export interface UserModel {
  username: string,
  email: string,
  password: string,
  roles: string
}

export interface AuthUserModel {
  usernameOrEmail: string,
  password: string
}

export interface UserFromEntry {
  userId: string
}