import { ExpenseCategory, ExpenseStatus, Language, Prisma, Role } from '@prisma/client';
import { prisma } from '../../config/database';
import { getMailFrom, mailTransporter } from '../../utils/mailer';
import { buildExpenseCreatedEmailHtml } from '../../utils/email-templates';

const normalizeReceiptUrl = (url: string | null): string | null => {
  if (!url) return null;

  const match = url.match(/\/uploads\/([^/]+)$/);
  if (match) {
    return `uploads/${match[1]}`;
  }

  return url;
};

const getUserTeamId = async (userId: string) => {
  const ledTeam = await prisma.team.findFirst({ where: { leaderId: userId } });
  if (ledTeam) {
    return ledTeam.id;
  }

  const member = await prisma.teamMember.findUnique({ where: { userId } });
  return member?.teamId ?? null;
};

const resolveAllocation = async (options: {
  allocationId?: string;
  teamId?: string;
  fiscalYear?: number;
}) => {
  if (options.allocationId) {
    const allocation = await prisma.budgetAllocation.findUnique({ where: { id: options.allocationId } });
    if (!allocation) {
      throw new Error('مخصص الميزانية غير موجود');
    }
    return allocation;
  }

  if (!options.teamId) {
    throw new Error('يجب تحديد الفريق');
  }

  const year = options.fiscalYear ?? new Date().getFullYear();
  const budget = await prisma.annualBudget.findUnique({ where: { fiscalYear: year } });
  if (!budget) {
    throw new Error('لا توجد ميزانية لهذه السنة');
  }

  const allocation = await prisma.budgetAllocation.findUnique({
    where: {
      budgetId_teamId: {
        budgetId: budget.id,
        teamId: options.teamId,
      },
    },
  });

  if (!allocation) {
    throw new Error('لا يوجد مخصص لهذا الفريق');
  }

  return allocation;
};

const notifyExpenseCreated = async (expense: {
  title: string;
  amount: Prisma.Decimal;
  category: ExpenseCategory;
  createdAt: Date;
  requestedBy: { fullName: string; email: string };
  allocation: { team: { name: string; leader: { id: string; isActive: boolean } } };
}) => {
  const mailFrom = getMailFrom();
  if (!mailFrom) {
    return;
  }

  const teamLeaderId = expense.allocation.team.leader.isActive ? expense.allocation.team.leader.id : null;

  const [teamLeader, directors] = await Promise.all([
    teamLeaderId
      ? prisma.user.findUnique({ where: { id: teamLeaderId }, select: { email: true, language: true } })
      : Promise.resolve(null),
    prisma.user.findMany({
      where: { role: 'DIRECTOR', isActive: true },
      select: { email: true, language: true },
    }),
  ]);

  const recipientMap = new Map<string, Language>();
  if (teamLeader?.email) {
    recipientMap.set(teamLeader.email, teamLeader.language);
  }
  directors.forEach((director) => {
    if (director.email) {
      recipientMap.set(director.email, director.language);
    }
  });

  if (recipientMap.size === 0) {
    return;
  }

  const sendTasks = Array.from(recipientMap.entries()).map(([email, language]) =>
    mailTransporter.sendMail({
      from: mailFrom,
      to: email,
      subject:
        language === Language.FR
          ? 'Notification: Nouvelle demande de depense'
          : language === Language.EN
          ? 'Alert: New Expense Request'
          : 'إشعار: طلب صرف جديد',
      html: buildExpenseCreatedEmailHtml({
        title: expense.title,
        amount: Number(expense.amount).toLocaleString(
          language === Language.AR ? 'ar-DZ' : language === Language.FR ? 'fr-DZ' : 'en-US'
        ),
        category: expense.category,
        requesterName: expense.requestedBy.fullName,
        teamName: expense.allocation.team.name,
        createdAt: expense.createdAt,
        language,
      }),
    })
  );

  const results = await Promise.allSettled(sendTasks);
  const failed = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');
  if (failed.length > 0) {
    console.error('Failed to send some expense notifications', failed.map((item) => item.reason));
  }
};

export const createExpenseService = async (data: {
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  requestedById: string;
  allocationId?: string;
  teamId?: string;
  fiscalYear?: number;
  receiptUrl?: string;
}) => {
  const allocation = await resolveAllocation({
    allocationId: data.allocationId,
    teamId: data.teamId,
    fiscalYear: data.fiscalYear,
  });

  const remaining = new Prisma.Decimal(allocation.allocatedAmount).minus(allocation.spentAmount);
  if (new Prisma.Decimal(data.amount).greaterThan(remaining)) {
    throw new Error('المبلغ يتجاوز الرصيد المتبقي للفريق');
  }

  const expense = await prisma.expense.create({
    data: {
      title: data.title,
      description: data.description,
      amount: new Prisma.Decimal(data.amount),
      category: data.category,
      requestedById: data.requestedById,
      allocationId: allocation.id,
      receiptUrl: data.receiptUrl,
    },
    include: {
      requestedBy: { select: { id: true, fullName: true, email: true, role: true } },
      allocation: {
        include: {
          team: {
            include: {
              leader: {
                select: { id: true, fullName: true, email: true, role: true, isActive: true, language: true },
              },
            },
          },
        },
      },
    },
  });

  void notifyExpenseCreated(expense as any);

  return expense;
};

