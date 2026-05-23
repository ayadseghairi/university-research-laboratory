import { ExpenseCategory } from '@prisma/client';
import { Request, Response } from 'express';
import { sendError, sendSuccess } from '../../utils/response';
import { createAnnualBudgetService, distributeToTeamsService, getBudgetOverviewService, updateCategoryBudgetService } from './budget.service';

export const createAnnualBudget = async (req: Request, res: Response) => {
  try {
    const { fiscalYear, totalAmount } = req.body as { fiscalYear: number; totalAmount: number };
    const data = await createAnnualBudgetService(Number(fiscalYear), Number(totalAmount));
    return sendSuccess(res, data, 'تم إنشاء الميزانية السنوية', 201);
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل إنشاء الميزانية', 400);
  }
};

export const distributeToTeams = async (req: Request, res: Response) => {
  try {
    const { budgetId, allocations } = req.body as {
      budgetId: string;
      allocations: { teamId: string; amount: number }[];
    };
    const data = await distributeToTeamsService(budgetId, allocations);
    return sendSuccess(res, data, 'تم توزيع الميزانية بنجاح');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل توزيع الميزانية', 400);
  }
};

export const getBudgetOverview = async (req: Request, res: Response) => {
  try {
    const year = Number(req.query.year || new Date().getFullYear());
    const data = await getBudgetOverviewService(year);
    if (!data) {
      return sendSuccess(res, null, 'لا توجد ميزانية لهذه السنة');
    }

    return sendSuccess(res, data, 'نظرة عامة على الميزانية');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل جلب الميزانية', 500);
  }
};

export const updateCategoryBudget = async (req: Request, res: Response) => {
  try {
    const { budgetId, category, amount } = req.body as {
      budgetId: string;
      category: ExpenseCategory;
      amount: number;
    };
    const data = await updateCategoryBudgetService(budgetId, category, Number(amount));
    return sendSuccess(res, data, 'تم تحديث ميزانية الفئة');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل تحديث الفئة', 400);
  }
};
