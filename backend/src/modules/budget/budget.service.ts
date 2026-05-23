import { ExpenseCategory, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

export const createAnnualBudgetService = async (fiscalYear: number, totalAmount: number) => {
  const existing = await prisma.annualBudget.findUnique({ where: { fiscalYear } });
  if (existing) {
    throw new Error('توجد ميزانية لهذه السنة بالفعل');
  }

  return prisma.annualBudget.create({
    data: {
      fiscalYear,
      totalAmount: new Prisma.Decimal(totalAmount),
    },
  });
};

export const distributeToTeamsService = async (
  budgetId: string,
  allocations: { teamId: string; amount: number }[]
) => {
  const budget = await prisma.annualBudget.findUnique({ where: { id: budgetId } });
  if (!budget) {
    throw new Error('الميزانية غير موجودة');
  }

  const totalAllocated = allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
  if (new Prisma.Decimal(totalAllocated).greaterThan(budget.totalAmount)) {
    throw new Error('إجمالي التوزيع يتجاوز الميزانية الكلية');
  }

  const result = await prisma.$transaction(async (tx) => {
    const createdAllocations = [] as unknown[];
    for (const allocation of allocations) {
      const team = await tx.team.findUnique({ where: { id: allocation.teamId } });
      if (!team) {
        throw new Error('أحد الفرق غير موجود');
      }

      const saved = await tx.budgetAllocation.upsert({
        where: {
          budgetId_teamId: {
            budgetId,
            teamId: allocation.teamId,
          },
        },
        update: {
          allocatedAmount: new Prisma.Decimal(allocation.amount),
          approvedAt: new Date(),
        },
        create: {
          budgetId,
          teamId: allocation.teamId,
          allocatedAmount: new Prisma.Decimal(allocation.amount),
          approvedAt: new Date(),
        },
      });
      createdAllocations.push(saved);
    }

    await tx.annualBudget.update({
      where: { id: budgetId },
      data: { isDistributed: true },
    });

    return createdAllocations;
  });

  return result;
};

export const getBudgetOverviewService = async (fiscalYear: number) => {
  return prisma.annualBudget.findUnique({
    where: { fiscalYear },
    include: {
      allocations: {
        include: {
          team: {
            include: {
              leader: { select: { id: true, fullName: true, email: true } },
            },
          },
          expenses: true,
        },
      },
      categoryBudgets: true,
    },
  });
};

export const updateCategoryBudgetService = async (
  budgetId: string,
  category: ExpenseCategory,
  amount: number
) => {
  const budget = await prisma.annualBudget.findUnique({ where: { id: budgetId } });
  if (!budget) {
    throw new Error('الميزانية غير موجودة');
  }

  return prisma.categoryBudget.upsert({
    where: {
      budgetId_category: {
        budgetId,
        category,
      },
    },
    update: {
      allocatedAmount: new Prisma.Decimal(amount),
    },
    create: {
      budgetId,
      category,
      allocatedAmount: new Prisma.Decimal(amount),
    },
  });
};
