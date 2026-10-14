import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, AccountRole } from '../types/auth';

export const DEMO_BANK_ACCOUNTS: UserAccount[] = [
  {
    id: 'ACC-EXEC-01',
    name: 'Rajesh Varma',
    email: 'r.varma@apexbank.in',
    role: 'Executive',
    roleLabel: 'Managing Director & Global Treasury',
    accountNumber: '•••• 9012',
    accountType: 'All',
    branch: 'All',
    avatarColor: 'from-blue-600 to-indigo-700',
    description: 'Complete cross-branch authority, macro liquidity metrics, and institutional oversight.',
  },
  {
    id: 'ACC-CORP-44',
    name: 'Aditi Rao',
    email: 'aditi.rao@apexcorporates.com',
    role: 'Corporate',
    roleLabel: 'Corporate & Commercial Banking Account',
    accountNumber: '•••• 4419',
    accountType: 'Business',
    branch: 'Mumbai Fort',
    avatarColor: 'from-amber-500 to-rose-600',
    description: 'High-ticket business transfers, commercial vendor payments, and bulk cash-flow tracking.',
  },
  {
    id: 'ACC-BR-CHN-12',
    name: 'Karthik Sundaram',
    email: 'k.sundaram@apexbank.in',
    role: 'BranchManager',
    roleLabel: 'Chennai Central Branch Operations',
    accountNumber: '•••• 7820',
    accountType: 'All',
    branch: 'Chennai Central',
    avatarColor: 'from-teal-500 to-emerald-700',
    description: 'Local hub operations: ATM cash liquidity, branch transaction velocity, and counter deposits.',
  },
  {
    id: 'ACC-RISK-99',
    name: 'Dr. Neha Sharma',
    email: 'n.sharma@apexbank-audit.in',
    role: 'RiskCompliance',
    roleLabel: 'Chief Risk & Regulatory Auditor',
    accountNumber: '•••• 3301',
    accountType: 'All',
    branch: 'All',
    avatarColor: 'from-purple-600 to-pink-600',
    description: 'Anomaly surveillance, outlier scoring, and transaction integrity audit governance.',
  },
  {
    id: 'ACC-RET-51',
    name: 'Siddharth Patel',
    email: 'siddharth.patel@gmail.com',
    role: 'Retail',
    roleLabel: 'Premier Savings & Retail Banking Account',
    accountNumber: '•••• 5188',
    accountType: 'Savings',
    branch: 'Bengaluru Indiranagar',
    avatarColor: 'from-sky-500 to-blue-600',
    description: 'Personal day-to-day spending: UPI transfers, debit card swipes, and household bills.',
  },
];

interface AuthContextType {
  currentUser: UserAccount;
  isAuthenticated: boolean;
  loginAsAccount: (account: UserAccount) => void;
  loginWithCredentials: (username: string, role: AccountRole, accountType: string, branch: string) => boolean;
  logout: () => void;
  isSignInModalOpen: boolean;
  setIsSignInModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem('apex_user_account');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEMO_BANK_ACCOUNTS[0];
      }
    }
    return DEMO_BANK_ACCOUNTS[0]; // Default to Global Executive
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('apex_user_account', JSON.stringify(currentUser));
  }, [currentUser]);

  const loginAsAccount = (account: UserAccount) => {
    setCurrentUser(account);
    setIsAuthenticated(true);
    setIsSignInModalOpen(false);
  };

  const loginWithCredentials = (username: string, role: AccountRole, accountType: string, branch: string) => {
    const customUser: UserAccount = {
      id: `ACC-CUSTOM-${Math.floor(1000 + Math.random() * 9000)}`,
      name: username || 'Banking User',
      email: `${(username || 'user').toLowerCase().replace(/\s+/g, '.')}@apexbank.in`,
      role,
      roleLabel: `${role} Banking Portfolio`,
      accountNumber: `•••• ${Math.floor(1000 + Math.random() * 9000)}`,
      accountType: accountType as any,
      branch: branch || 'All',
      avatarColor: 'from-blue-600 to-teal-500',
      description: 'Authenticated banking user session.',
    };
    setCurrentUser(customUser);
    setIsAuthenticated(true);
    setIsSignInModalOpen(false);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsSignInModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        loginAsAccount,
        loginWithCredentials,
        logout,
        isSignInModalOpen,
        setIsSignInModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
