import mysql from 'mysql2/promise'

const connectionString = process.env.DATABASE_URL

const connection = await mysql.createConnection(connectionString)

export class EntriesModel {
  static async getAll (userId) {
    const [entries] = await connection.query('SELECT BIN_TO_UUID(id) id, family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, groupSelected, kidsAllowed FROM entries WHERE userId = CAST(? AS BINARY)', [userId])
    return entries
  }

  static async getById ({ id }) {
    return await connection.query('SELECT BIN_TO_UUID(id) id, family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, groupSelected, kidsAllowed FROM entries WHERE id = UUID_TO_BIN(?)', [id])
  }

  static async create ({ input }, id) {
    const {
      family,
      entriesNumber,
      message,
      confirmation,
      phoneNumber,
      entriesConfirmed,
      groupSelected,
      kidsAllowed
    } = input

    const [uuidResult] = await connection.query('SELECT UUID() uuid')
    const [{ uuid }] = uuidResult

    try {
      await connection.query(
        `INSERT INTO entries (id, family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, groupSelected, kidsAllowed, userId) VALUES (UUID_TO_BIN('${uuid}'), ?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS BINARY))`,
        [family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, groupSelected, kidsAllowed, id]
      )
    } catch (error) {
      throw new Error('Error creating the party entry')
    }

    return await connection.query('SELECT BIN_TO_UUID(id) id, family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, groupSelected, kidsAllowed FROM entries WHERE id = UUID_TO_BIN(?)', [uuid])
  }

  static async delete ({ id }) {
    try {
      await connection.query('DELETE FROM entries WHERE id = UUID_TO_BIN(?)', [id])
    } catch (error) {
      throw new Error('Error deleting the party entry')
    }
  }

  static async update ({ id, input }) {
    const {
      family,
      entriesNumber,
      message,
      confirmation,
      phoneNumber,
      entriesConfirmed,
      groupSelected,
      kidsAllowed
    } = input

    try {
      const [{ affectedRows }] = await connection.query('UPDATE entries SET ? WHERE id = UUID_TO_BIN(?)', [
        { family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, groupSelected, kidsAllowed }, id
      ])

      if (affectedRows === 0) return false
    } catch (error) {
      throw new Error('Error updating the party entry')
    }

    return await connection.query('SELECT BIN_TO_UUID(id) id, family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, groupSelected, kidsAllowed FROM entries WHERE id = UUID_TO_BIN(?)', [id])
  }

  static async updateConfirmation ({ id, input }) {
    const {
      entriesConfirmed,
      message,
      confirmation
    } = input

    try {
      const [{ affectedRows }] = await connection.query('UPDATE entries SET ? WHERE id = UUID_TO_BIN(?)', [
        { entriesConfirmed, message, confirmation }, id
      ])

      if (affectedRows === 0) return false
    } catch (error) {
      throw new Error('Error updating the party entry')
    }

    return await connection.query('SELECT BIN_TO_UUID(id) id, family, entriesNumber, message, confirmation, entriesConfirmed, kidsAllowed FROM entries WHERE id = UUID_TO_BIN(?)', [id])
  }
}
