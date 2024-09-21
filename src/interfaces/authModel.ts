import { IFullRole } from './rolesModel.js'

export interface AuthModel {
  id: string
  username: string
  email: string
  profilePhoto: string
  roles: IFullRole[]
}
