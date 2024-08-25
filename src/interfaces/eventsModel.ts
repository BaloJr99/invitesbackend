export interface FullEventModel  extends EventModel {
  id: string,
  allowCreateInvites: boolean
}

export interface EventModel {
  nameOfEvent: string,
  dateOfEvent: string,
  maxDateOfConfirmation: string,
  typeOfEvent: string,
  nameOfCelebrated: string,
  userId: string
}