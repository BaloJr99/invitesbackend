import { z } from 'zod'
import { IFamilyGroup } from '../interfaces/familyGroupModel.js'

const familyGroupSchema = z.object({
  familyGroup: z.string({
    invalid_type_error: 'The family group name must be a string',
    required_error: 'The family group is required'
  }),
  eventId: z.string().uuid({
    message: 'The event id should be a uuid type'
  })
})

export function validateFamilyGroup(familyGroup: IFamilyGroup) {
  return familyGroupSchema.safeParse(familyGroup)
}

export function validateUpdateFamilyGroup(familyGroup: string) {
  return z
    .object({
      familyGroup: z.string({
        invalid_type_error: 'The family group name must be a string',
        required_error: 'The family group is required'
      })
    })
    .safeParse(familyGroup)
}
