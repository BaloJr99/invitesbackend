import express, { json } from 'express'
import path from 'path'
import { ACCEPTED_ORIGINS, corsMiddleware } from './middleware/cors.js'
import { EventsService } from './services/events.js'
import { InviteGroupsService } from './services/inviteGroups.js'
import { UsersService } from './services/users.js'
import { Server } from 'socket.io'
import { createServer } from 'http'
import { createApiRouter } from './routes/api.routes.js'
import { SettingsService } from './services/settings.js'
import { RolesService } from './services/roles.js'
import { MailService } from './services/mail.js'
import { InvitesService } from './services/invites.js'
import { LoggerService } from './services/logger.js'
import { ErrorHandler } from './utils/error.handle.js'
import { IConfirmation } from './interfaces/invitesModels.js'
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import { handle, LanguageDetector } from 'i18next-http-middleware'
import { fileURLToPath } from 'url'
import { IUserFromInvite } from './interfaces/usersModel.js'
import { FilesService } from './services/files.js'

export class App {
  constructor(
    private eventsService: EventsService,
    private inviteGroupsService: InviteGroupsService,
    private filesService: FilesService,
    private invitesService: InvitesService,
    private loggerService: LoggerService,
    private mailService: MailService,
    private rolesService: RolesService,
    private settingsService: SettingsService,
    private usersService: UsersService
  ) {
    this.eventsService = eventsService
    this.inviteGroupsService = inviteGroupsService
    this.filesService = filesService
    this.invitesService = invitesService
    this.loggerService = loggerService
    this.mailService = mailService
    this.rolesService = rolesService
    this.settingsService = settingsService
    this.usersService = usersService

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    i18next
      .use(Backend)
      .use(LanguageDetector)
      .init({
        backend: {
          loadPath: path.join(__dirname, '/locales/{{lng}}/translation.json')
        },
        fallbackLng: 'en'
      })

    const app = express()

    const server = createServer(app)

    const errorHandler = new ErrorHandler(this.loggerService)

    const io = new Server(server, {
      connectionStateRecovery: {},
      cors: {
        origin: ACCEPTED_ORIGINS,
        credentials: true
      }
    })

    io.on('connection', async (socket) => {
      socket.on('joinRoom', (username) => {
        if (username) {
          socket.join(username)
        }
      })

      socket.on('sendNotification', async (invite: IConfirmation) => {
        try {
          const result = await this.invitesService.getUserFromInviteId(
            invite.id
          )
          if (result.length > 0) {
            const user = result.at(0) as IUserFromInvite

            const username = await this.usersService.getUsername(user.id)

            if (username) {
              io.to(username).emit('newNotification', invite)
            }
          }
        } catch (_e) {
          const e: Error = _e as Error
          errorHandler.handleHttp(
            null,
            null,
            'ERROR_SENDING_NOTIFICATION',
            e.message,
            ''
          )
        }
      })
    })

    app.use(json({ limit: '2mb' }))
    app.use(corsMiddleware())
    app.use(handle(i18next))

    app.use(
      '/api',
      createApiRouter(
        this.eventsService,
        this.inviteGroupsService,
        this.filesService,
        this.invitesService,
        this.loggerService,
        this.mailService,
        this.rolesService,
        this.settingsService,
        this.usersService
      )
    )

    const PORT = process.env.PORT ?? 3000

    server.listen(PORT, () => console.log(`Server on port ${PORT}`))
  }
}
