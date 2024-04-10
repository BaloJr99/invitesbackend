import { verify } from 'jsonwebtoken';

export const verifyToken = (jwt: string) => {
  return verify(jwt, process.env.SECRET);
}