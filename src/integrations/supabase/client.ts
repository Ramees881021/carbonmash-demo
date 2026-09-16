// Firebase-backed client providing seamless compatibility with Firestore, Firebase Auth, and Storage.
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  DocumentData
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  getBlob,
  deleteObject
} from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';
import { getDefaultMasterData, getAllExportedMasterData, isKimptonUser } from '@/lib/defaultData';

const mapFirebaseUser = (fbUser: FirebaseUser | null) => {
  if (!fbUser) return null;
  return {
    id: fbUser.uid,
    uid: fbUser.uid,
    email: fbUser.email,
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: fbUser.metadata.creationTime || new Date().toISOString(),
  } as any;
};

const CURRENT_DATA_VERSION = 'v5_2026_09_15_exported';

// Clear old cache if version changed
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem('carbonmash_data_version') !== CURRENT_DATA_VERSION) {
      const keysToClear = [
        'carbonmash_data_profiles',
        'carbonmash_data_emissions_data',
        'carbonmash_data_netzero_targets',
        'carbonmash_data_carbon_budgets',
        'carbonmash_data_sustainability_credentials',
        'carbonmash_data_clients',
        'carbonmash_data_emission_reduction_projects',
        'carbonmash_data_user_roles',
        'carbonmash_data_carbon_calc_entries',
        'carbonmash_data_carbon_audit_log'
      ];
      keysToClear.forEach(k => localStorage.removeItem(k));
      localStorage.setItem('carbonmash_data_version', CURRENT_DATA_VERSION);
    }
  } catch {}
}

