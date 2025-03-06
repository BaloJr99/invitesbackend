import { FieldPacket, RowDataPacket } from 'mysql2'
import { ILogger } from '../global/types.js'
import { ILogsRepository } from '../interfaces/logs-repository.js'
import { MysqlDatabase } from '../services/mysql-database.js'

export class LogsRepository implements ILogsRepository {
  constructor(private database: MysqlDatabase) {
    this.database = database
  }

  async addLog(logger: ILogger): Promise<void> {
    const connection = await this.database.getConnection()
    try {
      const { dateOfError, customError, exceptionMessage, userId } = logger

      await connection.query(
        `INSERT INTO errorLogs (dateOfError, customError, exceptionMessage, userId) VALUES (?, ?, ?, ?)`,
        [dateOfError, customError, exceptionMessage, userId]
      )
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  async getLogs(): Promise<ILogger[]> {
    const connection = await this.database.getConnection()

    try {
      const todayMinus31 = new Date()
      todayMinus31.setDate(todayMinus31.getDate() - 31)

      const [results] = (await connection.query(
        'SELECT BIN_TO_UUID(id) AS id, dateOfError, customError, exceptionMessage, CAST(userId AS CHAR) AS userId FROM errorLogs WHERE dateOfError >= ? ORDER BY dateOfError DESC',
        [todayMinus31.toISOString().substring(0, 10)]
      )) as [RowDataPacket[], FieldPacket[]]

      return results as ILogger[]
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }
}
