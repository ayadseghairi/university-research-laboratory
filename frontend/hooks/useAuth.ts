'use client';

import { useEffect, useState } from 'react';
import { clearAuthCookies, getStoredUser } from '@/lib/auth';
import { User } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    setLoading(false);
  }, []);

  const logout = () => {
    clearAuthCookies();
    window.location.href = '/login';
  };

  return { user, loading, logout, isAuthenticated: Boolean(user) };
};
