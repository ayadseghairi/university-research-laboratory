import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { sendError } from './response';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return sendError(res, 'البيانات المرسلة غير صالحة', 400, result.array());
  }
  return next();
};

export const asNumber = (value: unknown) => Number(value ?? 0);
