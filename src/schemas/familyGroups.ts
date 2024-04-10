import { z } from 'zod';
import { FamilyGroupModel } from '../interfaces/familyGroupModel';

const familyGroupSchema = z.object({
  familyGroup: z.string({
    invalid_type_error: 'The family group name must be a string',
    required_error: 'The family group is required'
  })
});

export function validateFamilyGroup (familyGroup: FamilyGroupModel) {
  return familyGroupSchema.safeParse(familyGroup);
}
