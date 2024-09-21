import { z } from 'zod'
import { SettingsModel } from '../interfaces/settingsModel.js'

const settingsSchema = z.object({
  eventId: z.string().uuid({
    message: 'Invalid UUID'
  }),
  primaryColor: z.string({
    invalid_type_error: 'The primary color must be a string',
    required_error: 'The primary color is required'
  }),
  secondaryColor: z.string({
    invalid_type_error: 'The secondary color must be a string',
    required_error: 'The secondary color is required'
  }),
  parents: z.string({
    invalid_type_error: 'The parents must be a string',
    required_error: 'The parents is required'
  }),
  godParents: z.string({
    invalid_type_error: 'The godParents must be a string',
    required_error: 'The godParents is required'
  }),
  firstSectionSentences: z.string({
    invalid_type_error: 'The first section sentence must be a string',
    required_error: 'The first section sentence is required'
  }),
  secondSectionSentences: z.string({
    invalid_type_error: 'The second section sentence must be a string',
    required_error: 'The second section sentence is required'
  }),
  massUrl: z.string({
    invalid_type_error: 'The mass url must be a string',
    required_error: 'The mass url is required'
  }),
  massTime: z.string().time(),
  massAddress: z.string({
    invalid_type_error: 'The mass address must be a string',
    required_error: 'The mass address is required'
  }),
  receptionUrl: z.string({
    invalid_type_error: 'The reception url must be a string',
    required_error: 'The reception url is required'
  }),
  receptionTime: z.string().time(),
  receptionPlace: z.string({
    invalid_type_error: 'The reception place must be a string',
    required_error: 'The reception place is required'
  }),
  receptionAddress: z.string({
    invalid_type_error: 'The reception address must be a string',
    required_error: 'The reception address is required'
  }),
  dressCodeColor: z.string({
    invalid_type_error: 'The dress code must be a string',
    required_error: 'The dress code is required'
  })
})

export function validateSettings(settings: SettingsModel) {
  return settingsSchema.safeParse(settings)
}
