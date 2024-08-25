import { Router } from 'express'
import { EventsController } from '../controllers/events.js'
import { EventsService } from '../services/events.js'
import { isInvitesAdmin } from '../middleware/auth.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { checkJwt } from '../middleware/session.js'

export const eventsRouter = Router()

export const createEventsRouter = (eventsService: EventsService) => {
  const eventController = new EventsController(eventsService);

  eventsRouter.get('/', [checkJwt, isInvitesAdmin], eventController.getAllEvents);
  eventsRouter.get('/users', [checkJwt, isInvitesAdmin], eventController.getEventsByUser);
  eventsRouter.get('/invites/:id', [checkJwt, isInvitesAdmin], eventController.getEventInvites);
  eventsRouter.post('/', [checkJwt, isInvitesAdmin], eventController.createEvent);

  eventsRouter.get('/:id', [validateUuid], eventController.getEventById);
  eventsRouter.delete('/:id', [checkJwt, isInvitesAdmin, validateUuid], eventController.deleteEvent);
  eventsRouter.put('/:id', [checkJwt, isInvitesAdmin, validateUuid], eventController.updateEvent);

  return eventsRouter;
}
