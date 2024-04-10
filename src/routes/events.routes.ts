import { Router } from 'express'
import { EventsController } from '../controllers/events.js'
import { EventsService } from '../services/events.js'
import { isEntriesAdmin, verifyToken } from '../middleware/authJwt.js'
import { validateUuid } from '../middleware/validateUuid.js'

export const eventsRouter = Router()

export const createEventsRouter = (eventsService: EventsService) => {
  const eventController = new EventsController(eventsService);

  eventsRouter.get('/', [verifyToken, isEntriesAdmin], eventController.getEvents);
  eventsRouter.get('/entries/:id', [verifyToken, isEntriesAdmin], eventController.getEventEntries);
  eventsRouter.post('/', [verifyToken, isEntriesAdmin], eventController.createEvent);

  eventsRouter.get('/:id', [validateUuid], eventController.getById);
  eventsRouter.delete('/:id', [verifyToken, isEntriesAdmin, validateUuid], eventController.deleteEvent);
  eventsRouter.put('/:id', [verifyToken, isEntriesAdmin, validateUuid], eventController.updateEvent);

  return eventsRouter;
}
