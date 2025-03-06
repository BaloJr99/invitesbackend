import { Request, RequestHandler, Response } from 'express'
import { ErrorHandler } from '../utils/error.handle.js'
import { MysqlDatabase } from '../services/mysql-database.js'
import { IGalleryRepository } from '../interfaces/gallery-repository.js'
import { GalleryRepository } from '../repositories/gallery-repository.js'
import { validateAlbum, validateImage } from '../schemas/gallery.js'
import { EnvConfig } from '../config/config.js'
import { FileType } from '../global/enum.js'
import { UploadApiResponse } from 'cloudinary'
import { IFilesRepository } from '../interfaces/files-repository.js'
import { FilesRepository } from '../repositories/files-repository.js'

export class GalleryController {
  private errorHandler: ErrorHandler
  private filesRepository: IFilesRepository
  private galleryRepository: IGalleryRepository

  constructor(mysqlDatabase: MysqlDatabase) {
    this.filesRepository = new FilesRepository(mysqlDatabase)
    this.galleryRepository = new GalleryRepository(mysqlDatabase)
    this.errorHandler = new ErrorHandler(mysqlDatabase)
  }

  getAlbumsByEventId: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params

      const albums = await this.galleryRepository.getAlbumsByEventId(id)

      res.json(albums)
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_GET_ALBUMS_BY_EVENT_ID',
        e.message,
        req.userId
      )
    }
  }

  getAlbumImages: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params

      const images = await this.galleryRepository.getAlbumImages(id)

      res.json(images)
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_GET_ALBUM_IMAGES',
        e.message,
        req.userId
      )
    }
  }

  createAlbum: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = validateAlbum(req.body)

      if (!result.success) {
        res.status(422).json(JSON.parse(result.error.message))
        return
      }

      const albumId = await this.galleryRepository.createAlbum(result.data)

      res
        .status(201)
        .json({ id: albumId, message: req.t('messages.ALBUM_CREATED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_CREATE_ALBUM',
        e.message,
        req.userId
      )
    }
  }

  updateAlbum: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = validateAlbum(req.body)

      if (!result.success) {
        res.status(422).json(JSON.parse(result.error.message))
        return
      }

      const { id } = req.params

      await this.galleryRepository.updateAlbum(id, result.data)

      res.status(201).json({ message: req.t('messages.ALBUM_UPDATED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_UPDATE_ALBUM',
        e.message,
        req.userId
      )
    }
  }

  uploadImage: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = validateImage(req.body)

      if (!result.success) {
        res.status(422).json(JSON.parse(result.error.message))
        return
      }

      const { albumId } = result.data

      const folder =
        EnvConfig().node_env === 'development'
          ? `test/invites/${albumId}`
          : `prod/invites/${albumId}`

      const cloudResult = (await this.filesRepository.uploadAsset(
        result.data.image,
        folder,
        FileType.Image
      )) as UploadApiResponse

      await this.galleryRepository.createAlbumImage({
        fileUrl: cloudResult.secure_url,
        publicId: cloudResult.public_id,
        albumId
      })

      res.status(201).json({
        fileUrl: cloudResult.secure_url,
        message: req.t('messages.FILE_CREATED')
      })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_UPLOAD_IMAGE',
        e.message,
        req.userId
      )
    }
  }

  checkAlbum: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { eventId, album } = req.params
      const isDuplicated = await this.galleryRepository.checkAlbum(
        eventId,
        album
      )

      res.json(isDuplicated)
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_CHECK_ALBUM',
        e.message,
        req.userId
      )
    }
  }

  deleteAlbum: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params

      await this.galleryRepository.deleteAlbum(id)

      res.status(201).json({ message: req.t('messages.ALBUM_DELETED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_DELETE_ALBUM',
        e.message,
        req.userId
      )
    }
  }
}
