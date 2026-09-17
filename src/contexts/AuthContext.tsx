import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, seedUserMasterData } from '@/integrations/supabase/client';
import { EXPORTED_PROFILES } from '@/lib/accountsExportData';

export interface User {
  id: string;
  uid?: string;
  email?: string | null;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  created_at?: string;
}

export interface Session {
  user: User | null;
  access_token?: string;
}

export interface DemoAccount {
  id: string;
  name: string;
  email: string;
  companyName: string;
  role: 'admin' | 'user';
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: '6f7513f5-3613-4c77-a137-c73844e6eb17',
    name: 'Niamh Smith',
    email: 'niamh.smith@kimpton.co.uk',
    companyName: 'Kimpton',
    role: 'user'
  },
  {
    id: '66109f04-8054-4835-a069-28a9ca7870f3',
    name: 'Almac Demo Admin',
    email: 'demo@almacgroup.com',
    companyName: 'Almac Group',
    role: 'admin'
  },
  {
    id: '0fe57d1f-2bf8-45ba-86ce-18b139a6b195',
    name: 'Ramees Raja',
    email: 'rameesraja.kn@gmail.com',
    companyName: 'CarbonMash',
    role: 'admin'
  },
  {
    id: '7222baf0-1dd3-45ef-b3d0-b4daf83be7b6',
    name: 'Almac Standard User',
    email: 'user@almacgroup.com',
    companyName: 'Almac Group User',
    role: 'user'
  },
  {
    id: '8133241d-f5c0-40d2-b3ad-f3ee0ac8f463',
    name: 'Aman Nasar',
    email: 'amannasar39@gmail.com',
    companyName: 'Net-Z Platform',
    role: 'user'
  },
  {
    id: '77ea7b16-f598-4882-ac78-ce5dbcf7da1c',
    name: 'CarbonMash Demo',
    email: 'democc@carbonmash.com',
    companyName: 'CarbonMash',
    role: 'user'
  },
  {
    id: 'd76831a0-5dc1-4256-865d-a7a0265ca2ce',
    name: 'Ramees R',
    email: 'rameesr4s@gmail.com',
    companyName: 'Net-Z Platform',
    role: 'user'
  },
  {
    id: '0735e294-a4c6-4d06-9731-23cc6e69f780',
    name: 'Almac Admin',
    email: 'admin@almacgroup.com',
    companyName: 'Almac Group',
    role: 'admin'
  }
];

export const getRequiredPassword = (email: string): string => {
  const clean = (email || '').trim().toLowerCase();
  if (clean === 'democc@carbonmash.com') {
    return 'Ucbcarbonmash7!';
  }
  if (clean === 'rameesraja.kn@gmail.com' || clean === 'ramesraja.kn@gmail.com') {
    return 'Qwerty1234!';
  }
  if (clean.includes('almac') || clean.endsWith('@almacgroup.com')) {
    return 'Qwerty1234!';
  }
  if (clean === 'niamh.smith@kimpton.co.uk' || clean.includes('kimpton')) {
    return 'Kimpton2026!';
  }
  return 'Qwerty1234!';
};

export const applyCustomCompanyName = (account: DemoAccount): DemoAccount => {
  try {
    const customName = localStorage.getItem(`custom_company_name_${account.id}`) ||
                       localStorage.getItem(`custom_company_name_${account.email.toLowerCase()}`);
    if (customName) {
      return { ...account, companyName: customName };
    }
  } catch {}
  return account;
};

