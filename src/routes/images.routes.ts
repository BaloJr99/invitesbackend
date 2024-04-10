import { Router } from 'express'
import { ImagesController } from '../controllers/images.js'
import { isEntriesAdmin, verifyToken } from '../middleware/authJwt.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { InviteImagesService } from '../services/inviteImages.js'
import { ImagesService } from '../config/cloudinary/cloudinary.js'

export const imagesRouter = Router()

export const createImagesRouter = (imagesService: ImagesService, inviteImagesService: InviteImagesService ) => {
  const imagesController = new ImagesController(imagesService, inviteImagesService);

  imagesRouter.post('/', [verifyToken, isEntriesAdmin], imagesController.createImage);

  imagesRouter.get('/:id', [validateUuid], imagesController.getAllImages);
  imagesRouter.delete('/', [validateUuid], imagesController.deleteImage);
  imagesRouter.put('/', [verifyToken, isEntriesAdmin, validateUuid], imagesController.updateImage);

  return imagesRouter
}
