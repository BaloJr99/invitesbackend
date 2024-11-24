import { App } from './app.js'
import dotenv from 'dotenv'
import { establishConnection } from './config/mysql/connection.js'
import dbConnect from './config/mongo/mongo.js'
import { createRoles } from './utils/createRoles.handle.js'
import { EventsService } from './services/events.js'
import { InviteGroupsService } from './services/inviteGroups.js'
import { UsersService } from './services/users.js'
import { SettingsService } from './services/settings.js'
import { RolesService } from './services/roles.js'
import { mailConnection } from './config/nodemailer/transporter.js'
import { MailService } from './services/mail.js'
import { InvitesService } from './services/invites.js'
import { LoggerService } from './services/logger.js'
import { cloudinaryConfig } from './config/cloudinary/cloudinary.js'
import { FilesService } from './services/files.js'
dotenv.config()

const main = () => {
  let mysqlConnection = establishConnection()

  mysqlConnection.on('connection', function (connection) {
    console.log('DB Connection established')

    connection.on('error', function (err) {
      console.error(new Date(), 'MySQL error', err.code)

      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Attempting to reconnect to database')
        mysqlConnection = establishConnection()
      }
    })
    connection.on('close', function (err) {
      console.error(new Date(), 'MySQL close', err)
    })
  })

  dbConnect().then(() => {
    createRoles()
    console.log('Mongo Connection Ready')
  })

  const nodemailerConnection = mailConnection()

  new App(
    new EventsService(mysqlConnection),
    new InviteGroupsService(mysqlConnection),
    new FilesService(mysqlConnection, cloudinaryConfig),
    new InvitesService(mysqlConnection),
    new LoggerService(mysqlConnection),
    new MailService(nodemailerConnection),
    new RolesService(),
    new SettingsService(mysqlConnection),
    new UsersService()
  )
}

main()
