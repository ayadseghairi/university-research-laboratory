import { Request, Response } from 'express';
import { sendError, sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../middleware/auth.middleware';
import { createUserService, deleteUserService, getAllUsersService, toggleActiveService, updateUserService } from './users.service';

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const data = await getAllUsersService();
    return sendSuccess(res, data, 'تم جلب المستخدمين');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل جلب المستخدمين', 500);
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const data = await createUserService(req.body);
    return sendSuccess(res, data, 'تم إنشاء المستخدم', 201);
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل إنشاء المستخدم', 400);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const data = await updateUserService(req.params.id, req.body);
    return sendSuccess(res, data, 'تم تحديث المستخدم');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل تحديث المستخدم', 400);
  }
};

export const toggleActive = async (req: Request, res: Response) => {
  try {
    const data = await toggleActiveService(req.params.id);
    return sendSuccess(res, data, 'تم تحديث حالة الحساب');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل تحديث الحالة', 400);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const data = await deleteUserService(req.params.id, req.user!.id);
    return sendSuccess(res, data, 'تم حذف المستخدم');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'فشل حذف المستخدم';
    const isConflict =
      message.includes('لا يمكن حذف') ||
      message.includes('مرتبطة') ||
      message.includes('يقود فريقاً');
    return sendError(res, message, isConflict ? 409 : 400);
  }
};
