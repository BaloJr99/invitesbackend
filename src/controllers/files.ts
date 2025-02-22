import {
  validateFileUsage,
  validateFile,
  validateEventId
} from '../schemas/images.js'
import { Request, Response } from 'express'
import { ErrorHandler } from '../utils/error.handle.js'
import { FileType } from '../global/enum.js'
import { UploadApiResponse } from 'cloudinary'
import { EnvConfig } from '../config/config.js'
import { MysqlDatabase } from '../services/mysql-database.js'
import { FilesRepository } from '../repositories/files-repository.js'

export class FilesController {
  private errorHandler: ErrorHandler
  private filesRepository: FilesRepository

  constructor(mysqlDatabase: MysqlDatabase) {
    this.errorHandler = new ErrorHandler(mysqlDatabase)
    this.filesRepository = new FilesRepository(mysqlDatabase)
  }

  createFile = async (req: Request, res: Response) => {
    try {
      if (req.file) {
        const result = validateEventId(req.body)

        if (!result.success) {
          return res.status(422).json(JSON.parse(result.error.message))
        }

        const folder =
          EnvConfig().node_env === 'development' ? 'test/audios' : 'prod/audios'

        const cloudResult = (await this.filesRepository.uploadAsset(
          req.file.buffer,
          folder,
          FileType.Video
        )) as UploadApiResponse

        const { eventId } = result.data

        await this.filesRepository.createFile(
          {
            fileUrl: cloudResult.secure_url,
            publicId: cloudResult.public_id,
            eventId
          },
          FileType.Video
        )
      } else {
        const result = validateFile(req.body)

        if (!result.success) {
          return res.status(422).json(JSON.parse(result.error.message))
        }

        const folder =
          EnvConfig().node_env === 'development'
            ? 'test/invites'
            : 'prod/invites'

        const cloudResult = (await this.filesRepository.uploadAsset(
          result.data.image,
          folder,
          FileType.Image
        )) as UploadApiResponse

        const { eventId } = result.data

        await this.filesRepository.createFile(
          {
            fileUrl: cloudResult.secure_url,
            publicId: cloudResult.public_id,
            eventId
          },
          FileType.Image
        )
      }

      return res.status(201).json({ message: req.t('messages.FILES_CREATED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_CREATE_FILE',
        e.message,
        req.userId
      )
    }
  }

  updateFile = async (req: Request, res: Response) => {
    try {
      const result = validateFileUsage(req.body)

      if (!result.success) {
        return res.status(422).json(JSON.parse(result.error.message))
      }

      await this.filesRepository.updateImages(result.data)

      return res.status(201).json({ message: req.t('messages.FILES_UPDATED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_UPDATE_FILE',
        e.message,
        req.userId
      )
    }
  }

  deleteFile = async (req: Request, res: Response) => {
    try {
      const image = req.body

      const fileType =
        image.publicId.split('/')[1] === 'audios'
          ? FileType.Video
          : FileType.Image

      await this.filesRepository.deleteAsset(image.publicId, fileType)

      await this.filesRepository.deleteFile(image.id, fileType)

      return res.json({ message: req.t('messages.FILE_DELETED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_DELETE_FILE',
        e.message,
        req.userId
      )
    }
  }

  getAllFiles = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const eventImages = await this.filesRepository.getImageByEventId(id)
      const eventAudios = await this.filesRepository.getAudioByEventId(id)

      return res.json({ eventImages, eventAudios })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_GET_ALL_FILES',
        e.message,
        req.userId
      )
    }
  }
}
