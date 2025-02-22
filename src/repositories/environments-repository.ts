import { MysqlDatabase } from '../services/mysql-database.js'

export class EnvironmentsRepository {
  constructor(private database: MysqlDatabase) {
    this.database = database
  }

  async cleanEnvironment() {
    const connection = await this.database.getConnection()

    try {
      await connection.execute('CALL cleanEnvironment()')
    } finally {
      if (connection) connection.release()
    }
  }
}
