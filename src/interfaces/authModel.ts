import { RoleModel } from "./rolesModel.js";

export interface AuthModel {
  id: string,
  username: string,
  email: string,
  roles: RoleModel[]
}