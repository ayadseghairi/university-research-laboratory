import { Request, Response } from 'express';
import { sendError, sendSuccess } from '../../utils/response';
import { getAnnualSummaryService, getTeamReportService } from './reports.service';

export const getAnnualSummary = async (req: Request, res: Response) => {
  try {
    const year = Number(req.params.year || req.query.year || new Date().getFullYear());
    const data = await getAnnualSummaryService(year);
    if (!data) {
      return sendSuccess(res, null, 'لا توجد بيانات للسنة المالية المحددة');
    }
    return sendSuccess(res, data, 'تم جلب التقرير السنوي');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل جلب التقرير', 400);
  }
};

export const getTeamReport = async (req: Request, res: Response) => {
  try {
    const year = Number(req.query.year || new Date().getFullYear());
    const data = await getTeamReportService(req.params.teamId, year);
    return sendSuccess(res, data, 'تم جلب تقرير الفريق');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل جلب تقرير الفريق', 400);
  }
};
