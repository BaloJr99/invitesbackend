export interface IFullInvite {
  id: string
  family: string
  entriesNumber: number
  entriesConfirmed: number | null
  message: string | null
  confirmation: boolean | null
  phoneNumber: string
  kidsAllowed: boolean
  dateOfConfirmation: string | null
  isMessageRead: boolean
  eventId: string
  inviteGroupId: string
  inviteViewed: string
  needsAccomodation: boolean | null
}

export type IUpsertInvite = Omit<
  IFullInvite,
  | 'entriesConfirmed'
  | 'message'
  | 'confirmation'
  | 'dateOfConfirmation'
  | 'isMessageRead'
  | 'inviteViewed'
  | 'needsAccomodation'
>

export type IBulkInvite = Pick<
  IFullInvite,
  | 'family'
  | 'entriesNumber'
  | 'phoneNumber'
  | 'kidsAllowed'
  | 'eventId'
  | 'inviteGroupId'
> & { inviteGroupName: string; isNewInviteGroup: boolean }

export type ISaveTheDateConfirmation = Pick<
  IFullInvite,
  'id' | 'needsAccomodation'
>

export type IConfirmation = Pick<
  IFullInvite,
  'confirmation' | 'dateOfConfirmation' | 'entriesConfirmed' | 'id' | 'message'
>

export type IUserInvite = Pick<
  IFullInvite,
  | 'id'
  | 'family'
  | 'entriesNumber'
  | 'confirmation'
  | 'kidsAllowed'
  | 'eventId'
  | 'needsAccomodation'
> & {
  dateOfEvent: string
  maxDateOfConfirmation: string
  nameOfCelebrated: string
  typeOfEvent: string
}

export type IDashboardInvite = Pick<
  IFullInvite,
  | 'entriesConfirmed'
  | 'confirmation'
  | 'dateOfConfirmation'
  | 'entriesNumber'
  | 'eventId'
>;

export interface IInviteEventType {
  typeOfEvent: string
}
