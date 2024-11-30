import { Pool } from 'mysql2/promise'

export class EnvironmentService {
  constructor(private connection: Pool) {
    this.connection = connection
  }

  cleanEnvironment = async () => {
    const conn = await this.connection.getConnection()

    await conn.execute('CALL cleanEnvironment()')

    conn.destroy()
  }
}
