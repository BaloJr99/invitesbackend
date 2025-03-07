import express from 'express'
import path from 'path'
import { ACCEPTED_ORIGINS, corsMiddleware } from './middleware/cors.js'
import { Server } from 'socket.io'
import { createServer } from 'http'
import { createApiRouter } from './routes/api.routes.js'
import { ErrorHandler } from './utils/error.handle.js'
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import cookieParser from 'cookie-parser'
import { handle, LanguageDetector } from 'i18next-http-middleware'
import { fileURLToPath } from 'url'
import { EnvConfig } from './config/config.js'
import { MysqlDatabase } from './services/mysql-database.js'
import { Transporter } from 'nodemailer'
import { InvitesRepository } from './repositories/invites-repository.js'
import { UsersService } from './services/users.js'
import { IConfirmation, IUserFromInvite } from './global/types.js'

export class App {
  private invitesRepository: InvitesRepository
  private usersService: UsersService

  constructor(mysqlDatabase: MysqlDatabase, nodemailerConnection: Transporter) {
    this.invitesRepository = new InvitesRepository(mysqlDatabase)
    this.usersService = new UsersService()

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

    const errorHandler = new ErrorHandler(mysqlDatabase)

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
          const result = await this.invitesRepository.getUserFromInviteId(
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

    app.use(corsMiddleware())
    app.use(handle(i18next))
    app.use(cookieParser())

    app.use('/api', createApiRouter(mysqlDatabase, nodemailerConnection))

    const PORT = EnvConfig().port ?? 3000

    server.listen(PORT, () => console.log(`Server on port ${PORT}`))
  }
}
