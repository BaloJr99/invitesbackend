export interface IFullInviteGroup {
  id: string
  inviteGroup: string
  eventId: string
}

export type IInviteGroup = Omit<IFullInviteGroup, 'id'>
export type IPartialInviteGroup = Omit<IFullInviteGroup, 'eventId'>