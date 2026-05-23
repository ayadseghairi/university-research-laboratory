import { Router } from 'express';
import { body } from 'express-validator';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateRequest } from '../../utils/validators';
import { changeMyPassword, getMyProfile, updateMyProfile } from './settings.controller';

const router = Router();
const UNIVERSITY_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@univ-khenchela\.dz$/;

router.use(authMiddleware);

router.get('/me', getMyProfile);
router.patch(
  '/me',
  body('fullName').optional().isString().isLength({ min: 3 }).withMessage('الاسم الكامل غير صالح'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('البريد الإلكتروني غير صالح')
    .matches(UNIVERSITY_EMAIL_REGEX)
    .withMessage('يجب أن يكون البريد الإلكتروني من دومين univ-khenchela.dz'),
  validateRequest,
  updateMyProfile
);
router.patch(
  '/password',
  body('currentPassword').isString().isLength({ min: 6 }).withMessage('كلمة المرور الحالية مطلوبة'),
  body('newPassword').isString().isLength({ min: 6 }).withMessage('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
  validateRequest,
  changeMyPassword
);

export default router;
