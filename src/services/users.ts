import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import { comparePassword, encryptPassword } from '../utils/bcrypt.handle.js'
import { generatePass, generateSecret } from '../utils/generators.handle.js'
import {
  IAuthUser,
  IUpsertUser,
  IUserProfile,
  IUserProfilePhoto
} from '../global/types.js'
import { verifyJwtToken } from '../utils/jwt.handle.js'
import { EnvConfig } from '../config/config.js'

export class UsersService {
  signin = async (user: IAuthUser): Promise<string> => {
    const { usernameOrEmail, password } = user

    const userFounded = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
    }).populate('roles')

    if (!userFounded) {
      return 'ERROR_USER_NOT_FOUND'
    }

    if (userFounded && !userFounded.isActive) {
      return 'INACTIVE'
    }

    const matchPassword = await comparePassword(password, userFounded.password)

    const newNumberOfTries = userFounded.numberOfTries + 1

    if (!matchPassword || newNumberOfTries >= 3) {
      await User.findByIdAndUpdate(userFounded._id, {
        $set: {
          numberOfTries: newNumberOfTries
        }
      })

      if (newNumberOfTries >= 3) {
        return 'BLOCKED'
      }
      return 'ERROR_PASSWORD_DOESNT_MATCH'
    }

    await User.findByIdAndUpdate(userFounded._id, {
      $set: {
        numberOfTries: 0
      }
    })

    const accessToken = jwt.sign(
      {
        id: userFounded._id,
        username: userFounded.username,
        email: userFounded.email,
        profilePhoto: userFounded.profilePhoto,
        roles: userFounded.roles
      },
      `${EnvConfig().jwt.secret}`,
      {
        expiresIn: 600
      }
    )

    const refreshToken = jwt.sign(
      {
        id: userFounded._id
      },
      `${EnvConfig().jwt.secret}${userFounded.userSecret}`,
      {
        expiresIn: '1d'
      }
    )

    return JSON.stringify({ accessToken, refreshToken })
  }

  findUser = async (usernameOrEmail: string) => {
    const userFounded = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
    })

    return userFounded
  }

  findUserById = async (id: string) => {
    const userFounded = await User.findById(id).select({
      username: 1,
      email: 1
    })
    return userFounded
  }

  getUsername = async (userId: string) => {
    const userFounded = await User.findById(userId)
    return userFounded?.username
  }

  getUsers = async () => {
    const usersFounded = await User.find().select({
      username: 1,
      email: 1,
      isActive: 1
    })
    return usersFounded
  }

  getUsersBasicInfo = async () => {
    const usersFounded = await User.find({ isActive: true }).select({
      _id: 0,
      username: 1,
      id: '$_id'
    })
    return usersFounded
  }

  getUserById = async (userId: string) => {
    const userFounded = await User.findById(userId)
      .select({
        _id: 0,
        id: '$_id',
        username: 1,
        email: 1,
        isActive: 1
      })
      .populate({
        path: 'roles',
        select: {
          _id: 0,
          name: 1,
          id: '$_id'
        }
      })
    return userFounded
  }

  getUsersById = async (userId: string[]) => {
    const usersFounded = await User.find({ _id: { $in: userId } }).select({
      username: 1
    })
    return usersFounded
  }

  createUser = async (user: IUpsertUser) => {
    const { username, email, roles } = user
    const passHash = await encryptPassword(generatePass())

    const newUser = new User({
      username,
      email,
      roles,
      password: passHash,
      userSecret: generateSecret()
    })

    const savedUser = await newUser.save()
    return savedUser._id
  }

  updateUser = async (user: IUpsertUser) => {
    const result = await User.updateOne(
      { _id: user.id },
      {
        $set: {
          ...user
        }
      }
    )
    return result
  }

  isUserResettingPassword = async (userId: string): Promise<boolean> => {
    const userFounded = await User.findById(userId)

    if (!userFounded) {
      return false
    }

    return userFounded.needsPasswordRecovery
  }

  updateResetPasword = async (
    userId: string,
    password: string,
    userResettingPassword: boolean
  ) => {
    if (!userResettingPassword) {
      const passHash = await encryptPassword(password)

      const result = await User.updateOne(
        { _id: userId },
        {
          $set: {
            password: passHash,
            needsPasswordRecovery: userResettingPassword,
            numberOfTries: 0
          }
        }
      )
      return result
    }

    const result = await User.updateOne(
      { _id: userId },
      {
        $set: {
          needsPasswordRecovery: userResettingPassword
        }
      }
    )
    return result
  }

  deactivateUser = async (userId: string) => {
    const result = await User.updateOne(
      { _id: userId },
      { $set: { isActive: false } }
    )
    return result
  }

  deleteUserTestingData = async () => {
    await User.deleteOne({
      username: 'test-user'
    })
  }

  getUserProfile = async (userId: string) => {
    const userFounded = await User.findById(userId).select({
      _id: 0,
      id: '$_id',
      username: 1,
      email: 1,
      firstName: 1,
      lastName: 1,
      phoneNumber: 1,
      gender: 1,
      profilePhoto: 1,
      profilePhotoPublicId: 1
    })
    return userFounded
  }

  updateUserProfile = async (user: IUserProfile) => {
    const result = await User.updateOne(
      { _id: user.id },
      {
        $set: {
          ...user
        }
      }
    )
    return result
  }

  updateUserProfilePhoto = async (userProfilePhoto: IUserProfilePhoto) => {
    const result = await User.updateOne(
      { _id: userProfilePhoto.id },
      {
        $set: {
          profilePhoto: userProfilePhoto.profilePhoto,
          profilePhotoPublicId: userProfilePhoto.profilePhotoPublicId
        }
      }
    )
    return result
  }

  checkUsername = async (username: string) => {
    const userFounded = await User.findOne({
      username
    })

    return userFounded ? true : false
  }

  refreshToken = async (token: string): Promise<string> => {
    // Check if the refresh token is valid
    if (!token) return 'ERROR_REFRESH_TOKEN_NOT_FOUND'

    // Verify the refresh token
    const decoded = verifyJwtToken(token)

    // Get the userId
    const { id } = decoded

    const userFounded = await User.findById(id).populate('roles')

    if (!userFounded) {
      return 'ERROR_USER_NOT_FOUND'
    }

    const accessToken = jwt.sign(
      {
        id: userFounded._id,
        username: userFounded.username,
        email: userFounded.email,
        profilePhoto: userFounded.profilePhoto,
        roles: userFounded.roles
      },
      `${EnvConfig().jwt.secret}`,
      {
        expiresIn: 600
      }
    )

    return accessToken;
  }
}
