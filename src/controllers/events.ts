import { validateEvent } from '../schemas/events.js'
import { EventsService } from '../services/events.js';
import { Request, Response } from 'express';
import { FullEventModel } from '../interfaces/eventsModel.js';
import { LoggerService } from '../services/logger.js';
import { ErrorHandler } from '../utils/error.handle.js';

export class EventsController {
  errorHandler: ErrorHandler;
  constructor (
    private eventService: EventsService,
    private loggerService: LoggerService
  ) {
    this.eventService = eventService;
    this.errorHandler = new ErrorHandler(this.loggerService);
  }

  getAllEvents = async (req: Request, res: Response) => {
    try {
      const events = await this.eventService.getAllEvents();
      return res.json(events);
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_RESET_PASSWORD', e.message, req.userId);
    }
  }

  getEventsByUser = async (req: Request, res: Response) => {
    try {
      const events = await this.eventService.getEventsByUser(req.userId);
  
      return res.json(events);
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_GET_ALL_EVENTS', e.message, req.userId);
    }
  }

  getEventInvites = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const events = await this.eventService.getEventInvites(id);
  
      return res.json(events);
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_GET_EVENT_INVITES', e.message, req.userId);
    }
  }

  getEventById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
  
      const event = await this.eventService.getEventById(id) as FullEventModel[];
  
      if (event.length > 0) return res.json(event.at(0));
  
      return res.status(404).json({ message: 'Evento no encontrado' });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_GET_EVENT_BY_ID', e.message, req.userId);
    }
  }

  createEvent = async (req: Request, res: Response) => {
    try {
      const result = validateEvent(req.body);
  
      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) });
      }
  
      const eventId = await this.eventService.createEvent(result.data);
  
      return res.status(201).json({ id: eventId, message: 'Evento creado' });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_CREATE_EVENT', e.message, req.userId);
    }
  }

  deleteEvent = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.eventService.deleteEvent(id);
  
      return res.json({ message: 'Evento eliminado' });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_DELETE', e.message, req.userId);
    }
  }

  updateEvent = async (req: Request, res: Response) => {
    try {
      const result = validateEvent(req.body);
  
      if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) });
      }
  
      const { id } = req.params;

      await this.eventService.updateEvent(id, result.data);
  
      return res.status(201).json({ message: 'Evento actualizado' });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_UPDATE_EVENT', e.message, req.userId);
    }
  }
}
