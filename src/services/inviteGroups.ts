import {
  FieldPacket,
  Pool,
  PoolConnection,
  QueryResult,
  RowDataPacket
} from 'mysql2/promise'
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
    let connection: PoolConnection | undefined
    try {
      connection = await this.connection.getConnection()

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

  bulkInviteGroup = async (
    eventId: string,
    inviteGroups: string[]
  ): Promise<IFullInviteGroup[]> => {
    let connection: PoolConnection | undefined

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
      connection = await this.connection.getConnection()

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

  createInviteGroup = async (inviteGroups: IInviteGroup): Promise<string> => {
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()

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

  updateInviteGroup = async (
    inviteGroups: IPartialInviteGroup
  ): Promise<void> => {
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()

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

  checkInviteGroup = async (
    eventId: string,
    inviteGroup: string
  ): Promise<boolean> => {
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()

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
