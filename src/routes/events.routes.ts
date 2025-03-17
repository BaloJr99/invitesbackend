import { Router } from 'express'
import { EventsController } from '../controllers/events.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { MysqlDatabase } from '../services/mysql-database.js'
import { isInvitesAdmin } from '../middleware/auth.js'
import { checkJwt } from '../middleware/session.js'

export const eventsRouter = Router()

export const createEventsRouter = (mysqlDatabase: MysqlDatabase) => {
  const eventController = new EventsController(mysqlDatabase)

  eventsRouter.get(
    '/',
    [checkJwt, isInvitesAdmin],
    eventController.getAllEvents
  )
  eventsRouter.get(
    '/dropdown',
    [checkJwt, isInvitesAdmin],
    eventController.getDropdownEvents
  )
  eventsRouter.get(
    '/:id/eventInformation',
    [checkJwt, isInvitesAdmin],
    eventController.eventInformation
  )

  eventsRouter.get(
    '/invites/:id',
    [validateUuid, checkJwt, isInvitesAdmin],
    eventController.getEventInvites
  )

  eventsRouter.get('/isActive/:id', eventController.isActive)

  eventsRouter.get(
    '/invites/:id/deadlineMet',
    [validateUuid, checkJwt, isInvitesAdmin],
    eventController.isDeadlineMet
  )

  eventsRouter.post('/', checkJwt, isInvitesAdmin, eventController.createEvent)
  eventsRouter.get(
    '/:id',
    [validateUuid, checkJwt, isInvitesAdmin],
    eventController.getEventById
  )
  eventsRouter.delete(
    '/:id',
    [validateUuid, checkJwt, isInvitesAdmin],
    eventController.deleteEvent
  )
  eventsRouter.put(
    '/:id',
    [validateUuid, checkJwt, isInvitesAdmin],
    eventController.updateEvent
  )

  return eventsRouter
}
