import jwt from 'jsonwebtoken'
import { Types } from 'mongoose'
import { AuthModel } from '../interfaces/authModel.js'
import { EnvConfig } from '../config/config.js'

const verifyJwtToken = (bearerToken: string): AuthModel => {
  const token = bearerToken.split(' ').pop()
  return jwt.verify(`${token}`, EnvConfig().jwt.secret) as AuthModel
}

const generateToken = (id: Types.ObjectId) => {
  const token = jwt.sign({ id }, EnvConfig().jwt.secret, {
    expiresIn: 86400
  })

  return token
}

export { verifyJwtToken, generateToken }
