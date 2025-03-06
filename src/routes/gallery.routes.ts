import { Router } from 'express'
import { validateUuid } from '../middleware/validateUuid.js'
import { MysqlDatabase } from '../services/mysql-database.js'
import { GalleryController } from '../controllers/gallery.js'

export const galleryRouter = Router()

export const createGalleryRouter = (mysqlDatabase: MysqlDatabase) => {
  const galleryController = new GalleryController(mysqlDatabase)

  galleryRouter.get(
    '/:id',
    [validateUuid],
    galleryController.getAlbumsByEventId
  )

  galleryRouter.post('/', galleryController.createAlbum)

  galleryRouter.put('/:id', [validateUuid], galleryController.updateAlbum)

  galleryRouter.get(
    `/check-album/:eventId/:album`,
    galleryController.checkAlbum
  )

  galleryRouter.delete('/:id', [validateUuid], galleryController.deleteAlbum)

  galleryRouter.post('/images', galleryController.uploadImage)

  galleryRouter.get('/images/:id', galleryController.getAlbumImages)

  return galleryRouter
}
