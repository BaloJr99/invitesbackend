import { Pool } from "mysql2/promise";
import { FamilyGroupModel, PartialFamilyGroupModel } from "../interfaces/familyGroupModel";

export class FamilyGroupsService {
  constructor (private connection: Pool) {
    this.connection = connection;
  }

  getFamilyGroups = async (eventId: string) => {
    const [result] = await this.connection.query(
      'SELECT BIN_TO_UUID(id) id, familyGroup FROM familyGroups WHERE eventId = UUID_TO_BIN(?) ORDER BY familyGroup',
      [eventId]
    );
    return result;
  }

  createFamilyGroup = async (familyGroups: FamilyGroupModel) => {
    const { familyGroup, eventId } = familyGroups;

    const [queryResult] = await this.connection.query('SELECT UUID() uuid');
    const [{ uuid }] = queryResult as { uuid: string }[];

    await this.connection.query(
      `INSERT INTO familyGroups (id, familyGroup, eventId) VALUES (UUID_TO_BIN('${uuid}'), ?, UUID_TO_BIN(?))`,
      [familyGroup, eventId]
    );

    return uuid;
  }

  updateFamilyGroup = async (familyGroupId: string, familyGroups: PartialFamilyGroupModel ) => {
    const { familyGroup } = familyGroups;
    
    await this.connection.query(
      'UPDATE familyGroups SET ? WHERE id = UUID_TO_BIN(?)',
      [{ familyGroup }, familyGroupId]
    );
  }
}
