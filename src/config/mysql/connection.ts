import { Pool, createPool } from 'mysql2/promise'

export const connection = () => {
  let connection: Pool

  if (process.env.NODE_ENV === 'development') {
    connection = createPool({
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      timezone: '+00:00',
      connectionLimit: 10,
      dateStrings: true
    })
  } else {
    connection = createPool(process.env.DATABASE_URL)
  }

  return connection
}
