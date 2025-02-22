import { App } from './app.js'
import dbConnect from './config/mongo/mongo.js'
import { createRoles } from './utils/createRoles.handle.js'
import { mailConnection } from './config/nodemailer/transporter.js'
import { MysqlDatabase } from './services/mysql-database.js'

const main = () => {
  const mysqlDatabase = new MysqlDatabase()

  dbConnect().then(() => {
    createRoles()
    console.log('Mongo Connection Ready')
  })

  const nodemailerConnection = mailConnection()

  new App(mysqlDatabase, nodemailerConnection)
}

main()
