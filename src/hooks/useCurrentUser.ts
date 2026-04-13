// src/hooks/useCurrentUser.ts
// Hook to get current authenticated user ID

import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface UseCurrentUserReturn {
  userId: string | null;
  loading: boolean;
  error: string | null;
}

export const useCurrentUser = (): UseCurrentUserReturn => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setError(sessionError.message);
        }

        if (data?.session?.user?.id) {
          setUserId(data.session.user.id);
        } else {
          setError('No authenticated user found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to get current user');
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  return { userId, loading, error };
};
