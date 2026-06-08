import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-vault-bg text-vault-cyan">
        <div className="animate-pulse font-mono text-lg">Decrypting Vault Access...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
