import { Router } from 'express'
import EntriesController from '../controllers/entries.js';
import { EntriesService } from '../services/entries.js';
import { isEntriesAdmin } from '../middleware/auth.js';
import { validateUuid } from '../middleware/validateUuid.js';
import { checkJwt } from '../middleware/session.js';

export const entriesRouter = Router();

export const createEntriesRouter = (entriesService: EntriesService) => {
  const entriesController = new EntriesController(entriesService);

  entriesRouter.get('/', [checkJwt, isEntriesAdmin], entriesController.getEntries);
  entriesRouter.post('/', [checkJwt, isEntriesAdmin], entriesController.createEntry);

  entriesRouter.get('/:id', [validateUuid], entriesController.getEntryById);
  entriesRouter.get('/invite/:id', [validateUuid], entriesController.getEntryForEvent);
  entriesRouter.delete('/:id', [checkJwt, isEntriesAdmin, validateUuid], entriesController.deleteEntry);
  entriesRouter.put('/:id', [checkJwt, isEntriesAdmin, validateUuid], entriesController.updateEntry);

  entriesRouter.patch('/messages/:id', [checkJwt, isEntriesAdmin], entriesController.readMessage);
  entriesRouter.patch('/:id', [validateUuid], entriesController.updateConfirmation);

  return entriesRouter
}