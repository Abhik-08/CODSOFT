/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { type User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, isMockMode } from '../firebase';
import * as authService from '../services/authService';

interface AuthContextType {
  user: FirebaseUser | null;
  balance: number;
  loading: boolean;
  signInWithGoogle: () => Promise<FirebaseUser>;
  signInWithPinBypass: () => Promise<FirebaseUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(() => {
    if (isMockMode) {
      const storedMockUser = localStorage.getItem('apex_mock_logged_in_user');
      return storedMockUser ? JSON.parse(storedMockUser) : null;
    }
    return null;
  });

  const [balance, setBalance] = useState<number>(() => {
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
    return 0;
  });

  const [loading, setLoading] = useState<boolean>(() => {
    // In mock mode, we resolve mock session sync immediately without waiting for Firebase API connection
    return !isMockMode;
  });

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

    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      // Clean up previous snapshot listener if any
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (currentUser) {
        // Setup real-time balance listener
        const accountRef = doc(db, 'accounts', currentUser.uid);
        unsubscribeSnapshot = onSnapshot(accountRef, (docSnap) => {
          if (docSnap.exists()) {
            setBalance(docSnap.data().balance ?? 0);
          } else {
            setBalance(0);
          }
          setLoading(false);
        }, (err) => {
          console.error('Error listening to account snapshot:', err);
          setLoading(false);
        });
      } else {
        setBalance(0);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

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
    logout
  }), [user, balance, loading, signInWithGoogle, signInWithPinBypass, logout]);

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
