export interface FullInviteModel extends PartialInviteModel, ConfirmationModel {
  id: string
}

export interface PartialInviteModel {
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