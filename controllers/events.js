import { validateEvent } from '../schemas/events.js'
import jwt from 'jsonwebtoken'

export class EventsController {
  constructor ({ eventModel }) {
    this.eventModel = eventModel
  }

  getAll = async (req, res) => {
    const token = req.headers['x-access-token']

    if (!token) return res.status(403).json({ error: 'No token provided' })

    const decoded = jwt.verify(token, process.env.SECRET)

    const events = await this.eventModel.getAll(decoded.id)
    return res.json(events)
  }

  getById = async (req, res) => {
    const { id } = req.params

    const [event] = await this.eventModel.getById({ id })

    if (event.length > 0) return res.json(event.at(0))

    return res.status(404).json({ message: 'Evento no encontrado' })
  }

  create = async (req, res) => {
    const result = validateEvent(req.body)

    if (result.error) {
      return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    const token = req.headers['x-access-token']

    if (!token) return res.status(403).json({ error: 'No token provided' })

    const decoded = jwt.verify(token, process.env.SECRET)

    await this.eventModel.create({ input: result.data }, decoded.id)

    return res.status(201).json({ message: 'Evento creado' })
  }

  delete = async (req, res) => {
    const { id } = req.params
    const result = await this.eventModel.delete({ id })

    if (result === false) {
      return res.status(404).json({ message: 'Evento no encontrado' })
    }

    return res.json({ message: 'Evento eliminado' })
  }

  update = async (req, res) => {
    const result = validateEvent(req.body)

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params
    const update = await this.eventModel.update({ id, input: result.data })

    if (update === false) {
      return res.status(400).json({ message: 'Evento no encontrado' })
    }

    return res.status(201).json({ message: 'Evento actualizado' })
  }
}
