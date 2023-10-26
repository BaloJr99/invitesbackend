import mysql from 'mysql2/promise'

const DEFAUL_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  database: 'invitesdb'
}

const connectionString = DEFAUL_CONFIG

const connection = await mysql.createConnection(connectionString)

export class EntriesModel {
  static async getAll () {
    const [entries] = await connection.query('SELECT BIN_TO_UUID(id) id, family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, groupSelected FROM entries')
    return entries
  }

  static async getById ({ id }) {
    const [entry] = await connection.query('SELECT BIN_TO_UUID(id) id, family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, groupSelected FROM entries WHERE id = UUID_TO_BIN(?)', [id])
    return entry
  }

  static async create ({ input }) {
    const {
      family,
      entriesNumber,
      message,
      confirmation,
      phoneNumber,
      entriesConfirmed,
      groupSelected
    } = input

    const [uuidResult] = await connection.query('SELECT UUID() uuid')
    const [{ uuid }] = uuidResult

    try {
      await connection.query(
        `INSERT INTO entries (id, family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, groupSelected) VALUES (UUID_TO_BIN('${uuid}'), ?, ?, ?, ?, ?, ?, ?)`,
        [family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, groupSelected]
      )
    } catch (error) {
      throw new Error('Error creating the party entry')
    }

    const [entry] = await connection.query('SELECT BIN_TO_UUID(id) id, family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, groupSelected FROM entries WHERE id = UUID_TO_BIN(?)', [uuid])
    return entry.at(0)
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
      groupSelected
    } = input

    try {
      const [{ affectedRows }] = await connection.query('UPDATE entries SET ? WHERE id = UUID_TO_BIN(?)', [
        { family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, groupSelected }, id
      ])

      if (affectedRows === 0) return false
    } catch (error) {
      throw new Error('Error updating the party entry')
    }

    const [entry] = await connection.query('SELECT BIN_TO_UUID(id) id, family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, groupSelected FROM entries WHERE id = UUID_TO_BIN(?)', [id])
    return entry
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

    const [entry] = await connection.query('SELECT BIN_TO_UUID(id) id, family, entriesNumber, message, confirmation, entriesConfirmed FROM entries WHERE id = UUID_TO_BIN(?)', [id])
    return entry
  }
}
