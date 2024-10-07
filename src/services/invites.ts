import { FieldPacket, Pool, QueryResult, RowDataPacket } from 'mysql2/promise'
import {
  IBulkInvite,
  IConfirmation,
  IDashboardInvite,
  IInviteEventType,
  ISaveTheDateConfirmation,
  IUpsertInvite,
  IUserInvite
} from '../interfaces/invitesModels.js'
import { IUserFromInvite } from '../interfaces/usersModel.js'

export class InvitesService {
  constructor(private connection: Pool) {
    this.connection = connection
  }

  getAllInvites = async (
    userId: string,
    isAdmin: boolean
  ): Promise<IDashboardInvite[]> => {
    const [result] = (await this.connection.execute(
      'CALL getInvites(CAST(? AS BINARY), ?)',
      [userId, +isAdmin]
    )) as [RowDataPacket[], FieldPacket[]]
    return result.at(0) as IDashboardInvite[]
  }

  getInvite = async (id: string): Promise<IUserInvite[]> => {
    const [result] = (await this.connection.query(
      'SELECT BIN_TO_UUID(e.id) id, family, entriesNumber, confirmation, kidsAllowed, ev.dateOfEvent, ev.maxDateOfConfirmation, nameOfCelebrated, typeOfEvent, BIN_TO_UUID(eventId) eventId, needsAccomodation FROM invites AS e INNER JOIN events as ev ON e.eventId = ev.id WHERE e.id = UUID_TO_BIN(?)',
      [id]
    )) as [RowDataPacket[], FieldPacket[]]

    return result as IUserInvite[]
  }

  markAsViewed = async (id: string): Promise<void> => {
    await this.connection.query(
      'UPDATE invites SET inviteViewed = ? WHERE id = UUID_TO_BIN(?)',
      [true, id]
    )
  }

  createInvite = async (invite: IUpsertInvite): Promise<string> => {
    const {
      family,
      entriesNumber,
      phoneNumber,
      kidsAllowed,
      eventId,
      inviteGroupId
    } = invite

    const [queryResult] = await this.connection.query('SELECT UUID() uuid')
    const [{ uuid }] = queryResult as { uuid: string }[]

    await this.connection.query(
      `INSERT INTO invites (id, family, entriesNumber, phoneNumber, kidsAllowed, eventId, inviteGroupId) VALUES (UUID_TO_BIN('${uuid}'), ?, ?, ?, ?, UUID_TO_BIN(?), UUID_TO_BIN(?))`,
      [family, entriesNumber, phoneNumber, kidsAllowed, eventId, inviteGroupId]
    )

    return uuid
  }

  createBulkInvite = async (invites: IBulkInvite[]) => {
    const invitesToInsert = invites.map((invite) => ({
      id: crypto.randomUUID().toString(),
      family: invite.family,
      entriesNumber: invite.entriesNumber,
      phoneNumber: invite.phoneNumber,
      kidsAllowed: invite.kidsAllowed,
      eventId: invite.eventId,
      inviteGroupId: invite.inviteGroupId
    })) as IUpsertInvite[]

    const actualConnection = await this.connection.getConnection()

    try {
      // Begin transaction with current connection
      await actualConnection.beginTransaction()

      const queryPromises: Promise<[QueryResult, FieldPacket[]]>[] = []

      // Insert query into promise array
      invitesToInsert.forEach((invite) => {
        queryPromises.push(
          actualConnection.query(
            `INSERT INTO invites (id, family, entriesNumber, phoneNumber, kidsAllowed, eventId, inviteGroupId) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, UUID_TO_BIN(?), UUID_TO_BIN(?))`,
            [
              invite.id,
              invite.family,
              invite.entriesNumber,
              invite.phoneNumber,
              invite.kidsAllowed,
              invite.eventId,
              invite.inviteGroupId
            ]
          )
        )
      })

      // Execute all promises
      await Promise.all(queryPromises)

      // Commit transaction
      await actualConnection.commit()
      return invitesToInsert
    } catch (err) {
      // Rollback transaction
      await actualConnection.rollback()

      // Release connection
      actualConnection.release()
      return Promise.reject(err)
    }
  }

  bulkDeleteInvite = async (invites: string[]): Promise<void> => {
    const placeholders = invites.map(() => 'UUID_TO_BIN(?)').join(', ')
    await this.connection.query(
      `DELETE FROM invites WHERE id IN (${placeholders})`,
      invites
    )
  }

  deleteInvite = async (inviteId: string): Promise<void> => {
    await this.connection.query(
      'DELETE FROM invites WHERE id = UUID_TO_BIN(?)',
      [inviteId]
    )
  }

  updateInvite = async (entryModel: IUpsertInvite) => {
    const { id, family, entriesNumber, phoneNumber, kidsAllowed } = entryModel

    await this.connection.query(
      'UPDATE invites SET ? WHERE id = UUID_TO_BIN(?)',
      [{ family, entriesNumber, phoneNumber, kidsAllowed }, id]
    )
  }

  updateSweetXvConfirmation = async (confirmations: IConfirmation) => {
    const { id, entriesConfirmed, message, confirmation, dateOfConfirmation } =
      confirmations

    await this.connection.query(
      'UPDATE invites SET ? WHERE id = UUID_TO_BIN(?)',
      [{ entriesConfirmed, message, confirmation, dateOfConfirmation }, id]
    )
  }

  updateSaveTheDateConfirmation = async (
    confirmations: ISaveTheDateConfirmation
  ) => {
    const { id, needsAccomodation } = confirmations

    await this.connection.query(
      'UPDATE invites SET ? WHERE id = UUID_TO_BIN(?)',
      [{ needsAccomodation }, id]
    )
  }

  readMessage = async (inviteId: string) => {
    await this.connection.query(
      'UPDATE invites SET isMessageRead = true WHERE id = UUID_TO_BIN(?)',
      [inviteId]
    )
  }

  getUserFromInviteId = async (
    inviteId: string
  ): Promise<IUserFromInvite[]> => {
    const [result] = (await this.connection.query(
      'SELECT CAST(userId as CHAR) AS id FROM invites AS i INNER JOIN events AS e ON e.id = i.eventId WHERE i.id = UUID_TO_BIN(?)',
      [inviteId]
    )) as [RowDataPacket[], FieldPacket[]]

    return result as IUserFromInvite[]
  }

  getInviteEventType = async (id: string): Promise<IInviteEventType[]> => {
    const [result] = (await this.connection.query(
      'SELECT typeOfEvent FROM invites AS i INNER JOIN events as ev ON i.eventId = ev.id WHERE i.id = UUID_TO_BIN(?)',
      [id]
    )) as [RowDataPacket[], FieldPacket[]]

    return result as IInviteEventType[]
  }
}
