import { z } from 'zod'
import { ImageUsageModel, ImagesModel } from '../interfaces/imagesModel.js'

const imagesSchema = z.object({
  image: z
    .string({
      invalid_type_error: 'The image must be a string',
      required_error: 'The images are required'
    })
    .min(1, {
      message: 'You must provide the image base64'
    }),
  eventId: z
    .string({
      invalid_type_error: 'The event id must be a string',
      required_error: 'The event id is required'
    })
    .uuid({
      message: 'The event id should be a uuid type'
    })
    .min(1, {
      message: 'You must provide the event id'
    })
})

const imageUsageSchema = z
  .object({
    id: z
      .string({
        invalid_type_error: 'The id must be a string',
        required_error: 'The id is required'
      })
      .min(1, {
        message: 'You must provide the image id'
      }),
    imageUsage: z
      .string({
        invalid_type_error: 'The image usage must be a char',
        required_error: 'The image usage is required'
      })
      .length(1, {
        message: 'You must provide the image usage'
      })
  })
  .array()

export function validateImages(images: ImagesModel) {
  return imagesSchema.safeParse(images)
}

export function validateImageUsage(imageUsage: ImageUsageModel[]) {
  return imageUsageSchema.safeParse(imageUsage)
}
