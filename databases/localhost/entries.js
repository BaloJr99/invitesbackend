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

export class EntriesModel {
  static async getAll (userId) {
    const [entries] = await connection.query(
      'SELECT BIN_TO_UUID(id) id, family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, kidsAllowed, dateOfConfirmation, isMessageRead FROM entries WHERE userId = CAST(? AS BINARY) ORDER BY dateOfConfirmation DESC',
      [userId]
    )
    return entries
  }

  static async getById ({ id }) {
    return await connection.query(
      'SELECT BIN_TO_UUID(id) id, family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, kidsAllowed, dateOfConfirmation, isMessageRead FROM entries WHERE id = UUID_TO_BIN(?)',
      [id]
    )
  }

  static async getEntry ({ id }) {
    return await connection.query(
      'SELECT BIN_TO_UUID(e.id) id, family, entriesNumber, confirmation, kidsAllowed, ev.dateOfEvent, ev.maxDateOfConfirmation FROM entries AS e INNER JOIN events as ev ON e.eventId = ev.id WHERE e.id = UUID_TO_BIN(?)',
      [id]
    )
  }

  static async create ({ input }, id) {
    const {
      family,
      entriesNumber,
      phoneNumber,
      kidsAllowed,
      eventId,
      familyGroupId
    } = input

    const [uuidResult] = await connection.query('SELECT UUID() uuid')
    const [{ uuid }] = uuidResult

    try {
      await connection.query(
        `INSERT INTO entries (id, family, entriesNumber, phoneNumber, kidsAllowed, userId, eventId, familyGroupId) VALUES (UUID_TO_BIN('${uuid}'), ?, ?, ?, ?, CAST(? AS BINARY), UUID_TO_BIN(?), UUID_TO_BIN(?))`,
        [
          family,
          entriesNumber,
          phoneNumber,
          kidsAllowed,
          id,
          eventId,
          familyGroupId
        ]
      )
    } catch (error) {
      throw new Error('Error creating the party entry')
    }

    return uuid
  }

  static async delete ({ id }) {
    try {
      await connection.query('DELETE FROM entries WHERE id = UUID_TO_BIN(?)', [
        id
      ])
    } catch (error) {
      throw new Error('Error deleting the party entry')
    }
  }

  static async update ({ id, input }) {
    const { family, entriesNumber, phoneNumber, kidsAllowed } =
      input

    try {
      const [{ affectedRows }] = await connection.query(
        'UPDATE entries SET ? WHERE id = UUID_TO_BIN(?)',
        [{ family, entriesNumber, phoneNumber, kidsAllowed }, id]
      )

      if (affectedRows === 0) return false
    } catch (error) {
      throw new Error('Error updating the party entry')
    }

    return true
  }

  static async updateConfirmation ({ id, input }) {
    const { entriesConfirmed, message, confirmation, dateOfConfirmation } =
      input

    try {
      const [{ affectedRows }] = await connection.query(
        'UPDATE entries SET ? WHERE id = UUID_TO_BIN(?)',
        [{ entriesConfirmed, message, confirmation, dateOfConfirmation }, id]
      )

      if (affectedRows === 0) return false
    } catch (error) {
      throw new Error('Error updating the party entry')
    }

    return true
  }

  static async readMessage ({ id }) {
    try {
      const [{ affectedRows }] = await connection.query(
        'UPDATE entries SET isMessageRead = true WHERE id = UUID_TO_BIN(?)',
        [id]
      )

      if (affectedRows === 0) return false
    } catch (error) {
      throw new Error('Error updating the party entry')
    }

    return true
  }

  static async getUserFromEntryId (id) {
    return await connection.query(
      'SELECT CAST(userId as CHAR) AS userId FROM entries WHERE id = UUID_TO_BIN(?)',
      [id]
    )
  }
}
