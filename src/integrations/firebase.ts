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

// Chainable Firebase Query Builder imitating Supabase's PostgREST client
class FirebaseQueryBuilder {
  private tableName: string;
  private db: any;
  private constraints: QueryConstraint[] = [];
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
      this.constraints.push(where(column, '==', value));
    }
    return this;
  }

  neq(column: string, value: any) {
    if (value !== undefined && value !== null) {
      this.constraints.push(where(column, '!=', value));
    }
    return this;
  }

  in(column: string, values: any[]) {
    if (values && values.length > 0) {
      this.constraints.push(where(column, 'in', values));
    }
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    const asc = options?.ascending !== false;
    this.constraints.push(orderBy(column, asc ? 'asc' : 'desc'));
    return this;
  }

  limit(limitVal: number) {
    this.constraints.push(limit(limitVal));
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

  private async execute() {
    const colRef = collection(this.db, this.tableName);

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
      const q = query(colRef, ...this.constraints);
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
      const q = query(colRef, ...this.constraints);
      const snapshot = await getDocs(q);
      for (const d of snapshot.docs) {
        const docRef = doc(this.db, this.tableName, d.id);
        await deleteDoc(docRef);
      }
      return { data: null, error: null };
    }

    // Default: GET
    const q = query(colRef, ...this.constraints);
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return { data: results, error: null };
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const res = await this.execute();
      return onfulfilled ? onfulfilled(res) : res;
    } catch (err: any) {
      console.error(`Firestore error in table ${this.tableName}:`, err);
      const errorResult = { data: null, error: err };
      return onfulfilled ? onfulfilled(errorResult) : errorResult;
    }
  }

  async maybeSingle() {
    const res = await this.execute();
    if (res.error) return { data: null, error: res.error };
    const data = res.data;
    if (Array.isArray(data)) {
      return { data: data.length > 0 ? data[0] : null, error: null };
    }
    return { data, error: null };
  }

  async single() {
    const res = await this.execute();
    if (res.error) return { data: null, error: res.error };
    const data = res.data;
    if (Array.isArray(data)) {
      if (data.length === 0) return { data: null, error: new Error('No rows found') };
      return { data: data[0], error: null };
    }
    return { data, error: null };
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
