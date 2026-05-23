import { Request, Response } from 'express';
import {
  forgotPasswordService,
  getSetupStatusService,
  initializeFirstAdminService,
  loginService,
  meService,
  resetPasswordService,
  refreshTokenService,
} from './auth.service';
import { sendError, sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../middleware/auth.middleware';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, language } = req.body as { email: string; password: string; language?: string };
    const data = await loginService(email, password, language as any);
    return sendSuccess(res, data, 'تم تسجيل الدخول بنجاح');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل تسجيل الدخول', 401);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body as { token: string };
    const data = await refreshTokenService(token);
    return sendSuccess(res, data, 'تم تحديث الرمز بنجاح');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل تحديث الرمز', 401);
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const data = await meService(req.user!.id);
    return sendSuccess(res, data, 'بيانات المستخدم');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل جلب بيانات المستخدم', 404);
  }
};

export const initializeFirstAdmin = async (req: Request, res: Response) => {
  try {
    const data = await initializeFirstAdminService(req.body);
    return sendSuccess(res, data, 'تم إنشاء حساب المدير الأول بنجاح', 201);
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل تهيئة النظام', 400);
  }
};

export const getSetupStatus = async (_req: Request, res: Response) => {
  try {
    const data = await getSetupStatusService();
    return sendSuccess(res, data, 'حالة تهيئة النظام');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل جلب حالة التهيئة', 500);
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email: string };
    await forgotPasswordService(email);
    return sendSuccess(res, null, 'إذا كان البريد موجودًا فسيتم إرسال رابط إعادة التعيين');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل إرسال رابط إعادة التعيين', 500);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body as { token: string; password: string };
    await resetPasswordService(token, password);
    return sendSuccess(res, null, 'تم تحديث كلمة المرور بنجاح');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل إعادة تعيين كلمة المرور', 400);
  }
};
