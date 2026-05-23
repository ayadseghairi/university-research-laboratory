import { Request, Response } from 'express';
import path from 'path';
import { ExpenseCategory, ExpenseStatus } from '@prisma/client';
import { sendError, sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../middleware/auth.middleware';
import { approveExpenseService, createExpenseForCurrentUser, getExpenseByIdService, getExpensesService, rejectExpenseService, uploadReceiptService } from './expenses.service';

export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getExpensesService({
      status: req.query.status as ExpenseStatus | undefined,
      category: req.query.category as ExpenseCategory | undefined,
      teamId: req.query.teamId as string | undefined,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
      userId: req.user!.id,
      role: req.user!.role as any,
    });
    return sendSuccess(res, data, 'تم جلب طلبات الصرف');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل جلب الطلبات', 400);
  }
};

export const getExpenseById = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getExpenseByIdService(req.params.id, req.user!.id, req.user!.role as any);
    return sendSuccess(res, data, 'تفاصيل الطلب');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل جلب الطلب', 404);
  }
};

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const data = await createExpenseForCurrentUser(req.user!.id, req.user!.role as any, req.body);
    return sendSuccess(res, data, 'تم إنشاء الطلب', 201);
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل إنشاء الطلب', 400);
  }
};

export const approveExpense = async (req: AuthRequest, res: Response) => {
  try {
    const data = await approveExpenseService(req.params.id, req.user!.id);
    return sendSuccess(res, data, 'تمت الموافقة على الطلب');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل الموافقة على الطلب', 400);
  }
};

export const rejectExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body as { reason: string };
    const data = await rejectExpenseService(req.params.id, req.user!.id, reason);
    return sendSuccess(res, data, 'تم رفض الطلب');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل رفض الطلب', 400);
  }
};

export const uploadReceipt = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return sendError(res, 'الملف مطلوب', 400);
    }

    // Store only the filename, not the full path
    const filename = path.basename(req.file.path);
    const receiptUrl = `uploads/${filename}`;
    
    const data = await uploadReceiptService(req.params.id, receiptUrl);
    return sendSuccess(res, data, 'تم رفع الوصل');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل رفع الوصل', 400);
  }
};
