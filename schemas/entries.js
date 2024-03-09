import { z } from 'zod'

const entrySchema = z.object({
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
    required_error: 'The event id is required',
    invalid_type_error: 'The event id should be a uuid type'
  }),
  familyGroupId: z.string().uuid({
    required_error: 'The family group id is required',
    invalid_type_error: 'The family group id should be a uuid type'
  })
})

const confirmationSchema = z
  .object({
    message: z
      .string({
        invalid_type_error: 'The message must be a string'
      })
      .nullable(),
    entriesConfirmed: z.number().nullable(),
    confirmation: z.boolean(),
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

export function validateEntry (input) {
  return entrySchema.safeParse(input)
}

export function validateConfirmationSchema (input) {
  return confirmationSchema.safeParse(input)
}
