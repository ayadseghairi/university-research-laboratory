import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { getAnnualSummary, getTeamReport } from './reports.controller';

const router = Router();

router.get('/annual/:year', authMiddleware, requireRole('DIRECTOR', 'TEAM_LEADER'), getAnnualSummary);
router.get('/team/:teamId', authMiddleware, requireRole('DIRECTOR', 'TEAM_LEADER'), getTeamReport);

export default router;
