-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DIRECTOR', 'TEAM_LEADER', 'RESEARCHER');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('RESEARCH_DEVELOPMENT', 'LAB_MATERIALS', 'SCIENTIFIC_PUBLISHING', 'EQUIPMENT', 'FIELD_RESEARCH', 'RESEARCHER_REWARDS');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "leaderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "annual_budgets" (
    "id" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "isDistributed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "annual_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_budgets" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "allocatedAmount" DECIMAL(15,2) NOT NULL,
    "spentAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_allocations" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "allocatedAmount" DECIMAL(15,2) NOT NULL,
    "spentAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "status" "ExpenseStatus" NOT NULL DEFAULT 'PENDING',
    "receiptUrl" TEXT,
    "rejectionReason" TEXT,
    "requestedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "allocationId" TEXT NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teams_leaderId_key" ON "teams"("leaderId");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_userId_key" ON "team_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "annual_budgets_fiscalYear_key" ON "annual_budgets"("fiscalYear");

-- CreateIndex
CREATE UNIQUE INDEX "category_budgets_budgetId_category_key" ON "category_budgets"("budgetId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "budget_allocations_budgetId_teamId_key" ON "budget_allocations"("budgetId", "teamId");

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_budgets" ADD CONSTRAINT "category_budgets_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "annual_budgets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_allocations" ADD CONSTRAINT "budget_allocations_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "annual_budgets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_allocations" ADD CONSTRAINT "budget_allocations_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "budget_allocations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
