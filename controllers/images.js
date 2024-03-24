import { validateImageUsage, validateImages } from '../schemas/images.js'
import jwt from 'jsonwebtoken'

export class ImagesController {
  constructor ({ imagesModel, inviteImagesModel }) {
    this.imagesModel = imagesModel
    this.inviteImagesModel = inviteImagesModel
  }

  add = async (req, res) => {
    const token = req.headers['x-access-token']

    if (!token) return res.status(403).json({ error: 'No token provided' })

    const result = validateImages(req.body)

    if (result.error) {
      return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    const decoded = jwt.verify(token, process.env.SECRET)

    const cloudResult = await this.imagesModel.add({ input: result.data })

    const { eventId } = result.data

    await this.inviteImagesModel.create(
      { imageUrl: cloudResult.secure_url, publicId: cloudResult.public_id, eventId },
      decoded.id
    )

    return res.status(201).json({ message: 'Imagenes agregadas' })
  }

  update = async (req, res) => {
    const result = validateImageUsage(req.body)

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const update = await this.inviteImagesModel.update(result.data)
    if (update === false) {
      return res.status(400).json({ message: 'Error al actualizar' })
    }

    return res.status(201).json({ message: 'Informacion actualizada' })
  }

  delete = async (req, res) => {
    const token = req.headers['x-access-token']

    if (!token) return res.status(403).json({ error: 'No token provided' })

    const image = req.body
    await this.imagesModel.delete(image.publicId)

    await this.inviteImagesModel.delete(image.id)

    return res.json({ message: 'Imagen eliminada' })
  }

  getAllImages = async (req, res) => {
    const token = req.headers['x-access-token']

    if (!token) return res.status(403).json({ error: 'No token provided' })

    const { id } = req.params

    const [eventImages] = await this.inviteImagesModel.getImageByEventId({ id })

    return res.json(eventImages)
  }
}
