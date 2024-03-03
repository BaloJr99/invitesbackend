import mysql from 'mysql2/promise'

const connectionString = process.env.DATABASE_URL

const connection = await mysql.createConnection(connectionString)

export class EventsModel {
  static async getAll (userId) {
    const [entries] = await connection.query(
      'SELECT BIN_TO_UUID(id) id, nameOfEvent, dateOfEvent, maxDateOfConfirmation FROM events WHERE userId = CAST(? AS BINARY) ORDER BY dateOfEvent DESC',
      [userId]
    )
    return entries
  }

  static async getById ({ id }) {
    return await connection.query(
      'SELECT BIN_TO_UUID(id) id, nameOfEvent, dateOfEvent, maxDateOfConfirmation FROM events WHERE id = UUID_TO_BIN(?)',
      [id]
    )
  }

  static async create ({ input }, id) {
    const { nameOfEvent, dateOfEvent, maxDateOfConfirmation } =
      input

    const [uuidResult] = await connection.query('SELECT UUID() uuid')
    const [{ uuid }] = uuidResult

    try {
      await connection.query(
        `INSERT INTO events (id, nameOfEvent, dateOfEvent, maxDateOfConfirmation, user_id) VALUES (UUID_TO_BIN('${uuid}'), ?, ?, ?, CAST(? AS BINARY))`,
        [nameOfEvent, dateOfEvent, maxDateOfConfirmation, id]
      )
    } catch (error) {
      console.error(error)
      throw new Error('Error creating the event')
    }

    return true
  }

  static async delete ({ id }) {
    try {
      await connection.query('DELETE FROM events WHERE id = UUID_TO_BIN(?)', [
        id
      ])
    } catch (error) {
      throw new Error('Error deleting the event')
    }
  }

  static async update ({ id, input }) {
    const { nameOfEvent, dateOfEvent, maxDateOfConfirmation } =
      input

    try {
      const [{ affectedRows }] = await connection.query(
        'UPDATE entries SET ? WHERE id = UUID_TO_BIN(?)',
        [{ nameOfEvent, dateOfEvent, maxDateOfConfirmation }, id]
      )

      if (affectedRows === 0) return false
    } catch (error) {
      throw new Error('Error updating the event')
    }

    return true
  }
}
