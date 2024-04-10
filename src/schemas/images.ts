import { z } from 'zod';
import { ImageUsageModel, ImagesModel } from '../interfaces/imagesModel.js';

const imagesSchema = z.object({
  image: z.string({
    invalid_type_error: 'The image must be in string format',
    required_error: 'The images are required'
  }),
  eventId: z.string().uuid({
    message: 'The event id should be a uuid type'
  })
});

const imageUsageSchema = z.object({
  id: z.string({
    invalid_type_error: 'The id must be in string format',
    required_error: 'The id is required'
  }),
  imageUsage: z.string({
    invalid_type_error: 'The image usage must be in char format',
    required_error: 'The image usage is required'
  }).length(1)
}).array();

export function validateImages (images: ImagesModel) {
  return imagesSchema.safeParse(images);
}

export function validateImageUsage (imageUsage: ImageUsageModel[]) {
  return imageUsageSchema.safeParse(imageUsage);
}
