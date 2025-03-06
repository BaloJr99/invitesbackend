import {
  EventModel,
  IDashboardEvent,
  IDropdownEvent,
  IEventInformation,
  IFullEvent,
  IFullInvite,
  IsDeadlineMet,
  IUserEventsInfo
} from '../global/types.js'

export interface IEventsRepository {
  getAllEvents(): Promise<IDashboardEvent[]>

  getEventsByUser(userId: string): Promise<IDashboardEvent[]>

  getDropdownEvents(): Promise<IDropdownEvent[]>

  isActive(eventId: string): Promise<boolean>

  getEventId(nameOfEvent: string): Promise<string>

  eventInformation(eventId: string): Promise<IEventInformation[]>

  getDropdownEventsByUserId(userId: string): Promise<IDropdownEvent[]>

  getEventInvites(eventId: string): Promise<IFullInvite[]>

  isDeadlineMet(eventId: string): Promise<IsDeadlineMet[]>

  getEventById(eventId: string): Promise<IFullEvent[]>

  createEvent(event: EventModel): Promise<string>

  deleteEvent(eventId: string): Promise<void>

  updateEvent(
    eventId: string,
    event: EventModel,
    override: boolean,
    overrideViewed: boolean
  ): Promise<void>

  getEventsInfo(userId: string): Promise<IUserEventsInfo[]>
}
