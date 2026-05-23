import { NextFunction, Response } from 'express';
import { AuthRequest } from './auth.middleware';
import { sendError } from '../utils/response';

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 'ليس لديك صلاحية للوصول إلى هذا المورد', 403);
    }
    return next();
  };
};
