
export enum UserRole {
  PRESIDENT = 'PRESIDENT',
  TRESORIER = 'TRESORIER',
  MEMBRE = 'MEMBRE',
}

export enum TransactionType {
  INCOME = 'ENTREE',
  EXPENSE = 'SORTIE',
}

export enum IncomeCategory {
  COTISATION = 'Cotisation',
  DON = 'Don',
  SPONSORING = 'Sponsoring',
  VENTE = 'Vente',
  AUTRE = 'Autre',
}

export enum ExpenseCategory {
  TRANSPORT = 'Transport',
  NOURRITURE = 'Nourriture',
  FOURNITURES = 'Fournitures',
  COMMUNICATION = 'Communication',
  EVENEMENTS = 'Événements',
  SOCIAL = 'Aides sociales',
  AUTRE = 'Autre',
}

export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
}

export enum Sector {
  INFO = 'INFORMATIQUE DE GESTION',
  ADMIN = 'ADMINISTRATION',
  ELEC = 'ELECTROMECANIQUE',
  PREPA = 'ANNEE PREPARATOIRE',
}

export enum Level {
  L1 = 'L1',
  L2 = 'L2',
  L3 = 'L3',
  AP = 'AP', // For Année Préparatoire
}

export interface User {
  email: string;
  name: string;
  role: UserRole;
  memberId?: string; // Link to a specific member if applicable
}

export interface Member {
  id: string; // UUID
  dossierNumber: string;
  ine: string;
  uniqueId: string; // A... or B...
  firstName: string;
  lastName: string;
  dob: string;
  sector: Sector;
  level: Level;
  gender: Gender;
  balance: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  description: string; // Libellé
  performedBy: string; // Nom et prénom
  matricule: string;
  function: string;
  receiptNumber?: string; // For income
  proofUrl?: string; // For expense
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  responsible: string; // Responsable de la fonction
  signature: string; // Signature de la caisse
}

export interface ChartData {
  name: string;
  entrees: number;
  sorties: number;
}

export interface Budget {
  id: string;
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  year: number;
}

export interface AppSettings {
  associationName: string;
  currency: string;
  logoUrl: string;
}

export interface CommunityMessage {
  id: string;
  userId: string; // User email or ID
  userName: string;
  userRole: UserRole;
  memberInfo?: {
    sector: Sector;
    level: Level;
  };
  content: string;
  timestamp: string;
}
