import { App } from './app.js'
import dotenv from 'dotenv'
import { connection } from './config/mysql/connection.js'
import dbConnect from './config/mongo/mongo.js'
import { createRoles } from './utils/createRoles.handle.js'
import { EventsService } from './services/events.js'
import { ImagesService } from './config/cloudinary/cloudinary.js'
import { InviteImagesService } from './services/inviteImages.js'
import { FamilyGroupsService } from './services/familyGroups.js'
import { UsersService } from './services/users.js'
import { SettingsService } from './services/settings.js'
import { RolesService } from './services/roles.js'
import { mailConnection } from './config/nodemailer/transporter.js'
import { MailService } from './services/mail.js'
import { InvitesService } from './services/invites.js'
import { LoggerService } from './services/logger.js'
dotenv.config()

const main = () => {
  const mysqlConnection = connection()

  dbConnect().then(() => {
    createRoles()
    console.log('Mongo Connection Ready')
  })

  const nodemailerConnection = mailConnection()

  new App(
    new EventsService(mysqlConnection),
    new FamilyGroupsService(mysqlConnection),
    new ImagesService(),
    new InviteImagesService(mysqlConnection),
    new InvitesService(mysqlConnection),
    new LoggerService(mysqlConnection),
    new MailService(nodemailerConnection),
    new RolesService(),
    new SettingsService(mysqlConnection),
    new UsersService()
  )
}

main()
