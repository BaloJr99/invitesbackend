import { FieldPacket, Pool, PoolConnection, RowDataPacket } from 'mysql2/promise'
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
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()

      const [results] = (await connection.query(
        'SELECT BIN_TO_UUID(id) id, fileUrl, publicId, imageUsage FROM inviteImages WHERE eventId = UUID_TO_BIN(?) ORDER BY imageUsage',
        [eventId]
      )) as [RowDataPacket[], FieldPacket[]]

      return results as IDownloadImage[]
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  getAudioByEventId = async (eventId: string): Promise<IDownloadAudio[]> => {
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()

      const [results] = (await connection.query(
        'SELECT BIN_TO_UUID(id) id, fileUrl, publicId FROM invitesAudio WHERE eventId = UUID_TO_BIN(?)',
        [eventId]
      )) as [RowDataPacket[], FieldPacket[]]

      return results as IDownloadAudio[]
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  createFile = async (image: IFilesModel, fileType: FileType) => {
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()

      const { fileUrl, publicId, eventId } = image

      const [queryResult] = await connection.query('SELECT UUID() uuid')
      const [{ uuid }] = queryResult as { uuid: string }[]

      await connection.query(
        `INSERT INTO ${
          fileType === FileType.Image ? 'inviteImages' : 'invitesAudio'
        } (id, fileUrl, publicId, eventId) VALUES (UUID_TO_BIN(?), ?, ?, UUID_TO_BIN(?))`,
        [uuid, fileUrl, publicId, eventId]
      )
    } catch (error) {
      console.error(error)
    } finally {
      if (connection) connection.release()
    }
  }

  updateImages = async (images: IImageUsageModel[]) => {
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()

      for (const image of images) {
        const { id, imageUsage } = image
        await connection.query(
          'UPDATE inviteImages SET imageUsage = ? WHERE id = UUID_TO_BIN(?)',
          [imageUsage, id]
        )
      }
    } catch (error) {
      console.error(error)
    } finally {
      if (connection) connection.release()
    }
  }

  deleteFile = async (imageId: string, fileType: FileType) => {
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()

      await connection.query(
        `DELETE FROM ${
          fileType === FileType.Video ? 'invitesAudio' : 'inviteImages'
        } WHERE id = UUID_TO_BIN(?)`,
        [imageId]
      )
    } catch (error) {
      console.error(error)
    } finally {
      if (connection) connection.release()
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
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()

      const [results] = (await connection.query(
        'SELECT publicId FROM inviteImages'
      )) as [RowDataPacket[], FieldPacket[]]

      return results as IFilesId[]
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  getAllAudios = async (): Promise<IFilesId[]> => {
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()

      const [results] = (await connection.query(
        'SELECT publicId FROM invitesAudio'
      )) as [RowDataPacket[], FieldPacket[]]

      return results as IFilesId[]
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }
}
