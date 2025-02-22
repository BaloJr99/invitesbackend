import { FieldPacket, QueryResult, RowDataPacket } from 'mysql2'
import { IInviteGroupsRepository } from '../interfaces/invite-groups-repository.js'
import {
  IInviteGroup,
  IFullInviteGroup,
  IPartialInviteGroup
} from '../global/types.js'
import { MysqlDatabase } from '../services/mysql-database.js'

export class InviteGroupsRepository implements IInviteGroupsRepository {
  constructor(private database: MysqlDatabase) {
    this.database = database
  }

  async getInviteGroups(eventId: string): Promise<IInviteGroup[]> {
    const connection = await this.database.getConnection()
    try {
      const [result] = (await connection.query(
        'SELECT BIN_TO_UUID(id) id, inviteGroup FROM inviteGroups WHERE eventId = UUID_TO_BIN(?) ORDER BY inviteGroup',
        [eventId]
      )) as [RowDataPacket[], FieldPacket[]]
      return result as IInviteGroup[]
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  async bulkInviteGroup(
    eventId: string,
    inviteGroups: string[]
  ): Promise<IFullInviteGroup[]> {
    const connection = await this.database.getConnection()

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

    try {
      // Begin transaction with current connection
      await connection.beginTransaction()

      const queryPromises: Promise<[QueryResult, FieldPacket[]]>[] = []

      // Insert query into promise array
      newInviteGroups.forEach((inviteGroup) => {
        if (connection) {
          queryPromises.push(
            connection.query(
              `INSERT INTO inviteGroups (id, inviteGroup, eventId) VALUES (UUID_TO_BIN(?), ?, UUID_TO_BIN(?))`,
              [inviteGroup.id, inviteGroup.inviteGroup, inviteGroup.eventId]
            )
          )
        }
      })

      // Execute all promises
      await Promise.all(queryPromises)

      // Commit transaction
      await connection.commit()

      return newInviteGroups
    } catch (error) {
      // Rollback transaction
      if (connection) await connection.rollback()

      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  async createInviteGroup(inviteGroups: IInviteGroup): Promise<string> {
    const connection = await this.database.getConnection()

    try {
      const { inviteGroup, eventId } = inviteGroups

      const [queryResult] = await connection.query('SELECT UUID() uuid')
      const [{ uuid }] = queryResult as { uuid: string }[]

      await connection.query(
        `INSERT INTO inviteGroups (id, inviteGroup, eventId) VALUES (UUID_TO_BIN('${uuid}'), ?, UUID_TO_BIN(?))`,
        [inviteGroup, eventId]
      )

      return uuid
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  async updateInviteGroup(inviteGroups: IPartialInviteGroup): Promise<void> {
    const connection = await this.database.getConnection()

    try {
      const { id, inviteGroup } = inviteGroups

      await connection.query(
        'UPDATE inviteGroups SET ? WHERE id = UUID_TO_BIN(?)',
        [{ inviteGroup }, id]
      )
    } catch (error) {
      console.error(error)
    } finally {
      if (connection) connection.release()
    }
  }

  async checkInviteGroup(
    eventId: string,
    inviteGroup: string
  ): Promise<boolean> {
    const connection = await this.database.getConnection()

    try {
      const [inviteGroupFounded] = (await connection.query(
        'SELECT * FROM inviteGroups WHERE eventId = UUID_TO_BIN(?) AND inviteGroup = ?',
        [eventId, inviteGroup]
      )) as [RowDataPacket[], FieldPacket[]]

      return inviteGroupFounded.length > 0 ? true : false
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }
}
