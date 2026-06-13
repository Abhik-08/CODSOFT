export type UserRole = 'ADMIN' | 'STUDENT';

// client-side provider details
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerId: string;
}

// Firestore user document layout
export interface FirestoreUser {
  uid: string;
  name: string;
  email: string;
  displayName?: string;
  photoURL: string;
  provider: string;
  role: UserRole;
  isActive: boolean;
  createdAt: any; // FieldValue or ISO String
  updatedAt: any; // FieldValue or ISO String
}

// Unified client user model combining provider and database role claims
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  provider: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}

// Backwards compatibility alias for UserProfile
export interface UserProfile extends User {}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
