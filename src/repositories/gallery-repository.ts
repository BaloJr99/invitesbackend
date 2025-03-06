import { IAlbum, IAlbumImage, IUpsertAlbum } from '../global/types.js'
import { MysqlDatabase } from '../services/mysql-database.js'
import { IGalleryRepository } from '../interfaces/gallery-repository.js'
import { FieldPacket, RowDataPacket } from 'mysql2'

export class GalleryRepository implements IGalleryRepository {
  constructor(private database: MysqlDatabase) {
    this.database = database
  }

  async getAlbumsByEventId(eventId: string): Promise<IAlbum[]> {
    const connection = await this.database.getConnection()
    try {
      const [result] = (await connection.query(
        'SELECT BIN_TO_UUID(id) id, nameOfAlbum, dateOfAlbum, BIN_TO_UUID(id) eventId FROM albums WHERE eventId = UUID_TO_BIN(?) ORDER BY nameOfAlbum',
        [eventId]
      )) as [RowDataPacket[], FieldPacket[]]

      // Get the first image of each album
      for (const album of result as IAlbum[]) {
        const [image] = (await connection.query(
          'SELECT fileUrl FROM albumImages WHERE albumId = UUID_TO_BIN(?) LIMIT 1',
          [album.id]
        )) as [RowDataPacket[], FieldPacket[]]
        album.thumbnail = image[0]?.fileUrl ?? ''
      }

      return result as IAlbum[]
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  async getAlbumImages(albumId: string): Promise<IAlbumImage[]> {
    const connection = await this.database.getConnection()
    try {
      const [result] = (await connection.query(
        'SELECT BIN_TO_UUID(id) id, fileUrl, BIN_TO_UUID(albumId) albumId FROM albumImages WHERE albumId = UUID_TO_BIN(?)',
        [albumId]
      )) as [RowDataPacket[], FieldPacket[]]
      return result as IAlbumImage[]
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  async createAlbum(album: IUpsertAlbum): Promise<string> {
    const connection = await this.database.getConnection()

    try {
      const { nameOfAlbum, eventId } = album

      const [queryResult] = await connection.query('SELECT UUID() uuid')
      const [{ uuid }] = queryResult as { uuid: string }[]

      await connection.query(
        `INSERT INTO albums (id, nameOfAlbum, dateOfAlbum, eventId) VALUES (UUID_TO_BIN('${uuid}'), ?, UTC_TIMESTAMP(), UUID_TO_BIN(?))`,
        [nameOfAlbum, eventId]
      )

      return uuid
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  async updateAlbum(id: string, album: IUpsertAlbum): Promise<void> {
    const connection = await this.database.getConnection()

    try {
      const { nameOfAlbum } = album

      await connection.query(
        'UPDATE albums SET ?, dateOfAlbum = UTC_TIMESTAMP() WHERE id = UUID_TO_BIN(?)',
        [{ nameOfAlbum }, id]
      )
    } catch (error) {
      console.error(error)
    } finally {
      if (connection) connection.release()
    }
  }

  async checkAlbum(eventId: string, nameOfAlbum: string): Promise<boolean> {
    const connection = await this.database.getConnection()

    try {
      const [albumFounded] = (await connection.query(
        'SELECT * FROM albums WHERE eventId = UUID_TO_BIN(?) AND nameOfAlbum = ?',
        [eventId, nameOfAlbum]
      )) as [RowDataPacket[], FieldPacket[]]

      return albumFounded.length > 0 ? true : false
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  async deleteAlbum(albumId: string): Promise<void> {
    const connection = await this.database.getConnection()

    try {
      await connection.query(
        'UPDATE albums SET isActive = false WHERE id = UUID_TO_BIN(?)',
        [albumId]
      )
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  async createAlbumImage(image: IAlbumImage): Promise<void> {
    const connection = await this.database.getConnection()

    try {
      const { fileUrl, publicId, albumId } = image

      const [queryResult] = await connection.query('SELECT UUID() uuid')
      const [{ uuid }] = queryResult as { uuid: string }[]

      await connection.query(
        'INSERT INTO albumImages (id, fileUrl, publicId, albumId) VALUES (UUID_TO_BIN(?), ?, ?, UUID_TO_BIN(?))',
        [uuid, fileUrl, publicId, albumId]
      )
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }
}
