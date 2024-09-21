import { z } from 'zod'
import moongose from 'mongoose'
import {
  IAuthUser,
  IUpsertUser,
  IUserProfile,
  IUserProfilePhotoSource
} from '../interfaces/usersModel.js'

const fullUserSchema = z.object({
  username: z.string({
    required_error: 'The username is required'
  }),
  email: z.string({
    required_error: 'The email is required'
  }),
  isActive: z.boolean({
    required_error: 'The isActive flag is required'
  }),
  roles: z
    .array(
      z.string({
        required_error: 'The role is required'
      })
    )
    .nonempty()
    .transform((objectIds) =>
      objectIds.map((x) => new moongose.Types.ObjectId(x))
    )
})

const userProfileSchema = z.object({
  id: z.string({
    required_error: 'The id is required'
  }),
  username: z.string({
    required_error: 'The username is required'
  }),
  firstName: z.string({
    required_error: 'The first name is required'
  }),
  lastName: z.string({
    required_error: 'The last name is required'
  }),
  phoneNumber: z.string({
    required_error: 'The phone number is required'
  }),
  email: z.string({
    required_error: 'The email is required'
  }),
  gender: z.string({
    required_error: 'The gender is required'
  }),
  profilePhoto: z.string().url().or(z.literal(''))
})

const authUserSchema = z.object({
  usernameOrEmail: z.string({
    required_error: 'The username is required'
  }),
  password: z.string({
    required_error: 'The password is required'
  })
})

const userProfilePhotoSchema = z.object({
  id: z.string({
    required_error: 'The user id is required',
    invalid_type_error: 'The user id must be a string'
  }),
  profilePhotoSource: z.string({
    required_error: 'The profile photo is required',
    invalid_type_error: 'The profile photo must be a string'
  })
})

export function validateUser(user: IUpsertUser) {
  return fullUserSchema.safeParse(user)
}

export function validateAuthUser(user: IAuthUser) {
  return authUserSchema.safeParse(user)
}

export function validateUserProfile(user: IUserProfile) {
  return userProfileSchema.safeParse(user)
}

export function validateUsernameOrEmail(usernameOrEmail: string) {
  return z
    .object({
      usernameOrEmail: z.string({
        required_error: 'The username or email are required'
      })
    })
    .safeParse(usernameOrEmail)
}

export function validatePassword(password: string) {
  return z
    .object({
      password: z.string({
        required_error: 'The password is required'
      })
    })
    .safeParse(password)
}

export function validateUserProfilePhoto(photo: IUserProfilePhotoSource) {
  return userProfilePhotoSchema.safeParse(photo)
}
