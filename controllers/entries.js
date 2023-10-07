import { validateEntry } from '../schemas/entries.js'

export class EntryController {
  constructor ({ entryModel }) {
    this.entryModel = entryModel
  }

  getAll = async (req, res) => {
    const entries = await this.entryModel.getAll()
    res.json(entries)
  }

  getById = async (req, res) => {
    const { id } = req.params
    const entry = await this.entryModel.getById({ id })

    if (entry.length > 0) return res.json(entry)

    res.status(404).json({ message: 'Entry not found' })
  }

  create = async (req, res) => {
    const result = validateEntry(req.body)

    if (result.error) {
      return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    const newMovie = await this.entryModel.create({ input: result.data })

    res.status(201).json(newMovie)
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
    const updatedEntry = await this.entryModel.update({ id, input: result.data })

    if (updatedEntry === false) {
      return res.status(400).json({ message: 'Entry not found' })
    }

    return res.json(updatedEntry)
  }
}
