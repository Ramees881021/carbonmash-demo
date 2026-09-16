// Master datasets for CarbonMash / Net-Z platform
// Accurately matching the exact accounts data from CSV exports
import {
  EXPORTED_PROFILES,
  EXPORTED_EMISSIONS,
  EXPORTED_TARGETS,
  EXPORTED_BUDGETS,
  EXPORTED_CREDENTIALS,
  EXPORTED_ROLES,
  EXPORTED_CALC_ENTRIES,
  EXPORTED_AUDIT_LOG
} from '@/lib/accountsExportData';

export const isKimptonUser = (email?: string | null, companyName?: string | null): boolean => {
  const e = (email || '').toLowerCase();
  const c = (companyName || '').toLowerCase();
  return e.includes('kimpton') || c.includes('kimpton') || e.includes('niamh') || e.includes('smith');
};

export const getAllExportedMasterData = () => {
  return {
    profiles: EXPORTED_PROFILES,
    emissions_data: EXPORTED_EMISSIONS,
    netzero_targets: EXPORTED_TARGETS,
    carbon_budgets: EXPORTED_BUDGETS,
    sustainability_credentials: EXPORTED_CREDENTIALS,
    user_roles: EXPORTED_ROLES,
    carbon_calc_entries: EXPORTED_CALC_ENTRIES,
    carbon_audit_log: EXPORTED_AUDIT_LOG,
  };
};

