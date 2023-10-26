import { ROLES } from '../models/role.js'
import User from '../models/user.js'

export const checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.lenght; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        return res.status(400).json({
          message: `Role ${req.body.roles[i]} doesn't exists`
        })
      }
    }
  }

  next()
}

export const checkDuplicateUsernameOrEmail = async (req, res, next) => {
  const user = await User.findOne({ username: req.body.username })

  if (user) return res.status(400).json({ message: 'The user already exists' })

  const email = await User.findOne({ email: req.body.email })
  if (email) return res.status(400).json({ message: 'The email already exists' })

  next()
}
