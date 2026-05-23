import { Prisma, Role } from '@prisma/client';
import { prisma } from '../../config/database';

const teamInclude = {
  leader: { select: { id: true, fullName: true, email: true, role: true, isActive: true } },
  members: { include: { user: { select: { id: true, fullName: true, email: true, role: true, isActive: true } } } },
  allocations: {
    include: {
      budget: true,
    },
  },
} satisfies Prisma.TeamInclude;

const currentTeamIdForUser = async (userId: string) => {
  const member = await prisma.teamMember.findUnique({ where: { userId } });
  return member?.teamId ?? null;
};

export const getAllTeamsService = async () => {
  const teams = await prisma.team.findMany({
    include: teamInclude,
    orderBy: { createdAt: 'desc' },
  });

  return teams.map((team) => ({
    ...team,
    memberCount: team.members.length,
  }));
};

export const createTeamService = async (data: { name: string; description?: string; leaderId: string }) => {
  const leader = await prisma.user.findUnique({ where: { id: data.leaderId } });
  if (!leader || leader.role === Role.DIRECTOR) {
    throw new Error('يجب اختيار رئيس فريق صالح');
  }

  if (leader.role !== Role.TEAM_LEADER) {
    await prisma.user.update({
      where: { id: leader.id },
      data: { role: Role.TEAM_LEADER },
    });
  }

  const existing = await prisma.team.findUnique({ where: { leaderId: data.leaderId } });
  if (existing) {
    throw new Error('هذا الرئيس مرتبط بفريق آخر بالفعل');
  }

  const team = await prisma.team.create({
    data: {
      name: data.name,
      description: data.description,
      leaderId: data.leaderId,
    },
    include: teamInclude,
  });

  await prisma.teamMember.upsert({
    where: { userId: data.leaderId },
    update: { teamId: team.id },
    create: { userId: data.leaderId, teamId: team.id },
  });

  return { ...team, memberCount: team.members.length };
};

export const getTeamByIdService = async (id: string) => {
  const team = await prisma.team.findUnique({
    where: { id },
    include: teamInclude,
  });

  if (!team) {
    throw new Error('الفريق غير موجود');
  }

  return { ...team, memberCount: team.members.length };
};

export const addMemberService = async (teamId: string, userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role === Role.DIRECTOR) {
    throw new Error('لا يمكن إضافة هذا المستخدم إلى فريق');
  }

  const currentTeamId = await currentTeamIdForUser(userId);
  if (currentTeamId && currentTeamId !== teamId) {
    throw new Error('هذا المستخدم مرتبط بفريق آخر بالفعل');
  }

  const member = await prisma.teamMember.upsert({
    where: { userId },
    update: { teamId },
    create: { userId, teamId },
    include: { user: true, team: true },
  });

  return member;
};

export const removeMemberService = async (teamId: string, userId: string) => {
  const member = await prisma.teamMember.findUnique({ where: { userId } });
  if (!member || member.teamId !== teamId) {
    throw new Error('العضو غير موجود في هذا الفريق');
  }

  await prisma.teamMember.delete({ where: { userId } });
  return { removed: true };
};

export const updateTeamService = async (
  teamId: string,
  data: {
    name?: string;
    description?: string;
    leaderId?: string;
  }
) => {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) {
    throw new Error('الفريق غير موجود');
  }

  if (data.leaderId && data.leaderId !== team.leaderId) {
    const leader = await prisma.user.findUnique({ where: { id: data.leaderId } });
    if (!leader || leader.role !== Role.TEAM_LEADER) {
      throw new Error('يجب اختيار رئيس فريق صالح');
    }

    const alreadyLeading = await prisma.team.findFirst({
      where: {
        leaderId: data.leaderId,
        id: { not: teamId },
      },
    });

    if (alreadyLeading) {
      throw new Error('هذا المستخدم يقود فريقاً آخر بالفعل');
    }
  }

  const updated = await prisma.team.update({
    where: { id: teamId },
    data: {
      name: data.name,
      description: data.description,
      leaderId: data.leaderId,
    },
    include: teamInclude,
  });

  if (data.leaderId) {
    await prisma.teamMember.upsert({
      where: { userId: data.leaderId },
      update: { teamId },
      create: { userId: data.leaderId, teamId },
    });
  }

  return { ...updated, memberCount: updated.members.length };
};

export const deleteTeamService = async (teamId: string) => {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) {
    throw new Error('الفريق غير موجود');
  }

  const allocationCount = await prisma.budgetAllocation.count({ where: { teamId } });
  if (allocationCount > 0) {
    throw new Error('لا يمكن حذف الفريق لوجود ميزانيات مرتبطة به. استخدم تعطيل الفريق');
  }

  await prisma.teamMember.deleteMany({ where: { teamId } });
  await prisma.team.delete({ where: { id: teamId } });
  return { deleted: true };
};

export const disableTeamService = async (teamId: string) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { members: true },
  });

  if (!team) {
    throw new Error('الفريق غير موجود');
  }

  const userIds = Array.from(new Set([team.leaderId, ...team.members.map((m) => m.userId)]));
  await prisma.user.updateMany({
    where: { id: { in: userIds } },
    data: { isActive: false },
  });

  return { disabled: true, affectedUsers: userIds.length };
};
