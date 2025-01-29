import { Schema, model } from 'mongoose'

const UserSchema = new Schema(
  {
    username: {
      type: String,
      unique: true
    },
    email: {
      type: String,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    phoneNumber: {
      type: String
    },
    gender: {
      type: String
    },
    profilePhoto: {
      type: String
    },
    profilePhotoPublicId: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    needsPasswordRecovery: {
      type: Boolean,
      default: false
    },
    numberOfTries: {
      type: Number,
      default: 0
    },
    userSecret: {
      type: String,
      default: ''
    },
    roles: [
      {
        ref: 'Role',
        type: Schema.Types.ObjectId
      }
    ]
  },
  {
    timestamps: true,
    versionKey: false
  }
)

export default model('user', UserSchema)
