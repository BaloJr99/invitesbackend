import { IFullRole } from '../interfaces/rolesModel.js'
import Role from '../models/role.js'

export class RolesService {
  getRoles = async () => {
    const rolesFounded = await Role.find().select({
      _id: 0,
      name: 1,
      id: '$_id',
      isActive: 1
    })
    return rolesFounded
  }

  createRole = async (role: IFullRole) => {
    const { name, isActive } = role

    const newRole = new Role({
      name,
      isActive
    })

    const savedRole = await newRole.save()
    return savedRole._id
  }

  updateRole = async (role: IFullRole) => {
    const result = await Role.updateOne(
      { _id: role.id },
      {
        $set: {
          ...role
        }
      }
    )
    return result
  }

  checkRoleName = async (roleName: string) => {
    const roleFounded = await Role.findOne({
      name: roleName
    })

    return roleFounded ? true : false
  }

  deleteRoleTestingData = async () => {
    await Role.deleteOne({
      name: 'testRole'
    })
  }
}
