import { z } from 'zod';
import { AuthUserModel, FullUserModel, UploadUserProfileModel, UserModel, UserProfileModel } from '../interfaces/usersModel.js';
import moongose from 'mongoose';

const fullUserSchema = z.object({
  username: z.string({
    required_error: 'The username is required'
  }),
  email: z.string({
    required_error: 'The email is required'
  }),
  roles: z.array(z.string({
    required_error: 'The role is required'
  })).nonempty()
});

const userSchema = z.object({
  username: z.string({
    required_error: 'The username is required'
  }),
  email: z.string({
    required_error: 'The email is required'
  }),
  isActive: z.boolean({
    required_error: 'The isActive flag is required'
  }),
  roles: z.array(z.string({
    required_error: 'The role is required'
  })).nonempty().transform(objectIds => objectIds.map(x => new moongose.Types.ObjectId(x)))
});

const userProfileSchema = z.object({
  _id: z.string({
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
  profilePhoto: z.string().url().optional().or(z.literal(''))
});

const authUserSchema = z.object({
  usernameOrEmail: z.string({
    required_error: 'The username is required'
  }),
  password: z.string({
    required_error: 'The password is required'
  })
});

const userProfilePhotoSchema = z.object({
  userId: z.string({
    required_error: 'The user id is required',
    invalid_type_error: 'The user id must be a string'
  }),
  profilePhotoSource: z.string({
    required_error: 'The profile photo is required',
    invalid_type_error: 'The profile photo must be a string'
  })
});

export function validateFullUser (user: FullUserModel) {
  return fullUserSchema.safeParse(user);
}

export function validateUser (user: UserModel) {
  return userSchema.safeParse(user);
}

export function validateAuthUser (user: AuthUserModel) {
  return authUserSchema.safeParse(user);
}

export function validateUserProfile (user: UserProfileModel) {
  return userProfileSchema.safeParse(user);
}

export function validateUsernameOrEmail (usernameOrEmail: string) {
  return z.object({
    usernameOrEmail: z.string({
      required_error: 'The username or email are required'
    })
  }).safeParse(usernameOrEmail);
}

export function validatePassword (password: string) {
  return z.object({
    password: z.string({
      required_error: 'The password is required'
    })
  }).safeParse(password);
}

export function validateUserProfilePhoto (photo: UploadUserProfileModel) {
  return userProfilePhotoSchema.safeParse(photo);
}