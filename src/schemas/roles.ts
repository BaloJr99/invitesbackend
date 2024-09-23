import { z } from 'zod'

const fullRoleSchema = z.object({
  name: z.string({
    required_error: 'The name is required'
  }),
  isActive: z.boolean({
    required_error: 'The isActive flag is required'
  })
})

export function validateFullRole(role: string) {
  return fullRoleSchema.safeParse(role)
}