import { Response } from 'express';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'تمت العملية بنجاح',
  statusCode = 200
) => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const sendError = (
  res: Response,
  message = 'حدث خطأ',
  statusCode = 400,
  errors?: unknown
) => {
  return res.status(statusCode).json({ success: false, message, errors });
};
