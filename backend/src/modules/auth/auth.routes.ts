import { Router } from 'express';
import { body } from 'express-validator';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateRequest } from '../../utils/validators';
import {
  forgotPassword,
  getSetupStatus,
  initializeFirstAdmin,
  login,
  me,
  refreshToken,
  resetPassword,
} from './auth.controller';

const router = Router();

router.get('/setup-status', getSetupStatus);
router.post(
  '/setup',
  body('fullName').isString().isLength({ min: 3 }).withMessage('الاسم الكامل مطلوب'),
  body('email')
    .isEmail()
    .withMessage('البريد الإلكتروني غير صالح')
    .matches(/^[a-zA-Z0-9._%+-]+@univ-khenchela\.dz$/)
    .withMessage('يجب أن يكون البريد الإلكتروني من دومين univ-khenchela.dz'),
  body('password').isString().isLength({ min: 6 }).withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  validateRequest,
  initializeFirstAdmin
);
router.post(
  '/login',
  body('email').isEmail().withMessage('البريد الإلكتروني غير صالح'),
  body('password').isString().isLength({ min: 6 }).withMessage('كلمة المرور مطلوبة'),
  validateRequest,
  login
);
router.post(
  '/forgot-password',
  body('email').isEmail().withMessage('البريد الإلكتروني غير صالح'),
  validateRequest,
  forgotPassword
);
router.post(
  '/reset-password',
  body('token').isString().notEmpty().withMessage('رمز إعادة التعيين مطلوب'),
  body('password').isString().isLength({ min: 6 }).withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  validateRequest,
  resetPassword
);
router.post('/refresh', body('token').notEmpty().withMessage('الرمز مطلوب'), validateRequest, refreshToken);
router.get('/me', authMiddleware, me);

export default router;
