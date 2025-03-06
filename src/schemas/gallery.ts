import { z } from 'zod'
import { IImageUpload, IUpsertAlbum } from '../global/types.js'

const albumSchema = z.object({
  nameOfAlbum: z
    .string({
      invalid_type_error: 'The name of the album must be a string',
      required_error: 'The name of the album is required'
    })
    .min(1, {
      message: 'You must provide the name of the album'
    }),
  eventId: z
    .string({
      invalid_type_error: 'The event id must be a string',
      required_error: 'The event id is required'
    })
    .uuid({
      message: 'The event id should be a uuid type'
    })
})

const imagesSchema = z.object({
  image: z
    .string({
      invalid_type_error: 'The image must be a string',
      required_error: 'The images are required'
    })
    .min(1, {
      message: 'You must provide the image base64'
    }),
  albumId: z
    .string({
      invalid_type_error: 'The album id must be a string',
      required_error: 'The album id is required'
    })
    .uuid({
      message: 'The album id should be a uuid type'
    })
    .min(1, {
      message: 'You must provide the album id'
    })
})

export function validateImage(images: IImageUpload) {
  return imagesSchema.safeParse(images)
}

export function validateAlbum(album: IUpsertAlbum) {
  return albumSchema.safeParse(album)
}