// Local storage cache helper for fast reads & offline/permission fallback
const getLocalCollection = (collectionName: string): any[] => {
  try {
    const raw = localStorage.getItem(`carbonmash_data_${collectionName}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setLocalCollection = (collectionName: string, data: any[]) => {
  try {
    localStorage.setItem(`carbonmash_data_${collectionName}`, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }
};

// Auto-seed demo data for a user based on account
export const seedUserMasterData = async (userId: string, email?: string | null, companyName?: string | null) => {
  const masterData = getDefaultMasterData(userId, email, companyName);
  const allExported = getAllExportedMasterData();
  const targetProfile = masterData.profiles[0];
  const targetCompanyName = targetProfile?.company_name;

  const existingProfiles = getLocalCollection('profiles').filter((r: any) => r.user_id === userId);

  for (const [colName, records] of Object.entries(masterData)) {
    let allColData = getLocalCollection(colName);
    const existing = allColData.filter((r: any) => r.user_id === userId);
    
    // Check if re-seed needed across ALL collections for this account
    const needsReseed = existing.length === 0;

    // Merge base exported historical accounts into local collection if not present
    const baseExported = (allExported as any)[colName] || [];
    for (const exp of baseExported) {
      if (!allColData.some((r: any) => r.id === exp.id)) {
        allColData.push(exp);
      }
    }

    if (needsReseed) {
      allColData = allColData.filter((r: any) => r.user_id !== userId).concat(records);
      setLocalCollection(colName, allColData);

      // Attempt to save to Firestore asynchronously
      for (const rec of records) {
        try {
          const docRef = doc(db, colName, (rec as any).id);
          setDoc(docRef, rec, { merge: true }).catch(() => {});
        } catch {}
      }
    } else {
      setLocalCollection(colName, allColData);
    }
  }
};


class FirestoreQueryBuilder<T = any> implements PromiseLike<{ data: T[] | null; error: any; count?: number }> {
  private collectionName: string;
  private filters: Array<{ field: string; op: string; value: any }> = [];
  private orderConfig?: { field: string; ascending: boolean };
  private limitCount?: number;
  private selectedFields?: string[];

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  select(fields = '*') {
    if (fields && fields !== '*') {
      this.selectedFields = fields.split(',').map((f) => f.trim());
    }
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ field, op: '==', value });
    return this;
  }

  neq(field: string, value: any) {
    this.filters.push({ field, op: '!=', value });
    return this;
  }

  in(field: string, values: any[]) {
    this.filters.push({ field, op: 'in', value: values });
    return this;
  }

  is(field: string, value: any) {
    this.filters.push({ field, op: '==', value });
    return this;
  }

  order(field: string, { ascending = true }: { ascending?: boolean } = {}) {
    this.orderConfig = { field, ascending };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number) {
    this.limitCount = to - from + 1;
    return this;
  }

  private async execute(): Promise<{ data: T[]; error: null }> {
    let results: any[] = [];
    const currentUserId = auth.currentUser?.uid || 'default_user';

    if (auth.currentUser) {
      try {
        const colRef = collection(db, this.collectionName);
        const snapshot = await getDocs(colRef);

        snapshot.forEach((d) => {
          const docData = d.data();
          results.push({ id: d.id, ...docData });
        });

        if (results.length > 0) {
          setLocalCollection(this.collectionName, results);
        }
      } catch (err) {
        console.warn(`Firestore read failed or restricted for ${this.collectionName}, using cached/fallback data:`, err);
      }
    }

    // If Firestore yielded no data, use local fallback
    if (results.length === 0) {
      results = getLocalCollection(this.collectionName);
    }

    // If still no data for user, auto-seed defaults for known collections
    const userFilter = this.filters.find((f) => f.field === 'user_id');
    const targetUserId = userFilter ? userFilter.value : currentUserId;
    const currentUserEmail = auth.currentUser?.email;

    const existingUserRecords = results.filter((r) => r.user_id === targetUserId);
    const targetDefault = getDefaultMasterData(targetUserId, currentUserEmail);
    const expectedProfile = targetDefault.profiles[0];
    const expectedCompanyName = expectedProfile?.company_name;

    // Check if the cached profile for this user has an account mismatch
    const cachedProfiles = getLocalCollection('profiles').filter((r: any) => r.user_id === targetUserId);
    // Also check emissions mismatch (e.g. year count or baseline mismatch)
    const isEmissionsMismatch = this.collectionName === 'emissions_data' && existingUserRecords.length > 0 &&
      (existingUserRecords.length !== targetDefault.emissions_data.length ||
       existingUserRecords[0]?.reporting_year !== targetDefault.emissions_data[0]?.reporting_year ||
       existingUserRecords[0]?.scope_1_emissions !== targetDefault.emissions_data[0]?.scope_1_emissions);

    const needsReseed = existingUserRecords.length === 0 || isEmissionsMismatch;

    if (needsReseed) {
      if ((targetDefault as any)[this.collectionName]) {
        const seeds = (targetDefault as any)[this.collectionName];
        results = results.filter((r) => r.user_id !== targetUserId).concat(seeds);
        setLocalCollection(this.collectionName, results);

        // Async sync to Firestore
        for (const s of seeds) {
          try {
            setDoc(doc(db, this.collectionName, s.id), s, { merge: true }).catch(() => {});
          } catch {}
        }
      }
    }

    // Ensure all historical exported accounts are present in multi-row profile/credential/emissions queries
    if (!userFilter) {
      const allExported = getAllExportedMasterData();
      const baseList = (allExported as any)[this.collectionName] || [];
      for (const item of baseList) {
        if (!results.some((r) => r.id === item.id)) {
          results.push(item);
        }
      }
    }

    // Apply filters
    for (const filter of this.filters) {
      if (filter.op === '==') {
        results = results.filter((r) => r[filter.field] == filter.value);
      } else if (filter.op === '!=') {
        results = results.filter((r) => r[filter.field] != filter.value);
      } else if (filter.op === 'in' && Array.isArray(filter.value)) {
        results = results.filter((r) => filter.value.includes(r[filter.field]));
      }
    }

    // Order
    if (this.orderConfig) {
      const { field, ascending } = this.orderConfig;
      results.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        if (valA == null && valB == null) return 0;
        if (valA == null) return ascending ? 1 : -1;
        if (valB == null) return ascending ? -1 : 1;
        if (valA < valB) return ascending ? -1 : 1;
        if (valA > valB) return ascending ? 1 : -1;
        return 0;
      });
    }

    // Limit
    if (this.limitCount !== undefined && this.limitCount > 0) {
      results = results.slice(0, this.limitCount);
    }

    // Project fields if selected
    if (this.selectedFields && this.selectedFields.length > 0) {
      results = results.map((item) => {
        const projected: any = {};
        this.selectedFields!.forEach((f) => {
          if (f in item) projected[f] = item[f];
        });
        return projected;
      });
    }

    return { data: results as T[], error: null };
  }

  async maybeSingle(): Promise<{ data: T | null; error: any }> {
    const { data, error } = await this.execute();
    return { data: (data && data.length > 0 ? data[0] : null) as T | null, error };
  }

  async single(): Promise<{ data: T | null; error: any }> {
    const { data, error } = await this.execute();
    return {
      data: (data && data.length > 0 ? data[0] : null) as T | null,
      error: error || (data && data.length > 0 ? null : new Error('No record found'))
    };
  }

  then<TResult1 = { data: T[] | null; error: any; count?: number }, TResult2 = never>(
    onfulfilled?: ((value: { data: T[] | null; error: any; count?: number }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute()
      .then((res) => ({ data: res.data, error: res.error, count: res.data.length }))
      .then(onfulfilled, onrejected);
  }
}

class FirestoreMutationBuilder {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  async insert(records: any | any[]): Promise<{ data: any; error: any }> {
    try {
      const items = Array.isArray(records) ? records : [records];
      const inserted: any[] = [];
      const currentList = getLocalCollection(this.collectionName);

      for (const item of items) {
        const id = item.id || crypto.randomUUID();
        const dataToSave = {
          ...item,
          id,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Save locally
        const existingIdx = currentList.findIndex((r: any) => r.id === id);
        if (existingIdx >= 0) {
          currentList[existingIdx] = { ...currentList[existingIdx], ...dataToSave };
        } else {
          currentList.push(dataToSave);
        }

        // Save to Firestore
        try {
          const docRef = doc(db, this.collectionName, id);
          setDoc(docRef, dataToSave, { merge: true }).catch(() => {});
        } catch {}

        inserted.push(dataToSave);
      }

      setLocalCollection(this.collectionName, currentList);
      return { data: Array.isArray(records) ? inserted : inserted[0], error: null };
    } catch (error) {
      console.error(`Error inserting into ${this.collectionName}:`, error);
      return { data: null, error };
    }
  }

  async upsert(records: any | any[], _options?: any): Promise<{ data: any; error: any }> {
    return this.insert(records);
  }

  update(updates: any) {
    const colName = this.collectionName;
    return {
      async eq(field: string, value: any): Promise<{ data: any; error: any }> {
        try {
          const currentList = getLocalCollection(colName);
          let matched = false;

          for (let i = 0; i < currentList.length; i++) {
            if (currentList[i][field] == value) {
              currentList[i] = { ...currentList[i], ...updates, updated_at: new Date().toISOString() };
              matched = true;
              try {
                const docRef = doc(db, colName, currentList[i].id);
                setDoc(docRef, currentList[i], { merge: true }).catch(() => {});
              } catch {}
            }
          }

          if (matched) {
            setLocalCollection(colName, currentList);
          } else if (field === 'id') {
            // Direct write
            try {
              const docRef = doc(db, colName, value);
              setDoc(docRef, { ...updates, updated_at: new Date().toISOString() }, { merge: true }).catch(() => {});
            } catch {}
          }

          return { data: updates, error: null };
        } catch (error) {
          console.error(`Error updating ${colName}:`, error);
          return { data: null, error };
        }
      }
    };
  }

  delete() {
    const colName = this.collectionName;
    return {
      async eq(field: string, value: any): Promise<{ data: any; error: any }> {
        try {
          const currentList = getLocalCollection(colName);
          const filtered = currentList.filter((r: any) => {
            if (r[field] == value) {
              try {
                deleteDoc(doc(db, colName, r.id)).catch(() => {});
              } catch {}
              return false;
            }
            return true;
          });

          setLocalCollection(colName, filtered);
          return { data: null, error: null };
        } catch (error) {
          console.error(`Error deleting from ${colName}:`, error);
          return { data: null, error };
        }
      }
    };
  }
}

// Storage wrapper for Firebase Storage
const createLocalAssetUrl = (file: Blob | File | Uint8Array, fallbackError?: unknown) => {
  const blob = file instanceof Blob ? file : new Blob([file]);
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || fallbackError);
    reader.readAsDataURL(blob);
  });
};

const createStorageBucket = (bucketName: string) => ({
  async upload(path: string, file: Blob | File | Uint8Array, _options?: any) {
    if (!auth.currentUser) {
      const localUrl = await createLocalAssetUrl(file);
      return { data: { path: `${bucketName}/${path}`, publicUrl: localUrl }, error: null };
    }

    try {
      const storageRef = ref(storage, `${bucketName}/${path}`);
      await uploadBytes(storageRef, file);
      return { data: { path: `${bucketName}/${path}` }, error: null };
    } catch (error) {
      console.warn('Storage upload fallback:', error);
      const localUrl = await createLocalAssetUrl(file, error);
      return { data: { path: `${bucketName}/${path}`, publicUrl: localUrl }, error: null };
    }
  },

  getPublicUrl(path: string) {
    const bucket = storage.app.options.storageBucket || 'carbonmash-demo.firebasestorage.app';
    const cleanPath = path.startsWith(`${bucketName}/`) ? path : `${bucketName}/${path}`;
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(cleanPath)}?alt=media`;
    return { data: { publicUrl } };
  },

  async download(path: string) {
    try {
      const cleanPath = path.startsWith(`${bucketName}/`) ? path : `${bucketName}/${path}`;
      const storageRef = ref(storage, cleanPath);
      const blob = await getBlob(storageRef);
      return { data: blob, error: null };
    } catch (error) {
      console.error('Storage download error:', error);
      return { data: null, error };
    }
  },

  async remove(paths: string[]) {
    try {
      const promises = paths.map((p) => {
        const cleanPath = p.startsWith(`${bucketName}/`) ? p : `${bucketName}/${p}`;
        return deleteObject(ref(storage, cleanPath));
      });
      await Promise.all(promises);
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
});

// Master demo client configured for Firebase
export const supabase: any = {
  from: (collectionName: string) => {
    const queryBuilder = new FirestoreQueryBuilder(collectionName);
    const mutationBuilder = new FirestoreMutationBuilder(collectionName);

    return Object.assign(queryBuilder, {
      insert: mutationBuilder.insert.bind(mutationBuilder),
      upsert: mutationBuilder.upsert.bind(mutationBuilder),
      update: mutationBuilder.update.bind(mutationBuilder),
      delete: mutationBuilder.delete.bind(mutationBuilder)
    });
  },

  auth: {
    onAuthStateChange(callback: (event: string, session: any) => void) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          await seedUserMasterData(fbUser.uid, fbUser.email);
        }
        const user = mapFirebaseUser(fbUser);
        const session = user ? { user, access_token: await fbUser?.getIdToken().catch(() => 'demo-token') } : null;
        callback(fbUser ? 'SIGNED_IN' : 'SIGNED_OUT', session);
      });
      return {
        data: {
          subscription: {
            unsubscribe
          }
        }
      };
    },

    async getSession() {
      const fbUser = auth.currentUser;
      if (fbUser) {
        await seedUserMasterData(fbUser.uid, fbUser.email);
      }
      const user = mapFirebaseUser(fbUser);
      const session = user ? { user, access_token: await fbUser?.getIdToken().catch(() => 'demo-token') } : null;
      return { data: { session }, error: null };
    },

    async getUser() {
      const fbUser = auth.currentUser;
      return { data: { user: mapFirebaseUser(fbUser) }, error: null };
    },

    async signUp({ email, password }: { email: string; password: string; options?: any }) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await seedUserMasterData(userCredential.user.uid, email);
        const user = mapFirebaseUser(userCredential.user);
        return { data: { user, session: { user } }, error: null };
      } catch (error: any) {
        return { data: { user: null, session: null }, error };
      }
    },

    async signInWithPassword({ email, password }: { email: string; password: string }) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await seedUserMasterData(userCredential.user.uid, email);
        const user = mapFirebaseUser(userCredential.user);
        return { data: { user, session: { user } }, error: null };
      } catch (error: any) {
        return { data: { user: null, session: null }, error };
      }
    },

    async signOut() {
      try {
        await fbSignOut(auth);
        return { error: null };
      } catch (error) {
        return { error };
      }
    },

    async resetPasswordForEmail(email: string, _options?: any) {
      try {
        await sendPasswordResetEmail(auth, email);
        return { data: {}, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    async updateUser({ password }: { password?: string }) {
      try {
        if (auth.currentUser && password) {
          await updatePassword(auth.currentUser, password);
        }
        return { data: { user: mapFirebaseUser(auth.currentUser) }, error: null };
      } catch (error) {
        return { data: null, error };
      }
    }
  },

  storage: {
    from: (bucketName: string) => createStorageBucket(bucketName)
  },

  functions: {
    async invoke(functionName: string, _options?: { body?: any }) {
      const uid = auth.currentUser?.uid || 'default_user';
      if (functionName === 'copy-master-data') {
        await seedUserMasterData(uid, auth.currentUser?.email);
      }
      return { data: { success: true }, error: null };
    }
  }
};