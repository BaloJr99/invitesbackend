import { z } from 'zod'
import { IBulkInvite, IConfirmation, IUpsertInvite } from '../interfaces/invitesModels.js'

const inviteSchema = z.object({
  family: z.string({
    invalid_type_error: 'Family must be a string',
    required_error: 'The Family is required'
  }),
  entriesNumber: z
    .number({
      required_error: 'The number of entries is required',
      invalid_type_error: 'The entries number must be a number'
    })
    .int()
    .min(1, 'The minimum number of entries is 1'),
  phoneNumber: z.string({
    required_error: 'The phone number is required'
  }),
  kidsAllowed: z.boolean({
    required_error: 'The kids value is required',
    invalid_type_error: 'The kids allowed must be a boolean'
  }),
  eventId: z.string().uuid({
    message: 'Invalid UUID'
  }),
  familyGroupId: z.string().uuid({
    message: 'Invalid UUID'
  })
})

const confirmationSchema = z
  .object({
    message: z.string({
      invalid_type_error: 'The message must be a string',
      required_error: 'The message is required'
    }),
    entriesConfirmed: z.number({
      required_error: 'The number of entries are required'
    }),
    confirmation: z.boolean({
      required_error: 'The confirmation must be responded'
    }),
    dateOfConfirmation: z
      .string()
      .datetime()
      .transform((value) => value.replace('T', ' ').replace('Z', '')),
    isMessageRead: z.boolean().default(false)
  })
  .superRefine(({ confirmation, entriesConfirmed }, refinementContext) => {
    if (
      confirmation === true &&
      (entriesConfirmed === undefined || entriesConfirmed === null)
    ) {
      return refinementContext.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'The entries are required if you assist',
        path: ['entriesConfirmed']
      })
    }
  })

const bulkInviteSchema = z.object({
  family: z.string({
    invalid_type_error: 'Family must be a string',
    required_error: 'The Family is required'
  }),
  entriesNumber: z
    .number({
      required_error: 'The number of entries is required',
      invalid_type_error: 'The entries number must be a number'
    })
    .int()
    .min(1, 'The minimum number of entries is 1'),
  phoneNumber: z.string({
    required_error: 'The phone number is required'
  }),
  kidsAllowed: z.boolean({
    required_error: 'The kids value is required',
    invalid_type_error: 'The kids allowed must be a boolean'
  }),
  eventId: z.string().uuid({
    message: 'Invalid UUID'
  }),
  familyGroupId: z
    .string()
    .uuid({
      message: 'Invalid UUID'
    }).or(z.literal('')), 
  familyGroupName: z.string({
    invalid_type_error: 'Family group must be a string',
    required_error: 'Family group name is required'
  }),
  isNewFamilyGroup: z.boolean({
    invalid_type_error: 'Is new family group flag must be boolean',
    required_error: 'Is new family group flag is required'
  })
})

export function validateInvite(invite: IUpsertInvite) {
  return inviteSchema.safeParse(invite)
}

export function validateConfirmationSchema(confirmation: IConfirmation) {
  return confirmationSchema.safeParse(confirmation)
}

export function validateBulkInvite(invites: IBulkInvite[]) {
  return z.array(bulkInviteSchema).safeParse(invites)
}

export function validateBulkDeleteInvites(invitesIds: string[]) {
  return z
    .array(
      z.string().uuid({
        message: 'Invalid UUID'
      })
    )
    .min(1, {
      message: 'The invites ids are required'
    })
    .safeParse(invitesIds)
}
