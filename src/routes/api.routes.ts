import { Router } from 'express'
import { createEventsRouter } from './events.routes.js'
import { createImagesRouter } from './images.routes.js'
import { createInviteGroupsRouter } from './inviteGroups.routes.js'
import { createAuthRouter } from './auth.routes.js'
import { EventsService } from '../services/events.js'
import { InviteImagesService } from '../services/inviteImages.js'
import { InviteGroupsService } from '../services/inviteGroups.js'
import { UsersService } from '../services/users.js'
import { SettingsService } from '../services/settings.js'
import { createSettingsRouter } from './settings.routes.js'
import { createUsersRouter } from './users.routes.js'
import { RolesService } from '../services/roles.js'
import { createRolesRouter } from './roles.routes.js'
import { MailService } from '../services/mail.js'
import { InvitesService } from '../services/invites.js'
import { createInvitesRouter } from './invites.routes.js'
import { LoggerService } from '../services/logger.js'
import { isAdmin, isInvitesAdmin } from '../middleware/auth.js'
import { checkJwt } from '../middleware/session.js'
import { createLoggersRouter } from './logger.routes.js'
import { ImagesService } from '../services/images.js'

export const apiRouter = Router()

export const createApiRouter = (
  eventsService: EventsService,
  inviteGroupsService: InviteGroupsService,
  imagesService: ImagesService,
  inviteImagesService: InviteImagesService,
  invitesService: InvitesService,
  loggerService: LoggerService,
  mailService: MailService,
  rolesService: RolesService,
  settingsService: SettingsService,
  userService: UsersService
) => {
  apiRouter.use(
    '/auth',
    createAuthRouter(userService, mailService, loggerService)
  )

  apiRouter.use(
    '/events',
    [checkJwt, isInvitesAdmin],
    createEventsRouter(eventsService, loggerService)
  )

  apiRouter.use(
    '/inviteGroups',
    [checkJwt, isInvitesAdmin],
    createInviteGroupsRouter(inviteGroupsService, loggerService)
  )

  apiRouter.use(
    '/images',
    createImagesRouter(imagesService, inviteImagesService, loggerService)
  )

  apiRouter.use(
    '/invites',
    createInvitesRouter(invitesService, loggerService, inviteGroupsService)
  )

  apiRouter.use(
    '/logs',
    [checkJwt, isAdmin],
    createLoggersRouter(loggerService, userService)
  )

  apiRouter.use(
    '/roles',
    [checkJwt, isInvitesAdmin],
    createRolesRouter(rolesService, loggerService)
  )

  apiRouter.use(
    '/settings',
    createSettingsRouter(settingsService, loggerService)
  )

  apiRouter.use(
    '/users',
    [checkJwt],
    createUsersRouter(userService, eventsService, loggerService, imagesService)
  )

  return apiRouter
}
