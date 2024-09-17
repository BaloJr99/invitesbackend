import moongose from "mongoose"

export interface FullUserModel {
  username: string,
  email: string,
  roles: string[]
}

export interface UserModel {
  username: string,
  email: string,
  isActive: boolean,
  roles: moongose.Types.ObjectId[];
}

export interface UserEventInfoModel extends EventsInfoModel {
  id: string,
  username: string,
  email: string,
  numEvents: number,
  numEntries: number,
  isActive: boolean
}

export interface EventsInfoModel {
  numEvents: number,
  numEntries: number
}

export interface IsDeadlineMet {
  isDeadlineMet: number
}

export interface UserInfoModel {
  _id: moongose.Types.ObjectId,
  username: string,
  email: string,
  isActive: boolean
}

export interface AuthUserModel {
  usernameOrEmail: string,
  password: string
}

export interface UserProfileModel {
  _id: string,
  username: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  email: string,
  gender: string,
  profilePhoto?: string
}

export interface UserFromInvite {
  userId: string
}