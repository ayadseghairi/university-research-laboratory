import { ExpenseCategory } from '@prisma/client';
import { Router } from 'express';
import { body } from 'express-validator';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validateRequest } from '../../utils/validators';
import { createAnnualBudget, distributeToTeams, getBudgetOverview, updateCategoryBudget } from './budget.controller';

const router = Router();

router.get('/', authMiddleware, getBudgetOverview);
router.post(
  '/',
  authMiddleware,
  requireRole('DIRECTOR'),
  body('fiscalYear').isInt().withMessage('السنة المالية مطلوبة'),
  body('totalAmount').isFloat({ gt: 0 }).withMessage('المبلغ مطلوب'),
  validateRequest,
  createAnnualBudget
);
router.post(
  '/distribute',
  authMiddleware,
  requireRole('DIRECTOR'),
  body('budgetId').notEmpty().withMessage('معرف الميزانية مطلوب'),
  body('allocations').isArray({ min: 1 }).withMessage('التوزيع مطلوب'),
  validateRequest,
  distributeToTeams
);
router.patch(
  '/category',
  authMiddleware,
  requireRole('DIRECTOR'),
  body('budgetId').notEmpty(),
  body('category').isIn(Object.values(ExpenseCategory)),
  body('amount').isFloat({ gt: 0 }),
  validateRequest,
  updateCategoryBudget
);

export default router;
