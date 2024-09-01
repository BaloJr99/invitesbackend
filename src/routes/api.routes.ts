import { Router } from 'express';
import { createEventsRouter } from './events.routes.js';
import { createImagesRouter } from './images.routes.js';
import { createFamilyGroupsRouter } from './familyGroups.routes.js';
import { createAuthRouter } from './auth.routes.js';
import { EventsService } from '../services/events.js';
import { ImagesService } from '../config/cloudinary/cloudinary.js';
import { InviteImagesService } from '../services/inviteImages.js';
import { FamilyGroupsService } from '../services/familyGroups.js';
import { UsersService } from '../services/users.js';
import { SettingsService } from '../services/settings.js';
import { createSettingsRouter } from './settings.routes.js';
import { createUsersRouter } from './users.routes.js';
import { RolesService } from '../services/roles.js';
import { createRolesRouter } from './roles.routes.js';
import { MailService } from '../services/mail.js';
import { InvitesService } from '../services/invites.js';
import { createInvitesRouter } from './invites.routes.js';
import { LoggerService } from '../services/logger.js';
import { isAdmin, isInvitesAdmin } from '../middleware/auth.js';
import { checkJwt } from '../middleware/session.js';
import { createLoggersRouter } from './logger.routes.js';

export const apiRouter = Router();

export const createApiRouter = (
  eventsService: EventsService, 
  familyGroupService: FamilyGroupsService, 
  imagesService: ImagesService, 
  inviteImagesService: InviteImagesService, 
  invitesService: InvitesService,
  loggerService: LoggerService,
  mailService: MailService,
  rolesService: RolesService,
  settingsService: SettingsService,
  userService: UsersService
) => {

  apiRouter.use('/auth', createAuthRouter(userService, mailService, loggerService));
  apiRouter.use('/events', [checkJwt, isInvitesAdmin], createEventsRouter(eventsService, loggerService));
  apiRouter.use('/familyGroups', [checkJwt, isInvitesAdmin], createFamilyGroupsRouter(familyGroupService, loggerService));
  apiRouter.use('/images', [checkJwt, isInvitesAdmin], createImagesRouter(imagesService, inviteImagesService, loggerService));
  apiRouter.use('/invites', createInvitesRouter(invitesService, loggerService, familyGroupService));
  apiRouter.use('/logs', [checkJwt, isAdmin], createLoggersRouter(loggerService, userService));
  apiRouter.use('/roles', [checkJwt, isInvitesAdmin], createRolesRouter(rolesService, loggerService));
  apiRouter.use('/settings', [checkJwt, isInvitesAdmin], createSettingsRouter(settingsService, loggerService));
  apiRouter.use('/users', [checkJwt], createUsersRouter(userService, eventsService, loggerService));

  return apiRouter
}
