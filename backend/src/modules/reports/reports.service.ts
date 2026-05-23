import { ExpenseCategory, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

export const getAnnualSummaryService = async (fiscalYear: number) => {
  const budget = await prisma.annualBudget.findUnique({
    where: { fiscalYear },
    include: {
      allocations: {
        include: {
          team: { include: { leader: { select: { id: true, fullName: true, email: true } } } },
        },
      },
      categoryBudgets: true,
    },
  });

  if (!budget) {
    return null;
  }

  const teamSummaries = budget.allocations.map((allocation) => ({
    teamId: allocation.teamId,
    teamName: allocation.team.name,
    leaderName: allocation.team.leader.fullName,
    allocatedAmount: Number(allocation.allocatedAmount),
    spentAmount: Number(allocation.spentAmount),
    remainingAmount: Number(new Prisma.Decimal(allocation.allocatedAmount).minus(allocation.spentAmount)),
  }));

  const categorySummaries = Object.values(ExpenseCategory).map((category) => {
    const match = budget.categoryBudgets.find((item) => item.category === category);
    return {
      category,
      allocatedAmount: Number(match?.allocatedAmount ?? 0),
      spentAmount: Number(match?.spentAmount ?? 0),
      remainingAmount: Number(new Prisma.Decimal(match?.allocatedAmount ?? 0).minus(match?.spentAmount ?? 0)),
    };
  });

  const totalSpent = teamSummaries.reduce((sum, item) => sum + item.spentAmount, 0);
  const totalRemaining = Number(budget.totalAmount) - totalSpent;

  return {
    fiscalYear: budget.fiscalYear,
    totalAmount: Number(budget.totalAmount),
    totalSpent,
    totalRemaining,
    usagePercentage: budget.totalAmount ? Math.min(Math.round((totalSpent / Number(budget.totalAmount)) * 100), 100) : 0,
    teamSummaries,
    categorySummaries,
  };
};

export const getTeamReportService = async (teamId: string, fiscalYear: number) => {
  const budget = await prisma.annualBudget.findUnique({
    where: { fiscalYear },
    include: {
      allocations: {
        where: { teamId },
      },
      categoryBudgets: true,
    },
  });

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      leader: { select: { fullName: true, email: true } },
      members: { include: { user: { select: { fullName: true, email: true } } } },
    },
  });

  if (!budget || !team) {
    throw new Error('التقرير غير موجود');
  }

  const allocation = budget.allocations[0];
  const expenses = await prisma.expense.findMany({
    where: {
      allocation: {
        teamId,
        budgetId: budget.id,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    team,
    fiscalYear,
    allocation: allocation
      ? {
          allocatedAmount: Number(allocation.allocatedAmount),
          spentAmount: Number(allocation.spentAmount),
          remainingAmount: Number(new Prisma.Decimal(allocation.allocatedAmount).minus(allocation.spentAmount)),
        }
      : null,
    expenses,
    categoryMatrix: Object.values(ExpenseCategory).map((category) => {
      const match = budget.categoryBudgets.find((item) => item.category === category);
      return {
        category,
        allocatedAmount: Number(match?.allocatedAmount ?? 0),
        spentAmount: Number(match?.spentAmount ?? 0),
        remainingAmount: Number(new Prisma.Decimal(match?.allocatedAmount ?? 0).minus(match?.spentAmount ?? 0)),
      };
    }),
  };
};
