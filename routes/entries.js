import { Router } from 'express'
import { EntryController } from '../controllers/entries.js'

export const entriesRouter = Router()

export const createEntriesRouter = ({ entryModel }) => {
  const entrieController = new EntryController({ entryModel })

  entriesRouter.get('/', entrieController.getAll)
  entriesRouter.post('/', entrieController.create)

  entriesRouter.get('/:id', entrieController.getById)
  entriesRouter.delete('/:id', entrieController.delete)
  entriesRouter.put('/:id', entrieController.update)
  entriesRouter.patch('/:id', entrieController.updateConfirmation)

  return entriesRouter
}
