import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { handleHttp } from '../utils/error.handle.js';
import { EntriesService } from '../services/entries.js';
import { AuthModel } from '../interfaces/authModel.js';
import { FullEntryModel } from '../interfaces/entriesModels.js';
import { validateConfirmationSchema, validateEntry } from '../schemas/entries.js';

export class EntriesController {
  constructor (private entryService: EntriesService) {
    this.entryService = entryService;
  }

  getEntries = async (req: Request, res: Response) => {
    try {
      const token = req.headers['x-access-token'] as string;

      if (token === "") {
        return res.status(403).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.SECRET) as AuthModel;

      const [entries] = await this.entryService.getAllEntries(decoded.id) as FullEntryModel[];

      return res.status(200).json(entries);
    } catch (error) {
      handleHttp(res, 'ERROR_GET_ALL_ENTRIES');
    }
  };

  getEntryById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const entry = await this.entryService.getEntryById(id) as FullEntryModel[];

      if (entry.length > 0) return res.json(entry.at(0));

      return res.status(404).json({ message: 'Invitación no encontrada' });
    } catch (error) {
      handleHttp(res, 'ERROR_GET_ENTRY_BY_ID');
    }
  };

  getEntryForEvent = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const entry = await this.entryService.getEntry(id) as FullEntryModel[];

      if (entry.length > 0) return res.json(entry.at(0));

      return res.status(404).json({ message: 'Invitación no encontrada' });
    } catch (error) {
      handleHttp(res, 'ERROR_GET_ENTRY_FOR_EVENT');
    }
  };

  createEntry = async (req: Request, res: Response) => {
    try {
      const result = validateEntry(req.body);

      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) });
      }

      const token = req.headers['x-access-token'] as string;

      if (token === "") return res.status(403).json({ error: 'No token provided' });

      const decoded = jwt.verify(token, process.env.SECRET) as AuthModel;

      const entryId = await this.entryService.createEntry(result.data, decoded.id);

      return res.status(201).json({ id: entryId, message: 'Invitación creada' });
    } catch (error) {
      handleHttp(res, 'ERROR_CREATE_ENTRY');
    }
  };

  deleteEntry = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await this.entryService.deleteEntry(id);

      return res.json({ message: 'Invitación eliminada' })
    } catch (error) {
      handleHttp(res, 'ERROR_DELETE_ENTRY');
    }
  };

  updateEntry = async (req: Request, res: Response) => {
    try {
      const result = validateEntry(req.body);

      if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) });
      }

      const { id } = req.params;

      await this.entryService.updateEntry(id, result.data);

      return res.status(201).json({ message: 'Invitación actualizada' });
    } catch (error) {
      handleHttp(res, 'ERROR_UPDATE_ENTRY');
    }
  };

  updateConfirmation = async (req: Request, res: Response) => {
    try {
      const result = validateConfirmationSchema(req.body);

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params;
    await this.entryService.updateConfirmation(id, result.data);

    return res.status(201).json({ message: 'Respuesta enviada' })
    } catch (error) {
      console.log(error);
      handleHttp(res, 'ERROR_UPDATE_CONFIRMATION');
    }
  };

  readMessage = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.entryService.readMessage(id);
    } catch (error) {
      handleHttp(res, 'ERROR_READ_MESSAGE');
    }
  };
}

export default EntriesController;