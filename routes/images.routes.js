import { Router } from 'express'
import { ImagesController } from '../controllers/images.js'
import { isEntriesAdmin, verifyToken } from '../middlewares/authJwt.js'
import { validateUuid } from '../middlewares/validateUuid.js'

export const imagesRouter = Router()

export const createImagesRouter = ({ imagesModel, inviteImagesModel }) => {
  const imagesController = new ImagesController({
    imagesModel,
    inviteImagesModel
  })

  imagesRouter.post('/', [verifyToken, isEntriesAdmin], imagesController.add)

  imagesRouter.get('/:id', [validateUuid], imagesController.getAllImages)
  imagesRouter.delete('/', [validateUuid], imagesController.delete)
  imagesRouter.put('/', [verifyToken, isEntriesAdmin, validateUuid], imagesController.update)

  return imagesRouter
}
