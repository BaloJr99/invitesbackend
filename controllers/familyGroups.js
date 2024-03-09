import { validateFamilyGroup } from '../schemas/familyGroups.js'
import jwt from 'jsonwebtoken'

export class FamilyGroupsController {
  constructor ({ familyGroupModel }) {
    this.familyGroupModel = familyGroupModel
  }

  getAll = async (req, res) => {
    const token = req.headers['x-access-token']

    if (!token) return res.status(403).json({ error: 'No token provided' })

    const decoded = jwt.verify(token, process.env.SECRET)

    const familyGroups = await this.familyGroupModel.getAll(decoded.id)
    return res.json(familyGroups)
  }

  getById = async (req, res) => {
    const { id } = req.params

    const [familyGroup] = await this.familyGroupModel.getById({ id })

    if (familyGroup.length > 0) return res.json(familyGroup.at(0))

    return res.status(404).json({ message: 'Grupo familiar no encontrado' })
  }

  create = async (req, res) => {
    const result = validateFamilyGroup(req.body)

    if (result.error) {
      return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    const token = req.headers['x-access-token']

    if (!token) return res.status(403).json({ error: 'No token provided' })

    const decoded = jwt.verify(token, process.env.SECRET)

    const familyGroupId = await this.familyGroupModel.create(
      { input: result.data },
      decoded.id
    )

    return res.status(201).json({ id: familyGroupId, message: 'Grupo familiar creado' })
  }

  update = async (req, res) => {
    const result = validateFamilyGroup(req.body)

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params
    const update = await this.familyGroupModel.update({
      id,
      input: result.data
    })

    if (update === false) {
      return res.status(400).json({ message: 'Grupo familiar no encontrado' })
    }

    return res.status(201).json({ message: 'Grupo familiar actualizado' })
  }
}
