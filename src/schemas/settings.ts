import { z } from 'zod'
import { ISweetXvSettings } from '../interfaces/settingsModel.js'

const sweetXvSettingsSchema = z.object({
  eventId: z.string().uuid({
    message: 'Invalid UUID'
  }),
  primaryColor: z
    .string({
      invalid_type_error: 'The primary color must be a string',
      required_error: 'The primary color is required'
    })
    .min(7, {
      message: 'You must provide a valid hex color code'
    }),
  secondaryColor: z
    .string({
      invalid_type_error: 'The secondary color must be a string',
      required_error: 'The secondary color is required'
    })
    .min(7, {
      message: 'You must provide a valid hex color code'
    }),
  parents: z
    .string({
      invalid_type_error: 'The parents must be a string',
      required_error: 'The parents is required'
    })
    .min(1, {
      message: 'You must provide the parents names'
    }),
  godParents: z
    .string({
      invalid_type_error: 'The godParents must be a string',
      required_error: 'The godParents is required'
    })
    .min(1, {
      message: 'You must provide the god parents names'
    }),
  firstSectionSentences: z
    .string({
      invalid_type_error: 'The first section sentence must be a string',
      required_error: 'The first section sentence is required'
    })
    .min(1, {
      message: 'You must provide the first section sentences'
    }),
  secondSectionSentences: z
    .string({
      invalid_type_error: 'The second section sentence must be a string',
      required_error: 'The second section sentence is required'
    })
    .min(1, {
      message: 'You must provide the second section sentences'
    }),
  massUrl: z
    .string({
      invalid_type_error: 'The mass url must be a string',
      required_error: 'The mass url is required'
    })
    .url({
      message: 'The mass url must be a valid URL'
    }),
  massTime: z
    .string({
      invalid_type_error: 'The mass time must be a string',
      required_error: 'The mass time is required'
    })
    .time({
      message: 'Invalid time format'
    }),
  massAddress: z
    .string({
      invalid_type_error: 'The mass address must be a string',
      required_error: 'The mass address is required'
    })
    .min(1, {
      message: 'You must provide the mass address'
    }),
  receptionUrl: z
    .string({
      invalid_type_error: 'The reception url must be a string',
      required_error: 'The reception url is required'
    })
    .url({
      message: 'The mass url must be a valid URL'
    }),
  receptionTime: z
    .string({
      invalid_type_error: 'The reception time must be a string',
      required_error: 'The reception time is required'
    })
    .time({
      message: 'Invalid time format'
    }),
  receptionPlace: z
    .string({
      invalid_type_error: 'The reception place must be a string',
      required_error: 'The reception place is required'
    })
    .min(1, {
      message: 'You must provide the reception place'
    }),
  receptionAddress: z
    .string({
      invalid_type_error: 'The reception address must be a string',
      required_error: 'The reception address is required'
    })
    .min(1, {
      message: 'You must provide the reception address'
    }),
  dressCodeColor: z
    .string({
      invalid_type_error: 'The dress code must be a string',
      required_error: 'The dress code is required'
    })
    .min(1, {
      message: 'You must provide the dress code'
    })
})

const saveTheDateSettingsSchema = z.object({
  eventId: z.string().uuid({
    message: 'Invalid UUID'
  }),
  primaryColor: z
    .string({
      invalid_type_error: 'The primary color must be a string',
      required_error: 'The primary color is required'
    })
    .min(7, {
      message: 'You must provide a valid hex color code'
    }),
  secondaryColor: z
    .string({
      invalid_type_error: 'The secondary color must be a string',
      required_error: 'The secondary color is required'
    })
    .min(7, {
      message: 'You must provide a valid hex color code'
    }),
  receptionPlace: z
    .string({
      invalid_type_error: 'The reception place must be a string',
      required_error: 'The reception place is required'
    })
    .min(1, {
      message: 'You must provide the reception place'
    })
})

export function validateSweetXvSettings(settings: ISweetXvSettings) {
  return sweetXvSettingsSchema.safeParse(settings)
}

export function validateSaveTheDateSettings(settings: ISweetXvSettings) {
  return saveTheDateSettingsSchema.safeParse(settings)
}
