export interface FullEventModel extends EventModel {
  id: string
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
