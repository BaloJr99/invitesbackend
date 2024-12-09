import { FieldPacket, Pool, RowDataPacket } from 'mysql2/promise'
import {
  IDownloadAudio,
  IDownloadImage,
  IFilesId,
  IFilesModel,
  IImageUsageModel
} from '../interfaces/filesModel.js'
import { cloudinaryConfig } from '../config/cloudinary/cloudinary.js'
import { FileType } from '../interfaces/enum.js'

export class FilesService {
  constructor(
    private connection: Pool,
    private cloudinary: typeof cloudinaryConfig
  ) {
    this.connection = connection
  }

  getImageByEventId = async (eventId: string): Promise<IDownloadImage[]> => {
    try {
      const conn = await this.connection.getConnection()

      const [results] = (await conn.query(
        'SELECT BIN_TO_UUID(id) id, fileUrl, publicId, imageUsage FROM inviteImages WHERE eventId = UUID_TO_BIN(?) ORDER BY imageUsage',
        [eventId]
      )) as [RowDataPacket[], FieldPacket[]]

      conn.destroy()
      return results as IDownloadImage[]
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getAudioByEventId = async (eventId: string): Promise<IDownloadAudio[]> => {
    try {
      const conn = await this.connection.getConnection()

      const [results] = (await conn.query(
        'SELECT BIN_TO_UUID(id) id, fileUrl, publicId FROM invitesAudio WHERE eventId = UUID_TO_BIN(?)',
        [eventId]
      )) as [RowDataPacket[], FieldPacket[]]

      return results as IDownloadAudio[]
    } catch (error) {
      return Promise.reject(error)
    }
  }

  createFile = async (image: IFilesModel, fileType: FileType) => {
    try {
      const conn = await this.connection.getConnection()

      const { fileUrl, publicId, eventId } = image

      const [queryResult] = await conn.query('SELECT UUID() uuid')
      const [{ uuid }] = queryResult as { uuid: string }[]

      await conn.query(
        `INSERT INTO ${
          fileType === FileType.Image ? 'inviteImages' : 'invitesAudio'
        } (id, fileUrl, publicId, eventId) VALUES (UUID_TO_BIN(?), ?, ?, UUID_TO_BIN(?))`,
        [uuid, fileUrl, publicId, eventId]
      )

      conn.destroy()
    } catch (error) {
      console.error(error)
    }
  }

  updateImages = async (images: IImageUsageModel[]) => {
    try {
      const conn = await this.connection.getConnection()

      for (const image of images) {
        const { id, imageUsage } = image
        await conn.query(
          'UPDATE inviteImages SET imageUsage = ? WHERE id = UUID_TO_BIN(?)',
          [imageUsage, id]
        )
      }

      conn.destroy()
    } catch (error) {
      console.error(error)
    }
  }

  deleteFile = async (imageId: string, fileType: FileType) => {
    try {
      const conn = await this.connection.getConnection()

      await conn.query(
        `DELETE FROM ${
          fileType === FileType.Video ? 'invitesAudio' : 'inviteImages'
        } WHERE id = UUID_TO_BIN(?)`,
        [imageId]
      )

      conn.destroy()
    } catch (error) {
      console.error(error)
    }
  }

  uploadAsset = async (
    file: string | Buffer,
    folder: string,
    fileType: FileType
  ) => {
    if (fileType === FileType.Image) {
      return await this.cloudinary.uploader.upload(file as string, {
        folder,
        resource_type: 'image'
      })
    } else {
      return new Promise((resolve, reject) => {
        const stream = this.cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'video'
          },
          (error, result) => {
            if (error) reject(error)
            resolve(result)
          }
        )
        stream.end(file as Buffer)
      })
    }
  }

  deleteAsset = async (imageId: string, fileType: FileType) => {
    if (fileType === FileType.Video) {
      await this.cloudinary.uploader.destroy(imageId, {
        resource_type: 'video',
        invalidate: true
      })
    } else {
      return await this.cloudinary.uploader.destroy(imageId, {
        resource_type: 'image'
      })
    }
  }

  getAllImages = async (): Promise<IFilesId[]> => {
    try {
      const conn = await this.connection.getConnection()

      const [results] = (await conn.query(
        'SELECT publicId FROM inviteImages'
      )) as [RowDataPacket[], FieldPacket[]]

      conn.destroy()
      return results as IFilesId[]
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getAllAudios = async (): Promise<IFilesId[]> => {
    try {
      const conn = await this.connection.getConnection()

      const [results] = (await conn.query(
        'SELECT publicId FROM invitesAudio'
      )) as [RowDataPacket[], FieldPacket[]]

      return results as IFilesId[]
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
