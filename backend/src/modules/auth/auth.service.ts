import bcrypt from 'bcryptjs';
import { Role, Language } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN } from '../../config/jwt';
import { getMailFrom, mailTransporter } from '../../utils/mailer';

const UNIVERSITY_DOMAIN = 'univ-khenchela.dz';
const isUniversityEmail = (email: string) => email.toLowerCase().endsWith(`@${UNIVERSITY_DOMAIN}`);

const RESET_PASSWORD_SECRET = (process.env.RESET_PASSWORD_SECRET || process.env.JWT_SECRET || 'secret') as jwt.Secret;
const RESET_PASSWORD_EXPIRES_IN = (process.env.RESET_PASSWORD_EXPIRES_IN || '20m') as jwt.SignOptions['expiresIn'];
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const buildResetPasswordSecret = (passwordHash: string) => `${String(RESET_PASSWORD_SECRET)}:${passwordHash}`;

const userProfileInclude = {
  teamMember: {
    include: {
      team: {
        include: {
          leader: { select: { id: true, fullName: true, email: true, role: true, isActive: true } },
        },
      },
    },
  },
  teamLed: {
    include: {
      leader: { select: { id: true, fullName: true, email: true, role: true, isActive: true } },
    },
  },
} as const;

const mapUserProfile = (user: Awaited<ReturnType<typeof prisma.user.findUnique>> & {
  teamMember?: { team?: { id: string; name: string; description?: string | null; leader: unknown } | null } | null;
  teamLed?: { id: string; name: string; description?: string | null; leader: unknown } | null;
}) => {
  if (!user) {
    return null;
  }

  const { password, teamMember, teamLed, ...safeUser } = user as any;
  return {
    ...safeUser,
    team: teamMember?.team ?? teamLed ?? null,
  };
};

export const loginService = async (email: string, password: string, language?: Language) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: userProfileInclude,
  });
  if (!user || !user.isActive) {
    throw new Error('بيانات الدخول غير صحيحة');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('بيانات الدخول غير صحيحة');
  }

  // Update language if provided
  if (language && Object.values(Language).includes(language)) {
    await prisma.user.update({
      where: { id: user.id },
      data: { language },
    });
    user.language = language;
  }

  const accessToken = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    (process.env.JWT_SECRET || 'secret') as jwt.Secret,
    { expiresIn: JWT_ACCESS_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    (process.env.JWT_REFRESH_SECRET || 'refresh-secret') as jwt.Secret,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );

  return { user: mapUserProfile(user), accessToken, refreshToken };
};

export const refreshTokenService = async (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh-secret') as {
      id: string;
    };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.isActive) {
      throw new Error('المستخدم غير موجود');
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      (process.env.JWT_SECRET || 'secret') as jwt.Secret,
      { expiresIn: JWT_ACCESS_EXPIRES_IN }
    );

    return { accessToken };
  } catch {
    throw new Error('رمز التحديث غير صالح');
  }
};

export const meService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: userProfileInclude,
  });

  if (!user) {
    throw new Error('المستخدم غير موجود');
  }

  return mapUserProfile(user);
};

export const initializeFirstAdminService = async (data: {
  fullName: string;
  email: string;
  password: string;
  language?: Language;
}) => {
  const usersCount = await prisma.user.count();
  if (usersCount > 0) {
    throw new Error('تمت تهيئة النظام مسبقاً');
  }

  if (!isUniversityEmail(data.email)) {
    throw new Error('يجب أن يكون البريد الإلكتروني من دومين univ-khenchela.dz');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      password: hashedPassword,
      language: data.language && Object.values(Language).includes(data.language) ? data.language : Language.AR,
      role: Role.DIRECTOR,
      isActive: true,
    },
  });

  const { password, ...safeUser } = user;
  return safeUser;
};

export const getSetupStatusService = async () => {
  const usersCount = await prisma.user.count();
  return {
    canSetup: usersCount === 0,
  };
};

export const forgotPasswordService = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  // Avoid account enumeration by returning success even when the user does not exist.
  if (!user || !user.isActive) {
    return;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    buildResetPasswordSecret(user.password),
    { expiresIn: RESET_PASSWORD_EXPIRES_IN }
  );

  const resetLink = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
  const mailFrom = getMailFrom();

  if (!mailFrom) {
    throw new Error('إعدادات SMTP غير مكتملة: MAIL_FROM أو MAIL_USER مفقود');
  }

  await mailTransporter.sendMail({
    from: mailFrom,
    to: user.email,
    subject: 'إعادة تعيين كلمة المرور - منصة ميزانية المختبر',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.8; color: #0f172a;">
        <h2 style="margin: 0 0 10px;">طلب إعادة تعيين كلمة المرور</h2>
        <p>مرحبًا ${user.fullName}،</p>
        <p>تم استلام طلب لإعادة تعيين كلمة المرور الخاصة بحسابك.</p>
        <p>
          <a
            href="${resetLink}"
            style="display: inline-block; padding: 10px 16px; border-radius: 8px; background: #1f5ee0; color: #fff; text-decoration: none;"
          >
            إعادة تعيين كلمة المرور
          </a>
        </p>
        <p>إذا لم تقم بطلب ذلك، تجاهل هذه الرسالة.</p>
      </div>
    `,
  });
};

export const resetPasswordService = async (token: string, password: string) => {
  try {
    const decoded = jwt.decode(token) as { id?: string; email?: string } | null;
    if (!decoded?.id || !decoded?.email) {
      throw new Error('الرابط غير صالح');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || !user.isActive || user.email !== decoded.email) {
      throw new Error('الرابط غير صالح');
    }

    const payload = jwt.verify(token, buildResetPasswordSecret(user.password)) as { id: string; email: string };

    if (user.email !== payload.email) {
      throw new Error('الرابط غير صالح');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
  } catch {
    throw new Error('رابط إعادة التعيين غير صالح أو منتهي الصلاحية');
  }
};
