import bcrypt from 'bcryptjs';
import { Prisma, Role } from '@prisma/client';
import { prisma } from '../../config/database';

const UNIVERSITY_DOMAIN = 'univ-khenchela.dz';

const isUniversityEmail = (email: string) => email.toLowerCase().endsWith(`@${UNIVERSITY_DOMAIN}`);

const userInclude = {
  teamMember: {
    include: {
      team: true,
    },
  },
  teamLed: true,
} satisfies Prisma.UserInclude;

export const getAllUsersService = async () => {
  const users = await prisma.user.findMany({
    include: userInclude,
    orderBy: { createdAt: 'desc' },
  });

  return users.map((user) => ({
    ...user,
    team: user.teamMember?.team ?? user.teamLed ?? null,
    password: undefined,
  }));
};

export const createUserService = async (data: {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  teamId?: string;
}) => {
  if (!isUniversityEmail(data.email)) {
    throw new Error(`يجب أن يكون البريد الإلكتروني من دومين ${UNIVERSITY_DOMAIN}`);
  }

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new Error('البريد الإلكتروني مستخدم مسبقاً');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    },
  });

  if (data.teamId && data.role !== Role.DIRECTOR) {
    await prisma.teamMember.upsert({
      where: { userId: user.id },
      update: { teamId: data.teamId },
      create: { userId: user.id, teamId: data.teamId },
    });
  }

  const fresh = await prisma.user.findUnique({ where: { id: user.id }, include: userInclude });
  const { password, ...safe } = fresh!;
  return safe;
};

export const updateUserService = async (
  id: string,
  data: Partial<{
    fullName: string;
    email: string;
    password: string;
    role: Role;
    isActive: boolean;
    teamId: string;
  }>
) => {
  if (data.email && !isUniversityEmail(data.email)) {
    throw new Error(`يجب أن يكون البريد الإلكتروني من دومين ${UNIVERSITY_DOMAIN}`);
  }

  const updateData: Prisma.UserUpdateInput = {
    fullName: data.fullName,
    email: data.email,
    role: data.role,
    isActive: data.isActive,
  };

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    include: userInclude,
  });

  if (data.role === Role.DIRECTOR) {
    await prisma.teamMember.deleteMany({ where: { userId: id } });
  } else if (data.teamId) {
    await prisma.teamMember.upsert({
      where: { userId: id },
      update: { teamId: data.teamId },
      create: { userId: id, teamId: data.teamId },
    });
  }

  const fresh = await prisma.user.findUnique({ where: { id }, include: userInclude });
  const { password, ...safe } = fresh!;
  return safe;
};

export const toggleActiveService = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new Error('المستخدم غير موجود');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    include: userInclude,
  });

  const { password, ...safe } = updated;
  return safe;
};

export const deleteUserService = async (targetUserId: string, actorUserId: string) => {
  if (targetUserId === actorUserId) {
    throw new Error('لا يمكن حذف حسابك الحالي');
  }

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: {
      teamLed: true,
    },
  });

  if (!user) {
    throw new Error('المستخدم غير موجود');
  }

  if (user.teamLed) {
    throw new Error('لا يمكن حذف مستخدم يقود فريقاً. قم بتعديل الفريق أولاً');
  }

  const [requestedCount, approvedCount] = await Promise.all([
    prisma.expense.count({ where: { requestedById: targetUserId } }),
    prisma.expense.count({ where: { approvedById: targetUserId } }),
  ]);

  if (requestedCount > 0 || approvedCount > 0) {
    throw new Error('لا يمكن حذف المستخدم لوجود طلبات صرف مرتبطة به');
  }

  await prisma.teamMember.deleteMany({ where: { userId: targetUserId } });
  await prisma.user.delete({ where: { id: targetUserId } });

  return { deleted: true };
};
