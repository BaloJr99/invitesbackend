import { FieldPacket, Pool, RowDataPacket } from 'mysql2/promise'
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

  bulkInviteGroup = async (inviteGroups: IInviteGroup[]) => {
    const newInviteGroups = inviteGroups.reduce(
      (result: IInviteGroup[], inviteGroupModel) => {
        result.push({
          eventId: inviteGroupModel.eventId,
          id: crypto.randomUUID(),
          inviteGroup: inviteGroupModel.inviteGroup
        } as IInviteGroup)
        return result
      },
      []
    ) as IFullInviteGroup[]

    newInviteGroups.forEach(async (inviteGroup) => {
      await this.connection.query(
        `INSERT INTO inviteGroups (id, inviteGroup, eventId) VALUES (UUID_TO_BIN(?), ?, UUID_TO_BIN(?))`,
        [inviteGroup.id, inviteGroup.inviteGroup, inviteGroup.eventId]
      )
    })

    return newInviteGroups
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
}
