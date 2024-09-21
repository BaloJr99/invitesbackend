import jwt from 'jsonwebtoken'
import { Types } from 'mongoose'
import { AuthModel } from '../interfaces/authModel.js'

const verifyJwtToken = (bearerToken: string): AuthModel => {
  const token = bearerToken.split(' ').pop()
  return jwt.verify(`${token}`, process.env.SECRET) as AuthModel
}

const generateToken = (id: Types.ObjectId) => {
  const token = jwt.sign({ id }, process.env.SECRET, {
    expiresIn: 86400
  })

  return token
}

export { verifyJwtToken, generateToken }
