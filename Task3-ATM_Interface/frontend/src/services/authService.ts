import { 
  signInWithPopup, 
  signOut, 
  signInAnonymously,
  type User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider, isMockMode } from '../firebase';
import { ensureAccountExists } from './firestoreService';

export interface UserProfile {
  uid: string;
  name: string;
  email: string | null;
  photoURL: string | null;
  createdAt: unknown;
}

/**
 * Ensures a user document exists in the Firestore database.
 * Created only after the first login.
 */
export const syncUserDocument = async (user: FirebaseUser): Promise<void> => {
  if (isMockMode || user.uid.startsWith('mock-')) {
    const users = JSON.parse(localStorage.getItem('apex_mock_users') || '{}');
    if (!users[user.uid]) {
      users[user.uid] = {
        uid: user.uid,
        name: user.displayName || 'APEX Operator',
        email: user.email || 'pin.operator@apex.bank',
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('apex_mock_users', JSON.stringify(users));
    }
    
    // Automatically guarantee that the corresponding checking accounts document exists
    if (isMockMode) {
      const accounts = JSON.parse(localStorage.getItem('apex_mock_accounts') || '{}');
      if (!accounts[user.uid]) {
        accounts[user.uid] = {
          userId: user.uid,
          balance: 5000, // Premium mock starting balance
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('apex_mock_accounts', JSON.stringify(accounts));
      }
    } else {
      try {
        await ensureAccountExists(user.uid);
      } catch (error) {
        console.error('Failed to ensure account exists for mock user:', error);
      }
    }
    return;
  }

  try {
    // Automatically guarantee that the corresponding checking accounts document exists
    await ensureAccountExists(user.uid);
  } catch (error) {
    console.error('Error ensuring checking account exists on backend:', error);
    throw error;
  }
};

/**
 * Signs in the user using Firebase Google Auth popup and triggers Firestore sync.
 */
export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  if (isMockMode) {
    const mockUser = {
      uid: 'mock-google-uid-456',
      email: 'apex.operator@apex.bank',
      displayName: 'Abhik Google User',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      emailVerified: true,
      isAnonymous: false,
    } as unknown as FirebaseUser;
    
    localStorage.setItem('apex_mock_logged_in_user', JSON.stringify(mockUser));
    await syncUserDocument(mockUser);
    return mockUser;
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    await syncUserDocument(user);
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

/**
 * Signs in the user anonymously for PIN bypass.
 */
export const signInWithPinBypass = async (): Promise<FirebaseUser> => {
  const isAnonymousDisabled = localStorage.getItem('apex_anonymous_auth_disabled') === 'true';

  if (isMockMode || isAnonymousDisabled) {
    const mockUser = {
      uid: 'mock-anonymous-uid-123',
      email: 'pin.operator@apex.bank',
      displayName: 'APEX Pin Operator',
      photoURL: '',
      emailVerified: false,
      isAnonymous: true,
    } as unknown as FirebaseUser;
    
    localStorage.setItem('apex_mock_logged_in_user', JSON.stringify(mockUser));
    await syncUserDocument(mockUser);
    return mockUser;
  }

  try {
    const result = await signInAnonymously(auth);
    const user = result.user;
    await syncUserDocument(user);
    return user;
  } catch (error: any) {
    if (error?.code === 'auth/admin-restricted-operation') {
      localStorage.setItem('apex_anonymous_auth_disabled', 'true');
    }
    console.log('Firebase Anonymous Auth is restricted/disabled. Falling back to local PIN bypass mock user.');
    const mockUser = {
      uid: 'mock-anonymous-uid-123',
      email: 'pin.operator@apex.bank',
      displayName: 'APEX Pin Operator',
      photoURL: '',
      emailVerified: false,
      isAnonymous: true,
    } as unknown as FirebaseUser;
    
    localStorage.setItem('apex_mock_logged_in_user', JSON.stringify(mockUser));
    await syncUserDocument(mockUser);
    return mockUser;
  }
};

/**
 * Revokes the active session and signs out the user.
 */
export const logout = async (): Promise<void> => {
  localStorage.removeItem('apex_mock_logged_in_user');
  if (isMockMode) {
    return;
  }

  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};
