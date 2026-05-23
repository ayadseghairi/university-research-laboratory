import { NextFunction, Request, Response } from 'express';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  return res.status(500).json({
    success: false,
    message: 'حدث خطأ داخلي في الخادم',
    ...(process.env.NODE_ENV === 'development' ? { error: err.message } : {}),
  });
};
