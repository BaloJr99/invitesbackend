import { z } from 'zod'

const fullRoleSchema = z.object({
  name: z
    .string({
      invalid_type_error: 'The name must be a string',
      required_error: 'The name is required'
    })
    .min(1, {
      message: 'You must provide a name for the role'
    }),
  isActive: z.boolean({
    invalid_type_error: 'The isActive flag must be a boolean',
    required_error: 'The isActive flag is required'
  })
})

export function validateFullRole(role: string) {
  return fullRoleSchema.safeParse(role)
}
