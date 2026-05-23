import { Router } from 'express';
import { body, param } from 'express-validator';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validateRequest } from '../../utils/validators';
import {
  addMember,
  createTeam,
  deleteTeam,
  disableTeam,
  getAllTeams,
  getTeamById,
  removeMember,
  updateTeam,
} from './teams.controller';

const router = Router();

router.get('/', authMiddleware, getAllTeams);
router.get('/:id', authMiddleware, param('id').notEmpty(), validateRequest, getTeamById);
router.post(
  '/',
  authMiddleware,
  requireRole('DIRECTOR'),
  body('name').notEmpty().withMessage('اسم الفريق مطلوب'),
  body('leaderId').notEmpty().withMessage('رئيس الفريق مطلوب'),
  validateRequest,
  createTeam
);
router.patch(
  '/:id',
  authMiddleware,
  requireRole('DIRECTOR'),
  param('id').notEmpty().withMessage('معرف الفريق مطلوب'),
  validateRequest,
  updateTeam
);
router.patch(
  '/:id/disable',
  authMiddleware,
  requireRole('DIRECTOR'),
  param('id').notEmpty().withMessage('معرف الفريق مطلوب'),
  validateRequest,
  disableTeam
);
router.delete(
  '/:id',
  authMiddleware,
  requireRole('DIRECTOR'),
  param('id').notEmpty().withMessage('معرف الفريق مطلوب'),
  validateRequest,
  deleteTeam
);
router.post(
  '/:id/members',
  authMiddleware,
  requireRole('DIRECTOR', 'TEAM_LEADER'),
  body('userId').notEmpty().withMessage('معرف المستخدم مطلوب'),
  validateRequest,
  addMember
);
router.delete('/:id/members/:userId', authMiddleware, requireRole('DIRECTOR'), removeMember);

export default router;