export const getAccountMasterData = (userId: string, email?: string | null, companyName?: string | null) => {
  const now = new Date().toISOString();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanCompany = (companyName || '').trim().toLowerCase();

  // 1. Direct email match from exported profiles
  let matchedProfile = EXPORTED_PROFILES.find(p => p.email && p.email.toLowerCase() === cleanEmail);

  // 2. Direct user_id match
  if (!matchedProfile && userId) {
    matchedProfile = EXPORTED_PROFILES.find(p => p.user_id === userId);
  }

  // 3. Kimpton checks
  if (!matchedProfile && (cleanEmail.includes('kimpton') || cleanCompany.includes('kimpton') || cleanEmail.includes('niamh') || cleanEmail.includes('smith'))) {
    if (cleanEmail.includes('ramees') || cleanCompany.includes('construction')) {
      matchedProfile = EXPORTED_PROFILES.find(p => p.user_id === '0fe57d1f-2bf8-45ba-86ce-18b139a6b195');
    } else {
      matchedProfile = EXPORTED_PROFILES.find(p => p.user_id === '6f7513f5-3613-4c77-a137-c73844e6eb17');
    }
  }

  // 4. Almac checks
  if (!matchedProfile && (cleanEmail.includes('almac') || cleanCompany.includes('almac'))) {
    if (cleanEmail.includes('admin')) {
      matchedProfile = EXPORTED_PROFILES.find(p => p.user_id === '0735e294-a4c6-4d06-9731-23cc6e69f780');
    } else if (cleanEmail.includes('user')) {
      matchedProfile = EXPORTED_PROFILES.find(p => p.user_id === '7222baf0-1dd3-45ef-b3d0-b4daf83be7b6');
    } else {
      matchedProfile = EXPORTED_PROFILES.find(p => p.user_id === '66109f04-8054-4835-a069-28a9ca7870f3');
    }
  }

  // 5. Default fallback
  if (!matchedProfile) {
    matchedProfile = isKimptonUser(email, companyName)
      ? EXPORTED_PROFILES.find(p => p.user_id === '6f7513f5-3613-4c77-a137-c73844e6eb17')
      : EXPORTED_PROFILES.find(p => p.user_id === '66109f04-8054-4835-a069-28a9ca7870f3');
  }

  if (!matchedProfile) {
    matchedProfile = EXPORTED_PROFILES[0];
  }

  const sourceUserId = matchedProfile.user_id;

  // Active user profile
  const profile = {
    ...matchedProfile,
    id: userId,
    user_id: userId,
    email: email || matchedProfile.email,
    updated_at: now
  };

  // Map emissions
  const sourceEmissions = EXPORTED_EMISSIONS.filter(e => e.user_id === sourceUserId);
  const emissions_data = sourceEmissions.map(e => ({
    ...e,
    id: `${userId}_emissions_${e.reporting_year}`,
    user_id: userId,
    updated_at: now
  }));

  // Map targets
  const sourceTargets = EXPORTED_TARGETS.filter(t => t.user_id === sourceUserId);
  const netzero_targets = sourceTargets.map((t, idx) => ({
    ...t,
    id: `${userId}_target_${idx}`,
    user_id: userId,
    updated_at: now
  }));

  // Map budgets
  const sourceBudgets = EXPORTED_BUDGETS.filter(b => b.user_id === sourceUserId);
  const carbon_budgets = sourceBudgets.map((b, idx) => ({
    ...b,
    id: `${userId}_budget_${idx}`,
    user_id: userId,
    updated_at: now
  }));

  // Map credentials
  const sourceCreds = EXPORTED_CREDENTIALS.filter(c => c.user_id === sourceUserId);
  const sustainability_credentials = sourceCreds.map((c, idx) => ({
    ...c,
    id: `${userId}_cred_${idx}`,
    user_id: userId,
    updated_at: now
  }));

  // Map roles
  const sourceRoles = EXPORTED_ROLES.filter(r => r.user_id === sourceUserId);
  const user_roles = sourceRoles.length > 0
    ? sourceRoles.map((r, idx) => ({ ...r, id: `${userId}_role_${idx}`, user_id: userId }))
    : [{ id: `${userId}_role_admin`, user_id: userId, role: 'admin', created_at: now, updated_at: now }];

  // Map calc entries
  const sourceCalc = EXPORTED_CALC_ENTRIES.filter(c => c.user_id === sourceUserId);
  const carbon_calc_entries = sourceCalc.map((c, idx) => ({
    ...c,
    id: `${userId}_calc_${idx}`,
    user_id: userId,
    updated_at: now
  }));

  // Map audit log
  const sourceAudit = EXPORTED_AUDIT_LOG.filter(a => a.user_id === sourceUserId);
  const carbon_audit_log = sourceAudit.map((a, idx) => ({
    ...a,
    id: `${userId}_audit_${idx}`,
    user_id: userId,
    created_at: a.created_at || now
  }));

  // Clients & reduction projects
  const isKimpton = (profile.company_name || '').toLowerCase().includes('kimpton');
  const clientRecords = isKimpton ? [
    { name: 'Pfizer', country: 'United States', revenue: 12000000, apportioned: 1695 },
    { name: 'Roche', country: 'Switzerland', revenue: 9500000, apportioned: 1341 },
    { name: 'Novartis', country: 'Switzerland', revenue: 8000000, apportioned: 1130 },
    { name: 'AstraZeneca', country: 'United Kingdom', revenue: 6500000, apportioned: 918 },
    { name: 'GSK', country: 'United Kingdom', revenue: 5000000, apportioned: 706 },
  ] : [
    { name: 'Novartis', country: 'Switzerland', revenue: 28000000, apportioned: 14200 },
    { name: 'Roche', country: 'Switzerland', revenue: 24000000, apportioned: 12100 },
    { name: 'Pfizer', country: 'United States', revenue: 22000000, apportioned: 11500 },
    { name: 'Merck & Co.', country: 'United States', revenue: 18000000, apportioned: 9400 },
    { name: 'Bristol Myers Squibb', country: 'United States', revenue: 16000000, apportioned: 8200 },
  ];

  const clients: any[] = [];
  const years = emissions_data.map(e => e.reporting_year);
  const targetYears = years.length > 0 ? years.slice(-2) : [2023, 2024];
  targetYears.forEach(yr => {
    clientRecords.forEach(c => {
      clients.push({
        id: `${userId}_client_${yr}_${c.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        user_id: userId,
        company_name: c.name,
        country: c.country,
        revenue: c.revenue,
        reporting_year: yr,
        apportioned_emissions: c.apportioned,
        created_at: now,
        updated_at: now
      });
    });
  });

  const emission_reduction_projects = isKimpton ? [
    {
      id: `${userId}_proj_cx0201`,
      user_id: userId,
      project_code: 'CX-0201',
      project_name: 'High-Efficiency LED Retrofit (Offices & Yards)',
      name: 'High-Efficiency LED Retrofit (Offices & Yards)',
      technology_category: 'LED Lighting',
      category: 'Energy Efficiency',
      scope_targeted: 'Scope 2',
      scope: 'Scope 2',
      status: 'Implemented',
      stage: 'Implemented',
      start_year: 2022,
      end_year: 2023,
      total_investment: 45000,
      project_cost: 45000,
      capital_cost: 45000,
      annual_co2e_abatement: 65,
      annual_emission_savings: 65,
      estimated_annual_reduction: 65,
      description: 'Comprehensive upgrade to smart commercial LED fittings with automated daylight harvesting across all Kimpton branch facilities.',
      created_at: now,
      updated_at: now
    },
    {
      id: `${userId}_proj_cx0202`,
      user_id: userId,
      project_code: 'CX-0202',
      project_name: 'Commercial Air Source Heat Pump Installation',
      name: 'Commercial Air Source Heat Pump Installation',
      technology_category: 'Heat Pump',
      category: 'Thermal Decarbonisation',
      scope_targeted: 'Scope 1',
      scope: 'Scope 1',
      status: 'Implemented',
      stage: 'Implemented',
      start_year: 2023,
      end_year: 2024,
      total_investment: 120000,
      project_cost: 120000,
      capital_cost: 120000,
      annual_co2e_abatement: 140,
      annual_emission_savings: 140,
      estimated_annual_reduction: 140,
      description: 'Decarbonising space heating by replacing legacy gas boilers with modular air-to-water heat pumps and hydronic balancing.',
      created_at: now,
      updated_at: now
    },
    {
      id: `${userId}_proj_cx0203`,
      user_id: userId,
      project_code: 'CX-0203',
      project_name: 'Electric Van Transition & Depot Charging (Phase 1)',
      name: 'Electric Van Transition & Depot Charging (Phase 1)',
      technology_category: 'EV Fleet',
      category: 'Clean Transport',
      scope_targeted: 'Scope 1',
      scope: 'Scope 1',
      status: 'In Progress',
      stage: 'In Progress',
      start_year: 2024,
      end_year: 2025,
      total_investment: 210000,
      project_cost: 210000,
      capital_cost: 210000,
      annual_co2e_abatement: 160,
      annual_emission_savings: 160,
      estimated_annual_reduction: 160,
      description: 'Replacing 18 diesel service vans with custom-racked BEVs and commissioning 22kW dual-outlet depot AC charge points.',
      created_at: now,
      updated_at: now
    }
  ] : [
    {
      id: `${userId}_proj_almac_solar`,
      user_id: userId,
      project_code: 'ALM-0101',
      project_name: 'Site-wide Solar PV Installation (2.4 MWp)',
      name: 'Site-wide Solar PV Installation (2.4 MWp)',
      technology_category: 'Solar PV',
      category: 'Solar PV',
      scope_targeted: 'Scope 2',
      scope: 'Scope 2',
      status: 'In Progress',
      stage: 'In Progress',
      start_year: 2024,
      end_year: 2025,
      total_investment: 1850000,
      project_cost: 1850000,
      capital_cost: 1850000,
      annual_co2e_abatement: 1420,
      annual_emission_savings: 1420,
      estimated_annual_reduction: 1420,
      description: 'Solar PV installation across manufacturing facility rooftops.',
      created_at: now,
      updated_at: now
    }
  ];

  return {
    profiles: [profile],
    user_roles,
    emissions_data,
    clients,
    netzero_targets,
    carbon_budgets,
    sustainability_credentials,
    emission_reduction_projects,
    carbon_calc_entries,
    carbon_audit_log
  };
};

export const getDefaultMasterData = (userId: string, email?: string | null, companyName?: string | null) => {
  return getAccountMasterData(userId, email, companyName);
};

export const getKimptonMasterData = (userId: string) => {
  return getAccountMasterData(userId, 'niamh.smith@kimpton.co.uk', 'Kimpton Energy Solutions');
};

export const getAlmacMasterData = (userId: string) => {
  return getAccountMasterData(userId, 'demo@almacgroup.com', 'Almac Group');
};
