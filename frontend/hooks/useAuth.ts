import { useState, useEffect } from 'react';
import backend from '~backend/client';
import type { User } from '~backend/users/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    // Check for stored token on app start
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({ user, token: storedToken, isLoading: false });
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setAuthState({ user: null, token: null, isLoading: false });
      }
    } else {
      setAuthState({ user: null, token: null, isLoading: false });
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await backend.users.login({ email, password });
      
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
      
      setAuthState({
        user: response.user,
        token: response.token,
        isLoading: false,
      });
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    }
  };

  const loginAnonymous = async () => {
    try {
      const response = await backend.users.loginAnonymous();
      
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
      
      setAuthState({
        user: response.user,
        token: response.token,
        isLoading: false,
      });
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Anonymous login failed' 
      };
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      await backend.users.create({ email, password, name });
      return await login(email, password);
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setAuthState({ user: null, token: null, isLoading: false });
  };

  const getAuthenticatedBackend = () => {
    if (!authState.token) {
      console.warn('No authentication token available');
      return backend;
    }
    
    // Return backend client with proper authentication headers
    return backend.with({ 
      auth: async () => ({ 
        authorization: `Bearer ${authState.token}` 
      })
    });
  };

  return {
    user: authState.user,
    token: authState.token,
    isLoading: authState.isLoading,
    login,
    loginAnonymous,
    register,
    logout,
    getAuthenticatedBackend,
  };
}
