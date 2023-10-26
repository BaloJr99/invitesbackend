import { Schema, model } from 'mongoose'

export const ROLES = ['admin', 'entriesAdmin']

const roleSchema = new Schema({
  name: String,
  isActive: Boolean
}, {
  versionKey: false
})

export default model('Role', roleSchema)
