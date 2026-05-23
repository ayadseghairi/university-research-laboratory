import { Role } from '@prisma/client';
import { Router } from 'express';
import { body, param } from 'express-validator';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validateRequest } from '../../utils/validators';
import { createUser, deleteUser, getAllUsers, toggleActive, updateUser } from './users.controller';

const router = Router();
const UNIVERSITY_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@univ-khenchela\.dz$/;

router.get('/', authMiddleware, requireRole('DIRECTOR', 'TEAM_LEADER'), getAllUsers);
router.use(authMiddleware, requireRole('DIRECTOR'));

router.post(
  '/',
  body('fullName').notEmpty().withMessage('الاسم الكامل مطلوب'),
  body('email')
    .isEmail()
    .withMessage('البريد الإلكتروني غير صالح')
    .matches(UNIVERSITY_EMAIL_REGEX)
    .withMessage('يجب أن يكون البريد الإلكتروني من دومين univ-khenchela.dz'),
  body('password').isLength({ min: 6 }).withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  body('role').isIn(Object.values(Role)).withMessage('الدور غير صالح'),
  validateRequest,
  createUser
);
router.patch(
  '/:id',
  param('id').notEmpty().withMessage('المعرف مطلوب'),
  body('fullName').optional().isString().isLength({ min: 3 }).withMessage('الاسم الكامل غير صالح'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('البريد الإلكتروني غير صالح')
    .matches(UNIVERSITY_EMAIL_REGEX)
    .withMessage('يجب أن يكون البريد الإلكتروني من دومين univ-khenchela.dz'),
  body('password').optional().isString().isLength({ min: 6 }).withMessage('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
  body('role').optional().isIn(Object.values(Role)).withMessage('الدور غير صالح'),
  body('teamId').optional().isString().withMessage('الفريق غير صالح'),
  validateRequest,
  updateUser
);
router.patch('/:id/toggle-active', param('id').notEmpty().withMessage('المعرف مطلوب'), validateRequest, toggleActive);
router.delete('/:id', param('id').notEmpty().withMessage('المعرف مطلوب'), validateRequest, deleteUser);

export default router;
