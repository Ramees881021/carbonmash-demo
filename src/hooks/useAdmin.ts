import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Master account user ID & email
export const MASTER_ACCOUNT_ID = '0fe57d1f-2bf8-45ba-86ce-18b139a6b195';
export const MASTER_ADMIN_EMAIL = 'rameesraja.kn@gmail.com';

const APPROVALS_STORAGE_KEY = 'carbonmash_account_approvals';

export const canManageUsers = (user: { email?: string | null; id?: string } | null | undefined): boolean => {
  if (!user) return false;
  const cleanEmail = (user.email || '').trim().toLowerCase();
  const emailMatch = cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase() || cleanEmail === 'ramesraja.kn@gmail.com';
  const idMatch = user.id === MASTER_ACCOUNT_ID;
  return emailMatch || idMatch;
};

export const getAccountApprovalOverrides = (): Record<string, boolean> => {
  try {
    const raw = localStorage.getItem(APPROVALS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const setAccountApproval = (
  userId: string,
  email: string | null | undefined,
  isApproved: boolean
) => {
  try {
    const overrides = getAccountApprovalOverrides();
    if (userId) overrides[userId] = isApproved;
    if (email) overrides[email.trim().toLowerCase()] = isApproved;
    localStorage.setItem(APPROVALS_STORAGE_KEY, JSON.stringify(overrides));
  } catch (e) {
    console.warn('Could not save approval override:', e);
  }
};

export const isAccountApproved = (
  user: { id?: string; email?: string | null } | null | undefined,
  defaultApproved = true
): boolean => {
  if (!user) return false;
  // Master account is always approved
  if (canManageUsers(user)) return true;

  const overrides = getAccountApprovalOverrides();
  if (user.email && overrides[user.email.trim().toLowerCase()] !== undefined) {
    return overrides[user.email.trim().toLowerCase()];
  }
  if (user.id && overrides[user.id] !== undefined) {
    return overrides[user.id];
  }
  return defaultApproved;
};


export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      if (user.email?.toLowerCase() === 'niamh.smith@kimpton.co.uk') {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const hasUserManagement = canManageUsers(user);

  return { isAdmin, hasUserManagement, loading };
};

