import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as signOutFirebase, 
  sendPasswordResetEmail,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  QueryConstraint
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  deleteObject, 
  listAll 
} from 'firebase/storage';

// Firebase Config from Env variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase services
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// MASTER account ID configuration matching original code
const MASTER_ACCOUNT_ID = '0fe57d1f-2bf8-45ba-86ce-18b139a6b195';

// Compatibility types to mock Supabase User and Session
export interface User {
  id: string;
  email: string;
  email_confirmed_at: string;
  phone: string;
  created_at: string;
  updated_at: string;
  role: string;
  aud: string;
}

export interface Session {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: User;
}

const mapFirebaseUserToSupabase = (firebaseUser: any): User | null => {
  if (!firebaseUser) return null;
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    email_confirmed_at: new Date().toISOString(),
    phone: firebaseUser.phoneNumber || '',
    created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
    updated_at: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
    role: 'authenticated',
    aud: 'authenticated',
  };
};

const mapFirebaseUserToSession = (firebaseUser: any): Session | null => {
  if (!firebaseUser) return null;
  const user = mapFirebaseUserToSupabase(firebaseUser);
  if (!user) return null;
  return {
    access_token: 'mock-firebase-token-' + firebaseUser.uid,
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: 'mock-firebase-refresh-token',
    user,
  };
};

