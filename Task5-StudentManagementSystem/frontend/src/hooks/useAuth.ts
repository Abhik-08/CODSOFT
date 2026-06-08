import { useAuthContext } from '../context/AuthContext'

export const useAuth = () => {
  const {
    user,
    loading,
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
    loginWithGoogle,
    registerWithEmail,
    loginWithEmail,
    resetPassword,
    logout
  }
}

