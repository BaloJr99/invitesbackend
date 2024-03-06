import { Router } from 'express'
import { EntryController } from '../controllers/entries.js'
import { isEntriesAdmin, verifyToken } from '../middlewares/authJwt.js'
import { validateUuid } from '../middlewares/validateUuid.js'

export const entriesRouter = Router()

export const createEntriesRouter = ({ entryModel }) => {
  const entrieController = new EntryController({ entryModel })

  entriesRouter.get('/', [verifyToken, isEntriesAdmin], entrieController.getAll)
  entriesRouter.post(
    '/',
    [verifyToken, isEntriesAdmin],
    entrieController.create
  )

  entriesRouter.get('/:id', [validateUuid], entrieController.getById)
  entriesRouter.get('/invite/:id', [validateUuid], entrieController.getEntry)
  entriesRouter.delete(
    '/:id',
    [verifyToken, isEntriesAdmin, validateUuid],
    entrieController.delete
  )
  entriesRouter.put(
    '/:id',
    [verifyToken, isEntriesAdmin, validateUuid],
    entrieController.update
  )
  entriesRouter.patch(
    '/messages/:id',
    [verifyToken, isEntriesAdmin],
    entrieController.readMessage
  )
  entriesRouter.patch(
    '/:id',
    [validateUuid],
    entrieController.updateConfirmation
  )

  return entriesRouter
}
