import { SettingsService } from '../services/settings.js'
import { Request, Response } from 'express'
import { ErrorHandler } from '../utils/error.handle.js'
import { LoggerService } from '../services/logger.js'
import {
  validateSaveTheDateSettings,
  validateSweetXvSettings,
  validateWeddingSettings
} from '../schemas/settings.js'
import { EventType } from '../interfaces/enum.js'

export class SettingsController {
  errorHandler: ErrorHandler

  constructor(
    private settingsService: SettingsService,
    private loggerService: LoggerService
  ) {
    this.settingsService = settingsService
    this.errorHandler = new ErrorHandler(this.loggerService)
  }

  getEventSettingsById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const event = await this.settingsService.getEventSettingsById(id)
      if (event.length > 0)
        return res.json({
          ...event[0]
        })

      return res
        .status(404)
        .json({ message: req.t('messages.SETTINGS_NOT_FOUND') })
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

  createEventSettings = async (req: Request, res: Response) => {
    try {
      const { eventType } = req.params

      let result

      if (eventType === EventType.Xv) {
        result = validateSweetXvSettings(req.body)
      } else {
        result = validateSaveTheDateSettings(req.body)
      }

      if (!result.success) {
        return res.status(422).json(JSON.parse(result.error.message))
      }

      const { eventId, ...settings } = result.data

      const settingId = await this.settingsService.createEventSettings({
        eventId,
        settings: JSON.stringify(settings)
      })

      return res
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

  updateEventSettings = async (req: Request, res: Response) => {
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
        return res.status(422).json(JSON.parse(result.error.message))
      }

      const { eventId, ...settings } = result.data

      await this.settingsService.updateEventSettings({
        eventId,
        settings: JSON.stringify(settings)
      })

      return res
        .status(201)
        .json({ message: req.t('messages.SETTINGS_UPDATED') })
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
