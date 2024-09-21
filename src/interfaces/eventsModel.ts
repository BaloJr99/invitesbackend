export interface IFullEvent {
  id: string
  nameOfEvent: string
  dateOfEvent: string
  maxDateOfConfirmation: string
  typeOfEvent: string
  nameOfCelebrated: string
  userId: string
}

export type IDashboardEvent = Pick<
  IFullEvent,
  'id' | 'nameOfEvent' | 'dateOfEvent'
> & { allowCreateInvites: boolean }

export type IDropdownEvent = Pick<IFullEvent, 'id' | 'nameOfEvent'>

export interface IUserEventsInfo {
  numEvents: number
  numEntries: number
}

export interface EventModel {
  nameOfEvent: string
  dateOfEvent: string
  maxDateOfConfirmation: string
  typeOfEvent: string
  nameOfCelebrated: string
  userId: string
}

export interface IDropdownEventModel {
  id: string
  nameOfEvent: string
}

export interface IsDeadlineMet {
  isDeadlineMet: number
}
