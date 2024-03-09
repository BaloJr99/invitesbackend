import { z } from 'zod'

const familyGroupSchema = z.object({
  familyGroup: z.string({
    invalid_type_error: 'The family group name must be a string',
    required_error: 'The family group is required'
  })
})

export function validateFamilyGroup (input) {
  return familyGroupSchema.safeParse(input)
}
