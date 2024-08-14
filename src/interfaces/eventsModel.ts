export interface FullEventModel  extends EventModel {
  id: string,
  allowCreateEntries: boolean
}

export interface EventModel {
  nameOfEvent: string,
  dateOfEvent: string,
  maxDateOfConfirmation: string
}