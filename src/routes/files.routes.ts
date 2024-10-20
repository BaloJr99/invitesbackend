import { Router } from 'express'
import { FilesController } from '../controllers/files.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { LoggerService } from '../services/logger.js'
import { isInvitesAdmin } from '../middleware/auth.js'
import { checkJwt } from '../middleware/session.js'
import multer from 'multer'
import { FilesService } from '../services/files.js'

export const filesRouter = Router()

export const createFilesRouter = (
  filesService: FilesService,
  loggerService: LoggerService
) => {
  const filesController = new FilesController(filesService, loggerService)

  const storage = multer.memoryStorage()
  const upload = multer({ storage, limits: { fileSize: 1024 * 1024 * 5 } })

  filesRouter.post(
    '/',
    upload.single('music'),
    [checkJwt, isInvitesAdmin],
    filesController.createFile
  )

  filesRouter.get('/:id', [validateUuid], filesController.getAllFiles)

  filesRouter.delete(
    '/',
    [checkJwt, isInvitesAdmin],
    filesController.deleteFile
  )

  filesRouter.put('/', [checkJwt, isInvitesAdmin], filesController.updateFile)

  return filesRouter
}
