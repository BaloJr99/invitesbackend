import { z } from 'zod';
import { UserModel } from '../interfaces/usersModel.js';

const userSchema = z.object({
  username: z.string({
    required_error: 'The username is required'
  }),
  email: z.string({
    required_error: 'The email is required'
  }),
  password: z.string({
    required_error: 'The password is required'
  }),
  roles: z.string({
    required_error: 'The role is required'
  })
});

const authUserSchema = z.object({
  usernameOrEmail: z.string({
    required_error: 'The username is required'
  }),
  password: z.string({
    required_error: 'The password is required'
  })
});

export function validateUser (user: UserModel) {
  return userSchema.safeParse(user);
}

export function validateAuthUser (user: UserModel) {
  return authUserSchema.safeParse(user);
}
