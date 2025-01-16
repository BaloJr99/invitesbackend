import { App } from './app.js'
import dotenv from 'dotenv'
import { ConnectionHandler } from './config/mysql/connection.js'
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
import { EnvironmentService } from './services/environment.js'
dotenv.config()

const main = () => {
  const connectionHandler = new ConnectionHandler()
  const mysqlConnection = connectionHandler.connection;

  dbConnect().then(() => {
    createRoles()
    console.log('Mongo Connection Ready')
  })

  const nodemailerConnection = mailConnection()

  new App(
    new EnvironmentService(mysqlConnection),
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
