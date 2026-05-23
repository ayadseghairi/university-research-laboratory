import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response';

export interface AuthRequest extends Request {
  user?: { id: string; role: string; email: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return sendError(res, 'لم يتم إرسال رمز الدخول', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      id: string;
      role: string;
      email: string;
    };
    req.user = decoded;
    return next();
  } catch {
    return sendError(res, 'رمز الدخول غير صالح أو منتهي الصلاحية', 401);
  }
};
