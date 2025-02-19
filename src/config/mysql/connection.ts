import { Pool, createPool } from 'mysql2/promise'
import { EnvConfig } from '../config.js'

export class ConnectionHandler {
  public connection: Pool

  constructor() {
    this.connection = this.establishConnection()
  }

  establishConnection = () => {
    let connection: Pool

    if (EnvConfig().node_env === 'development') {
      connection = createPool({
        host: EnvConfig().mysql.host,
        port: EnvConfig().mysql.port,
        user: EnvConfig().mysql.user,
        password: EnvConfig().mysql.password,
        database: EnvConfig().mysql.database,
        timezone: '+00:00',
        connectionLimit: 100,
        idleTimeout: 60000,
        connectTimeout: 60000,
        enableKeepAlive: true
      })
    } else {
      connection = createPool(EnvConfig().mysql.database_url)
    }

    return connection
  }
}
