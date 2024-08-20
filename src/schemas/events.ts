import { z } from 'zod';
import { EventModel } from '../interfaces/eventsModel.js';

const eventSchema = z.object({
  nameOfEvent: z.string({
    invalid_type_error: 'The event name must be a string',
    required_error: 'The event name is required'
  }),
  dateOfEvent: z
    .string()
    .datetime()
    .transform((value) => value.replace('T', ' ').replace('Z', '')),
  maxDateOfConfirmation: z
    .string()
    .datetime()
    .transform((value) => value.replace('T', ' ').replace('Z', '')),
  typeOfEvent: z.string({
    required_error: 'The type of the event is required'
  }).length(1),
  nameOfCelebrated: z.string({
    required_error: 'The name of the celebrated is required'
  }),
  userId: z.string({
    required_error: 'The user is required'
  })
});

export function validateEvent (event: EventModel) {
  return eventSchema.safeParse(event);
}
