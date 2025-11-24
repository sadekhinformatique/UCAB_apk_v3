import { UserRole, IncomeCategory, ExpenseCategory } from './types';

export const ADMIN_EMAIL = 'djahfarsadekh2015@gmail.com';
export const ADMIN_PASS = 'Dspro1814@2027';

export const ROLES_CONFIG = {
  [UserRole.PRESIDENT]: { label: 'Président', canApprove: true, canViewAll: true },
  [UserRole.TRESORIER]: { label: 'Trésorier', canApprove: true, canViewAll: true },
  [UserRole.MEMBRE]: { label: 'Membre', canApprove: false, canViewAll: false },
};

export const INCOME_CATEGORIES = Object.values(IncomeCategory);
export const EXPENSE_CATEGORIES = Object.values(ExpenseCategory);