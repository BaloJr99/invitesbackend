import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.handle";
import { AuthModel } from "../interfaces/authModel";

export const checkJwt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jwtByUser = req.headers.authorization ?? "";

    const jwt = jwtByUser.split(' ').pop();

    const isOk = verifyToken(`${jwt}`) as AuthModel;

    if (!isOk) return res.status(401).json({ error: 'INVALID_AUTH' });

    next();
  } catch (error) {
    return res.status(401).json({ error: 'INVALID_AUTH' });
  }
}