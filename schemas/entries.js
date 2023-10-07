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
  }).optional(),
  confirmation: z.boolean().optional()
})

export function validateEntry (input) {
  return entrySchema.safeParse(input)
}

export function validatePartialEntry (input) {
  return entrySchema.partial().safeParse(input)
}
