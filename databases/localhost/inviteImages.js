import mysql from 'mysql2/promise'

const DEFAULT_CONFIG = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  timezone: '+00:00'
}

const connectionString = DEFAULT_CONFIG

const connection = await mysql.createConnection(connectionString)

export class InviteImagesModel {
  static async getImageByEventId ({ id }) {
    return await connection.query(
      'SELECT BIN_TO_UUID(id) id, imageUrl, publicId, imageUsage FROM inviteImages WHERE eventId = UUID_TO_BIN(?)',
      [id]
    )
  }

  static async create (input, userId) {
    const { imageUrl, publicId, eventId } = input
    const [uuidResult] = await connection.query('SELECT UUID() uuid')
    const [{ uuid }] = uuidResult

    try {
      await connection.query(
        'INSERT INTO inviteImages (id, imageUrl, publicId, userId, eventId) VALUES (UUID_TO_BIN(?), ?, ?, CAST(? AS BINARY), UUID_TO_BIN(?))',
        [uuid, imageUrl, publicId, userId, eventId]
      )
    } catch (error) {
      console.log(error)
      throw new Error('Error inserting the images')
    }
  }

  static async update (input) {
    for (const image of input) {
      try {
        const { id, imageUsage } = image
        await connection.query(
          'UPDATE inviteImages SET imageUsage = ? WHERE id = UUID_TO_BIN(?)',
          [imageUsage, id]
        )
      } catch (error) {
        console.log(error)
        throw new Error('Error updating the image')
      }
    }
  }

  static async delete (id) {
    try {
      await connection.query(
        'DELETE FROM inviteImages WHERE id = UUID_TO_BIN(?)',
        [id]
      )
    } catch (error) {
      throw new Error('Error deleting the image')
    }
  }
}
