import { z } from 'zod'
import {
  IBulkInvite,
  IConfirmation,
  ISaveTheDateConfirmation,
  IUpsertInvite
} from '../interfaces/invitesModels.js'

const inviteSchema = z.object({
  family: z
    .string({
      invalid_type_error: 'Family must be a string',
      required_error: 'The Family is required'
    })
    .min(1, {
      message: 'You must provide the family name'
    }),
  entriesNumber: z
    .number({
      invalid_type_error: 'The entries number must be a number',
      required_error: 'The number of entries is required'
    })
    .int({
      message: 'The entries number must be an integer'
    })
    .min(1, 'The minimum number of entries is 1'),
  phoneNumber: z
    .string({
      invalid_type_error: 'The phone number must be a string',
      required_error: 'The phone number is required'
    })
    .length(10, {
      message: 'The phone number must be 10 digits long'
    }),
  kidsAllowed: z.boolean({
    invalid_type_error: 'The kids allowed must be a boolean',
    required_error: 'The kids value is required'
  }),
  eventId: z
    .string({
      invalid_type_error: 'The event id must be a string',
      required_error: 'The event id is required'
    })
    .uuid({
      message: 'Invalid UUID'
    }),
  inviteGroupId: z
    .string({
      invalid_type_error: 'The invite group id must be a string',
      required_error: 'The invite group id is required'
    })
    .uuid({
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
      invalid_type_error: 'The confirmation must be a boolean',
      required_error: 'The confirmation is required'
    }),
    dateOfConfirmation: z
      .string({
        invalid_type_error: 'The date of confirmation must be a string',
        required_error: 'The date of confirmation is required'
      })
      .regex(/^\d{4}-\d{2}-\d{2}\s(\d{2}:){2}\d{2}$/, {
        message: 'Invalid date format'
      }),
    isMessageRead: z
      .boolean({
        invalid_type_error: 'The is message read must be a boolean',
        required_error: 'The is message read is required'
      })
      .default(false)
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

const saveTheDateconfirmationSchema = z.object({
  needsAccomodation: z.boolean({
    invalid_type_error: 'The accomodation flag must be a boolean',
    required_error: 'The accomodation flag is required'
  })
})

const bulkInviteSchema = z.object({
  family: z
    .string({
      invalid_type_error: 'Family must be a string',
      required_error: 'The Family is required'
    })
    .min(1, {
      message: 'You must provide the family name'
    }),
  entriesNumber: z
    .number({
      invalid_type_error: 'The entries number must be a number',
      required_error: 'The number of entries is required'
    })
    .int({
      message: 'The entries number must be an integer'
    })
    .min(1, 'The minimum number of entries is 1'),
  phoneNumber: z
    .string({
      invalid_type_error: 'The phone number must be a string',
      required_error: 'The phone number is required'
    })
    .length(10, {
      message: 'The phone number must be 10 digits long'
    }),
  kidsAllowed: z.boolean({
    invalid_type_error: 'The kids allowed must be a boolean',
    required_error: 'The kids value is required'
  }),
  eventId: z
    .string({
      invalid_type_error: 'The event id must be a string',
      required_error: 'The event id is required'
    })
    .uuid({
      message: 'Invalid UUID'
    }),
  inviteGroupId: z
    .string({
      invalid_type_error: 'The invite group id must be a string',
      required_error: 'The invite group id is required'
    })
    .uuid({
      message: 'Invalid UUID'
    })
    .or(z.literal('')),
  inviteGroupName: z.string({
    invalid_type_error: 'Invite group must be a string',
    required_error: 'Invite group name is required'
  }),
  isNewInviteGroup: z.boolean({
    invalid_type_error: 'Is new invite group flag must be boolean',
    required_error: 'Is new invite group flag is required'
  })
})

export function validateInvite(invite: IUpsertInvite) {
  return inviteSchema.safeParse(invite)
}

export function validateConfirmationSchema(confirmation: IConfirmation) {
  return confirmationSchema.safeParse(confirmation)
}

export function validateSaveTheDateConfirmationSchema(
  confirmation: ISaveTheDateConfirmation
) {
  return saveTheDateconfirmationSchema.safeParse(confirmation)
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
