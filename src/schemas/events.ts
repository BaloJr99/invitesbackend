import { z } from 'zod'
import { EventModel } from '../interfaces/eventsModel.js'

const eventSchema = z.object({
  nameOfEvent: z.string({
    invalid_type_error: 'The event name must be a string',
    required_error: 'The event name is required'
  }),
  dateOfEvent: z
    .string({
      invalid_type_error: 'The date of the event must be a string',
      required_error: 'The date of the event is required'
    })
    .date(),
  maxDateOfConfirmation: z.string({
    invalid_type_error: 'The max date of confirmation must be a string',
    required_error: 'The max date of confirmation is required'
  }),
  typeOfEvent: z
    .string({
      required_error: 'The type of the event is required',
      invalid_type_error: 'The type of the event must be a string'
    })
    .length(1),
  nameOfCelebrated: z.string({
    required_error: 'The name of the celebrated is required',
    invalid_type_error: 'The name of the celebrated must be a string'
  }),
  userId: z.string({
    required_error: 'The user is required',
    invalid_type_error: 'The user must be a string'
  })
})

export function validateEvent(event: EventModel) {
  return eventSchema.safeParse(event)
}
