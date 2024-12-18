import { z } from 'zod'
import { ISweetXvSettings } from '../interfaces/settingsModel.js'

const sweetXvSettingsSchema = z
  .object({
    sections: z
      .object({
        sectionId: z.string({
          invalid_type_error: 'The section id must be a string',
          message: 'You must provide the section id'
        }),
        selected: z.boolean({
          invalid_type_error: 'The selected must be a boolean',
          message: 'You must provide the selected value'
        })
      })
      .array(),
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
      })
      .optional(),
    godParents: z
      .string({
        invalid_type_error: 'The godParents must be a string',
        required_error: 'The godParents is required'
      })
      .min(1, {
        message: 'You must provide the god parents names'
      })
      .optional(),
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
      })
      .optional(),
    massUrl: z
      .string({
        invalid_type_error: 'The mass url must be a string',
        required_error: 'The mass url is required'
      })
      .url({
        message: 'The mass url must be a valid URL'
      })
      .optional(),
    massTime: z
      .string({
        invalid_type_error: 'The mass time must be a string',
        required_error: 'The mass time is required'
      })
      .time({
        message: 'Invalid time format'
      })
      .optional(),
    massAddress: z
      .string({
        invalid_type_error: 'The mass address must be a string',
        required_error: 'The mass address is required'
      })
      .min(1, {
        message: 'You must provide the mass address'
      })
      .optional(),
    receptionUrl: z
      .string({
        invalid_type_error: 'The reception url must be a string',
        required_error: 'The reception url is required'
      })
      .url({
        message: 'The mass url must be a valid URL'
      })
      .optional(),
    receptionTime: z
      .string({
        invalid_type_error: 'The reception time must be a string',
        required_error: 'The reception time is required'
      })
      .time({
        message: 'Invalid time format'
      })
      .optional(),
    receptionPlace: z
      .string({
        invalid_type_error: 'The reception place must be a string',
        required_error: 'The reception place is required'
      })
      .min(1, {
        message: 'You must provide the reception place'
      })
      .optional(),
    receptionAddress: z
      .string({
        invalid_type_error: 'The reception address must be a string',
        required_error: 'The reception address is required'
      })
      .min(1, {
        message: 'You must provide the reception address'
      })
      .optional(),
    dressCodeColor: z
      .string({
        invalid_type_error: 'The dress code must be a string',
        required_error: 'The dress code is required'
      })
      .min(1, {
        message: 'You must provide the dress code'
      })
      .optional()
  })
  .superRefine((data, ctx) => {
    const sections = data.sections
    let sectionHasIssues = false

    // We need to mark fields as optional if the section is not selected
    sectionHasIssues =
      sectionHasIssues ||
      (sections.some((s) => s.sectionId === 'ceremonyInfo' && s.selected) &&
        (!data.massUrl ||
          !data.massTime ||
          !data.massAddress ||
          !data.parents ||
          !data.godParents ||
          !data.secondSectionSentences)) ||
      (sections.some((s) => s.sectionId === 'receptionInfo' && s.selected) &&
        (!data.receptionUrl ||
          !data.receptionTime ||
          !data.receptionPlace ||
          !data.receptionAddress)) ||
      (sections.some((s) => s.sectionId === 'dressCode' && s.selected) &&
        !data.dressCodeColor)

    if (sectionHasIssues) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Sections are invalid',
        path: ['sections']
      })
    }

    return sectionHasIssues
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
    }),
  copyMessage: z
    .string({
      invalid_type_error: 'The copy message must be a string',
      required_error: 'The copy message is required'
    })
    .min(1, {
      message: 'You must provide the copy message'
    }),
  hotelName: z
    .string({
      invalid_type_error: 'The hotel name must be a string',
      required_error: 'The hotel name is required'
    })
    .min(1, {
      message: 'You must provide the hotel name'
    }),
  hotelInformation: z
    .string({
      invalid_type_error: 'The hotel information must be a string',
      required_error: 'The hotel information is required'
    })
    .url({
      message: 'The hotel information must be a valid URL'
    })
})

export function validateSweetXvSettings(settings: ISweetXvSettings) {
  return sweetXvSettingsSchema.safeParse(settings)
}

export function validateSaveTheDateSettings(settings: ISweetXvSettings) {
  return saveTheDateSettingsSchema.safeParse(settings)
}
