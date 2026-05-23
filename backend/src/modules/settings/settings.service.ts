import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';

const UNIVERSITY_DOMAIN = 'univ-khenchela.dz';

const isUniversityEmail = (email: string) => email.toLowerCase().endsWith(`@${UNIVERSITY_DOMAIN}`);

export const getMyProfileService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      teamMember: {
        include: {
          team: true,
        },
      },
      teamLed: true,
    },
  });

  if (!user) {
    throw new Error('المستخدم غير موجود');
  }

  const { password, ...safeUser } = user;
  return safeUser;
};

export const updateMyProfileService = async (
  userId: string,
  data: {
    fullName?: string;
    email?: string;
  }
) => {
  if (data.email && !isUniversityEmail(data.email)) {
    throw new Error(`يجب أن يكون البريد الإلكتروني من دومين ${UNIVERSITY_DOMAIN}`);
  }

  if (data.email) {
    const existing = await prisma.user.findFirst({
      where: {
        email: data.email,
        id: { not: userId },
      },
    });
    if (existing) {
      throw new Error('البريد الإلكتروني مستخدم مسبقاً');
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: data.fullName,
      email: data.email,
    },
    include: {
      teamMember: {
        include: {
          team: true,
        },
      },
      teamLed: true,
    },
  });

  const { password, ...safeUser } = user;
  return safeUser;
};

export const changeMyPasswordService = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('المستخدم غير موجود');
  }

  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) {
    throw new Error('كلمة المرور الحالية غير صحيحة');
  }

  const sameAsCurrent = await bcrypt.compare(newPassword, user.password);
  if (sameAsCurrent) {
    throw new Error('كلمة المرور الجديدة يجب أن تكون مختلفة');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { updated: true };
};
