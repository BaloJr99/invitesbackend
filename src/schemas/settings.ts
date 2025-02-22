import { z } from 'zod'
import { ISweetXvSettings, IWeddingSetting } from '../global/types.js'

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
        }),
        order: z.number({
          invalid_type_error: 'The order must be a number',
          message: 'You must provide the order value'
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
      .regex(/^\d{4}-\d{2}-\d{2}\s(\d{2}:){2}\d{2}$/, {
        message: 'Invalid date format'
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
      .regex(/^\d{4}-\d{2}-\d{2}\s(\d{2}:){2}\d{2}$/, {
        message: 'Invalid date format'
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

const weddingSettingsSchema = z
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
        }),
        order: z.number({
          invalid_type_error: 'The order must be a number',
          message: 'You must provide the order value'
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
    weddingPrimaryColor: z
      .string({
        invalid_type_error: 'The primary color must be a string',
        required_error: 'The primary color is required'
      })
      .min(7, {
        message: 'You must provide a valid hex color code'
      }),
    weddingSecondaryColor: z
      .string({
        invalid_type_error: 'The secondary color must be a string',
        required_error: 'The secondary color is required'
      })
      .min(7, {
        message: 'You must provide a valid hex color code'
      }),
    weddingCopyMessage: z
      .string({
        invalid_type_error: 'The wedding copy message must be a string',
        required_error: 'The wedding copy message is required'
      })
      .min(1, {
        message: 'You must provide the wedding copy message'
      }),
    groomParents: z
      .string({
        invalid_type_error: 'The groom parents must be a string',
        required_error: 'The groom parents is required'
      })
      .min(1, {
        message: 'You must provide the groom parents name'
      }),
    brideParents: z
      .string({
        invalid_type_error: 'The bride parents must be a string',
        required_error: 'The bride parents is required'
      })
      .min(1, {
        message: 'You must provide the bride parents name'
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
      }),
    hotelUrl: z
      .string({
        invalid_type_error: 'The hotel url must be a string',
        required_error: 'The hotel url is required'
      })
      .url({
        message: 'The hotel url must be a valid URL'
      }),
    hotelAddress: z
      .string({
        invalid_type_error: 'The hotel address must be a string',
        required_error: 'The hotel address is required'
      })
      .min(1, {
        message: 'You must provide the hotel address'
      }),
    hotelPhone: z
      .string({
        invalid_type_error: 'The hotel phone must be a string',
        required_error: 'The hotel phone is required'
      })
      .min(1, {
        message: 'You must provide the hotel phone'
      }),
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
      .regex(/^\d{4}-\d{2}-\d{2}\s(\d{2}:){2}\d{2}$/, {
        message: 'Invalid date format'
      })
      .optional(),
    massPlace: z
      .string({
        invalid_type_error: 'The mass place must be a string',
        required_error: 'The mass place is required'
      })
      .min(1, {
        message: 'You must provide the mass place'
      })
      .optional(),
    venueUrl: z
      .string({
        invalid_type_error: 'The venue url must be a string',
        required_error: 'The venue url is required'
      })
      .url({
        message: 'The venue url must be a valid URL'
      })
      .optional(),
    venueTime: z
      .string({
        invalid_type_error: 'The venue time must be a string',
        required_error: 'The venue time is required'
      })
      .regex(/^\d{4}-\d{2}-\d{2}\s(\d{2}:){2}\d{2}$/, {
        message: 'Invalid date format'
      })
      .optional(),
    venuePlace: z
      .string({
        invalid_type_error: 'The venue place must be a string',
        required_error: 'The venue place is required'
      })
      .min(1, {
        message: 'You must provide the venue place'
      })
      .optional(),
    civilUrl: z
      .string({
        invalid_type_error: 'The civil url must be a string',
        required_error: 'The civil url is required'
      })
      .url({
        message: 'The civil url must be a valid URL'
      })
      .optional(),
    civilTime: z
      .string({
        invalid_type_error: 'The civil time must be a string',
        required_error: 'The civil time is required'
      })
      .regex(/^\d{4}-\d{2}-\d{2}\s(\d{2}:){2}\d{2}$/, {
        message: 'Invalid date format'
      })
      .optional(),
    civilPlace: z
      .string({
        invalid_type_error: 'The civil place must be a string',
        required_error: 'The civil place is required'
      })
      .min(1, {
        message: 'You must provide the civil place'
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
      .optional(),
    cardNumber: z
      .string({
        invalid_type_error: 'The card number must be a string',
        required_error: 'The card number is required'
      })
      .min(1, {
        message: 'You must provide the card number'
      })
      .optional(),
    clabeBank: z
      .string({
        invalid_type_error: 'The clabe bank must be a string',
        required_error: 'The clabe bank is required'
      })
      .min(1, {
        message: 'You must provide the clabe bank'
      })
      .optional()
  })
  .superRefine((data, ctx) => {
    const sections = data.sections
    let sectionHasIssues = false

    // We need to mark fields as optional if the section is not selected
    sectionHasIssues =
      (sections.some((s) => s.sectionId === 'itineraryInfo' && s.selected) &&
        (!data.massUrl ||
          !data.massTime ||
          !data.massPlace ||
          !data.venuePlace ||
          !data.venueTime ||
          !data.venueUrl)) ||
      (sections.some((s) => s.sectionId === 'dressCodeInfo' && s.selected) &&
        !data.dressCodeColor) ||
      (sections.some((s) => s.sectionId === 'giftsInfo' && s.selected) &&
        (!data.cardNumber || !data.clabeBank))

    if (sectionHasIssues) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Sections are invalid',
        path: ['sections']
      })
    }

    return sectionHasIssues
  })

export function validateSweetXvSettings(settings: ISweetXvSettings) {
  return sweetXvSettingsSchema.safeParse(settings)
}

export function validateSaveTheDateSettings(settings: ISweetXvSettings) {
  return saveTheDateSettingsSchema.safeParse(settings)
}

export function validateWeddingSettings(settings: IWeddingSetting) {
  return weddingSettingsSchema.safeParse(settings)
}
