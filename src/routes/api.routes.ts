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
import { EntriesService } from '../services/entries.js';
import { createEntriesRouter } from './entries.routes.js';
import { EventSettingsService } from '../services/settings.js';
import { createSettingsRouter } from './settings.routes.js';
import { createUsersRouter } from './users.routes.js';
import { RolesService } from '../services/roles.js';
import { createRolesRouter } from './roles.routes.js';
import { MailService } from '../services/mail.js';

export const apiRouter = Router();

export const createApiRouter = (
  entriesService: EntriesService,
  eventsService: EventsService, 
  imagesService: ImagesService, 
  inviteImagesService: InviteImagesService, 
  familyGroupService: FamilyGroupsService, 
  userService: UsersService,
  eventSettingsService: EventSettingsService,
  rolesService: RolesService,
  mailService: MailService) => {

  apiRouter.use('/entries', createEntriesRouter(entriesService));
  apiRouter.use('/events', createEventsRouter(eventsService));
  apiRouter.use('/images', createImagesRouter(imagesService, inviteImagesService));
  apiRouter.use('/familyGroups', createFamilyGroupsRouter(familyGroupService));
  apiRouter.use('/auth', createAuthRouter(userService, mailService));
  apiRouter.use('/settings', createSettingsRouter(eventSettingsService));
  apiRouter.use('/users', createUsersRouter(userService, eventsService));
  apiRouter.use('/roles', createRolesRouter(rolesService));

  return apiRouter
}
