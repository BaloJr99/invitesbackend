import { json, Router } from 'express'
import { createEventsRouter } from './events.routes.js'
import { createInviteGroupsRouter } from './inviteGroups.routes.js'
import { createAuthRouter } from './auth.routes.js'
import { createSettingsRouter } from './settings.routes.js'
import { createUsersRouter } from './users.routes.js'
import { createRolesRouter } from './roles.routes.js'
import { createInvitesRouter } from './invites.routes.js'
import { isAdmin, isInvitesAdmin } from '../middleware/auth.js'
import { checkJwt } from '../middleware/session.js'
import { createLoggersRouter } from './logger.routes.js'
import { createFilesRouter } from './files.routes.js'
import { isDevelopment } from '../middleware/isDevelopment.js'
import { createEnvironmentRouter } from './environment.routes.js'
import { MysqlDatabase } from '../services/mysql-database.js'
import { Transporter } from 'nodemailer'
import { createGalleryRouter } from './gallery.routes.js'

export const apiRouter = Router()

export const createApiRouter = (
  mysqlDatabase: MysqlDatabase,
  nodemailerConnection: Transporter
) => {
  apiRouter.use(
    '/auth',
    json(),
    createAuthRouter(mysqlDatabase, nodemailerConnection)
  )

  apiRouter.use(
    '/events',
    [json(), checkJwt, isInvitesAdmin],
    createEventsRouter(mysqlDatabase)
  )

  apiRouter.use(
    '/inviteGroups',
    [json(), checkJwt, isInvitesAdmin],
    createInviteGroupsRouter(mysqlDatabase)
  )

  apiRouter.use(
    '/files',
    [json({ limit: '3mb' })],
    createFilesRouter(mysqlDatabase)
  )

  apiRouter.use(
    '/gallery',
    [json({ limit: '10mb' })],
    createGalleryRouter(mysqlDatabase)
  )

  apiRouter.use('/invites', json(), createInvitesRouter(mysqlDatabase))

  apiRouter.use(
    '/logs',
    [json(), checkJwt, isAdmin],
    createLoggersRouter(mysqlDatabase)
  )

  apiRouter.use(
    '/roles',
    [json(), checkJwt, isInvitesAdmin],
    createRolesRouter(mysqlDatabase)
  )

  apiRouter.use('/settings', json(), createSettingsRouter(mysqlDatabase))

  apiRouter.use('/users', [json(), checkJwt], createUsersRouter(mysqlDatabase))

  apiRouter.use(
    '/environment',
    [json(), checkJwt, isAdmin, isDevelopment],
    createEnvironmentRouter(mysqlDatabase)
  )

  return apiRouter
}
