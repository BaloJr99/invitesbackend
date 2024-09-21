import { Router } from 'express'
import { ImagesController } from '../controllers/images.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { InviteImagesService } from '../services/inviteImages.js'
import { ImagesService } from '../config/cloudinary/cloudinary.js'
import { LoggerService } from '../services/logger.js'
import { isInvitesAdmin } from '../middleware/auth.js'
import { checkJwt } from '../middleware/session.js'

export const imagesRouter = Router()

export const createImagesRouter = (
  imagesService: ImagesService,
  inviteImagesService: InviteImagesService,
  loggerService: LoggerService
) => {
  const imagesController = new ImagesController(
    imagesService,
    inviteImagesService,
    loggerService
  )

  imagesRouter.post(
    '/',
    [checkJwt, isInvitesAdmin],
    imagesController.createImage
  )

  imagesRouter.get('/:id', [validateUuid], imagesController.getAllImages)
  imagesRouter.delete(
    '/',
    [checkJwt, isInvitesAdmin],
    imagesController.deleteImage
  )
  imagesRouter.put(
    '/',
    [checkJwt, isInvitesAdmin],
    imagesController.updateImage
  )

  return imagesRouter
}
