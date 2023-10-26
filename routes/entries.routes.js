import { Router } from 'express'
import { EntryController } from '../controllers/entries.js'
import { isEntriesAdmin, verifyToken } from '../middlewares/authJwt.js'

export const entriesRouter = Router()

export const createEntriesRouter = ({ entryModel }) => {
  const entrieController = new EntryController({ entryModel })

  entriesRouter.get('/', [verifyToken, isEntriesAdmin], entrieController.getAll)
  entriesRouter.post('/', [verifyToken, isEntriesAdmin], entrieController.create)

  entriesRouter.get('/:id', entrieController.getById)
  entriesRouter.delete('/:id', [verifyToken, isEntriesAdmin], entrieController.delete)
  entriesRouter.put('/:id', [verifyToken, isEntriesAdmin], entrieController.update)
  entriesRouter.patch('/:id', entrieController.updateConfirmation)

  return entriesRouter
}
