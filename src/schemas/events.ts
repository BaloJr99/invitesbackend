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
    .transform((value) => value.replace('T', ' ').replace('Z', ''))
});

export function validateEvent (event: EventModel) {
  return eventSchema.safeParse(event);
}
