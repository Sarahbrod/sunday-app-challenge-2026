'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, type User } from '@/lib/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null });

  const fetchMe = useCallback(async () => {
    try {
      const user = await api.auth.me();
      setState({ user, loading: false, error: null });
    } catch (err) {
      // 401 means not logged in — not an error to display
      setState({ user: null, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const signup = useCallback(async (
    name: string,
    email: string,
    password: string,
    accountType: string,
    interests: string[],
  ): Promise<User> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const user = await api.auth.signup({
        name,
        email,
        password,
        account_type: accountType || 'solo',
        interests,
      });
      setState({ user, loading: false, error: null });
      return user;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Sign up failed.';
      setState(prev => ({ ...prev, loading: false, error: msg }));
      throw err;
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const user = await api.auth.login(email, password);
      setState({ user, loading: false, error: null });
      return user;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Login failed.';
      setState(prev => ({ ...prev, loading: false, error: msg }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await api.auth.logout().catch(() => null);
    setState({ user: null, loading: false, error: null });
  }, []);

  return { ...state, signup, login, logout, refetch: fetchMe };
}
