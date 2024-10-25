import { Router } from 'express'
import { EventsController } from '../controllers/events.js'
import { EventsService } from '../services/events.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { LoggerService } from '../services/logger.js'

export const eventsRouter = Router()

export const createEventsRouter = (
  eventsService: EventsService,
  loggerService: LoggerService
) => {
  const eventController = new EventsController(eventsService, loggerService)

  eventsRouter.get('/', eventController.getAllEvents)
  eventsRouter.get('/dropdown', eventController.getDropdownEvents)
  eventsRouter.get('/:id/eventInformation', eventController.eventInformation)

  eventsRouter.get(
    '/invites/:id',
    [validateUuid],
    eventController.getEventInvites
  )

  eventsRouter.get(
    '/invites/:id/deadlineMet',
    [validateUuid],
    eventController.isDeadlineMet
  )

  eventsRouter.post('/', eventController.createEvent)
  eventsRouter.get('/:id', [validateUuid], eventController.getEventById)
  eventsRouter.delete('/:id', [validateUuid], eventController.deleteEvent)
  eventsRouter.put('/:id', [validateUuid], eventController.updateEvent)

  return eventsRouter
}
