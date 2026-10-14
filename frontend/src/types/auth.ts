export type AccountRole = 'Executive' | 'BranchManager' | 'Corporate' | 'Retail' | 'RiskCompliance';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: AccountRole;
  roleLabel: string;
  accountNumber: string;
  accountType: 'All' | 'Business' | 'Savings' | 'Current' | 'Salary';
  branch: string;
  avatarColor: string;
  description: string;
}

export interface AuthState {
  user: UserAccount | null;
  isAuthenticated: boolean;
}
