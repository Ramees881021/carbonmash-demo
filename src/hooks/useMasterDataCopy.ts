import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/firebase/client';
import { MASTER_ACCOUNT_ID } from '@/hooks/useAdmin';

/**
 * Copies master account data to the current user on first login
 * via an edge function that bypasses RLS.
 */
export const useMasterDataCopy = (userId: string | undefined) => {
  const [ready, setReady] = useState(false);
  const running = useRef(false);

  useEffect(() => {
    if (!userId) return;
    if (userId === MASTER_ACCOUNT_ID) {
      setReady(true);
      return;
    }

    if (running.current) return;
    running.current = true;

    const copyIfNeeded = async () => {
      try {
        await supabase.functions.invoke('copy-master-data');
      } catch (err) {
        console.error('Error copying master data:', err);
      } finally {
        setReady(true);
      }
    };

    copyIfNeeded();
  }, [userId]);

  return ready;
};
