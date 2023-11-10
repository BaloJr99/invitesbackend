import mysql from 'mysql2/promise'

const connectionString = process.env.DATABASE_URL

const connection = await mysql.createConnection(connectionString)

export class EntriesModel {
  static async getAll (userId) {
    const [entries] = await connection.query(
      'SELECT BIN_TO_UUID(id) id, family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, groupSelected, kidsAllowed, dateOfConfirmation, isMessageRead FROM entries WHERE userId = CAST(? AS BINARY) ORDER BY dateOfConfirmation DESC',
      [userId]
    )
    return entries
  }

  static async getById ({ id }) {
    return await connection.query(
      'SELECT BIN_TO_UUID(id) id, family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, groupSelected, kidsAllowed, dateOfConfirmation, isMessageRead FROM entries WHERE id = UUID_TO_BIN(?)',
      [id]
    )
  }

  static async create ({ input }, id) {
    const { family, entriesNumber, phoneNumber, groupSelected, kidsAllowed } =
      input

    const [uuidResult] = await connection.query('SELECT UUID() uuid')
    const [{ uuid }] = uuidResult

    try {
      await connection.query(
        `INSERT INTO entries (id, family, entriesNumber, phoneNumber, groupSelected, kidsAllowed, userId) VALUES (UUID_TO_BIN('${uuid}'), ?, ?, ?, ?, ?, CAST(? AS BINARY))`,
        [family, entriesNumber, phoneNumber, groupSelected, kidsAllowed, id]
      )
    } catch (error) {
      throw new Error('Error creating the party entry')
    }

    return true
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
    const { family, entriesNumber, phoneNumber, groupSelected, kidsAllowed } =
      input

    try {
      const [{ affectedRows }] = await connection.query(
        'UPDATE entries SET ? WHERE id = UUID_TO_BIN(?)',
        [{ family, entriesNumber, phoneNumber, groupSelected, kidsAllowed }, id]
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
