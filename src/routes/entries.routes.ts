import { Router } from 'express'
import EntriesController from '../controllers/entries.js';
import { EntriesService } from '../services/entries.js';
import { isEntriesAdmin, verifyToken } from '../middleware/authJwt.js';
import { validateUuid } from '../middleware/validateUuid.js';

export const entriesRouter = Router();

export const createEntriesRouter = (entriesService: EntriesService) => {
  const entriesController = new EntriesController(entriesService);

  entriesRouter.get('/', [verifyToken, isEntriesAdmin], entriesController.getEntries);
  entriesRouter.post('/', [verifyToken, isEntriesAdmin], entriesController.createEntry);

  entriesRouter.get('/:id', [validateUuid], entriesController.getEntryById);
  entriesRouter.get('/invite/:id', [validateUuid], entriesController.getEntryForEvent);
  entriesRouter.delete('/:id', [verifyToken, isEntriesAdmin, validateUuid], entriesController.deleteEntry);
  entriesRouter.put('/:id', [verifyToken, isEntriesAdmin, validateUuid], entriesController.updateEntry);

  entriesRouter.patch('/messages/:id', [verifyToken, isEntriesAdmin], entriesController.readMessage);
  entriesRouter.patch('/:id', [validateUuid], entriesController.updateConfirmation);

  return entriesRouter
}