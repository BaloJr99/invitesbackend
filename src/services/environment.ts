import { Pool, PoolConnection } from 'mysql2/promise'

export class EnvironmentService {
  constructor(private connection: Pool) {
    this.connection = connection
  }

  cleanEnvironment = async () => {
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()
      await connection.execute('CALL cleanEnvironment()')
    } finally {
      if (connection) connection.release()
    }
  }
}
