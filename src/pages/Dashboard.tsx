import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard, DashboardProvider } from '@/contexts/DashboardContext';
import { useMode, ModeProvider } from '@/contexts/ModeContext';
import { supabase, seedUserMasterData } from '@/integrations/supabase/client';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { OverviewTab } from '@/components/dashboard/OverviewTab';
import { EmissionsTab } from '@/components/dashboard/EmissionsTab';
import { CarbonCalculatorTab } from '@/components/dashboard/CarbonCalculatorTab';
import { ScorecardTab } from '@/components/dashboard/ScorecardTab';
import { ClientsTab } from '@/components/dashboard/ClientsTab';
import { NetZeroTab } from '@/components/dashboard/NetZeroTab';
import { CarbonBudgetTab } from '@/components/dashboard/CarbonBudgetTab';
import { OrganisationTab } from '@/components/dashboard/OrganisationTab';
import { ReportingTab } from '@/components/dashboard/ReportingTab';
import { PredictiveAnalyticsTab } from '@/components/dashboard/PredictiveAnalyticsTab';
import { UsersTab } from '@/components/dashboard/UsersTab';
import { DocumentsManagementTab } from '@/components/dashboard/DocumentsManagementTab';
import { DatabaseTab } from '@/components/dashboard/carbon-calculator/DatabaseTab';
import { AuditTrailTab } from '@/components/dashboard/carbon-calculator/AuditTrailTab';
import { CarbonDashboardTab } from '@/components/dashboard/carbon-calculator/CarbonDashboardTab';
import { AlmacLogo } from '@/components/ui/AlmacLogo';
import { CompanyHeaderLogo } from '@/components/ui/CompanyHeaderLogo';
import { Card } from '@/components/ui/card';
import { isKimptonUser } from '@/lib/defaultData';
import { Loader2, ShieldAlert, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdmin, canManageUsers, isAccountApproved } from '@/hooks/useAdmin';
import { useMasterDataCopy } from '@/hooks/useMasterDataCopy';
import { Button } from '@/components/ui/button';

type TabType = 'overview' | 'emissions' | 'carbon-calculator' | 'carbon-calculator-database' | 'carbon-calculator-audit-trail' | 'carbon-calculator-dashboard' | 'scorecard' | 'clients' | 'netzero' | 'carbonbudget' | 'organisation' | 'organisation-documents' | 'reporting' | 'predictive' | 'users';

interface Profile {
  id: string;
  user_id: string;
  company_name: string;
  industry: string | null;
  company_size: string | null;
  currency: string;
  base_year: number | null;
  is_approved?: boolean;
}