export const approveExpenseService = async (expenseId: string, approverId: string) => {
  return prisma.$transaction(async (tx) => {
    const expense = await tx.expense.findUnique({ where: { id: expenseId } });
    if (!expense) {
      throw new Error('الطلب غير موجود');
    }

    if (expense.status !== ExpenseStatus.PENDING) {
      throw new Error('لا يمكن الموافقة على هذا الطلب');
    }

    const allocation = await tx.budgetAllocation.findUnique({ where: { id: expense.allocationId } });
    if (!allocation) {
      throw new Error('مخصص الميزانية غير موجود');
    }

    const remaining = new Prisma.Decimal(allocation.allocatedAmount).minus(allocation.spentAmount);
    if (new Prisma.Decimal(expense.amount).greaterThan(remaining)) {
      throw new Error('المبلغ يتجاوز الرصيد المتبقي للفريق');
    }

    await tx.budgetAllocation.update({
      where: { id: allocation.id },
      data: { spentAmount: { increment: expense.amount } },
    });

    const categoryBudget = await tx.categoryBudget.findUnique({
      where: {
        budgetId_category: {
          budgetId: allocation.budgetId,
          category: expense.category,
        },
      },
    });

    if (categoryBudget) {
      await tx.categoryBudget.update({
        where: { id: categoryBudget.id },
        data: { spentAmount: { increment: expense.amount } },
      });
    }

    return tx.expense.update({
      where: { id: expenseId },
      data: { status: ExpenseStatus.APPROVED, approvedById: approverId, rejectionReason: null },
    });
  });
};

export const rejectExpenseService = async (expenseId: string, approverId: string, reason: string) => {
  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense) {
    throw new Error('الطلب غير موجود');
  }

  return prisma.expense.update({
    where: { id: expenseId },
    data: {
      status: ExpenseStatus.REJECTED,
      approvedById: approverId,
      rejectionReason: reason,
    },
  });
};

export const getExpenseByIdService = async (expenseId: string, userId: string, role: Role) => {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      requestedBy: { select: { id: true, fullName: true, email: true, role: true } },
      approvedBy: { select: { id: true, fullName: true, email: true } },
      allocation: {
        include: {
          team: true,
        },
      },
    },
  });

  if (!expense) {
    throw new Error('الطلب غير موجود');
  }

  if (role !== 'DIRECTOR') {
    const teamId = await getUserTeamId(userId);
    if (!teamId || expense.allocation.teamId !== teamId) {
      throw new Error('ليس لديك صلاحية لعرض هذا الطلب');
    }
  }

  return {
    ...expense,
    receiptUrl: normalizeReceiptUrl(expense.receiptUrl),
  };
};

export const getExpensesService = async (filters: {
  status?: ExpenseStatus;
  category?: ExpenseCategory;
  teamId?: string;
  dateFrom?: string;
  dateTo?: string;
  userId: string;
  role: Role;
}) => {
  const where: Prisma.ExpenseWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.role === 'DIRECTOR') {
    if (filters.teamId) {
      where.allocation = { teamId: filters.teamId };
    }
  } else {
    const teamId = await getUserTeamId(filters.userId);
    if (!teamId) {
      throw new Error('لم يتم العثور على فريق للمستخدم');
    }
    where.allocation = { teamId };
    if (filters.role === 'RESEARCHER') {
      where.requestedById = filters.userId;
    }
  }

  if (filters.dateFrom || filters.dateTo) {
    where.expenseDate = {
      ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
      ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
    };
  }

  const expenses = await prisma.expense.findMany({
    where,
    include: {
      requestedBy: { select: { id: true, fullName: true, email: true, role: true } },
      approvedBy: { select: { id: true, fullName: true, email: true } },
      allocation: {
        include: {
          team: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return expenses.map((expense) => ({
    ...expense,
    receiptUrl: normalizeReceiptUrl(expense.receiptUrl),
  }));
};

export const uploadReceiptService = async (expenseId: string, filePath: string) => {
  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense) {
    throw new Error('الطلب غير موجود');
  }

  return prisma.expense.update({
    where: { id: expenseId },
    data: { receiptUrl: filePath },
  });
};

export const createExpenseForCurrentUser = async (
  userId: string,
  role: Role,
  data: {
    title: string;
    description?: string;
    amount: number;
    category: ExpenseCategory;
    fiscalYear?: number;
    teamId?: string;
    receiptUrl?: string;
  }
) => {
  const teamId = role === 'DIRECTOR' ? data.teamId : data.teamId ?? (await getUserTeamId(userId));

  return createExpenseService({
    ...data,
    requestedById: userId,
    teamId: teamId ?? undefined,
  });
};
