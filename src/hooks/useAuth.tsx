import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'editor' | 'analyst' | 'viewer';

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      setRole(data?.role || 'viewer');
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole('viewer');
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!role) return false;
    
    const hierarchy = {
      'admin': 3,
      'editor': 2,
      'analyst': 2,
      'viewer': 1
    };

    return hierarchy[role] >= hierarchy[requiredRole];
  };

  const canDelete = (itemUserId: string, currentUserId: string): boolean => {
    if (!role) return false;
    
    // Admin can delete anything
    if (role === 'admin') return true;
    
    // Others can only delete their own items
    return itemUserId === currentUserId;
  };

  return { role, loading, hasPermission, canDelete, fetchUserRole };
}
