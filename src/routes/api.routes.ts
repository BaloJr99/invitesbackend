import { Router } from 'express';
import { createEventsRouter } from './events.routes.js';
import { createImagesRouter } from './images.routes.js';
import { createFamilyGroupsRouter } from './familyGroup.routes.js';
import { createAuthRouter } from './auth.routes.js';
import { EventsService } from '../services/events.js';
import { ImagesService } from '../config/cloudinary/cloudinary.js';
import { InviteImagesService } from '../services/inviteImages.js';
import { FamilyGroupService } from '../services/familyGroups.js';
import { UserService } from '../services/users.js';
import { EntriesService } from '../services/entries.js';
import { createEntriesRouter } from './entries.routes.js';

export const apiRouter = Router();

export const createApiRouter = (
  entriesService: EntriesService,
  eventsService: EventsService, 
  imagesService: ImagesService, 
  inviteImagesService: InviteImagesService, 
  familyGroupService: FamilyGroupService, 
  userService: UserService) => {

  apiRouter.use('/entries', createEntriesRouter(entriesService));
  apiRouter.use('/events', createEventsRouter(eventsService));
  apiRouter.use('/images', createImagesRouter(imagesService, inviteImagesService));
  apiRouter.use('/familyGroups', createFamilyGroupsRouter(familyGroupService));
  apiRouter.use('/auth', createAuthRouter(userService));

  return apiRouter
}
