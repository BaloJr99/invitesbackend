import jwt from 'jsonwebtoken';
import User from "../models/user.js";
import Role from "../models/role.js";
import { AuthUserModel, UserModel } from '../interfaces/usersModel';
import { comparePassword, encryptPassword } from '../utils/bcrypt.handle.js';
import { generateToken } from '../utils/jwt.handle.js';

export class UserService {
  signup = async (user: UserModel) => {
    const { username, password, email, roles } = user;

    const passHash = await encryptPassword(password);

    const newUser = new User({
      username,
      password: passHash,
      email
    });

    if (roles) {
      const foundRoles = await Role.find({ name: { $in: roles } })
      newUser.roles = foundRoles.map((role) => role._id)
    } else {
      const role = await Role.findOne({ name: 'entriesAdmin' });
      if (role)
        newUser.roles = [role._id];
    }

    const savedUser = await newUser.save();
    
    return generateToken(savedUser._id);
  }

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
}
