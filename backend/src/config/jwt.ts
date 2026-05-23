import { SignOptions } from 'jsonwebtoken';

export const JWT_ACCESS_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '15m') as SignOptions['expiresIn'];
export const JWT_REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
