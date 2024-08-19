import Role from "../models/role.js";
import { FullRoleModel, RoleModel } from '../interfaces/rolesModel.js';

export class RolesService {
  getRoles = async () => {
    const rolesFounded = await Role.find();
    return rolesFounded;
  }

  createRole = async (user: FullRoleModel) => {
    const { name } = user;

    const newRole = new Role({
      name
    });

    const savedRole = await newRole.save();
    return savedRole._id;
  }

  updateRole = async (roleId: string, user: RoleModel) => {
    const result = await Role.updateOne({ _id: roleId }, { $set: { 
      ...user
     }});
    return result;
  }

  deleteRole = async (roleId: string) => {
    const result = await Role.updateOne({ _id: roleId }, { $set: { isActive: false }});
    return result;
  }
}
