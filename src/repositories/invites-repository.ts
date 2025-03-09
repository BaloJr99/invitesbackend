import { FieldPacket, QueryResult, RowDataPacket } from 'mysql2/promise'
import {
  IBulkInvite,
  IConfirmation,
  IDashboardInvite,
  IInviteEventType,
  IOverwriteConfirmation,
  ISaveTheDateConfirmation,
  IUpsertInvite,
  IUserFromInvite,
  IUserInvite
} from '../global/types.js'
import { MysqlDatabase } from '../services/mysql-database.js'
import { IInvitesRepository } from '../interfaces/invites-repository.js'

export class InvitesRepository implements IInvitesRepository {
  constructor(private database: MysqlDatabase) {
    this.database = database
  }

  getAllInvites = async (
    userId: string,
    isAdmin: boolean
  ): Promise<IDashboardInvite[]> => {
    const connection = await this.database.getConnection()

    try {
      const [result] = (await connection.execute(
        'CALL getInvites(CAST(? AS BINARY), ?)',
        [userId, +isAdmin]
      )) as [RowDataPacket[], FieldPacket[]]

      return result.at(0) as IDashboardInvite[]
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  getInvite = async (id: string): Promise<IUserInvite[]> => {
    const connection = await this.database.getConnection()

    try {
      const [result] = (await connection.query(
        'SELECT BIN_TO_UUID(e.id) id, family, entriesNumber, confirmation, kidsAllowed, ev.dateOfEvent, ev.maxDateOfConfirmation, nameOfCelebrated, typeOfEvent, BIN_TO_UUID(eventId) eventId, needsAccomodation FROM invites AS e INNER JOIN events as ev ON e.eventId = ev.id WHERE e.id = UUID_TO_BIN(?)',
        [id]
      )) as [RowDataPacket[], FieldPacket[]]

      return result as IUserInvite[]
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  markAsViewed = async (id: string): Promise<void> => {
    const connection = await this.database.getConnection()

    try {
      await connection.query(
        'UPDATE invites SET inviteViewed = ? WHERE id = UUID_TO_BIN(?)',
        [true, id]
      )
    } catch (error) {
      console.error(error)
    } finally {
      if (connection) connection.release()
    }
  }

  createInvite = async (invite: IUpsertInvite): Promise<string> => {
    const connection = await this.database.getConnection()

    try {
      const {
        family,
        entriesNumber,
        phoneNumber,
        kidsAllowed,
        eventId,
        inviteGroupId
      } = invite

      const [queryResult] = await connection.query('SELECT UUID() uuid')
      const [{ uuid }] = queryResult as { uuid: string }[]

      await connection.query(
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

      return uuid
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  createBulkInvite = async (
    invites: IBulkInvite[]
  ): Promise<IUpsertInvite[]> => {
    const connection = await this.database.getConnection()

    const invitesToInsert = invites.map((invite) => ({
      id: crypto.randomUUID().toString(),
      family: invite.family,
      entriesNumber: invite.entriesNumber,
      phoneNumber: invite.phoneNumber,
      kidsAllowed: invite.kidsAllowed,
      eventId: invite.eventId,
      inviteGroupId: invite.inviteGroupId
    })) as IUpsertInvite[]

    try {
      // Begin transaction with current connection
      await connection.beginTransaction()

      const queryPromises: Promise<[QueryResult, FieldPacket[]]>[] = []

      // Insert query into promise array
      invitesToInsert.forEach((invite) => {
        if (connection) {
          queryPromises.push(
            connection.query(
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
        }
      })

      // Execute all promises
      await Promise.all(queryPromises)

      // Commit transaction
      await connection.commit()
      return invitesToInsert
    } catch (error) {
      // Rollback transaction
      if (connection) await connection.rollback()

      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  bulkDeleteInvite = async (invites: string[]): Promise<void> => {
    const connection = await this.database.getConnection()

    try {
      const placeholders = invites.map(() => 'UUID_TO_BIN(?)').join(', ')
      await connection.query(
        `DELETE FROM invites WHERE id IN (${placeholders})`,
        invites
      )
    } catch (error) {
      console.error(error)
    } finally {
      if (connection) connection.release()
    }
  }

  deleteInvite = async (inviteId: string): Promise<void> => {
    const connection = await this.database.getConnection()

    try {
      await connection.query('DELETE FROM invites WHERE id = UUID_TO_BIN(?)', [
        inviteId
      ])
    } catch (error) {
      console.error(error)
    } finally {
      if (connection) connection.release()
    }
  }

  updateInvite = async (entryModel: IUpsertInvite): Promise<void> => {
    const connection = await this.database.getConnection()

    try {
      const { id, family, entriesNumber, phoneNumber, kidsAllowed } = entryModel

      await connection.query('UPDATE invites SET ? WHERE id = UUID_TO_BIN(?)', [
        { family, entriesNumber, phoneNumber, kidsAllowed },
        id
      ])
    } catch (error) {
      console.error(error)
    } finally {
      if (connection) connection.release()
    }
  }

  updateSweetXvConfirmation = async (
    confirmations: IConfirmation
  ): Promise<void> => {
    const connection = await this.database.getConnection()

    try {
      const {
        id,
        entriesConfirmed,
        message,
        confirmation,
        dateOfConfirmation
      } = confirmations

      await connection.query('UPDATE invites SET ? WHERE id = UUID_TO_BIN(?)', [
        { entriesConfirmed, message, confirmation, dateOfConfirmation },
        id
      ])
    } catch (error) {
      console.error(error)
    } finally {
      if (connection) connection.release()
    }
  }

  updateSaveTheDateConfirmation = async (
    confirmations: ISaveTheDateConfirmation
  ): Promise<void> => {
    const connection = await this.database.getConnection()

    try {
      const { id, needsAccomodation } = confirmations

      await connection.query('UPDATE invites SET ? WHERE id = UUID_TO_BIN(?)', [
        { needsAccomodation },
        id
      ])
    } catch (error) {
      console.error(error)
    } finally {
      if (connection) connection.release()
    }
  }

  readMessage = async (inviteId: string): Promise<void> => {
    const connection = await this.database.getConnection()

    try {
      await connection.query(
        'UPDATE invites SET isMessageRead = true WHERE id = UUID_TO_BIN(?)',
        [inviteId]
      )
    } catch (error) {
      console.error(error)
    } finally {
      if (connection) connection.release()
    }
  }

  getUserFromInviteId = async (
    inviteId: string
  ): Promise<IUserFromInvite[]> => {
    const connection = await this.database.getConnection()

    try {
      const [result] = (await connection.query(
        'SELECT CAST(userId as CHAR) AS id FROM invites AS i INNER JOIN events AS e ON e.id = i.eventId WHERE i.id = UUID_TO_BIN(?)',
        [inviteId]
      )) as [RowDataPacket[], FieldPacket[]]

      return result as IUserFromInvite[]
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  getInviteEventType = async (id: string): Promise<IInviteEventType[]> => {
    const connection = await this.database.getConnection()

    try {
      const [result] = (await connection.query(
        'SELECT typeOfEvent FROM invites AS i INNER JOIN events as ev ON i.eventId = ev.id WHERE i.id = UUID_TO_BIN(?)',
        [id]
      )) as [RowDataPacket[], FieldPacket[]]

      return result as IInviteEventType[]
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  cancelInvites = async (eventId: string): Promise<void> => {
    const connection = await this.database.getConnection()

    try {
      await connection.query(
        'UPDATE invites SET confirmation = false, message = "", entriesConfirmed = 0, dateOfConfirmation = UTC_TIMESTAMP() WHERE eventId = UUID_TO_BIN(?) AND confirmation IS NULL',
        [eventId]
      )
    } catch (error) {
      console.error(error)
    } finally {
      if (connection) connection.release()
    }
  }

  overwriteConfirmation = async (
    overwriteConfirmation: IOverwriteConfirmation,
    inviteId: string
  ): Promise<void> => {
    const connection = await this.database.getConnection()

    try {
      const { confirmation, entriesConfirmed } = overwriteConfirmation
      await connection.query(
        'UPDATE invites SET confirmation = ?, entriesConfirmed = ?, message = "", dateOfConfirmation = UTC_TIMESTAMP() WHERE id = UUID_TO_BIN(?)',
        [confirmation, entriesConfirmed, inviteId]
      )
    } catch (error) {
      console.error(error)
    } finally {
      if (connection) connection.release()
    }
  }
}
