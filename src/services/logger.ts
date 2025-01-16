import { FieldPacket, Pool, PoolConnection, RowDataPacket } from 'mysql2/promise'
import { ILogger } from '../interfaces/loggerModel.js'

export class LoggerService {
  constructor(private connection: Pool) {
    this.connection = connection
  }

  addLog = async (logger: ILogger) => {
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()
      const { dateOfError, customError, exceptionMessage, userId } = logger

      await connection.query(
        `INSERT INTO errorLogs (dateOfError, customError, exceptionMessage, userId) VALUES (?, ?, ?, ?)`,
        [dateOfError, customError, exceptionMessage, userId]
      )

    } catch (error) {
      console.log(error)
    } finally {
      if (connection) connection.release()
    }
  }

  getLogs = async (): Promise<ILogger[]> => {
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()

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
