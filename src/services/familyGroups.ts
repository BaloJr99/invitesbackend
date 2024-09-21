import { FieldPacket, Pool, RowDataPacket } from 'mysql2/promise'
import {
  IFamilyGroup,
  IFullFamilyGroup,
  IPartialFamilyGroup
} from '../interfaces/familyGroupModel.js'

export class FamilyGroupsService {
  constructor(private connection: Pool) {
    this.connection = connection
  }

  getFamilyGroups = async (eventId: string): Promise<IFamilyGroup[]> => {
    const [result] = (await this.connection.query(
      'SELECT BIN_TO_UUID(id) id, familyGroup FROM familyGroups WHERE eventId = UUID_TO_BIN(?) ORDER BY familyGroup',
      [eventId]
    )) as [RowDataPacket[], FieldPacket[]]
    return result as IFamilyGroup[]
  }

  bulkFamilyGroup = async (familyGroups: IFamilyGroup[]) => {
    const newFamilyGroups = familyGroups.reduce(
      (result: IFamilyGroup[], familyGroupModel) => {
        result.push({
          eventId: familyGroupModel.eventId,
          id: crypto.randomUUID(),
          familyGroup: familyGroupModel.familyGroup
        } as IFamilyGroup)
        return result
      },
      []
    ) as IFullFamilyGroup[]

    newFamilyGroups.forEach(async (familyGroup) => {
      await this.connection.query(
        `INSERT INTO familyGroups (id, familyGroup, eventId) VALUES (UUID_TO_BIN(?), ?, UUID_TO_BIN(?))`,
        [familyGroup.id, familyGroup.familyGroup, familyGroup.eventId]
      )
    })

    return newFamilyGroups
  }

  createFamilyGroup = async (familyGroups: IFamilyGroup) => {
    const { familyGroup, eventId } = familyGroups

    const [queryResult] = await this.connection.query('SELECT UUID() uuid')
    const [{ uuid }] = queryResult as { uuid: string }[]

    await this.connection.query(
      `INSERT INTO familyGroups (id, familyGroup, eventId) VALUES (UUID_TO_BIN('${uuid}'), ?, UUID_TO_BIN(?))`,
      [familyGroup, eventId]
    )

    return uuid
  }

  updateFamilyGroup = async (
    familyGroups: IPartialFamilyGroup
  ) => {
    const { id, familyGroup } = familyGroups

    await this.connection.query(
      'UPDATE familyGroups SET ? WHERE id = UUID_TO_BIN(?)',
      [{ familyGroup }, id]
    )
  }
}
