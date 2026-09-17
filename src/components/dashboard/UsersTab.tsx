import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, seedUserMasterData } from '@/integrations/supabase/client';
import { MASTER_ACCOUNT_ID, MASTER_ADMIN_EMAIL, canManageUsers, isAccountApproved, setAccountApproval } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Trash2, RotateCcw, Loader2, Shield, User as UserIcon, CheckCircle, XCircle } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  company_name: string;
  email: string | null;
  currency: string;
  base_year: number | null;
  created_at: string;
  is_approved: boolean;
}

interface UserRole {
  user_id: string;
  role: 'admin' | 'user';
}

export const UsersTab = () => {
  const { user } = useAuth();
  const isAuthorized = canManageUsers(user);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Deduplicate profiles by email and user_id
      const seenEmails = new Set<string>();
      const seenUserIds = new Set<string>();
      const uniqueProfiles: UserProfile[] = [];

      for (const p of (profiles || []) as UserProfile[]) {
        const emailKey = p.email ? p.email.trim().toLowerCase() : null;
        const userIdKey = p.user_id || p.id;

        if (emailKey && seenEmails.has(emailKey)) {
          continue;
        }
        if (userIdKey && seenUserIds.has(userIdKey)) {
          continue;
        }

        if (emailKey) seenEmails.add(emailKey);
        if (userIdKey) seenUserIds.add(userIdKey);
        uniqueProfiles.push(p);
      }

      // Enrich profiles with persistent approval overrides and company name resolution
      const enrichedProfiles = uniqueProfiles.map((p) => {
        const cleanEmail = (p.email || '').trim().toLowerCase();
        let companyName = p.company_name;

        // Check custom saved company name in localStorage
        const customName = localStorage.getItem(`custom_company_name_${p.user_id}`) ||
                           localStorage.getItem(`custom_company_name_${p.id}`) ||
                           localStorage.getItem(`custom_company_name_${cleanEmail}`);
        if (customName) {
          companyName = customName;
        } else if (cleanEmail === 'rameesraja.kn@gmail.com' || cleanEmail === 'ramesraja.kn@gmail.com' || p.user_id === '0fe57d1f-2bf8-45ba-86ce-18b139a6b195') {
          companyName = 'CarbonMash';
        } else if (cleanEmail.includes('almac')) {
          companyName = cleanEmail.includes('user') ? 'Almac Group User' : 'Almac Group';
        } else if (cleanEmail.includes('carbonmash') || cleanEmail.includes('democc')) {
          companyName = 'CarbonMash';
        } else if (cleanEmail.includes('kimpton') || cleanEmail.includes('niamh') || p.user_id === '6f7513f5-3613-4c77-a137-c73844e6eb17') {
          companyName = 'Kimpton';
        }

        // Clean up any remaining "Energy Solutions" from Kimpton
        if (companyName && companyName.toLowerCase().includes('kimpton')) {
          companyName = 'Kimpton';
        }

        return {
          ...p,
          company_name: companyName,
          is_approved: isAccountApproved({ id: p.user_id, email: p.email }, p.is_approved ?? true)
        };
      });

      setUsers(enrichedProfiles);
      setUserRoles((roles || []) as UserRole[]);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [isAuthorized]);

  const getUserRole = (userId: string, email?: string | null): 'admin' | 'user' => {
    if (email && email.toLowerCase() === 'niamh.smith@kimpton.co.uk') {
      return 'user';
    }
    const role = userRoles.find(r => r.user_id === userId);
    return role?.role || 'user';
  };

  const resetUser = async (userId: string, email?: string | null, companyName?: string | null) => {
    setRestoring(userId);
    try {
      // Remove from deleted list if present
      try {
        const raw = localStorage.getItem('carbonmash_deleted_user_ids');
        if (raw) {
          const list: string[] = JSON.parse(raw);
          const updated = list.filter(item => 
            item !== userId && 
            item !== (email ? email.toLowerCase() : '')
          );
          localStorage.setItem('carbonmash_deleted_user_ids', JSON.stringify(updated));
        }
      } catch {}

      // 1. Clear current collections for this user
      await supabase.from('emissions_data').delete().eq('user_id', userId);
      await supabase.from('clients').delete().eq('user_id', userId);
      await supabase.from('netzero_targets').delete().eq('user_id', userId);
      await supabase.from('carbon_budgets').delete().eq('user_id', userId);
      await supabase.from('sustainability_credentials').delete().eq('user_id', userId);
      await supabase.from('carbon_calc_entries').delete().eq('user_id', userId);
      await supabase.from('carbon_audit_log').delete().eq('user_id', userId);
      await supabase.from('emission_reduction_projects').delete().eq('user_id', userId);

      // 2. Re-seed master baseline data for this specific user account
      await seedUserMasterData(userId, email, companyName);

      toast.success(`Account data for ${companyName || email || 'user'} reset to default values`);
      await fetchUsers();
    } catch (err) {
      console.error('Error resetting user:', err);
      toast.error('Failed to reset user data');
    } finally {
      setRestoring(null);
    }
  };

  const toggleApproval = async (userId: string, profileId: string, email: string | null | undefined, currentlyApproved: boolean) => {
    setApproving(userId);
    const newApproved = !currentlyApproved;
    try {
      setAccountApproval(userId, email, newApproved);

      await supabase
        .from('profiles')
        .update({ is_approved: newApproved } as any)
        .eq('id', profileId);

      if (userId !== profileId) {
        await supabase
          .from('profiles')
          .update({ is_approved: newApproved } as any)
          .eq('user_id', userId);
      }

      toast.success(newApproved ? 'User access approved' : 'User access revoked');
      await fetchUsers();
    } catch (err) {
      console.error('Error toggling approval:', err);
      toast.error('Failed to update user approval');
    } finally {
      setApproving(null);
    }
  };

  const deleteUser = async (userId: string, profileId: string, email?: string | null) => {
    if (userId === MASTER_ACCOUNT_ID || email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() || email?.toLowerCase() === 'ramesraja.kn@gmail.com') {
      toast.error('Cannot delete the master account');
      return;
    }

    setDeleting(userId);
    try {
      // Record in persistent deleted list so it stays removed
      try {
        const raw = localStorage.getItem('carbonmash_deleted_user_ids');
        const list: string[] = raw ? JSON.parse(raw) : [];
        if (userId && !list.includes(userId)) list.push(userId);
        if (profileId && !list.includes(profileId)) list.push(profileId);
        if (email && !list.includes(email.trim().toLowerCase())) list.push(email.trim().toLowerCase());
        localStorage.setItem('carbonmash_deleted_user_ids', JSON.stringify(list));
      } catch {}

      // Delete user's data
      await supabase.from('emissions_data').delete().eq('user_id', userId);
      await supabase.from('clients').delete().eq('user_id', userId);
      await supabase.from('netzero_targets').delete().eq('user_id', userId);
      await supabase.from('carbon_budgets').delete().eq('user_id', userId);
      await supabase.from('sustainability_credentials').delete().eq('user_id', userId);
      await supabase.from('user_roles').delete().eq('user_id', userId);
      await supabase.from('carbon_calc_entries').delete().eq('user_id', userId);
      await supabase.from('carbon_audit_log').delete().eq('user_id', userId);
      await supabase.from('emission_reduction_projects').delete().eq('user_id', userId);
      
      // Delete profile
      await supabase.from('profiles').delete().eq('id', profileId);
      if (userId !== profileId) {
        await supabase.from('profiles').delete().eq('user_id', userId);
      }

      toast.success('User removed successfully');
      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to remove user');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-card rounded-lg border border-border">
        <Shield className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
        <h3 className="text-lg font-semibold text-foreground mb-1">Access Restricted</h3>
        <p className="text-sm text-muted-foreground">
          User Management is only accessible by authorized master accounts (rameesraja.kn@gmail.com).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage registered users. Restore users to master account values, revoke access, or remove them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((userProfile) => {
                const isMaster = userProfile.user_id === MASTER_ACCOUNT_ID || 
                  (userProfile.email && (
                    userProfile.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() ||
                    userProfile.email.toLowerCase() === 'ramesraja.kn@gmail.com'
                  ));
                const role = getUserRole(userProfile.user_id, userProfile.email);
                
                return (
                  <TableRow key={userProfile.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium text-foreground">{userProfile.company_name || 'No company'}</div>
                          <div className="text-xs text-muted-foreground">{userProfile.email || 'No email'}</div>
                        </div>
                        {isMaster && (
                          <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
                            Master
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
                        {role === 'admin' ? (
                          <><Shield className="h-3 w-3 mr-1" /> Admin</>
                        ) : (
                          <><UserIcon className="h-3 w-3 mr-1" /> User</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isMaster ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Always Active</Badge>
                      ) : userProfile.is_approved ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Approved</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">Revoked</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(userProfile.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {!isMaster && (
                        <>
                          <Button
                            variant={userProfile.is_approved ? "secondary" : "default"}
                            size="sm"
                            onClick={() => toggleApproval(userProfile.user_id, userProfile.id, userProfile.email, userProfile.is_approved)}
                            disabled={approving === userProfile.user_id}
                          >
                            {approving === userProfile.user_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : userProfile.is_approved ? (
                              <><XCircle className="h-4 w-4 mr-1 text-destructive" /> Revoke</>
                            ) : (
                              <><CheckCircle className="h-4 w-4 mr-1 text-emerald-600" /> Approve</>
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resetUser(userProfile.user_id, userProfile.email, userProfile.company_name)}
                            disabled={restoring === userProfile.user_id}
                          >
                            {restoring === userProfile.user_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <><RotateCcw className="h-4 w-4 mr-1" /> Reset</>
                            )}
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={deleting === userProfile.user_id}
                              >
                                {deleting === userProfile.user_id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <><Trash2 className="h-4 w-4 mr-1" /> Remove</>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {userProfile.company_name}? 
                                  This will delete all their data permanently.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser(userProfile.user_id, userProfile.id, userProfile.email)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
