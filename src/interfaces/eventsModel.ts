export interface FullEventModel  extends EventModel {
  id: string
}

export interface EventModel {
  nameOfEvent: string,
  dateOfEvent: string,
  maxDateOfConfirmation: string
}