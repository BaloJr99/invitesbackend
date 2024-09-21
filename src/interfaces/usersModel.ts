import mongoose from 'mongoose'

export interface IFullUser {
  id: string
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber: string
  gender: string
  isActive: boolean
  profilePhoto: string
  profilePhotoPublicId: string
  roles: mongoose.Types.ObjectId[]
}

export type IAuthUser = Pick<IFullUser, 'password'> & {
  usernameOrEmail: string
}

export type IUpsertUser = Pick<
  IFullUser,
  'id' | 'username' | 'email' | 'isActive' | 'roles'
>

export type IUserDropdownData = Pick<IFullUser, 'id' | 'username'>

export type IUser = IUserDropdownData &
  Pick<IFullUser, 'email' | 'profilePhoto' | 'roles'>

export type IUserEventsInfo = Omit<IUpsertUser, 'roles'> & {
  numEvents: number
  numEntries: number
}

export type IUserInfo = Pick<IFullUser, 'username' | 'email' | 'isActive'> & {
  _id: mongoose.Types.ObjectId
}

export type IUserProfile = Omit<
  IFullUser,
  'isActive' | 'roles' | 'password' | 'profilePhotoPublicId' | 'profilePhoto'
>

export type IUserProfilePhotoSource = Pick<IFullUser, 'id'> & {
  profilePhotoSource: string
}

export interface IUserAction {
  user: IUpsertUser
  isNew: boolean
}

export type IUserFromInvite = Pick<IFullUser, 'id'>

export type IUserProfilePhoto = Pick<IUserProfilePhotoSource, 'id'> & {
  profilePhoto: string
  profilePhotoPublicId: string
}
