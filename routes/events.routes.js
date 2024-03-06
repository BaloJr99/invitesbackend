import { Router } from 'express'
import { EventsController } from '../controllers/events.js'
import { isEntriesAdmin, verifyToken } from '../middlewares/authJwt.js'
import { validateUuid } from '../middlewares/validateUuid.js'

export const eventsRouter = Router()

export const createEventsRouter = ({ eventModel }) => {
  const eventController = new EventsController({ eventModel })

  eventsRouter.get('/', [verifyToken, isEntriesAdmin], eventController.getAll)
  eventsRouter.get('/entries/:id', [verifyToken, isEntriesAdmin], eventController.getEventEntries)
  eventsRouter.post('/', [verifyToken, isEntriesAdmin], eventController.create)

  eventsRouter.get('/:id', [validateUuid], eventController.getById)
  eventsRouter.delete('/:id', [verifyToken, isEntriesAdmin, validateUuid], eventController.delete)
  eventsRouter.put('/:id', [verifyToken, isEntriesAdmin, validateUuid], eventController.update)

  return eventsRouter
}
