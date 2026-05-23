import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { sendError, sendSuccess } from '../../utils/response';
import {
  changeMyPasswordService,
  getMyProfileService,
  updateMyProfileService,
} from './settings.service';

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getMyProfileService(req.user!.id);
    return sendSuccess(res, data, 'تم جلب بيانات الحساب');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل جلب الحساب', 400);
  }
};

export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const data = await updateMyProfileService(req.user!.id, req.body);
    return sendSuccess(res, data, 'تم تحديث بيانات الحساب');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل تحديث الحساب', 400);
  }
};

export const changeMyPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };
    const data = await changeMyPasswordService(req.user!.id, currentPassword, newPassword);
    return sendSuccess(res, data, 'تم تغيير كلمة المرور بنجاح');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل تغيير كلمة المرور', 400);
  }
};
