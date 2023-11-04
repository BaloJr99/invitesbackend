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
    res.json(entries)
  }

  getById = async (req, res) => {
    const { id } = req.params
    const [entry] = await this.entryModel.getById({ id })

    if (entry.length > 0) return res.json(entry.at(0))

    res.status(404).json({ message: 'Entry not found' })
  }

  create = async (req, res) => {
    const result = validateEntry(req.body)

    if (result.error) {
      return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    const token = req.headers['x-access-token']

    if (!token) return res.status(403).json({ error: 'No token provided' })

    const decoded = jwt.verify(token, process.env.SECRET)

    const [newEntry] = await this.entryModel.create({ input: result.data }, decoded.id)

    res.status(201).json(newEntry.at(0))
  }

  delete = async (req, res) => {
    const { id } = req.params
    const result = await this.entryModel.delete({ id })

    if (result === false) {
      return res.status(404).json({ message: 'Entry not found' })
    }

    return res.json({ message: 'Entry deleted' })
  }

  update = async (req, res) => {
    const result = validateEntry(req.body)

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params
    const [newEntries] = await this.entryModel.update({ id, input: result.data })

    if (newEntries === false) {
      return res.status(400).json({ message: 'Entry not found' })
    }

    return res.json(newEntries.at(0))
  }

  updateConfirmation = async (req, res) => {
    const result = validateConfirmationSchema(req.body)

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params
    const [updateConfirmation] = await this.entryModel.updateConfirmation({ id, input: result.data })

    if (updateConfirmation === false) {
      return res.status(400).json({ message: 'Entry not found' })
    }

    return res.json(updateConfirmation.at(0))
  }
}
