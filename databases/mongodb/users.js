import mongoose from 'mongoose'
import User from '../../models/user.js'
import Role from '../../models/role.js'
import jwt from 'jsonwebtoken'
import { createRoles } from '../../shared/utils.js'

const username = encodeURIComponent(process.env.MONGO_USERNAME)
const password = encodeURIComponent(process.env.MONGO_PASSWORD)
const cluster = process.env.MONGO_CLUSTER

mongoose
  .connect(
    `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`
  )
  .then((db) => {
    console.log('Db is connected')
    createRoles()
  })
  .catch((error) => console.log(error))

export class UserModel {
  static async signup ({ input }) {
    const { username, password, email, roles } = input

    const newUser = new User({
      username,
      password: await User.encryptPassword(password),
      email
    })

    if (roles) {
      const foundRoles = await Role.find({ name: { $in: roles } })
      newUser.roles = foundRoles.map((role) => role._id)
    } else {
      const role = await Role.findOne({ name: 'entriesAdmin' })
      newUser.roles = [role._id]
    }

    const savedUser = await newUser.save()

    const token = jwt.sign({ id: savedUser._id }, process.env.SECRET, {
      expiresIn: 86400
    })

    return token
  }

  static async signin ({ input }) {
    const { username, email, password } = input

    const userFounded = await User.findOne({
      $or: [{ email }, { username }]
    }).populate('roles')

    if (!userFounded) {
      return false
    }

    const matchPassword = await User.comparePassword(
      password,
      userFounded.password
    )

    if (!matchPassword) {
      return false
    }

    const token = jwt.sign({ id: userFounded._id, username: userFounded.username, email: userFounded.email }, process.env.SECRET, {
      expiresIn: 86400
    })

    return token
  }
}
