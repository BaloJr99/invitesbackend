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
    try {
      const conn = await this.connection.getConnection()

      const [result] = (await conn.execute(
        'CALL getInvites(CAST(? AS BINARY), ?)',
        [userId, +isAdmin]
      )) as [RowDataPacket[], FieldPacket[]]

      conn.release()
      return result.at(0) as IDashboardInvite[]
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getInvite = async (id: string): Promise<IUserInvite[]> => {
    try {
      const conn = await this.connection.getConnection()

      const [result] = (await conn.query(
        'SELECT BIN_TO_UUID(e.id) id, family, entriesNumber, confirmation, kidsAllowed, ev.dateOfEvent, ev.maxDateOfConfirmation, nameOfCelebrated, typeOfEvent, BIN_TO_UUID(eventId) eventId, needsAccomodation FROM invites AS e INNER JOIN events as ev ON e.eventId = ev.id WHERE e.id = UUID_TO_BIN(?)',
        [id]
      )) as [RowDataPacket[], FieldPacket[]]

      conn.release()
      return result as IUserInvite[]
    } catch (error) {
      return Promise.reject(error)
    }
  }

  markAsViewed = async (id: string): Promise<void> => {
    try {
      const conn = await this.connection.getConnection()

      await conn.query(
        'UPDATE invites SET inviteViewed = ? WHERE id = UUID_TO_BIN(?)',
        [true, id]
      )

      conn.release()
    } catch (error) {
      console.error(error)
    }
  }

  createInvite = async (invite: IUpsertInvite): Promise<string> => {
    try {
      const {
        family,
        entriesNumber,
        phoneNumber,
        kidsAllowed,
        eventId,
        inviteGroupId
      } = invite

      const conn = await this.connection.getConnection()

      const [queryResult] = await conn.query('SELECT UUID() uuid')
      const [{ uuid }] = queryResult as { uuid: string }[]

      await conn.query(
        `INSERT INTO invites (id, family, entriesNumber, phoneNumber, kidsAllowed, eventId, inviteGroupId) VALUES (UUID_TO_BIN('${uuid}'), ?, ?, ?, ?, UUID_TO_BIN(?), UUID_TO_BIN(?))`,
        [
          family,
          entriesNumber,
          phoneNumber,
          kidsAllowed,
          eventId,
          inviteGroupId
        ]
      )

      conn.release()
      return uuid
    } catch (error) {
      return Promise.reject(error)
    }
  }

  createBulkInvite = async (
    invites: IBulkInvite[]
  ): Promise<IUpsertInvite[]> => {
    const invitesToInsert = invites.map((invite) => ({
      id: crypto.randomUUID().toString(),
      family: invite.family,
      entriesNumber: invite.entriesNumber,
      phoneNumber: invite.phoneNumber,
      kidsAllowed: invite.kidsAllowed,
      eventId: invite.eventId,
      inviteGroupId: invite.inviteGroupId
    })) as IUpsertInvite[]

    const conn = await this.connection.getConnection()

    try {
      // Begin transaction with current connection
      await conn.beginTransaction()

      const queryPromises: Promise<[QueryResult, FieldPacket[]]>[] = []

      // Insert query into promise array
      invitesToInsert.forEach((invite) => {
        queryPromises.push(
          conn.query(
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
      await conn.commit()
      return invitesToInsert
    } catch (err) {
      // Rollback transaction
      await conn.rollback()

      // Release connection
      conn.release()
      return Promise.reject(err)
    }
  }

  bulkDeleteInvite = async (invites: string[]): Promise<void> => {
    try {
      const conn = await this.connection.getConnection()

      const placeholders = invites.map(() => 'UUID_TO_BIN(?)').join(', ')
      await conn.query(
        `DELETE FROM invites WHERE id IN (${placeholders})`,
        invites
      )

      conn.release()
    } catch (error) {
      console.error(error)
    }
  }

  deleteInvite = async (inviteId: string): Promise<void> => {
    try {
      const conn = await this.connection.getConnection()

      await conn.query('DELETE FROM invites WHERE id = UUID_TO_BIN(?)', [
        inviteId
      ])

      conn.release()
    } catch (error) {
      console.error(error)
    }
  }

  updateInvite = async (entryModel: IUpsertInvite) => {
    try {
      const { id, family, entriesNumber, phoneNumber, kidsAllowed } = entryModel
      const conn = await this.connection.getConnection()

      await conn.query('UPDATE invites SET ? WHERE id = UUID_TO_BIN(?)', [
        { family, entriesNumber, phoneNumber, kidsAllowed },
        id
      ])
      conn.release
    } catch (error) {
      console.error(error)
    }
  }

  updateSweetXvConfirmation = async (confirmations: IConfirmation) => {
    try {
      const {
        id,
        entriesConfirmed,
        message,
        confirmation,
        dateOfConfirmation
      } = confirmations

      const conn = await this.connection.getConnection()

      await conn.query('UPDATE invites SET ? WHERE id = UUID_TO_BIN(?)', [
        { entriesConfirmed, message, confirmation, dateOfConfirmation },
        id
      ])

      conn.release()
    } catch (error) {
      console.error(error)
    }
  }

  updateSaveTheDateConfirmation = async (
    confirmations: ISaveTheDateConfirmation
  ) => {
    try {
      const { id, needsAccomodation } = confirmations
      const conn = await this.connection.getConnection()

      await conn.query('UPDATE invites SET ? WHERE id = UUID_TO_BIN(?)', [
        { needsAccomodation },
        id
      ])

      conn.release()
    } catch (error) {
      console.error(error)
    }
  }

  readMessage = async (inviteId: string) => {
    try {
      const conn = await this.connection.getConnection()

      await conn.query(
        'UPDATE invites SET isMessageRead = true WHERE id = UUID_TO_BIN(?)',
        [inviteId]
      )

      conn.release()
    } catch (error) {
      console.error(error)
    }
  }

  getUserFromInviteId = async (
    inviteId: string
  ): Promise<IUserFromInvite[]> => {
    try {
      const conn = await this.connection.getConnection()

      const [result] = (await conn.query(
        'SELECT CAST(userId as CHAR) AS id FROM invites AS i INNER JOIN events AS e ON e.id = i.eventId WHERE i.id = UUID_TO_BIN(?)',
        [inviteId]
      )) as [RowDataPacket[], FieldPacket[]]

      conn.release()
      return result as IUserFromInvite[]
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getInviteEventType = async (id: string): Promise<IInviteEventType[]> => {
    try {
      const conn = await this.connection.getConnection()

      const [result] = (await conn.query(
        'SELECT typeOfEvent FROM invites AS i INNER JOIN events as ev ON i.eventId = ev.id WHERE i.id = UUID_TO_BIN(?)',
        [id]
      )) as [RowDataPacket[], FieldPacket[]]

      conn.release()
      return result as IInviteEventType[]
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
