// This file re-exports the Firebase-backed mock to preserve client-side import paths.
export { supabase } from '../firebase';
export type { User, Session } from '../firebase';