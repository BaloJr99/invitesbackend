import { Schema, model } from 'mongoose'

export const ROLES = ['admin', 'invitesAdmin']

const roleSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  versionKey: false
})

export default model('Role', roleSchema)
