import { z } from 'zod'

const imagesSchema = z.object({
  image: z.string({
    invalid_type_error: 'The image must be in string format',
    required_error: 'The images are required'
  }),
  eventId: z.string().uuid({
    required_error: 'The event id is required',
    invalid_type_error: 'The event id should be a uuid type'
  })
})

const imageUsageSchema = z
  .object({
    id: z.string({
      invalid_type_error: 'The id must be in string format',
      required_error: 'The id is required'
    }),
    imageUsage: z.string({
      invalid_type_error: 'The image usage must be in char format',
      required_error: 'The image usage is required'
    }).length(1)
  }).array({
    invalid_type_error: 'The message must be an array of strings',
    required_error: 'The image usage is required to update the images'
  })

export function validateImages (input) {
  return imagesSchema.safeParse(input)
}

export function validateImageUsage (input) {
  return imageUsageSchema.safeParse(input)
}
