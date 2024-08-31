import { Router } from 'express'
import { ImagesController } from '../controllers/images.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { InviteImagesService } from '../services/inviteImages.js'
import { ImagesService } from '../config/cloudinary/cloudinary.js'
import { LoggerService } from '../services/logger.js'

export const imagesRouter = Router()

export const createImagesRouter = (imagesService: ImagesService, inviteImagesService: InviteImagesService, loggerService: LoggerService) => {
  const imagesController = new ImagesController(imagesService, inviteImagesService, loggerService);

  imagesRouter.post('/', imagesController.createImage);

  imagesRouter.get('/:id', [validateUuid], imagesController.getAllImages);
  imagesRouter.delete('/', imagesController.deleteImage);
  imagesRouter.put('/', imagesController.updateImage);

  return imagesRouter
}
