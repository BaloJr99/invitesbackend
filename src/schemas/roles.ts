import { z } from 'zod'
import { FullRoleModel, RoleModel } from '../interfaces/rolesModel.js'

const fullRoleSchema = z.object({
  name: z.string({
    required_error: 'The name is required'
  })
})

const roleSchema = z.object({
  name: z.string({
    required_error: 'The name is required'
  }),
  isActive: z.boolean({
    required_error: 'The isActive flag is required'
  })
})

export function validateFullRole(role: FullRoleModel) {
  return fullRoleSchema.safeParse(role)
}

export function validateRole(role: RoleModel) {
  return roleSchema.safeParse(role)
}
