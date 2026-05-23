import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { Router } from 'express';
import { body, param } from 'express-validator';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validateRequest } from '../../utils/validators';
import { sendError } from '../../utils/response';
import { approveExpense, createExpense, getExpenseById, getExpenses, rejectExpense, uploadReceipt } from './expenses.controller';

const uploadRoot = process.env.UPLOAD_PATH || './uploads';
const absoluteUploadRoot = path.resolve(process.cwd(), uploadRoot);
fs.mkdirSync(absoluteUploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, absoluteUploadRoot),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `receipt_${uuidv4()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE || 5242880) },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('نوع الملف غير مسموح به'));
    }
    return cb(null, true);
  },
});

const router = Router();

router.get('/', authMiddleware, getExpenses);
router.get('/:id', authMiddleware, param('id').notEmpty(), validateRequest, getExpenseById);
router.post(
  '/',
  authMiddleware,
  requireRole('DIRECTOR', 'TEAM_LEADER', 'RESEARCHER'),
  body('title').notEmpty().withMessage('العنوان مطلوب'),
  body('amount').isFloat({ gt: 0 }).withMessage('المبلغ مطلوب'),
  body('category').notEmpty().withMessage('الفئة مطلوبة'),
  validateRequest,
  createExpense
);
router.patch('/:id/approve', authMiddleware, requireRole('DIRECTOR'), approveExpense);
router.patch(
  '/:id/reject',
  authMiddleware,
  requireRole('DIRECTOR'),
  body('reason').notEmpty().withMessage('سبب الرفض مطلوب'),
  validateRequest,
  rejectExpense
);
router.post('/:id/receipt', authMiddleware, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof Error) {
      if (err.message.includes('نوع الملف')) {
        return sendError(res, err.message, 400);
      }
      return sendError(res, err.message || 'خطأ في رفع الملف', 400);
    }
    next();
  });
}, uploadReceipt);

export default router;
