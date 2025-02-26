import { Request, RequestHandler, Response } from 'express'
import { ErrorHandler } from '../utils/error.handle.js'
import {
  validateSaveTheDateSettings,
  validateSweetXvSettings,
  validateWeddingSettings
} from '../schemas/settings.js'
import { EventType } from '../global/enum.js'
import { MysqlDatabase } from '../services/mysql-database.js'
import { SettingsRepository } from '../repositories/settings-repository.js'
import { EventsRepository } from '../repositories/events-repository.js'

export class SettingsController {
  private errorHandler: ErrorHandler
  private settingsRepository: SettingsRepository
  private eventsRepository: EventsRepository

  constructor(mysqlDatabase: MysqlDatabase) {
    this.errorHandler = new ErrorHandler(mysqlDatabase)
    this.settingsRepository = new SettingsRepository(mysqlDatabase)
    this.eventsRepository = new EventsRepository(mysqlDatabase)
  }

  getEventSettingsById: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params

      const eventFound = await this.eventsRepository.getEventById(id)

      if (eventFound.length === 0) {
        res.json({ message: req.t('messages.EVENT_NOT_FOUND') })
        return
      }

      const event = await this.settingsRepository.getEventSettingsById(id)
      if (event.length > 0) {
        res.json(event[0])
        return
      }

      res.json({
        eventId: id,
        settings: '{}'
      })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_GET_EVENT_SETTINGS_BY_ID',
        e.message,
        req.userId
      )
    }
  }

  createEventSettings: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { eventType } = req.params

      let result

      if (eventType === EventType.Xv) {
        result = validateSweetXvSettings(req.body)
      } else {
        result = validateSaveTheDateSettings(req.body)
      }

      if (!result.success) {
        res.status(422).json(JSON.parse(result.error.message))
        return
      }

      const { eventId, ...settings } = result.data

      const settingId = await this.settingsRepository.createEventSettings({
        eventId,
        settings: JSON.stringify(settings)
      })

      res
        .status(201)
        .json({ id: settingId, message: req.t('messages.SETTINGS_CREATED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_CREATE_EVENT_SETTINGS',
        e.message,
        req.userId
      )
    }
  }

  updateEventSettings: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { eventType } = req.params

      let result

      if (eventType === EventType.Xv) {
        result = validateSweetXvSettings(req.body)
      } else if (eventType === EventType.Wedding) {
        result = validateWeddingSettings(req.body)
      } else {
        result = validateSaveTheDateSettings(req.body)
      }

      if (!result.success) {
        res.status(422).json(JSON.parse(result.error.message))
        return
      }

      const { eventId, ...settings } = result.data

      await this.settingsRepository.updateEventSettings({
        eventId,
        settings: JSON.stringify(settings)
      })

      res.status(201).json({ message: req.t('messages.SETTINGS_UPDATED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_UPDATE_EVENT_SETTINGS',
        e.message,
        req.userId
      )
    }
  }
}