// Local Storage Seed Data Seeder for Net-Z Platform
function getLocalStorageSeedData(tableName: string, userId: string): any[] {
  if (tableName === 'user_roles') {
    return [
      {
        id: crypto.randomUUID(),
        user_id: userId,
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
  
  if (tableName === 'profiles') {
    return [
      {
        id: userId,
        user_id: userId,
        company_name: 'Almac Group',
        industry: 'Pharmaceuticals',
        company_size: '1000-5000',
        currency: 'GBP',
        base_year: 2021,
        is_approved: true,
        period_start_month: 1,
        period_start_day: 1,
        period_end_month: 12,
        period_end_day: 31,
        summary: 'Leading pharmaceutical development and manufacturing partner, tracking emissions across all scopes to achieve net-zero target.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  if (tableName === 'emissions_data') {
    return [
      {
        id: crypto.randomUUID(),
        user_id: userId,
        reporting_year: 2021,
        scope_1_emissions: 1500,
        scope_2_emissions: 2400,
        scope_2_location_based: 2500,
        scope_3_emissions: 12000,
        revenue: 50000000,
        ecovadis_score: 55,
        cdp_score: 'B',
        sbti_target_status: 'committed',
        scope3_breakdown: {
          purchased_goods: 6000,
          capital_goods: 1500,
          fuel_energy: 1000,
          upstream_transport: 800,
          waste: 200,
          business_travel: 1200,
          employee_commuting: 800,
          upstream_leased: 500
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        reporting_year: 2022,
        scope_1_emissions: 1420,
        scope_2_emissions: 2200,
        scope_2_location_based: 2300,
        scope_3_emissions: 11500,
        revenue: 55000000,
        ecovadis_score: 60,
        cdp_score: 'B',
        sbti_target_status: 'committed',
        scope3_breakdown: {
          purchased_goods: 5800,
          capital_goods: 1400,
          fuel_energy: 950,
          upstream_transport: 750,
          waste: 180,
          business_travel: 1150,
          employee_commuting: 770,
          upstream_leased: 500
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        reporting_year: 2023,
        scope_1_emissions: 1350,
        scope_2_emissions: 1950,
        scope_2_location_based: 2100,
        scope_3_emissions: 10800,
        revenue: 62000000,
        ecovadis_score: 68,
        cdp_score: 'A-',
        sbti_target_status: 'approved',
        scope3_breakdown: {
          purchased_goods: 5400,
          capital_goods: 1300,
          fuel_energy: 900,
          upstream_transport: 700,
          waste: 150,
          business_travel: 1100,
          employee_commuting: 750,
          upstream_leased: 500
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        reporting_year: 2024,
        scope_1_emissions: 1210,
        scope_2_emissions: 1700,
        scope_2_location_based: 1800,
        scope_3_emissions: 9900,
        revenue: 70000000,
        ecovadis_score: 75,
        cdp_score: 'A-',
        sbti_target_status: 'approved',
        scope3_breakdown: {
          purchased_goods: 4900,
          capital_goods: 1200,
          fuel_energy: 850,
          upstream_transport: 650,
          waste: 120,
          business_travel: 1000,
          employee_commuting: 700,
          upstream_leased: 480
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        reporting_year: 2025,
        scope_1_emissions: 1050,
        scope_2_emissions: 1450,
        scope_2_location_based: 1500,
        scope_3_emissions: 8800,
        revenue: 80000000,
        ecovadis_score: 82,
        cdp_score: 'A',
        sbti_target_status: 'approved',
        scope3_breakdown: {
          purchased_goods: 4300,
          capital_goods: 1100,
          fuel_energy: 800,
          upstream_transport: 600,
          waste: 100,
          business_travel: 900,
          employee_commuting: 600,
          upstream_leased: 400
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  if (tableName === 'clients') {
    return [
      {
        id: crypto.randomUUID(),
        user_id: userId,
        company_name: 'Pfizer',
        country: 'United States',
        reporting_year: 2025,
        revenue: 12000000,
        apportioned_emissions: 1695,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        company_name: 'Roche',
        country: 'Switzerland',
        reporting_year: 2025,
        revenue: 9500000,
        apportioned_emissions: 1341,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        company_name: 'Novartis',
        country: 'Switzerland',
        reporting_year: 2025,
        revenue: 8000000,
        apportioned_emissions: 1130,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        company_name: 'AstraZeneca',
        country: 'United Kingdom',
        reporting_year: 2025,
        revenue: 6500000,
        apportioned_emissions: 918,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        company_name: 'GSK',
        country: 'United Kingdom',
        reporting_year: 2025,
        revenue: 5000000,
        apportioned_emissions: 706,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  if (tableName === 'netzero_targets') {
    return [
      {
        id: crypto.randomUUID(),
        user_id: userId,
        base_year: 2021,
        near_term_target_year: 2030,
        netzero_target_year: 2040,
        scope_1_2_reduction_percent: 50,
        scope_3_reduction_percent: 42,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  if (tableName === 'carbon_budgets') {
    return [
      {
        id: crypto.randomUUID(),
        user_id: userId,
        discount_rate: 3.5,
        scope_1_carbon_cost: 95,
        scope_2_carbon_cost: 95,
        scope_3_carbon_cost: 50,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  if (tableName === 'sustainability_credentials') {
    return [
      {
        id: crypto.randomUUID(),
        user_id: userId,
        credential_name: 'EcoVadis Gold Medal',
        credential_type: 'ecovadis',
        score_or_level: 'Gold',
        status: 'Active',
        valid_until: '2026-12-31',
        display_order: 1,
        logo_url: null,
        certificate_url: null,
        attachment_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        credential_name: 'CDP Climate Change A-',
        credential_type: 'cdp',
        score_or_level: 'A-',
        status: 'Active',
        valid_until: '2026-12-31',
        display_order: 2,
        logo_url: null,
        certificate_url: null,
        attachment_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        credential_name: 'SBTi Net-Zero Approved Target',
        credential_type: 'sbti',
        score_or_level: 'Approved',
        status: 'Active',
        valid_until: '2030-12-31',
        display_order: 3,
        logo_url: null,
        certificate_url: null,
        attachment_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  if (tableName === 'emission_reduction_projects') {
    return [
      {
        id: crypto.randomUUID(),
        user_id: userId,
        name: 'Solar Array Installation',
        description: 'Installed 500kW solar panel system on manufacturing building roof.',
        scope_type: 'scope_2',
        status: 'Completed',
        project_cost: 250000,
        annual_emission_savings: 180,
        start_year: 2022,
        end_year: 2023,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        name: 'Boiler Electrification',
        description: 'Replace natural gas steam boilers with high efficiency electric boilers.',
        scope_type: 'scope_1',
        status: 'In Progress',
        project_cost: 480000,
        annual_emission_savings: 320,
        start_year: 2024,
        end_year: 2026,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        name: 'EV Fleet Conversion',
        description: 'Convert corporate sales and logistics fleet to 100% electric vehicles.',
        scope_type: 'scope_1',
        status: 'Planned',
        project_cost: 350000,
        annual_emission_savings: 140,
        start_year: 2025,
        end_year: 2028,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  if (tableName === 'industry_benchmarks') {
    return [
      {
        id: crypto.randomUUID(),
        company_name: 'Industry Average (Pharma)',
        industry: 'Pharmaceuticals',
        year: 2025,
        avg_scope_1_intensity: 15.2,
        avg_scope_2_intensity: 22.4,
        avg_scope_3_intensity: 118.5,
        avg_ecovadis_score: 64,
        avg_cdp_score: 'B',
        sbti_adoption_rate: 45,
        is_leader: false,
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        company_name: 'Sustainability Leaders (Pharma)',
        industry: 'Pharmaceuticals',
        year: 2025,
        avg_scope_1_intensity: 8.5,
        avg_scope_2_intensity: 11.2,
        avg_scope_3_intensity: 82.0,
        avg_ecovadis_score: 78,
        avg_cdp_score: 'A',
        sbti_adoption_rate: 90,
        is_leader: true,
        created_at: new Date().toISOString()
      }
    ];
  }

  if (tableName === 'carbon_calc_entries') {
    return [
      {
        id: crypto.randomUUID(),
        user_id: userId,
        reporting_year: 2025,
        scope: 1,
        category: 'fuel_energy',
        sub_category: 'Natural Gas',
        amount_tco2e: 450,
        description: 'Facility heating boilers natural gas consumption',
        emission_factor: 0.18387,
        emission_factor_source: 'DEFRA 2025 - Natural Gas',
        data_quality: 'High',
        confidence_score: 95,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        reporting_year: 2025,
        scope: 2,
        category: 'fuel_energy',
        sub_category: 'Electricity',
        amount_tco2e: 820,
        description: 'Purchased electricity grid consumption for HQ office',
        emission_factor: 0.20707,
        emission_factor_source: 'DEFRA 2025 - UK Electricity',
        data_quality: 'Medium',
        confidence_score: 85,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        reporting_year: 2025,
        scope: 3,
        category: 'business_travel',
        sub_category: 'Flights',
        amount_tco2e: 120,
        description: 'Transatlantic business travel flights for sales team',
        emission_factor: 0.15,
        emission_factor_source: 'DEFRA 2025 - Business Travel Flights',
        data_quality: 'High',
        confidence_score: 90,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        reporting_year: 2025,
        scope: 3,
        category: 'purchased_goods',
        sub_category: 'SaaS Software',
        amount_tco2e: 80,
        description: 'Cloud hosting and software subscription licenses',
        emission_factor: 0.08,
        emission_factor_source: 'DEFRA 2025 - IT Services',
        data_quality: 'Medium',
        confidence_score: 80,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  return [];
}

// Chainable Firebase Query Builder imitating Supabase's PostgREST client
class FirebaseQueryBuilder {
  private tableName: string;
  private db: any;
  private filters: Array<{ column: string; operator: '==' | '!=' | 'in'; value: any }> = [];
  private sortOrder: { column: string; ascending: boolean } | null = null;
  private limitVal: number | null = null;
  private dataToInsertOrUpdate: any = null;
  private isInsert = false;
  private isUpdate = false;
  private isDelete = false;
  private isUpsert = false;

  constructor(tableName: string, db: any) {
    this.tableName = tableName;
    this.db = db;
  }

  select(columns: string = '*') {
    return this;
  }

  eq(column: string, value: any) {
    if (value !== undefined && value !== null) {
      this.filters.push({ column, operator: '==', value });
    }
    return this;
  }

  neq(column: string, value: any) {
    if (value !== undefined && value !== null) {
      this.filters.push({ column, operator: '!=', value });
    }
    return this;
  }

  in(column: string, values: any[]) {
    if (values && values.length > 0) {
      this.filters.push({ column, operator: 'in', value: values });
    }
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.sortOrder = { column, ascending: options?.ascending !== false };
    return this;
  }

  limit(limitVal: number) {
    this.limitVal = limitVal;
    return this;
  }

  insert(data: any) {
    this.isInsert = true;
    this.dataToInsertOrUpdate = data;
    return this;
  }

  update(data: any) {
    this.isUpdate = true;
    this.dataToInsertOrUpdate = data;
    return this;
  }

  upsert(data: any, options?: any) {
    this.isUpsert = true;
    this.dataToInsertOrUpdate = data;
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  private async executeFirestore() {
    const colRef = collection(this.db, this.tableName);
    const constraints: QueryConstraint[] = [];
    
    for (const f of this.filters) {
      constraints.push(where(f.column, f.operator, f.value));
    }
    if (this.sortOrder) {
      constraints.push(orderBy(this.sortOrder.column, this.sortOrder.ascending ? 'asc' : 'desc'));
    }
    if (this.limitVal !== null) {
      constraints.push(limit(this.limitVal));
    }

    if (this.isInsert) {
      const rows = Array.isArray(this.dataToInsertOrUpdate) 
        ? this.dataToInsertOrUpdate 
        : [this.dataToInsertOrUpdate];
      
      const insertedRows: any[] = [];
      for (const row of rows) {
        const newId = row.id || crypto.randomUUID();
        const docData = {
          ...row,
          id: newId,
          created_at: row.created_at || new Date().toISOString(),
          updated_at: row.updated_at || new Date().toISOString(),
        };
        const docRef = doc(colRef, newId);
        await setDoc(docRef, docData);
        insertedRows.push(docData);
      }
      return { data: Array.isArray(this.dataToInsertOrUpdate) ? insertedRows : insertedRows[0], error: null };
    }

    if (this.isUpdate) {
      const q = query(colRef, ...constraints);
      const snapshot = await getDocs(q);
      const updatedRows: any[] = [];
      
      for (const d of snapshot.docs) {
        const docRef = doc(this.db, this.tableName, d.id);
        const updateData = {
          ...this.dataToInsertOrUpdate,
          updated_at: new Date().toISOString(),
        };
        await updateDoc(docRef, updateData);
        updatedRows.push({ ...d.data(), ...updateData });
      }
      return { data: updatedRows, error: null };
    }

    if (this.isUpsert) {
      const rows = Array.isArray(this.dataToInsertOrUpdate)
        ? this.dataToInsertOrUpdate
        : [this.dataToInsertOrUpdate];
      
      const upsertedRows: any[] = [];
      for (const row of rows) {
        let existingDocId: string | null = null;

        if (row.id) {
          existingDocId = row.id;
        } else if (this.tableName === 'profiles' && row.user_id) {
          existingDocId = row.user_id;
        } else {
          let uniqueQueries: QueryConstraint[] = [];
          if (row.user_id) uniqueQueries.push(where('user_id', '==', row.user_id));
          if (row.credential_type) uniqueQueries.push(where('credential_type', '==', row.credential_type));

          if (uniqueQueries.length > 0) {
            const q = query(colRef, ...uniqueQueries);
            const snap = await getDocs(q);
            if (!snap.empty) {
              existingDocId = snap.docs[0].id;
            }
          }
        }

        const id = existingDocId || crypto.randomUUID();
        const docRef = doc(colRef, id);
        
        const docData = {
          ...row,
          id: id,
          updated_at: new Date().toISOString(),
        };
        if (!existingDocId) {
          docData.created_at = row.created_at || new Date().toISOString();
        }

        await setDoc(docRef, docData, { merge: true });
        upsertedRows.push(docData);
      }
      return { data: Array.isArray(this.dataToInsertOrUpdate) ? upsertedRows : upsertedRows[0], error: null };
    }

    if (this.isDelete) {
      const q = query(colRef, ...constraints);
      const snapshot = await getDocs(q);
      for (const d of snapshot.docs) {
        const docRef = doc(this.db, this.tableName, d.id);
        await deleteDoc(docRef);
      }
      return { data: null, error: null };
    }

    // Default: GET
    const q = query(colRef, ...constraints);
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return { data: results, error: null };
  }

  private async executeLocalStorage() {
    const storageKey = `local_db_${this.tableName}`;
    
    const getLocalData = (): any[] => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return [];
        return JSON.parse(raw);
      } catch (e) {
        console.error(`Error parsing localStorage for ${this.tableName}:`, e);
        return [];
      }
    };

    const saveLocalData = (data: any[]) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (e) {
        console.error(`Error saving localStorage for ${this.tableName}:`, e);
      }
    };

    let localData = getLocalData();
    const currentUserId = auth.currentUser?.uid;

    if (localData.length === 0 && currentUserId) {
      const seed = getLocalStorageSeedData(this.tableName, currentUserId);
      if (seed.length > 0) {
        localData = seed;
        saveLocalData(localData);
      }
    }

    if (this.isInsert) {
      const rows = Array.isArray(this.dataToInsertOrUpdate) 
        ? this.dataToInsertOrUpdate 
        : [this.dataToInsertOrUpdate];
      
      const insertedRows = rows.map((row: any) => ({
        ...row,
        id: row.id || crypto.randomUUID(),
        created_at: row.created_at || new Date().toISOString(),
        updated_at: row.updated_at || new Date().toISOString(),
      }));

      localData.push(...insertedRows);
      saveLocalData(localData);

      return { data: Array.isArray(this.dataToInsertOrUpdate) ? insertedRows : insertedRows[0], error: null };
    }

    if (this.isUpdate) {
      const updatedRows: any[] = [];
      localData = localData.map((row: any) => {
        let matches = true;
        for (const f of this.filters) {
          const val = row[f.column];
          if (f.operator === '==' && val !== f.value) matches = false;
          if (f.operator === '!=' && val === f.value) matches = false;
          if (f.operator === 'in' && (!Array.isArray(f.value) || !f.value.includes(val))) matches = false;
        }

        if (matches) {
          const updatedRow = {
            ...row,
            ...this.dataToInsertOrUpdate,
            updated_at: new Date().toISOString(),
          };
          updatedRows.push(updatedRow);
          return updatedRow;
        }
        return row;
      });

      saveLocalData(localData);
      return { data: updatedRows, error: null };
    }

    if (this.isUpsert) {
      const rows = Array.isArray(this.dataToInsertOrUpdate)
        ? this.dataToInsertOrUpdate
        : [this.dataToInsertOrUpdate];
      
      const upsertedRows: any[] = [];
      for (const row of rows) {
        let matchIndex = -1;

        if (row.id) {
          matchIndex = localData.findIndex((d: any) => d.id === row.id);
        } else if (this.tableName === 'profiles' && row.user_id) {
          matchIndex = localData.findIndex((d: any) => d.user_id === row.user_id);
        } else {
          matchIndex = localData.findIndex((d: any) => {
            let match = true;
            if (row.user_id && d.user_id !== row.user_id) match = false;
            if (row.credential_type && d.credential_type !== row.credential_type) match = false;
            return match;
          });
        }

        if (matchIndex > -1) {
          const updatedRow = {
            ...localData[matchIndex],
            ...row,
            updated_at: new Date().toISOString(),
          };
          localData[matchIndex] = updatedRow;
          upsertedRows.push(updatedRow);
        } else {
          const newRow = {
            ...row,
            id: row.id || crypto.randomUUID(),
            created_at: row.created_at || new Date().toISOString(),
            updated_at: row.updated_at || new Date().toISOString(),
          };
          localData.push(newRow);
          upsertedRows.push(newRow);
        }
      }

      saveLocalData(localData);
      return { data: Array.isArray(this.dataToInsertOrUpdate) ? upsertedRows : upsertedRows[0], error: null };
    }

    if (this.isDelete) {
      const remainingRows = localData.filter((row: any) => {
        let matches = true;
        for (const f of this.filters) {
          const val = row[f.column];
          if (f.operator === '==' && val !== f.value) matches = false;
          if (f.operator === '!=' && val === f.value) matches = false;
          if (f.operator === 'in' && (!Array.isArray(f.value) || !f.value.includes(val))) matches = false;
        }
        return !matches;
      });

      saveLocalData(remainingRows);
      return { data: null, error: null };
    }

    // Default GET: Filter, sort and slice data
    let filteredResults = [...localData];
    
    for (const f of this.filters) {
      filteredResults = filteredResults.filter(row => {
        const val = row[f.column];
        if (f.operator === '==') {
          return val === f.value;
        }
        if (f.operator === '!=' && val !== undefined) {
          return val !== f.value;
        }
        if (f.operator === 'in') {
          return Array.isArray(f.value) && f.value.includes(val);
        }
        return true;
      });
    }

    if (this.sortOrder) {
      const { column, ascending } = this.sortOrder;
      filteredResults.sort((a, b) => {
        const valA = a[column];
        const valB = b[column];
        if (valA === undefined || valA === null) return ascending ? 1 : -1;
        if (valB === undefined || valB === null) return ascending ? -1 : 1;
        if (valA < valB) return ascending ? -1 : 1;
        if (valA > valB) return ascending ? 1 : -1;
        return 0;
      });
    }

    if (this.limitVal !== null) {
      filteredResults = filteredResults.slice(0, this.limitVal);
    }

    return { data: filteredResults, error: null };
  }

  private async execute() {
    try {
      return await this.executeFirestore();
    } catch (err: any) {
      const isPermissionOrAuthError = 
        err?.code === 'permission-denied' || 
        err?.message?.includes('permission') || 
        err?.message?.includes('unauthorized') ||
        err?.message?.includes('Missing or insufficient permissions');

      if (isPermissionOrAuthError) {
        console.warn(`Firestore permission denied on table ${this.tableName}. Falling back to localStorage.`);
        return await this.executeLocalStorage();
      }
      throw err;
    }
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const res = await this.execute();
      return onfulfilled ? onfulfilled(res) : res;
    } catch (err: any) {
      console.error(`Error executing query in table ${this.tableName}:`, err);
      const errorResult = { data: null, error: err };
      return onfulfilled ? onfulfilled(errorResult) : errorResult;
    }
  }

  async maybeSingle() {
    try {
      const res = await this.execute();
      if (res.error) return { data: null, error: res.error };
      const data = res.data;
      if (Array.isArray(data)) {
        return { data: data.length > 0 ? data[0] : null, error: null };
      }
      return { data, error: null };
    } catch (err: any) {
      console.error(`Error in maybeSingle on table ${this.tableName}:`, err);
      return { data: null, error: err };
    }
  }

  async single() {
    try {
      const res = await this.execute();
      if (res.error) return { data: null, error: res.error };
      const data = res.data;
      if (Array.isArray(data)) {
        if (data.length === 0) return { data: null, error: new Error('No rows found') };
        return { data: data[0], error: null };
      }
      return { data, error: null };
    } catch (err: any) {
      console.error(`Error in single on table ${this.tableName}:`, err);
      return { data: null, error: err };
    }
  }
}

// Storage Bucket compatibility layer
class FirebaseStorageBucket {
  private bucketName: string;
  private storage: any;

  constructor(bucketName: string, storage: any) {
    this.bucketName = bucketName;
    this.storage = storage;
  }

  async upload(path: string, file: any, options?: any) {
    try {
      const fileRef = ref(this.storage, `${this.bucketName}/${path}`);
      await uploadBytes(fileRef, file);
      return { data: { path }, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  getPublicUrl(path: string) {
    const bucket = this.storage.app.options.storageBucket || 'almac-398e3.firebasestorage.app';
    const encodedPath = encodeURIComponent(`${this.bucketName}/${path}`);
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
    return { data: { publicUrl } };
  }

  async remove(paths: string[]) {
    try {
      for (const p of paths) {
        const fileRef = ref(this.storage, `${this.bucketName}/${p}`);
        await deleteObject(fileRef);
      }
      return { data: paths, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async list(path: string) {
    try {
      const folderRef = ref(this.storage, `${this.bucketName}/${path}`);
      const res = await listAll(folderRef);
      const data = res.items.map(item => ({
        name: item.name,
        id: item.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      }));
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }
}

// Local rule-based classification heuristics
function localClassifySupplier(name: string, description: string = '') {
  const text = (name + ' ' + description).toLowerCase();
  
  if (/(?:electric|power|gas|utility|utilities|fuel|energy|heating|diesel|petrol)/.test(text)) {
    return { category: 'fuel_energy', confidence: 0.95 };
  }
  if (/(?:travel|flight|airline|hotel|stay|accommodation|trip|taxi|train|cab|uber)/.test(text)) {
    return { category: 'business_travel', confidence: 0.95 };
  }
  if (/(?:waste|recycle|garbage|trash|disposal|recycling|hazardous)/.test(text)) {
    return { category: 'waste', confidence: 0.95 };
  }
  if (/(?:commute|commuting|shuttle|bus|subway|transit|metro)/.test(text)) {
    return { category: 'employee_commuting', confidence: 0.90 };
  }
  if (/(?:freight|logistics|shipping|delivery|cargo|courier|transport|warehouse|warehousing)/.test(text)) {
    return { category: 'upstream_transport', confidence: 0.95 };
  }
  if (/(?:lease|rent|leased|co-working|coworking)/.test(text)) {
    return { category: 'upstream_leased', confidence: 0.90 };
  }
  if (/(?:machinery|vehicle|equipment|hardware|furniture|building|construction|infrastructure|server|computer)/.test(text)) {
    return { category: 'capital_goods', confidence: 0.90 };
  }
  if (/(?:software|saas|license|consulting|legal|audit|professional|cleaning|catering|office supply|stationery|paper|advert|marketing|insurance|finance)/.test(text)) {
    return { category: 'purchased_goods', confidence: 0.90 };
  }
  return { category: 'review_queue', confidence: 0.5 };
}

// Local rule-based emission factor helper
function localAssignEmissionFactor(category: string, supplier: string, description: string, method: string) {
  const text = (supplier + ' ' + description).toLowerCase();
  let ef = 1.0;
  let source = 'DEFRA 2025 - General average';
  let reasoning = 'Assigned local average based on category';

  if (category === 'purchased_goods') {
    if (/(?:software|saas|license|cloud)/.test(text)) {
      ef = method === 'spend' ? 0.08 : 0.5;
      source = 'DEFRA 2025 - IT services';
      reasoning = 'Assigned average IT services emission factor';
    } else if (/(?:paper|stationery|office)/.test(text)) {
      ef = method === 'spend' ? 0.15 : 0.8;
      source = 'DEFRA 2025 - Office supplies';
    } else {
      ef = method === 'spend' ? 0.12 : 1.0;
      source = 'DEFRA 2025 - Purchased goods average';
    }
  } else if (category === 'capital_goods') {
    if (/(?:computer|laptop|server|monitor|phone)/.test(text)) {
      ef = method === 'spend' ? 0.45 : 300;
      source = 'DEFRA 2025 - IT hardware';
      reasoning = 'Assigned embodied carbon for electronics';
    } else {
      ef = method === 'spend' ? 0.28 : 2.5;
      source = 'DEFRA 2025 - Machinery & furniture';
    }
  }

  return { ef, source, reasoning };
}

// Complete mock Supabase Client backed by Firebase
export const supabase = {
  auth: {
    async signUp({ email, password }: any) {
      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const user = mapFirebaseUserToSupabase(credential.user);
        const session = mapFirebaseUserToSession(credential.user);
        return { data: { user, session }, error: null };
      } catch (err: any) {
        return { data: { user: null, session: null }, error: err };
      }
    },

    async signInWithPassword({ email, password }: any) {
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const user = mapFirebaseUserToSupabase(credential.user);
        const session = mapFirebaseUserToSession(credential.user);
        return { data: { user, session }, error: null };
      } catch (err: any) {
        return { data: { user: null, session: null }, error: err };
      }
    },

    async signOut() {
      try {
        await signOutFirebase(auth);
        return { error: null };
      } catch (err: any) {
        return { error: err };
      }
    },

    async resetPasswordForEmail(email: string, options?: any) {
      try {
        await sendPasswordResetEmail(auth, email);
        return { data: {}, error: null };
      } catch (err: any) {
        return { data: null, error: err };
      }
    },

    async getSession() {
      const currentUser = auth.currentUser;
      const session = mapFirebaseUserToSession(currentUser);
      return { data: { session }, error: null };
    },

    onAuthStateChange(callback: (event: string, session: Session | null) => void) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        const session = mapFirebaseUserToSession(firebaseUser);
        const event = firebaseUser ? 'SIGNED_IN' : 'SIGNED_OUT';
        callback(event, session);
      });
      return {
        data: {
          subscription: {
            unsubscribe: () => unsubscribe()
          }
        }
      };
    }
  },

  from(tableName: string) {
    return new FirebaseQueryBuilder(tableName, db);
  },

  storage: {
    from(bucketName: string) {
      return new FirebaseStorageBucket(bucketName, storage);
    }
  },

  functions: {
    async invoke(name: string, options?: any) {
      try {
        const body = options?.body || {};

        if (name === 'copy-master-data') {
          const currentUser = auth.currentUser;
          if (!currentUser) return { data: null, error: new Error('Unauthorized') };
          const userId = currentUser.uid;

          // Check if data already exists in Firestore
          const checkQuery = new FirebaseQueryBuilder('emissions_data', db).eq('user_id', userId);
          const checkRes = await checkQuery;
          if (checkRes.data && checkRes.data.length > 0) {
            return { data: { message: "User already has data" }, error: null };
          }

          // Fetch and copy master data
          const tables = ['emissions_data', 'clients', 'netzero_targets', 'carbon_budgets', 'sustainability_credentials'];
          const results: string[] = [];

          for (const table of tables) {
            const masterQuery = new FirebaseQueryBuilder(table, db).eq('user_id', MASTER_ACCOUNT_ID);
            const masterRes = await masterQuery;
            if (masterRes.data && masterRes.data.length > 0) {
              const rows = masterRes.data.map(({ id, user_id, organization_id, ...rest }: any) => ({
                ...rest,
                user_id: userId,
              }));
              const insertQuery = new FirebaseQueryBuilder(table, db).insert(rows);
              await insertQuery;
              results.push(`${table}: ${rows.length}`);
            }
          }
          return { data: { message: "Data copied", results }, error: null };
        }

        if (name === 'classify-suppliers') {
          const { action, suppliers, category } = body;
          
          if (action === 'classify') {
            const allResults = suppliers.map((s: any) => {
              const { category, confidence } = localClassifySupplier(s.supplier_name, s.description);
              const autoRouted = confidence >= 0.85 && category !== 'review_queue';
              return {
                supplier_name: s.supplier_name,
                description: s.description || '',
                optional_spend: s.optional_spend || '',
                optional_contact: s.optional_contact || '',
                ai_category: category,
                ai_confidence: confidence,
                current_category: autoRouted ? category : 'review_queue',
                auto_routed: autoRouted,
              };
            });

            const classified = allResults.filter((r: any) => r.auto_routed);
            const reviewQueue = allResults.filter((r: any) => !r.auto_routed);
            return {
              data: {
                classified,
                review_queue: reviewQueue,
                stats: {
                  total: allResults.length,
                  auto_classified: classified.length,
                  needs_review: reviewQueue.length,
                }
              },
              error: null
            };
          }

          if (action === 'save') {
            const currentUser = auth.currentUser;
            if (!currentUser) return { data: null, error: new Error('Unauthorized') };
            
            const upsertRows = suppliers.map((s: any) => ({
              user_id: currentUser.uid,
              name_normalized: s.supplier_name.toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, ' '),
              name_display: s.supplier_name.trim(),
              description: s.description || null,
              ai_category: s.ai_category,
              ai_confidence: s.ai_confidence,
              user_override_category: s.user_override_category || null,
              current_category: s.user_override_category || s.current_category || s.ai_category,
              last_classified_at: new Date().toISOString(),
            }));

            const saveQuery = new FirebaseQueryBuilder('suppliers_master', db).upsert(upsertRows);
            const saveRes = await saveQuery;
            return {
              data: {
                saved: Array.isArray(saveRes.data) ? saveRes.data.length : 1,
                results: saveRes.data
              },
              error: null
            };
          }

          if (action === 'generate-template') {
            const currentUser = auth.currentUser;
            if (!currentUser) return { data: null, error: new Error('Unauthorized') };

            const listQuery = new FirebaseQueryBuilder('suppliers_master', db)
              .eq('user_id', currentUser.uid)
              .eq('current_category', category);
            const listRes = await listQuery;
            return { data: { suppliers: listRes.data || [], category }, error: null };
          }
        }

        if (name === 'assign-emission-factor') {
          const { entries } = body;
          const finalResults = entries.map((entry: any) => {
            const { ef, source, reasoning } = localAssignEmissionFactor(
              entry.category,
              entry.supplier,
              entry.description || '',
              entry.method
            );
            let tco2e = 0;
            if (entry.method === 'average' && entry.quantity) {
              tco2e = (entry.quantity * ef) / 1000;
            } else if (entry.method === 'spend' && entry.totalSpend) {
              tco2e = (entry.totalSpend * ef) / 1000;
            }
            return {
              emission_factor: ef,
              tco2e: parseFloat(tco2e.toFixed(6)),
              emission_factor_source: source,
              reasoning,
            };
          });
          return { data: { results: finalResults }, error: null };
        }

        if (name === 'assign-hotel-factor') {
          const { nights } = body;
          const ef = 25.4;
          const tco2e = (nights * ef) / 1000;
          return {
            data: {
              results: [{
                emission_factor: ef,
                tco2e: parseFloat(tco2e.toFixed(6)),
                emission_factor_source: 'DEFRA 2025 - Hotel stay general',
                reasoning: 'Hotel staying emission factor per night'
              }]
            },
            error: null
          };
        }

        if (name === 'assign-process-factor') {
          const { quantity } = body;
          const ef = 0.35;
          const tco2e = (quantity * ef) / 1000;
          return {
            data: {
              results: [{
                emission_factor: ef,
                tco2e: parseFloat(tco2e.toFixed(6)),
                emission_factor_source: 'EPA 2025 - Process processing',
                reasoning: 'Process emission factor'
              }]
            },
            error: null
          };
        }

        if (name === 'assign-wtt-factors') {
          const { quantity } = body;
          const ef = 0.12;
          const tco2e = (quantity * ef) / 1000;
          return {
            data: {
              results: [{
                emission_factor: ef,
                tco2e: parseFloat(tco2e.toFixed(6)),
                emission_factor_source: 'DEFRA 2025 - Well-to-tank factors',
                reasoning: 'Well-to-tank upstream fuel activities'
              }]
            },
            error: null
          };
        }

        throw new Error(`Unknown Edge Function mock: ${name}`);
      } catch (err: any) {
        return { data: null, error: err };
      }
    }
  }
};
