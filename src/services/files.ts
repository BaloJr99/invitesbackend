import { Pool } from 'mysql2/promise'
import { IFilesModel, IImageUsageModel } from '../interfaces/filesModel.js'
import { cloudinaryConfig } from '../config/cloudinary/cloudinary.js'
import { FileType } from '../interfaces/enum.js'

export class FilesService {
  constructor(
    private connection: Pool,
    private cloudinary: typeof cloudinaryConfig
  ) {
    this.connection = connection
  }

  getImageByEventId = async (eventId: string) => {
    return await this.connection.query(
      'SELECT BIN_TO_UUID(id) id, fileUrl, publicId, imageUsage FROM inviteImages WHERE eventId = UUID_TO_BIN(?) ORDER BY imageUsage',
      [eventId]
    )
  }

  getAudioByEventId = async (eventId: string) => {
    return await this.connection.query(
      'SELECT BIN_TO_UUID(id) id, fileUrl, publicId FROM invitesAudio WHERE eventId = UUID_TO_BIN(?)',
      [eventId]
    )
  }

  createFile = async (image: IFilesModel, fileType: FileType) => {
    const { fileUrl, publicId, eventId } = image

    const [queryResult] = await this.connection.query('SELECT UUID() uuid')
    const [{ uuid }] = queryResult as { uuid: string }[]

    await this.connection.query(
      `INSERT INTO ${fileType === FileType.Image ? 'inviteImages' : 'invitesAudio'} (id, fileUrl, publicId, eventId) VALUES (UUID_TO_BIN(?), ?, ?, UUID_TO_BIN(?))`,
      [uuid, fileUrl, publicId, eventId]
    )
  }

  updateImages = async (images: IImageUsageModel[]) => {
    for (const image of images) {
      const { id, imageUsage } = image
      await this.connection.query(
        'UPDATE inviteImages SET imageUsage = ? WHERE id = UUID_TO_BIN(?)',
        [imageUsage, id]
      )
    }
  }

  deleteImage = async (imageId: string) => {
    await this.connection.query(
      'DELETE FROM inviteImages WHERE id = UUID_TO_BIN(?)',
      [imageId]
    )
  }

  uploadFile = async (
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

  deleteFile = async (imageId: string) => {
    return await this.cloudinary.uploader.destroy(imageId)
  }
}
