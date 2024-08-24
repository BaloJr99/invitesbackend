import jwt from 'jsonwebtoken';
import User from "../models/user.js";
import Role from "../models/role.js";
import { AuthUserModel, FullUserModel, UserModel } from '../interfaces/usersModel';
import { comparePassword, encryptPassword } from '../utils/bcrypt.handle.js';
import { generatePass } from '../utils/passwordGenerator.hande.js';

export class UsersService {
  signin = async (user: AuthUserModel): Promise<string> => {
    const { usernameOrEmail, password } = user;

    const userFounded = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
    }).populate('roles');

    if (!userFounded) {
      return 'ERROR_USER_NOT_FOUND';
    }

    const matchPassword = await comparePassword(
      password,
      userFounded.password
    );

    const newNumberOfTries = userFounded.numberOfTries + 1;

    if (!matchPassword || newNumberOfTries >= 3) {
      await User.findByIdAndUpdate(userFounded._id, { $set: { 
        numberOfTries: newNumberOfTries
       }})

       if (newNumberOfTries >= 3) {
         return 'BLOCKED';
       }
      return 'ERROR_PASSWORD_DOESNT_MATCH';
    }

    await User.findByIdAndUpdate(userFounded._id, { $set: { 
      numberOfTries: 0
     }})

    const token = jwt.sign({ 
      id: userFounded._id, 
      username: userFounded.username, 
      email: userFounded.email,
      roles: userFounded.roles
    }, process.env.SECRET, {
      expiresIn: 86400
    });

    return token;
  }
  
  findUser = async (usernameOrEmail: string) => {
    const userFounded = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
    });

    return userFounded;
  }

  getUsername = async (userId: string) => {
    const userFounded = await User.findById(userId);
    return userFounded?.username;
  }

  getUsers = async () => {
    const usersFounded = await User.find().select({
      username: 1,
      email: 1,
      isActive: 1
    });
    return usersFounded;
  }

  getUsersBasicInfo = async () => {
    const usersFounded = await User.find({ isActive: true }).select({
      username: 1,
    });
    return usersFounded;
  }

  getUserById = async (userId: string) => {
    const userFounded = await User.findById(userId).populate('roles');
    return userFounded;
  }

  createUser = async (user: FullUserModel) => {
    const { username, email, roles } = user;
    const passHash = await encryptPassword(generatePass());

    const newUser = new User({
      username,
      password: passHash,
      email
    });

    if (roles) {
      const foundRoles = await Role.find({ _id: { $in: roles } })
      newUser.roles = foundRoles.map((role) => role._id)
    }

    const savedUser = await newUser.save();
    return savedUser._id;
  }

  updateUser = async (userId:string, user: UserModel) => {
    const result = await User.updateOne({ _id: userId }, { $set: { 
      ...user
     }});
    return result;
  }

  isUserResettingPassword = async (userId:string): Promise<boolean> => {
    const userFounded = await User.findById(userId);

    if (!userFounded) {
      return false;
    }

    return userFounded.needsPasswordRecovery;
  }

  updateResetPasword = async (userId:string, password: string, userResettingPassword: boolean) => {
    console.log(userResettingPassword)
    if (!userResettingPassword) {
      console.log(password)
      const passHash = await encryptPassword(password);

      const result = await User.updateOne({ _id: userId }, { $set: { 
        password: passHash,
        needsPasswordRecovery: userResettingPassword,
        numberOfTries: 0
      }});
      return result;
    }

    const result = await User.updateOne({ _id: userId }, { $set: { 
      needsPasswordRecovery: userResettingPassword
    }});
    return result;
  }

  deleteUser = async (userId: string) => {
    const result = await User.updateOne({ _id: userId }, { $set: { isActive: false }});
    return result;
  }
}
