import { Request, Response } from 'express';
import { sendError, sendSuccess } from '../../utils/response';
import {
  addMemberService,
  createTeamService,
  deleteTeamService,
  disableTeamService,
  getAllTeamsService,
  getTeamByIdService,
  removeMemberService,
  updateTeamService,
} from './teams.service';

export const getAllTeams = async (_req: Request, res: Response) => {
  try {
    const data = await getAllTeamsService();
    return sendSuccess(res, data, 'تم جلب الفرق');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل جلب الفرق', 500);
  }
};

export const createTeam = async (req: Request, res: Response) => {
  try {
    const data = await createTeamService(req.body);
    return sendSuccess(res, data, 'تم إنشاء الفريق', 201);
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل إنشاء الفريق', 400);
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  try {
    const data = await getTeamByIdService(req.params.id);
    return sendSuccess(res, data, 'تفاصيل الفريق');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل جلب الفريق', 404);
  }
};

export const addMember = async (req: Request, res: Response) => {
  try {
    const data = await addMemberService(req.params.id, req.body.userId);
    return sendSuccess(res, data, 'تمت إضافة العضو', 201);
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل إضافة العضو', 400);
  }
};

export const removeMember = async (req: Request, res: Response) => {
  try {
    const data = await removeMemberService(req.params.id, req.params.userId);
    return sendSuccess(res, data, 'تم حذف العضو');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل حذف العضو', 400);
  }
};

export const updateTeam = async (req: Request, res: Response) => {
  try {
    const data = await updateTeamService(req.params.id, req.body);
    return sendSuccess(res, data, 'تم تحديث الفريق');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل تحديث الفريق', 400);
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const data = await deleteTeamService(req.params.id);
    return sendSuccess(res, data, 'تم حذف الفريق');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل حذف الفريق', 400);
  }
};

export const disableTeam = async (req: Request, res: Response) => {
  try {
    const data = await disableTeamService(req.params.id);
    return sendSuccess(res, data, 'تم تعطيل الفريق');
  } catch (error) {
    return sendError(res, error instanceof Error ? error.message : 'فشل تعطيل الفريق', 400);
  }
};
