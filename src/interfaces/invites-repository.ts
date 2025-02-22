import {
  IBulkInvite,
  IConfirmation,
  IDashboardInvite,
  IInviteEventType,
  ISaveTheDateConfirmation,
  IUpsertInvite,
  IUserFromInvite,
  IUserInvite
} from '../global/types.js'

export interface IInvitesRepository {
  getAllInvites(userId: string, isAdmin: boolean): Promise<IDashboardInvite[]>

  getInvite(id: string): Promise<IUserInvite[]>

  markAsViewed(id: string): Promise<void>

  createInvite(invite: IUpsertInvite): Promise<string>

  createBulkInvite(invites: IBulkInvite[]): Promise<IUpsertInvite[]>

  bulkDeleteInvite(invites: string[]): Promise<void>

  deleteInvite(inviteId: string): Promise<void>

  updateInvite(entryModel: IUpsertInvite): Promise<void>

  updateSweetXvConfirmation(confirmations: IConfirmation): Promise<void>

  updateSaveTheDateConfirmation(
    confirmations: ISaveTheDateConfirmation
  ): Promise<void>

  readMessage(inviteId: string): Promise<void>

  getUserFromInviteId(inviteId: string): Promise<IUserFromInvite[]>

  getInviteEventType(id: string): Promise<IInviteEventType[]>
}