const DashboardContent = () => {
  const { user, signOut } = useAuth();
  const { setCurrency, setBaseYear, setPeriodPattern, setReportingPeriodStart, setReportingPeriodEnd, selectedYear, setSelectedYear: setSelectedYearWithPattern, setSelectedYearOnly: setSelectedYear } = useDashboard();
  const { isPresenterMode } = useMode();
  const { isAdmin, hasUserManagement } = useAdmin();
  const isUserManagementAllowed = hasUserManagement || canManageUsers(user);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const isApproved = isAccountApproved({ id: user?.id, email: user?.email }, (profile as any)?.is_approved ?? true);

  // Copy master data on first login if user has no data yet
  useMasterDataCopy(user?.id);

  // Reset to valid tab when switching modes or if not authorized for user management
  useEffect(() => {
    const businessOnlyTabs: TabType[] = ['predictive', 'scorecard', 'clients', 'carbonbudget', 'reporting', 'users', 'organisation-documents'];
    if (isPresenterMode && businessOnlyTabs.includes(activeTab)) {
      setActiveTab('overview');
    }
    if (activeTab === 'users' && !isUserManagementAllowed) {
      setActiveTab('overview');
    }
  }, [isPresenterMode, activeTab, isUserManagementAllowed]);

  // Listen for company name updates from Organisation tab
  useEffect(() => {
    const handleCompanyNameUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.company_name) {
        setProfile((prev) => prev ? { ...prev, company_name: customEvent.detail.company_name } : prev);
      }
    };
    window.addEventListener('company-name-updated', handleCompanyNameUpdated);
    return () => {
      window.removeEventListener('company-name-updated', handleCompanyNameUpdated);
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        try {
          await seedUserMasterData(user.id, user.email);
        } catch (err) {
          console.warn('Dashboard seedUserMasterData error:', err);
        }
        
        // Fetch profile and latest emissions year in parallel
        const [profileRes, emissionsRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('emissions_data')
            .select('reporting_year')
            .eq('user_id', user.id)
            .order('reporting_year', { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);
        
        // Determine the best default year: latest year with data, or current-1
        const latestDataYear = emissionsRes.data?.reporting_year ?? null;
        
        const approvedStatus = isAccountApproved({ id: user.id, email: user.email }, profileRes.data?.is_approved ?? true);
        const isRamees = (user.email || '').toLowerCase().includes('ramees');
        const isKimpton = !isRamees && isKimptonUser(user.email, profileRes.data?.company_name);
        const isAlmac = (user.email || '').toLowerCase().includes('almac') || (profileRes.data?.company_name || '').toLowerCase().includes('almac');
        const isCarbonmash = isRamees || (user.email || '').toLowerCase().includes('carbonmash') || (profileRes.data?.company_name || '').toLowerCase().includes('carbonmash');
        
        const defaultCompanyName = isKimpton 
          ? 'Kimpton' 
          : (isAlmac ? ((user.email || '').toLowerCase().includes('user') ? 'Almac Group User' : 'Almac Group') : 'CarbonMash');

        const defaultIndustry = isKimpton 
          ? 'Facilities & Energy Solutions' 
          : (isAlmac ? 'Pharmaceuticals & Biotechnology' : 'Carbon Management & Clean Tech');

        const savedCustomName = localStorage.getItem(`custom_company_name_${user.id}`) ||
                                (user.email ? localStorage.getItem(`custom_company_name_${user.email.toLowerCase()}`) : null) ||
                                (profileRes.data?.id ? localStorage.getItem(`custom_company_name_${profileRes.data.id}`) : null);

        const profileData = (profileRes.data as any) || {
          id: user.id,
          user_id: user.id,
          company_name: savedCustomName || defaultCompanyName,
          industry: defaultIndustry,
          currency: 'GBP',
          base_year: 2021,
          is_approved: approvedStatus,
        };
        if (savedCustomName) {
          profileData.company_name = savedCustomName;
        }
        profileData.is_approved = approvedStatus;

        setProfile(profileData);
        setCurrency(profileData.currency || 'GBP');
        setBaseYear(profileData.base_year || 2021);

        // Load saved period pattern
        const p = profileData;
        let pattern: { startMonth: number; startDay: number; endMonth: number; endDay: number } | null = null;
        if (p.period_start_month && p.period_end_month) {
          pattern = {
            startMonth: p.period_start_month,
            startDay: p.period_start_day || 1,
            endMonth: p.period_end_month,
            endDay: p.period_end_day || 31,
          };
          setPeriodPattern(pattern);
        }
        
        // Set year to latest data year if available
        const yearToSet = latestDataYear || 2024;
        if (pattern) {
          const startYear = pattern.startMonth > pattern.endMonth ? yearToSet - 1 : yearToSet;
          setReportingPeriodStart(new Date(startYear, pattern.startMonth - 1, pattern.startDay));
          setReportingPeriodEnd(new Date(yearToSet, pattern.endMonth - 1, pattern.endDay));
        }
        setSelectedYear(yearToSet);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    if (updatedProfile.currency) {
      setCurrency(updatedProfile.currency);
    }
    if (updatedProfile.base_year !== undefined) {
      setBaseYear(updatedProfile.base_year);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        profile={profile}
        onProfileUpdate={handleProfileUpdate}
        isAdmin={isAdmin}
        hasUserManagement={isUserManagementAllowed}
        isApproved={isApproved}
      />
      <div className="flex-1 flex flex-col ml-64">
        {/* Top header bar with logo */}
        <div className="w-full py-3 px-6 flex items-center justify-center border-b bg-card">
          <CompanyHeaderLogo companyName={profile?.company_name} userEmail={user?.email} logoUrl={(profile as any)?.logo_url} className="h-10" />
        </div>

        {!isApproved ? (
          <div className="flex-1 flex items-center justify-center p-8 bg-muted/20">
            <Card className="max-w-md w-full border-destructive/30 shadow-md bg-card text-center p-8 space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Account Access Revoked
                </h2>
                <p className="text-sm text-muted-foreground">
                  Access for <span className="font-semibold text-foreground">{user?.email || 'this user'}</span> ({profile?.company_name}) has been revoked by the administrator.
                </p>
              </div>
              <div className="p-3 bg-muted/60 rounded-md text-xs text-muted-foreground leading-relaxed">
                You cannot view emissions data or platform tools while your account is revoked. If you need access restored, please contact the administrator at <span className="font-semibold text-foreground">rameesraja.kn@gmail.com</span>.
              </div>
              <div className="pt-3 flex justify-center">
                <Button variant="outline" onClick={signOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <>
            <DashboardHeader />
            <main className={cn(
              "flex-1 p-6 overflow-auto transition-all duration-300",
              "animate-fade-in"
            )}>
              {activeTab === 'organisation' && <OrganisationTab />}
              {activeTab === 'organisation-documents' && !isPresenterMode && isAdmin && <DocumentsManagementTab />}
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'predictive' && !isPresenterMode && <PredictiveAnalyticsTab />}
              {activeTab === 'emissions' && <EmissionsTab />}
              {activeTab === 'carbon-calculator' && <CarbonCalculatorTab />}
              {activeTab === 'carbon-calculator-database' && <DatabaseTab />}
              {activeTab === 'carbon-calculator-audit-trail' && <AuditTrailTab />}
              {activeTab === 'carbon-calculator-dashboard' && <CarbonDashboardTab />}
              {activeTab === 'scorecard' && !isPresenterMode && <ScorecardTab />}
              {activeTab === 'clients' && !isPresenterMode && <ClientsTab />}
              {activeTab === 'netzero' && <NetZeroTab />}
              {activeTab === 'carbonbudget' && !isPresenterMode && <CarbonBudgetTab />}
              {activeTab === 'reporting' && !isPresenterMode && <ReportingTab />}
              {activeTab === 'users' && !isPresenterMode && isAdmin && isUserManagementAllowed && <UsersTab />}
            </main>
          </>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <ModeProvider>
      <DashboardProvider>
        <DashboardContent />
      </DashboardProvider>
    </ModeProvider>
  );
};

export default Dashboard;
