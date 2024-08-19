import { Pool } from "mysql2/promise";
import { FamilyGroupModel } from "../interfaces/familyGroupModel";

export class FamilyGroupsService {
  constructor (private connection: Pool) {
    this.connection = connection;
  }

  getFamilyGroups = async (userId: string) => {
    const [result] = await this.connection.query(
      'SELECT BIN_TO_UUID(id) id, familyGroup FROM familyGroups WHERE userId = CAST(? AS BINARY) ORDER BY familyGroup',
      [userId]
    );
    return result;
  }

  createFamilyGroup = async (familyGroups: FamilyGroupModel, userId: string) => {
    const { familyGroup } = familyGroups;

    const [queryResult] = await this.connection.query('SELECT UUID() uuid');
    const [{ uuid }] = queryResult as { uuid: string }[];

    await this.connection.query(
      `INSERT INTO familyGroups (id, familyGroup, userId) VALUES (UUID_TO_BIN('${uuid}'), ?, CAST(? AS BINARY))`,
      [familyGroup, userId]
    );

    return uuid;
  }

  updateFamilyGroup = async (familyGroupId: string, familyGroups: FamilyGroupModel ) => {
    const { familyGroup } = familyGroups;
    
    await this.connection.query(
      'UPDATE familyGroups SET ? WHERE id = UUID_TO_BIN(?)',
      [{ familyGroup }, familyGroupId]
    );
  }
}
