import { FieldPacket, Pool, QueryResult, RowDataPacket } from 'mysql2/promise'
import {
  IInviteGroup,
  IFullInviteGroup,
  IPartialInviteGroup
} from '../interfaces/inviteGroupsModel.js'

export class InviteGroupsService {
  constructor(private connection: Pool) {
    this.connection = connection
  }

  getInviteGroups = async (eventId: string): Promise<IInviteGroup[]> => {
    try {
      const conn = await this.connection.getConnection()

      const [result] = (await conn.query(
        'SELECT BIN_TO_UUID(id) id, inviteGroup FROM inviteGroups WHERE eventId = UUID_TO_BIN(?) ORDER BY inviteGroup',
        [eventId]
      )) as [RowDataPacket[], FieldPacket[]]
      return result as IInviteGroup[]
    } catch (error) {
      return Promise.reject(error)
    }
  }

  bulkInviteGroup = async (
    eventId: string,
    inviteGroups: string[]
  ): Promise<IFullInviteGroup[]> => {
    const newInviteGroups = inviteGroups.reduce(
      (result: IInviteGroup[], inviteGroup) => {
        result.push({
          eventId: eventId,
          id: crypto.randomUUID(),
          inviteGroup: inviteGroup
        } as IInviteGroup)
        return result
      },
      []
    ) as IFullInviteGroup[]

    const conn = await this.connection.getConnection()

    try {
      // Begin transaction with current connection
      await conn.beginTransaction()

      const queryPromises: Promise<[QueryResult, FieldPacket[]]>[] = []

      // Insert query into promise array
      newInviteGroups.forEach((inviteGroup) => {
        queryPromises.push(
          conn.query(
            `INSERT INTO inviteGroups (id, inviteGroup, eventId) VALUES (UUID_TO_BIN(?), ?, UUID_TO_BIN(?))`,
            [inviteGroup.id, inviteGroup.inviteGroup, inviteGroup.eventId]
          )
        )
      })

      // Execute all promises
      await Promise.all(queryPromises)

      // Commit transaction
      await conn.commit()

      // Release connection
      conn.release()
      return newInviteGroups
    } catch (error) {
      // Rollback transaction
      await conn.rollback()

      // Release connection
      conn.release()
      return Promise.reject(error)
    }
  }

  createInviteGroup = async (inviteGroups: IInviteGroup): Promise<string> => {
    try {
      const conn = await this.connection.getConnection()

      const { inviteGroup, eventId } = inviteGroups

      const [queryResult] = await conn.query('SELECT UUID() uuid')
      const [{ uuid }] = queryResult as { uuid: string }[]

      await conn.query(
        `INSERT INTO inviteGroups (id, inviteGroup, eventId) VALUES (UUID_TO_BIN('${uuid}'), ?, UUID_TO_BIN(?))`,
        [inviteGroup, eventId]
      )

      conn.release()
      return uuid
    } catch (error) {
      return Promise.reject(error)
    }
  }

  updateInviteGroup = async (
    inviteGroups: IPartialInviteGroup
  ): Promise<void> => {
    try {
      const conn = await this.connection.getConnection()

      const { id, inviteGroup } = inviteGroups

      await conn.query('UPDATE inviteGroups SET ? WHERE id = UUID_TO_BIN(?)', [
        { inviteGroup },
        id
      ])

      conn.release()
    } catch (error) {
      console.error(error)
    }
  }

  checkInviteGroup = async (
    eventId: string,
    inviteGroup: string
  ): Promise<boolean> => {
    try {
      const conn = await this.connection.getConnection()

      const [inviteGroupFounded] = (await conn.query(
        'SELECT * FROM inviteGroups WHERE eventId = UUID_TO_BIN(?) AND inviteGroup = ?',
        [eventId, inviteGroup]
      )) as [RowDataPacket[], FieldPacket[]]

      return inviteGroupFounded.length > 0 ? true : false
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
