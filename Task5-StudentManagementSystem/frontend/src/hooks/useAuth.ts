import { useAuthContext } from '../context/AuthContext'

export const useAuth = () => {
  const {
    user,
    loading,
    isAdmin,
    isStudent,
    loginWithGoogle,
    registerWithEmail,
    loginWithEmail,
    resetPassword,
    logout
  } = useAuthContext()

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin,
    isStudent,
    loginWithGoogle,
    registerWithEmail,
    loginWithEmail,
    resetPassword,
    logout
  }
}
