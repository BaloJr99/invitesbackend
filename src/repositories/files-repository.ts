import { FieldPacket, RowDataPacket } from 'mysql2'
import { FileType } from '../global/enum.js'
import { IFilesRepository } from '../interfaces/files-repository.js'
import {
  IDownloadImage,
  IDownloadAudio,
  IFilesModel,
  IImageUsageModel,
  IFilesId
} from '../global/types.js'
import { MysqlDatabase } from '../services/mysql-database.js'
import { cloudinaryConfig } from '../config/cloudinary/cloudinary.js'

export class FilesRepository implements IFilesRepository {
  private cloudinary = cloudinaryConfig

  constructor(private database: MysqlDatabase) {
    this.database = database
  }

  async getImageByEventId(eventId: string): Promise<IDownloadImage[]> {
    const connection = await this.database.getConnection()

    try {
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

  async getAudioByEventId(eventId: string): Promise<IDownloadAudio[]> {
    const connection = await this.database.getConnection()

    try {
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

  async createFile(image: IFilesModel, fileType: FileType): Promise<void> {
    const connection = await this.database.getConnection()

    try {
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

  async updateImages(images: IImageUsageModel[]): Promise<void> {
    const connection = await this.database.getConnection()

    try {
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

  async deleteFile(imageId: string, fileType: FileType): Promise<void> {
    const connection = await this.database.getConnection()

    try {
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

  async uploadAsset(
    file: string | Buffer,
    folder: string,
    fileType: FileType
  ): Promise<unknown> {
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

  async deleteAsset(imageId: string, fileType: FileType): Promise<void> {
    if (fileType === FileType.Video) {
      await this.cloudinary.uploader.destroy(imageId, {
        resource_type: 'video',
        invalidate: true
      })
    } else {
      await this.cloudinary.uploader.destroy(imageId, {
        resource_type: 'image'
      })
    }
  }

  async getAllImages(): Promise<IFilesId[]> {
    const connection = await this.database.getConnection()

    try {
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

  async getAllAudios(): Promise<IFilesId[]> {
    const connection = await this.database.getConnection()

    try {
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
