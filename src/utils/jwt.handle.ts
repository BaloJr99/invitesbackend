import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

const verifyJwtToken = (bearerToken: string) => {
  const token = bearerToken.split(' ').pop();
  return jwt.verify(`${token}`, process.env.SECRET);
}

const generateToken = (id: Types.ObjectId) => {
  const token = jwt.sign({ id }, process.env.SECRET, {
    expiresIn: 86400
  });

  return token;
}

export { verifyJwtToken, generateToken };