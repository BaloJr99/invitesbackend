import { validateEvent } from '../schemas/events.js'
import { EventsService } from '../services/events.js'
import { Request, Response } from 'express'
import { IDashboardEvent, IDropdownEvent } from '../interfaces/eventsModel.js'
import { LoggerService } from '../services/logger.js'
import { ErrorHandler } from '../utils/error.handle.js'
import { verifyJwtToken } from '../utils/jwt.handle.js'

export class EventsController {
  errorHandler: ErrorHandler
  constructor(
    private eventService: EventsService,
    private loggerService: LoggerService
  ) {
    this.eventService = eventService
    this.errorHandler = new ErrorHandler(this.loggerService)
  }

  getAllEvents = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization || ''

      const decoded = verifyJwtToken(token)
      const isAdmin = decoded.roles.some((r) => r.name == 'admin')

      let events: IDashboardEvent[]
      if (isAdmin) {
        events = await this.eventService.getAllEvents()
      } else {
        events = await this.eventService.getEventsByUser(req.userId)
      }
      return res.json(events)
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_GET_ALL_EVENTS',
        e.message,
        req.userId
      )
    }
  }

  getDropdownEvents = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization || ''

      const decoded = verifyJwtToken(token)
      const isAdmin = decoded.roles.some((r) => r.name == 'admin')

      let events: IDropdownEvent[]
      if (isAdmin) {
        events = await this.eventService.getDropdownEvents()
      } else {
        events = await this.eventService.getDropdownEventsByUserId(req.userId)
      }

      return res.json(events)
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_GET_DROPDOWN_EVENTS',
        e.message,
        req.userId
      )
    }
  }

  getEventType = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const eventType = await this.eventService.getEventType(id)

      if (eventType.length > 0) return res.json(eventType[0].typeOfEvent)

      return res
        .status(404)
        .json({ message: req.t('messages.EVENT_NOT_FOUND') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_GET_DROPDOWN_EVENTS',
        e.message,
        req.userId
      )
    }
  }

  getEventInvites = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const events = await this.eventService.getEventInvites(id)

      return res.json(events)
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_GET_EVENT_INVITES',
        e.message,
        req.userId
      )
    }
  }

  isDeadlineMet = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const deadlineResults = await this.eventService.isDeadlineMet(id)

      if (deadlineResults.length === 0) {
        return res.json(false)
      }

      return res.json(Boolean(deadlineResults[0].isDeadlineMet))
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_IS_DEADLINE_MET',
        e.message,
        req.userId
      )
    }
  }

  getEventById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const event = await this.eventService.getEventById(id)

      if (event.length > 0) return res.json(event.at(0))

      return res
        .status(404)
        .json({ message: req.t('messages.EVENT_NOT_FOUND') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_GET_EVENT_BY_ID',
        e.message,
        req.userId
      )
    }
  }

  createEvent = async (req: Request, res: Response) => {
    try {
      const result = validateEvent(req.body)

      if (!result.success) {
        return res.status(422).json(JSON.parse(result.error.message))
      }

      const eventId = await this.eventService.createEvent(result.data)

      return res
        .status(201)
        .json({ id: eventId, message: req.t('messages.EVENT_CREATED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_CREATE_EVENT',
        e.message,
        req.userId
      )
    }
  }

  deleteEvent = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      await this.eventService.deleteEvent(id)

      return res.json({ message: req.t('messages.EVENT_DELETED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_DELETE_EVENT',
        e.message,
        req.userId
      )
    }
  }

  updateEvent = async (req: Request, res: Response) => {
    try {
      const result = validateEvent(req.body)
      const { override } = req.query

      if (!result.success) {
        return res.status(422).json(JSON.parse(result.error.message))
      }

      const { id } = req.params

      await this.eventService.updateEvent(id, result.data, JSON.parse(override as string))

      return res.status(201).json({ message: req.t('messages.EVENT_UPDATED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_UPDATE_EVENT',
        e.message,
        req.userId
      )
    }
  }
}
