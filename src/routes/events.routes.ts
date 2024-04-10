import { Router } from 'express'
import { EventsController } from '../controllers/events.js'
import { EventsService } from '../services/events.js'
import { isEntriesAdmin } from '../middleware/auth.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { checkJwt } from '../middleware/session.js'

export const eventsRouter = Router()

export const createEventsRouter = (eventsService: EventsService) => {
  const eventController = new EventsController(eventsService);

  eventsRouter.get('/', [checkJwt, isEntriesAdmin], eventController.getEvents);
  eventsRouter.get('/entries/:id', [checkJwt, isEntriesAdmin], eventController.getEventEntries);
  eventsRouter.post('/', [checkJwt, isEntriesAdmin], eventController.createEvent);

  eventsRouter.get('/:id', [validateUuid], eventController.getById);
  eventsRouter.delete('/:id', [checkJwt, isEntriesAdmin, validateUuid], eventController.deleteEvent);
  eventsRouter.put('/:id', [checkJwt, isEntriesAdmin, validateUuid], eventController.updateEvent);

  return eventsRouter;
}
