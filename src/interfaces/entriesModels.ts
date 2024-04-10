export interface FullEntryModel {
  id: string,
  family: string,
  entriesNumber: number,
  phoneNumber: string,
  kidsAllowed: boolean,
  eventId: string,
  familyGroupId: string,
  message: string,
  entriesConfirmed: number,
  confirmation: boolean,
  dateOfConfirmation: string,
  isMessageRead: boolean
}

export interface PartialEntryModel {
  family: string,
  entriesNumber: number,
  phoneNumber: string,
  kidsAllowed: boolean,
  eventId: string,
  familyGroupId: string
}

export interface ConfirmationModel {
  message: string,
  entriesConfirmed: number,
  confirmation: boolean,
  dateOfConfirmation: string,
  isMessageRead: boolean
}