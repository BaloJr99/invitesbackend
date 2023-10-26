import { z } from 'zod'

const entrySchema = z.object({
  family: z.string({
    invalid_type_error: 'Family must be a string',
    required_error: 'The Family is required'
  }),
  entriesNumber: z.number({
    required_error: 'The number of entries is required',
    invalid_type_error: 'The entries number must be a number'
  }).int().min(1, 'The minimum number of entries is 1'),
  message: z.string({
    invalid_type_error: 'The message must be a string'
  }).nullable().optional(),
  entriesConfirmed: z.number({
    required_error: 'The number of entries is required',
    invalid_type_error: 'The entries confirmed must be a number'
  }).optional(),
  phoneNumber: z.string({
    required_error: 'The phone number is required'
  }),
  confirmation: z.boolean().optional(),
  groupSelected: z.string({
    required_error: 'The group is required'
  })
})

const confirmationSchema = z.object({
  message: z.string({
    invalid_type_error: 'The message must be a string'
  }).nullable().optional(),
  entriesConfirmed: z.number().nullable().optional(),
  confirmation: z.boolean().optional()
}).superRefine(({ confirmation, entriesConfirmed }, refinementContext) => {
  if (confirmation === true && (entriesConfirmed === undefined || entriesConfirmed === null)) {
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
