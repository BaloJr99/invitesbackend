import mysql from 'mysql2/promise'

const connectionString = process.env.DATABASE_URL

const connection = await mysql.createConnection(connectionString)

export class FamilyGroupModel {
  static async getAll (userId) {
    const [familyGroups] = await connection.query(
      'SELECT BIN_TO_UUID(id) id, familyGroup FROM familygroups WHERE userId = CAST(? AS BINARY) ORDER BY familyGroup',
      [userId]
    )
    return familyGroups
  }

  static async getById ({ id }) {
    return await connection.query(
      'SELECT BIN_TO_UUID(id) id, familyGroup FROM familygroups WHERE id = UUID_TO_BIN(?)',
      [id]
    )
  }

  static async create ({ input }, id) {
    const { familyGroup } = input

    const [uuidResult] = await connection.query('SELECT UUID() uuid')
    const [{ uuid }] = uuidResult

    try {
      await connection.query(
        `INSERT INTO familygroups (id, familyGroup, userId) VALUES (UUID_TO_BIN('${uuid}'), ?, CAST(? AS BINARY))`,
        [familyGroup, id]
      )
    } catch (error) {
      throw new Error('Error creating the family group')
    }

    return uuid
  }

  static async update ({ id, input }) {
    const { familyGroup } = input

    try {
      const [{ affectedRows }] = await connection.query(
        'UPDATE familygroups SET ? WHERE id = UUID_TO_BIN(?)',
        [{ familyGroup }, id]
      )

      if (affectedRows === 0) return false
    } catch (error) {
      throw new Error('Error updating the family group')
    }

    return true
  }
}
