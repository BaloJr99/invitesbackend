import { Router } from 'express'
import { ImagesController } from '../controllers/images.js'
import { isEntriesAdmin } from '../middleware/auth.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { InviteImagesService } from '../services/inviteImages.js'
import { ImagesService } from '../config/cloudinary/cloudinary.js'
import { checkJwt } from '../middleware/session.js'

export const imagesRouter = Router()

export const createImagesRouter = (imagesService: ImagesService, inviteImagesService: InviteImagesService ) => {
  const imagesController = new ImagesController(imagesService, inviteImagesService);

  imagesRouter.post('/', [checkJwt, isEntriesAdmin], imagesController.createImage);

  imagesRouter.get('/:id', [validateUuid], imagesController.getAllImages);
  imagesRouter.delete('/', [validateUuid], imagesController.deleteImage);
  imagesRouter.put('/', [checkJwt, isEntriesAdmin, validateUuid], imagesController.updateImage);

  return imagesRouter
}
