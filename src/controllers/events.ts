import { validateEvent } from '../schemas/events.js'
import jwt from 'jsonwebtoken';
import { EventsService } from '../services/events.js';
import { Request, Response } from 'express';
import { AuthModel } from '../interfaces/authModel.js';
import { FullEventModel } from '../interfaces/eventsModel.js';
import { handleHttp } from '../utils/error.handle.js';

export class EventsController {
  constructor (private eventService: EventsService) {
    this.eventService = eventService;
  }

  getEvents = async (req: Request, res: Response) => {
    try {
      const token = req.headers['x-access-token'] as string;
  
      if (token === "") return res.status(403).json({ error: 'No token provided' });
  
      const decoded = jwt.verify(token, process.env.SECRET) as AuthModel;
  
      const events = await this.eventService.getEvents(decoded.id);
  
      return res.json(events);
    } catch (error) {
      handleHttp(res, 'ERROR_GET_ALL_EVENTS');
    }
  }

  getEventEntries = async (req: Request, res: Response) => {
    try {
      const token = req.headers['x-access-token'] as string;
      const { id } = req.params;
  
      if (token === "") return res.status(403).json({ error: 'No token provided' });
  
      const decoded = jwt.verify(token, process.env.SECRET) as AuthModel;
  
      const events = await this.eventService.getEventEntries(decoded.id, id);
  
      return res.json(events);
    } catch (error) {
      handleHttp(res, 'ERROR_GET_EVENT_ENTRIES');
    }
  }

  getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
  
      const event = await this.eventService.getEventById(id) as FullEventModel[];
  
      if (event.length > 0) return res.json(event.at(0));
  
      return res.status(404).json({ message: 'Evento no encontrado' });
    } catch (error) {
      handleHttp(res, 'ERROR_GET_EVENT_BY_ID');
    }
  }

  createEvent = async (req: Request, res: Response) => {
    try {
      const result = validateEvent(req.body);
  
      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) });
      }
  
      const token = req.headers['x-access-token'] as string;
  
      if (token === "") return res.status(403).json({ error: 'No token provided' });
  
      const decoded = jwt.verify(token, process.env.SECRET) as AuthModel;
  
      const eventId = await this.eventService.createEvent(
        result.data,
        decoded.id
      );
  
      return res.status(201).json({ id: eventId, message: 'Evento creado' });
    } catch (error) {
      handleHttp(res, 'ERROR_CREATE_EVENT');
    }
  }

  deleteEvent = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.eventService.deleteEvent(id);
  
      return res.json({ message: 'Evento eliminado' });
    } catch (error) {
      handleHttp(res, 'ERROR_DELETE');
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
    } catch (error) {
      handleHttp(res, 'ERROR_UPDATE_EVENT');
    }
  }
}
