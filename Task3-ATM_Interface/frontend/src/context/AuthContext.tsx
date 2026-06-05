/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { type User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import * as authService from '../services/authService';
import api from '../services/apiService';

interface AuthContextType {
  user: FirebaseUser | null;
  balance: number;
  loading: boolean;
  signInWithGoogle: () => Promise<FirebaseUser>;
  signInWithPinBypass: () => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(() => {
    try {
      const storedMockUser = localStorage.getItem('apex_mock_logged_in_user');
      return storedMockUser ? JSON.parse(storedMockUser) : null;
    } catch (e) {
      console.error('Failed to parse stored mock user:', e);
      return null;
    }
  });

  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshBalance = useCallback(async () => {
    const storedMockUser = localStorage.getItem('apex_mock_logged_in_user');
    if (auth.currentUser || storedMockUser) {
      try {
        const response = await api.get('/account/balance');
        if (response.data?.success) {
          setBalance(response.data.data.balance);
        }
      } catch (error) {
        console.error('Error refreshing balance:', error);
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const response = await api.get('/account/balance');
          if (response.data?.success) {
            setBalance(response.data.data.balance);
          }
        } catch (error) {
          console.error('Error fetching initial balance:', error);
        } finally {
          setLoading(false);
        }
      } else {
        const storedMockUser = localStorage.getItem('apex_mock_logged_in_user');
        if (storedMockUser) {
          try {
            const userObj = JSON.parse(storedMockUser);
            setUser(userObj);
            const response = await api.get('/account/balance');
            if (response.data?.success) {
              setBalance(response.data.data.balance);
            }
          } catch (error) {
            console.error('Error fetching initial balance for fallback mock user:', error);
          } finally {
            setLoading(false);
          }
        } else {
          setUser(null);
          setBalance(0);
          setLoading(false);
        }
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [refreshBalance]);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const loggedUser = await authService.signInWithGoogle();
      setUser(loggedUser);
      // Fetch fresh balance from the backend immediately after login
      try {
        const response = await api.get('/account/balance');
        if (response.data?.success) {
          setBalance(response.data.data.balance);
        }
      } catch (e) {
        console.error('Error fetching balance after Google sign-in:', e);
      }
      return loggedUser;
    } catch (error) {
      console.error('AuthContext Sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithPinBypass = useCallback(async () => {
    setLoading(true);
    try {
      const loggedUser = await authService.signInWithPinBypass();
      setUser(loggedUser);
      // Fetch fresh balance from the backend immediately after login
      try {
        const response = await api.get('/account/balance');
        if (response.data?.success) {
          setBalance(response.data.data.balance);
        }
      } catch (e) {
        console.error('Error fetching balance after PIN bypass sign-in:', e);
      }
      return loggedUser;
    } catch (error) {
      console.error('AuthContext PIN Sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setBalance(0);
    } catch (error) {
      console.error('AuthContext Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    balance,
    loading,
    signInWithGoogle,
    signInWithPinBypass,
    logout,
    refreshBalance
  }), [user, balance, loading, signInWithGoogle, signInWithPinBypass, logout, refreshBalance]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
