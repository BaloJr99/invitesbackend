import { validateEntry, validateConfirmationSchema } from '../schemas/entries.js'
import jwt from 'jsonwebtoken'

export class EntryController {
  constructor ({ entryModel }) {
    this.entryModel = entryModel
  }

  getAll = async (req, res) => {
    const token = req.headers['x-access-token']

    if (!token) return res.status(403).json({ error: 'No token provided' })

    const decoded = jwt.verify(token, process.env.SECRET)

    const entries = await this.entryModel.getAll(decoded.id)
    return res.json(entries)
  }

  getById = async (req, res) => {
    const { id } = req.params

    const [entry] = await this.entryModel.getById({ id })

    if (entry.length > 0) return res.json(entry.at(0))

    return res.status(404).json({ message: 'Invitación no encontrada' })
  }

  getEntry = async (req, res) => {
    const { id } = req.params

    const [entry] = await this.entryModel.getEntry({ id })

    if (entry.length > 0) return res.json(entry.at(0))

    return res.status(404).json({ message: 'Invitación no encontrada' })
  }

  create = async (req, res) => {
    const result = validateEntry(req.body)

    if (result.error) {
      return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    const token = req.headers['x-access-token']

    if (!token) return res.status(403).json({ error: 'No token provided' })

    const decoded = jwt.verify(token, process.env.SECRET)

    const entryId = await this.entryModel.create({ input: result.data }, decoded.id)

    return res.status(201).json({ id: entryId, message: 'Invitación creada' })
  }

  delete = async (req, res) => {
    const { id } = req.params
    const result = await this.entryModel.delete({ id })

    if (result === false) {
      return res.status(404).json({ message: 'Invitación no encontrada' })
    }

    return res.json({ message: 'Invitación eliminada' })
  }

  update = async (req, res) => {
    const result = validateEntry(req.body)

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params
    const update = await this.entryModel.update({ id, input: result.data })

    if (update === false) {
      return res.status(400).json({ message: 'Invitación no encontrada' })
    }

    return res.status(201).json({ message: 'Invitación actualizada' })
  }

  updateConfirmation = async (req, res) => {
    const result = validateConfirmationSchema(req.body)

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params
    const wasUpdated = await this.entryModel.updateConfirmation({ id, input: result.data })

    if (wasUpdated === false) {
      return res.status(400).json({ message: 'Invitación no encontrada' })
    }

    return res.status(201).json({ message: 'Respuesta enviada' })
  }

  readMessage = async (req, res) => {
    const { id } = req.params
    const wasMessageRead = await this.entryModel.readMessage({ id })

    if (wasMessageRead === false) {
      return res.status(400).json({ message: 'Mensaje no encontrado' })
    }

    return res.status(200).json({ message: 'Mensaje leído' })
  }
}
