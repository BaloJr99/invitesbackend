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
    const [result] = (await this.connection.query(
      'SELECT BIN_TO_UUID(id) id, inviteGroup FROM inviteGroups WHERE eventId = UUID_TO_BIN(?) ORDER BY inviteGroup',
      [eventId]
    )) as [RowDataPacket[], FieldPacket[]]
    return result as IInviteGroup[]
  }

  bulkInviteGroup = async (eventId: string, inviteGroups: string[]) => {
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

    const actualConnection = await this.connection.getConnection()

    try {
      // Begin transaction with current connection
      await actualConnection.beginTransaction()

      const queryPromises: Promise<[QueryResult, FieldPacket[]]>[] = []

      // Insert query into promise array
      newInviteGroups.forEach((inviteGroup) => {
        queryPromises.push(
          actualConnection.query(
            `INSERT INTO inviteGroups (id, inviteGroup, eventId) VALUES (UUID_TO_BIN(?), ?, UUID_TO_BIN(?))`,
            [inviteGroup.id, inviteGroup.inviteGroup, inviteGroup.eventId]
          )
        )
      })

      // Execute all promises
      await Promise.all(queryPromises)

      // Commit transaction
      await actualConnection.commit()
      return newInviteGroups
    } catch (err) {
      // Rollback transaction
      await actualConnection.rollback()

      // Release connection
      actualConnection.release()
      return Promise.reject(err)
    }
  }

  createInviteGroup = async (inviteGroups: IInviteGroup) => {
    const { inviteGroup, eventId } = inviteGroups

    const [queryResult] = await this.connection.query('SELECT UUID() uuid')
    const [{ uuid }] = queryResult as { uuid: string }[]

    await this.connection.query(
      `INSERT INTO inviteGroups (id, inviteGroup, eventId) VALUES (UUID_TO_BIN('${uuid}'), ?, UUID_TO_BIN(?))`,
      [inviteGroup, eventId]
    )

    return uuid
  }

  updateInviteGroup = async (inviteGroups: IPartialInviteGroup) => {
    const { id, inviteGroup } = inviteGroups

    await this.connection.query(
      'UPDATE inviteGroups SET ? WHERE id = UUID_TO_BIN(?)',
      [{ inviteGroup }, id]
    )
  }

  checkInviteGroup = async (eventId: string, inviteGroup: string) => {
    const [inviteGroupFounded] = (await this.connection.query(
      'SELECT * FROM inviteGroups WHERE eventId = UUID_TO_BIN(?) AND inviteGroup = ?',
      [eventId, inviteGroup]
    )) as [RowDataPacket[], FieldPacket[]]

    return inviteGroupFounded.length > 0 ? true : false
  }
}
