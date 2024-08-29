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
import { EventSettingsService } from '../services/settings.js';
import { createSettingsRouter } from './settings.routes.js';
import { createUsersRouter } from './users.routes.js';
import { RolesService } from '../services/roles.js';
import { createRolesRouter } from './roles.routes.js';
import { MailService } from '../services/mail.js';
import { InvitesService } from '../services/invites.js';
import { createInvitesRouter } from './invites.routes.js';
import { LoggerService } from '../services/logger.js';

export const apiRouter = Router();

export const createApiRouter = (
  invitesService: InvitesService,
  eventsService: EventsService, 
  imagesService: ImagesService, 
  inviteImagesService: InviteImagesService, 
  familyGroupService: FamilyGroupsService, 
  userService: UsersService,
  eventSettingsService: EventSettingsService,
  rolesService: RolesService,
  mailService: MailService,
  loggerService: LoggerService
) => {

  apiRouter.use('/auth', createAuthRouter(userService, mailService, loggerService));
  apiRouter.use('/invites', createInvitesRouter(invitesService, loggerService));
  apiRouter.use('/events', createEventsRouter(eventsService, loggerService));
  apiRouter.use('/familyGroups', createFamilyGroupsRouter(familyGroupService, loggerService));
  apiRouter.use('/images', createImagesRouter(imagesService, inviteImagesService, loggerService));
  apiRouter.use('/roles', createRolesRouter(rolesService, loggerService));
  apiRouter.use('/settings', createSettingsRouter(eventSettingsService, loggerService));
  apiRouter.use('/users', createUsersRouter(userService, eventsService, loggerService));

  return apiRouter
}
