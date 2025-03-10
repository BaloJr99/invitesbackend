import { z } from 'zod'
import moongose from 'mongoose'
import {
  IAuthUser,
  IUpsertUser,
  IUserProfile,
  IUserProfilePhotoSource
} from '../global/types.js'

const fullUserSchema = z.object({
  username: z
    .string({
      required_error: 'The username is required',
      invalid_type_error: 'The username must be a string'
    })
    .min(1, {
      message: 'You must provide a username'
    }),
  email: z
    .string({
      required_error: 'The email is required',
      invalid_type_error: 'The email must be a string'
    })
    .email({
      message: 'You must provide an email'
    }),
  isActive: z.boolean({
    required_error: 'The isActive flag is required',
    invalid_type_error: 'The isActive flag must be a boolean'
  }),
  roles: z
    .array(
      z
        .string({
          required_error: 'The role is required',
          invalid_type_error: 'The role must be a string'
        })
        .min(1, {
          message: 'You must provide a role'
        })
    )
    .nonempty({
      message: 'You must provide at least one role'
    })
    .transform((objectIds) =>
      objectIds.map((x) => new moongose.Types.ObjectId(x))
    )
})

const userProfileSchema = z.object({
  id: z
    .string({
      invalid_type_error: 'The id must be a string',
      required_error: 'The id is required'
    })
    .min(1, {
      message: 'You must provide the user id'
    }),
  username: z
    .string({
      invalid_type_error: 'The username must be a string',
      required_error: 'The username is required'
    })
    .min(1, {
      message: 'You must provide the username'
    }),
  firstName: z
    .string({
      invalid_type_error: 'The first name must be a string',
      required_error: 'The first name is required'
    })
    .min(1, {
      message: 'You must provide the first name'
    }),
  lastName: z
    .string({
      invalid_type_error: 'The last name must be a string',
      required_error: 'The last name is required'
    })
    .min(1, {
      message: 'You must provide the last name'
    }),
  phoneNumber: z
    .string({
      invalid_type_error: 'The phone number must be a string',
      required_error: 'The phone number is required'
    })
    .min(10, {
      message: 'You must have a valid phone number'
    }),
  email: z
    .string({
      invalid_type_error: 'The email must be a string',
      required_error: 'The email is required'
    })
    .email({
      message: 'You must provide an email'
    }),
  gender: z
    .string({
      invalid_type_error: 'The gender must be a char',
      required_error: 'The gender is required'
    })
    .length(1, {
      message: 'You must provide a valid gender'
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

export function validateUserId(userId: string) {
  return z
    .object({
      id: z.string({
        required_error: 'The user id is required',
        invalid_type_error: 'The user id must be a string'
      })
    })
    .safeParse(userId)
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
