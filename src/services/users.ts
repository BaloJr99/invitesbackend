import jwt from 'jsonwebtoken';
import User from "../models/user.js";
import Role from "../models/role.js";
import { AuthUserModel, FullUserModel, UserModel } from '../interfaces/usersModel';
import { comparePassword, encryptPassword } from '../utils/bcrypt.handle.js';
import { generatePass } from '../utils/passwordGenerator.hande.js';

export class UsersService {
  signin = async (user: AuthUserModel) => {
    const { usernameOrEmail, password } = user;

    const userFounded = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
    }).populate('roles');

    if (!userFounded) {
      return false;
    }

    const matchPassword = await comparePassword(
      password,
      userFounded.password
    );

    if (!matchPassword) {
      return false
    }

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

  deleteUser = async (userId: string) => {
    const result = await User.updateOne({ _id: userId }, { $set: { isActive: false }});
    return result;
  }
}
