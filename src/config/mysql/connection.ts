import { Pool, createPool } from 'mysql2/promise'

export class ConnectionHandler {
  public connection: Pool

  constructor() {
    this.connection = this.establishConnection()
  }

  establishConnection = () => {
    let connection: Pool

    if (process.env.NODE_ENV === 'development') {
      connection = createPool({
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        timezone: '+00:00',
        connectionLimit: 100,
        idleTimeout: 60000,
        connectTimeout: 60000,
        enableKeepAlive: true
      })
    } else {
      connection = createPool(process.env.DATABASE_URL)
    }

    return connection
  }
}
