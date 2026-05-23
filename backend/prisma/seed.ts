import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.expense.deleteMany();
  await prisma.budgetAllocation.deleteMany();
  await prisma.categoryBudget.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.annualBudget.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Seed completed: database cleared with no initial records');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
