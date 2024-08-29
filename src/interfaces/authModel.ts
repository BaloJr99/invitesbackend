import { RoleModel } from "./rolesModel";

export interface AuthModel {
  id: string,
  username: string,
  email: string,
  roles: RoleModel[]
}