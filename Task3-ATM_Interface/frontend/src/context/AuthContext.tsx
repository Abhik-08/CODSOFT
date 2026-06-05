/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { type User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, isMockMode } from '../firebase';
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

  const [balance, setBalance] = useState<number>(() => {
    try {
      if (isMockMode) {
        const storedMockUser = localStorage.getItem('apex_mock_logged_in_user');
        const mockUser = storedMockUser ? JSON.parse(storedMockUser) : null;
        if (mockUser) {
          const accounts = JSON.parse(localStorage.getItem('apex_mock_accounts') || '{}');
          if (!accounts[mockUser.uid]) {
            accounts[mockUser.uid] = {
              userId: mockUser.uid,
              balance: 5000, // Premium default mock starting balance
              updatedAt: new Date().toISOString()
            };
            localStorage.setItem('apex_mock_accounts', JSON.stringify(accounts));
          }
          return accounts[mockUser.uid].balance;
        }
      }
    } catch (e) {
      console.error('Failed to parse stored mock user or accounts:', e);
    }
    return 0;
  });

  const [loading, setLoading] = useState<boolean>(() => {
    // In mock mode, we resolve mock session sync immediately without waiting for Firebase API connection
    return !isMockMode;
  });

  const refreshBalance = useCallback(async () => {
    if (isMockMode) {
      const storedMockUser = localStorage.getItem('apex_mock_logged_in_user');
      const mockUser = storedMockUser ? JSON.parse(storedMockUser) : null;
      if (mockUser) {
        const accounts = JSON.parse(localStorage.getItem('apex_mock_accounts') || '{}');
        setBalance(accounts[mockUser.uid]?.balance ?? 5000);
      }
      return;
    }

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
    if (isMockMode) {
      // Setup mock real-time balance updater event listener
      const handleBalanceUpdate = (e: Event) => {
        const customEvent = e as CustomEvent<{ userId: string; balance: number }>;
        const activeMockUser = localStorage.getItem('apex_mock_logged_in_user');
        const activeUserObj = activeMockUser ? JSON.parse(activeMockUser) : null;
        if (customEvent.detail.userId === activeUserObj?.uid) {
          setBalance(customEvent.detail.balance);
        }
      };

      globalThis.addEventListener('apex_mock_balance_update', handleBalanceUpdate);
      return () => {
        globalThis.removeEventListener('apex_mock_balance_update', handleBalanceUpdate);
      };
    }

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
      if (isMockMode) {
        // Initialize mock account
        const accounts = JSON.parse(localStorage.getItem('apex_mock_accounts') || '{}');
        if (!accounts[loggedUser.uid]) {
          accounts[loggedUser.uid] = {
            userId: loggedUser.uid,
            balance: 5000,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem('apex_mock_accounts', JSON.stringify(accounts));
        }
        setBalance(accounts[loggedUser.uid].balance);
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
      if (isMockMode) {
        // Initialize mock account
        const accounts = JSON.parse(localStorage.getItem('apex_mock_accounts') || '{}');
        if (!accounts[loggedUser.uid]) {
          accounts[loggedUser.uid] = {
            userId: loggedUser.uid,
            balance: 5000,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem('apex_mock_accounts', JSON.stringify(accounts));
        }
        setBalance(accounts[loggedUser.uid].balance);
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
