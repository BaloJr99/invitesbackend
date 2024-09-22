import { z } from 'zod'
import { IInviteGroup } from '../interfaces/inviteGroupsModel.js'

const inviteGroupSchema = z.object({
  inviteGroup: z.string({
    invalid_type_error: 'The invite group name must be a string',
    required_error: 'The invite group is required'
  }),
  eventId: z.string().uuid({
    message: 'The event id should be a uuid type'
  })
})

export function validateInviteGroup(inviteGroup: IInviteGroup) {
  return inviteGroupSchema.safeParse(inviteGroup)
}

export function validateUpdateInviteGroup(inviteGroup: string) {
  return z
    .object({
      inviteGroup: z.string({
        invalid_type_error: 'The invite group name must be a string',
        required_error: 'The invite group is required'
      })
    })
    .safeParse(inviteGroup)
}
