import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { ArrowRight, AlertCircle } from 'lucide-react'

export default function RegisterPage() {
  const { registerWithEmail } = useAuthContext()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: any) => {
    e.preventDefault()
    if (!name || !email || !password) {
      setError('Please fill in all the required registration fields.')
      return
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await registerWithEmail(email, password, name)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to request academic console privileges.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 text-left">
      {/* stylized logo */}
      <div className="flex justify-center lg:justify-start">
        <div className="text-[#781f5a] dark:text-[#eaacd2]">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="6" r="2.5" fill="currentColor" />
            <circle cx="20" cy="34" r="2.5" fill="currentColor" />
            <circle cx="6" cy="20" r="2.5" fill="currentColor" />
            <circle cx="34" cy="20" r="2.5" fill="currentColor" />
            <path d="M20 10V30M10 20H30M13 14H27M13 26H27" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="text-center lg:text-left space-y-1">
        <h3 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white transition-all">
          Create administrator account
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Register new dashboard privileges for class management
        </p>
      </div>

      {/* Dynamic Error display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg animate-fadeIn">
          <AlertCircle size={15} className="shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Name input */}
        <div className="space-y-1">
          <label htmlFor="name" className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
            Full Name
          </label>
          <div className="relative flex items-center rounded-lg border border-slate-200 dark:border-white/10 focus-within:border-[#781f5a] focus-within:ring-2 focus-within:ring-[#781f5a]/10 bg-white dark:bg-[#151419] transition-all shadow-sm">
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Professor John Doe"
              className="w-full bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
            />
          </div>
        </div>

        {/* Email input */}
        <div className="space-y-1">
          <label htmlFor="email" className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
            Institutional Email
          </label>
          <div className="relative flex items-center rounded-lg border border-slate-200 dark:border-white/10 focus-within:border-[#781f5a] focus-within:ring-2 focus-within:ring-[#781f5a]/10 bg-white dark:bg-[#151419] transition-all shadow-sm">
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu"
              className="w-full bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
            />
          </div>
        </div>

        {/* Password input */}
        <div className="space-y-1">
          <label htmlFor="password" className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
            Password
          </label>
          <div className="relative flex items-center rounded-lg border border-slate-200 dark:border-white/10 focus-within:border-[#781f5a] focus-within:ring-2 focus-within:ring-[#781f5a]/10 bg-white dark:bg-[#151419] transition-all shadow-sm">
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••••••••"
              className="w-full bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
            />
          </div>
        </div>

        {/* Submit action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#781f5a] hover:bg-[#8e296c] dark:bg-[#eaacd2] dark:hover:bg-[#f3c1de] dark:text-[#3d122c] disabled:opacity-50 text-white font-bold text-sm py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/35 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Register</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="text-xs text-center text-slate-500 pt-2">
        Already have an account?{' '}
        <Link to="/login" className="text-[#781f5a] dark:text-[#eaacd2] hover:underline font-bold">
          Sign In
        </Link>
      </div>
    </div>
  )
}