export const findAccount = (emailOrId: string): DemoAccount | null => {
  if (!emailOrId) return null;
  const clean = emailOrId.trim().toLowerCase();

  // Alias support for master admin spelling
  if (clean === 'ramesraja.kn@gmail.com' || clean === 'rameesraja.kn@gmail.com') {
    const rAccount = DEMO_ACCOUNTS.find(a => a.email === 'rameesraja.kn@gmail.com') || DEMO_ACCOUNTS[2];
    return applyCustomCompanyName(rAccount);
  }

  // 1. Direct match in DEMO_ACCOUNTS
  const fromDemo = DEMO_ACCOUNTS.find(
    a => a.email.toLowerCase() === clean || a.id.toLowerCase() === clean
  );
  if (fromDemo) return applyCustomCompanyName(fromDemo);

  // 2. Direct match in EXPORTED_PROFILES
  const fromExp = EXPORTED_PROFILES.find(
    p => (p.email && p.email.toLowerCase() === clean) || (p.user_id && p.user_id.toLowerCase() === clean)
  );
  if (fromExp) {
    const acc: DemoAccount = {
      id: fromExp.user_id,
      name: fromExp.company_name,
      email: fromExp.email || clean,
      companyName: fromExp.company_name,
      role: 'user'
    };
    return applyCustomCompanyName(acc);
  }

  // 3. Fallback match in localStorage cached profiles
  try {
    const local = JSON.parse(localStorage.getItem('carbonmash_data_profiles') || '[]');
    const fromLocal = local.find(
      (p: any) => (p.email && p.email.toLowerCase() === clean) || (p.user_id && p.user_id.toLowerCase() === clean)
    );
    if (fromLocal) {
      const acc: DemoAccount = {
        id: fromLocal.user_id || fromLocal.id,
        name: fromLocal.company_name,
        email: fromLocal.email || clean,
        companyName: fromLocal.company_name,
        role: 'user'
      };
      return applyCustomCompanyName(acc);
    }
  } catch {}

  return null;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  activeAccount: DemoAccount;
  switchAccount: (accountEmail: string) => Promise<void>;
  signUp: (email: string, password: string, companyName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const createAccountUser = (account: DemoAccount): User => ({
    id: account.id,
    uid: account.id,
    email: account.email,
    user_metadata: { name: account.name, company: account.companyName },
    app_metadata: {},
    created_at: '2024-01-01T00:00:00.000Z'
  });

  // Determine initial account
  const getInitialAccount = (): DemoAccount => {
    try {
      const savedEmail = localStorage.getItem('active_account_email');
      if (savedEmail) {
        const found = findAccount(savedEmail);
        if (found) return found;
      }
    } catch {}
    return applyCustomCompanyName(DEMO_ACCOUNTS[0]); // Default: Kimpton Energy Solutions
  };

  const getInitialUser = (): User | null => {
    try {
      const savedEmail = localStorage.getItem('active_account_email');
      if (savedEmail) {
        const found = findAccount(savedEmail);
        if (found) return createAccountUser(found);
      }
    } catch {}
    return null;
  };

  const [activeAccount, setActiveAccount] = useState<DemoAccount>(getInitialAccount);
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [session, setSession] = useState<Session | null>(() => {
    const initUser = getInitialUser();
    return initUser ? { user: initUser, access_token: 'demo_token' } : null;
  });
  const [loading, setLoading] = useState(false);

  // Listen for company name updates so activeAccount stays perfectly synchronized
  useEffect(() => {
    const handleCompUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.company_name) {
        const newName = customEvent.detail.company_name;
        setActiveAccount(prev => ({ ...prev, companyName: newName }));
        setUser(prev => prev ? {
          ...prev,
          user_metadata: { ...(prev.user_metadata || {}), company: newName }
        } : prev);
      }
    };
    window.addEventListener('company-name-updated', handleCompUpdated);
    return () => window.removeEventListener('company-name-updated', handleCompUpdated);
  }, []);

  // Initialize master data on start for the active account
  useEffect(() => {
    const initData = async () => {
      try {
        await seedUserMasterData(activeAccount.id, activeAccount.email, activeAccount.companyName);
      } catch (err) {
        console.warn('Initial seedUserMasterData error:', err);
      }
    };
    initData();
  }, [activeAccount.id]);

  const switchAccount = async (accountEmail: string) => {
    const target = findAccount(accountEmail);
    if (!target) return;

    localStorage.setItem('active_account_email', target.email);
    setActiveAccount(target);
    const newUser = createAccountUser(target);
    setUser(newUser);
    setSession({ user: newUser, access_token: 'demo_token' });

    try {
      await seedUserMasterData(target.id, target.email, target.companyName);
    } catch (err) {
      console.warn('Seed error during switchAccount:', err);
    }

    // Quick window reload to allow all dashboard state to reload fresh
    window.location.reload();
  };

  const signUp = async (email: string, _password: string, companyName: string) => {
    return { error: null };
  };

  const signIn = async (email: string, password?: string) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const target = findAccount(cleanEmail);
    if (!target) {
      return { error: new Error(`No account found for "${email}". Please verify the email address.`) };
    }

    const expectedPassword = getRequiredPassword(cleanEmail);
    if (!password || password !== expectedPassword) {
      return { error: new Error('Invalid email or password. Please verify your credentials.') };
    }

    localStorage.setItem('active_account_email', target.email);
    setActiveAccount(target);
    const newUser = createAccountUser(target);
    setUser(newUser);
    setSession({ user: newUser, access_token: 'demo_token' });

    try {
      await seedUserMasterData(target.id, target.email, target.companyName);
    } catch (err) {
      console.warn('Seed error during signIn:', err);
    }

    return { error: null };
  };

  const signOut = async () => {
    localStorage.removeItem('active_account_email');
    setUser(null);
    setSession(null);
    setActiveAccount(DEMO_ACCOUNTS[0]);
  };

  const resetPassword = async (_email: string) => {
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      activeAccount,
      switchAccount,
      signUp,
      signIn,
      signOut,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};
