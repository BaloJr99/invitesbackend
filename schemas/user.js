import { z } from 'zod'

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
  roles: z.string().array().optional()
})

export function validateUser (input) {
  return userSchema.safeParse(input)
}

export function validatePartialUser (input) {
  return userSchema.partial().safeParse(input)
}
