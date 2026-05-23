export type Role = 'DIRECTOR' | 'TEAM_LEADER' | 'RESEARCHER';
export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
export type ExpenseCategory =
  | 'RESEARCH_DEVELOPMENT'
  | 'LAB_MATERIALS'
  | 'SCIENTIFIC_PUBLISHING'
  | 'EQUIPMENT'
  | 'FIELD_RESEARCH'
  | 'RESEARCHER_REWARDS';

export type UILanguage = 'ar' | 'fr' | 'en';

const CATEGORY_TRANSLATIONS: Record<UILanguage, Record<ExpenseCategory, string>> = {
  ar: {
    RESEARCH_DEVELOPMENT: 'بحث وتطوير',
    LAB_MATERIALS: 'مواد مخبرية',
    SCIENTIFIC_PUBLISHING: 'نشر علمي',
    EQUIPMENT: 'معدات علمية',
    FIELD_RESEARCH: 'بحث ميداني',
    RESEARCHER_REWARDS: 'مكافآت الباحثين',
  },
  fr: {
    RESEARCH_DEVELOPMENT: 'Recherche et développement',
    LAB_MATERIALS: 'Matériaux de laboratoire',
    SCIENTIFIC_PUBLISHING: 'Publication scientifique',
    EQUIPMENT: 'Équipement scientifique',
    FIELD_RESEARCH: 'Recherche sur le terrain',
    RESEARCHER_REWARDS: 'Récompenses des chercheurs',
  },
  en: {
    RESEARCH_DEVELOPMENT: 'Research and Development',
    LAB_MATERIALS: 'Lab Materials',
    SCIENTIFIC_PUBLISHING: 'Scientific Publishing',
    EQUIPMENT: 'Scientific Equipment',
    FIELD_RESEARCH: 'Field Research',
    RESEARCHER_REWARDS: 'Researcher Rewards',
  },
};

const STATUS_TRANSLATIONS: Record<UILanguage, Record<ExpenseStatus, string>> = {
  ar: {
    PENDING: 'في الانتظار',
    APPROVED: 'موافق عليه',
    REJECTED: 'مرفوض',
    PAID: 'تم الدفع',
  },
  fr: {
    PENDING: 'En attente',
    APPROVED: 'Approuvé',
    REJECTED: 'Rejeté',
    PAID: 'Payé',
  },
  en: {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    PAID: 'Paid',
  },
};

const ROLE_TRANSLATIONS: Record<UILanguage, Record<Role, string>> = {
  ar: {
    DIRECTOR: 'مدير المختبر',
    TEAM_LEADER: 'رئيس فريق',
    RESEARCHER: 'باحث',
  },
  fr: {
    DIRECTOR: 'Directeur du laboratoire',
    TEAM_LEADER: "Chef d'équipe",
    RESEARCHER: 'Chercheur',
  },
  en: {
    DIRECTOR: 'Laboratory Director',
    TEAM_LEADER: 'Team Leader',
    RESEARCHER: 'Researcher',
  },
};

export const getCategoryLabel = (category: ExpenseCategory, language: UILanguage = 'ar') => {
  return CATEGORY_TRANSLATIONS[language][category] || category;
};

export const getStatusLabel = (status: ExpenseStatus, language: UILanguage = 'ar') => {
  return STATUS_TRANSLATIONS[language][status] || status;
};

export const getRoleLabel = (role: Role, language: UILanguage = 'ar') => {
  return ROLE_TRANSLATIONS[language][role] || role;
};

export const CATEGORY_LABELS = CATEGORY_TRANSLATIONS.ar;
export const STATUS_LABELS = STATUS_TRANSLATIONS.ar;

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  RESEARCH_DEVELOPMENT: 'bx-analyse',
  LAB_MATERIALS: 'bx-test-tube',
  SCIENTIFIC_PUBLISHING: 'bx-book-open',
  EQUIPMENT: 'bx-chip',
  FIELD_RESEARCH: 'bx-map',
  RESEARCHER_REWARDS: 'bx-award',
};

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  isActive: boolean;
  team?: Team | null;
}

export interface TeamMember {
  id: string;
  user: User;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  leader: Pick<User, 'id' | 'fullName' | 'email' | 'role' | 'isActive'>;
  members?: TeamMember[];
  memberCount?: number;
  allocations?: BudgetAllocation[];
}

export interface AnnualBudget {
  id: string;
  fiscalYear: number;
  totalAmount: number;
  isDistributed: boolean;
  allocations: BudgetAllocation[];
  categoryBudgets: CategoryBudget[];
}

export interface BudgetAllocation {
  id: string;
  teamId?: string;
  allocatedAmount: number;
  spentAmount: number;
  approvedAt?: string | null;
  team: Team;
}

export interface CategoryBudget {
  id: string;
  category: ExpenseCategory;
  allocatedAmount: number;
  spentAmount: number;
}

export interface Expense {
  id: string;
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  status: ExpenseStatus;
  receiptUrl?: string;
  rejectionReason?: string;
  requestedBy: Pick<User, 'id' | 'fullName' | 'email' | 'role'>;
  approvedBy?: Pick<User, 'id' | 'fullName' | 'email'> | null;
  allocation: { team: Pick<Team, 'id' | 'name'> };
  expenseDate: string;
  createdAt: string;
}

export interface BudgetOverview {
  fiscalYear: number;
  totalAmount: number;
  totalSpent: number;
  totalRemaining: number;
  usagePercentage: number;
  teamSummaries: Array<{
    teamId: string;
    teamName: string;
    leaderName: string;
    allocatedAmount: number;
    spentAmount: number;
    remainingAmount: number;
  }>;
  categorySummaries: Array<{
    category: ExpenseCategory;
    allocatedAmount: number;
    spentAmount: number;
    remainingAmount: number;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
