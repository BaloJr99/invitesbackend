import {
  IFullInviteGroup,
  IInviteGroup,
  IPartialInviteGroup
} from '../global/types.js'

export interface IInviteGroupsRepository {
  getInviteGroups(eventId: string): Promise<IInviteGroup[]>

  bulkInviteGroup(
    eventId: string,
    inviteGroups: string[]
  ): Promise<IFullInviteGroup[]>

  createInviteGroup(inviteGroups: IInviteGroup): Promise<string>

  updateInviteGroup(inviteGroups: IPartialInviteGroup): Promise<void>

  checkInviteGroup(eventId: string, inviteGroup: string): Promise<boolean>
}
