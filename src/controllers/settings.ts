import { validateSettings } from '../schemas/settings.js'
import { EventSettingsService } from '../services/settings.js';
import { Request, Response } from 'express';
import { AuthModel } from '../interfaces/authModel.js';
import { FullSettingsModel } from '../interfaces/settingsModel.js';
import { handleHttp } from '../utils/error.handle.js';
import { verifyJwtToken } from '../utils/jwt.handle.js';

export class SettingsController {
  constructor (private eventSettingsService: EventSettingsService) {
    this.eventSettingsService = eventSettingsService;
  }

  getEventSettingsById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
  
      const event = await this.eventSettingsService.getEventSettingsById(id) as FullSettingsModel[];
  
      if (event.length > 0) return res.json(event.at(0));
  
      return res.status(404).json({ message: 'Las configuraciones del evento no se encontraron' });
    } catch (error) {
      handleHttp(res, 'ERROR_GET_EVENT_SETTINGS_BY_ID');
    }
  }

  createEventSettings = async (req: Request, res: Response) => {
    try {
      const result = validateSettings(req.body);
  
      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) });
      }
  
      const token = req.headers.authorization || '';
  
      if (token === "") return res.status(403).json({ error: 'No token provided' });
  
      const decoded = verifyJwtToken(token) as AuthModel;
  
      const eventId = await this.eventSettingsService.createEventSettings(
        result.data,
        decoded.id
      );
  
      return res.status(201).json({ id: eventId, message: 'Configuraciones del evento creadas' });
    } catch (error) {
      console.error(error);
      handleHttp(res, 'ERROR_CREATE_EVENT_SETTINGS');
    }
  }

  updateEventSettings = async (req: Request, res: Response) => {
    try {
      const result = validateSettings(req.body);
  
      if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) });
      }
  
      const { id } = req.params;

      await this.eventSettingsService.updateEventSettings(id, result.data);
  
      return res.status(201).json({ message: 'Configuraciones del evento actualizadas' });
    } catch (error) {
      handleHttp(res, 'ERROR_UPDATE_EVENT_SETTINGS');
    }
  }
}
