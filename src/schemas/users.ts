import { z } from 'zod';
import { AuthUserModel, FullUserModel, UserModel } from '../interfaces/usersModel.js';
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

const authUserSchema = z.object({
  usernameOrEmail: z.string({
    required_error: 'The username is required'
  }),
  password: z.string({
    required_error: 'The password is required'
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
