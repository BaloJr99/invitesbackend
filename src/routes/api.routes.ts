import { Router } from 'express'
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
  apiRouter.use('/auth', createAuthRouter(mysqlDatabase, nodemailerConnection))

  apiRouter.use(
    '/events',
    [checkJwt, isInvitesAdmin],
    createEventsRouter(mysqlDatabase)
  )

  apiRouter.use(
    '/inviteGroups',
    [checkJwt, isInvitesAdmin],
    createInviteGroupsRouter(mysqlDatabase)
  )

  apiRouter.use('/files', createFilesRouter(mysqlDatabase))

  apiRouter.use('/gallery', createGalleryRouter(mysqlDatabase))

  apiRouter.use('/invites', createInvitesRouter(mysqlDatabase))

  apiRouter.use(
    '/logs',
    [checkJwt, isAdmin],
    createLoggersRouter(mysqlDatabase)
  )

  apiRouter.use(
    '/roles',
    [checkJwt, isInvitesAdmin],
    createRolesRouter(mysqlDatabase)
  )

  apiRouter.use('/settings', createSettingsRouter(mysqlDatabase))

  apiRouter.use('/users', [checkJwt], createUsersRouter(mysqlDatabase))

  apiRouter.use(
    '/environment',
    [checkJwt, isAdmin, isDevelopment],
    createEnvironmentRouter(mysqlDatabase)
  )

  return apiRouter
}
