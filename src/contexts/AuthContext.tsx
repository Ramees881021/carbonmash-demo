import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, seedUserMasterData } from '@/integrations/supabase/client';

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
    companyName: 'Kimpton Energy Solutions',
    role: 'admin'
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
    companyName: 'Kimpton',
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
  }
];

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
  // Determine initial account
  const getInitialAccount = (): DemoAccount => {
    try {
      const savedEmail = localStorage.getItem('active_account_email');
      if (savedEmail) {
        const found = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === savedEmail.toLowerCase());
        if (found) return found;
      }
    } catch {}
    return DEMO_ACCOUNTS[0]; // Default: Kimpton Energy Solutions
  };

  const [activeAccount, setActiveAccount] = useState<DemoAccount>(getInitialAccount);

  const createAccountUser = (account: DemoAccount): User => ({
    id: account.id,
    uid: account.id,
    email: account.email,
    user_metadata: { name: account.name, company: account.companyName },
    app_metadata: {},
    created_at: '2024-01-01T00:00:00.000Z'
  });

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize master data on start
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
    const target = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === accountEmail.toLowerCase());
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

  const signIn = async (email: string, _password: string) => {
    const target = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (!target) {
      return { error: new Error('No demo account matches this email address.') };
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
