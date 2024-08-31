import { validateSettings } from '../schemas/settings.js'
import { SettingsService } from '../services/settings.js';
import { Request, Response } from 'express';
import { FullSettingsModel } from '../interfaces/settingsModel.js';
import { ErrorHandler } from '../utils/error.handle.js';
import { LoggerService } from '../services/logger.js';

export class SettingsController {
  errorHandler: ErrorHandler;

  constructor (
    private settingsService: SettingsService,
    private loggerService: LoggerService
  ) {
    this.settingsService = settingsService;
    this.errorHandler = new ErrorHandler(this.loggerService);
  }

  getEventSettingsById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
  
      const event = await this.settingsService.getEventSettingsById(id) as FullSettingsModel[];
  
      if (event.length > 0) return res.json(event.at(0));
  
      return res.status(404).json({ message: 'Las configuraciones del evento no se encontraron' });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_GET_EVENT_SETTINGS_BY_ID', e.message, req.userId);
    }
  }

  createEventSettings = async (req: Request, res: Response) => {
    try {
      const result = validateSettings(req.body);
  
      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) });
      }
  
      const settingId = await this.settingsService.createEventSettings(
        result.data
      );
  
      return res.status(201).json({ id: settingId, message: 'Configuraciones del evento creadas' });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_CREATE_EVENT_SETTINGS', e.message, req.userId);
    }
  }

  updateEventSettings = async (req: Request, res: Response) => {
    try {
      const result = validateSettings(req.body);
  
      if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) });
      }
  
      const { id } = req.params;

      await this.settingsService.updateEventSettings(id, result.data);
  
      return res.status(201).json({ message: 'Configuraciones del evento actualizadas' });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_UPDATE_EVENT_SETTINGS', e.message, req.userId);
    }
  }
}
