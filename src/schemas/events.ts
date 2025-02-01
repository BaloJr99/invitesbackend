import { z } from 'zod'
import { EventModel } from '../interfaces/eventsModel.js'

const eventSchema = z.object({
  nameOfEvent: z
    .string({
      required_error: 'The event name is required',
      invalid_type_error: 'The event name must be a string'
    })
    .min(1, {
      message: 'You must provide a name for the event'
    }),
  dateOfEvent: z
    .string({
      required_error: 'The date of the event is required',
      invalid_type_error: 'The date of the event must be a string'
    })
    .regex(/^\d{4}-\d{2}-\d{2}\s(\d{2}:){2}\d{2}$/, {
      message: 'Invalid date format'
    }),
  maxDateOfConfirmation: z
    .string({
      invalid_type_error: 'The max date of confirmation must be a string',
      required_error: 'The max date of confirmation is required'
    })
    .regex(/^\d{4}-\d{2}-\d{2}\s(\d{2}:){2}\d{2}$/, {
      message: 'Invalid date format'
    }),
  typeOfEvent: z
    .string({
      invalid_type_error: 'The type of the event must be a string',
      required_error: 'The type of the event is required'
    })
    .min(1, {
      message: 'You must provide the type of event'
    }),
  nameOfCelebrated: z
    .string({
      invalid_type_error: 'The name of the celebrated must be a string',
      required_error: 'The name of the celebrated is required'
    })
    .min(1, {
      message: 'You must provide the name of the celebrated'
    }),
  userId: z
    .string({
      invalid_type_error: 'The user must be a string',
      required_error: 'The user is required'
    })
    .min(1, {
      message: 'You must provide the user'
    })
})

export function validateEvent(event: EventModel) {
  return eventSchema.safeParse(event)
}
