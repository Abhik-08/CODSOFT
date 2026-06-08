import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { User, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'

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
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h3 className="text-xl font-bold tracking-tight text-vault-fg">Create administrator account</h3>
        <p className="text-xs text-slate-400">Register new dashboard privileges for class management</p>
      </div>

      {/* Dynamic Error display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg animate-fadeIn">
          <AlertCircle size={15} className="shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-5">
        {/* Name input */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Full Name
          </label>
          <div className="relative flex items-center rounded-xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 focus-within:bg-white dark:focus-within:bg-[#070b14]/50 focus-within:border-vault-accent focus-within:ring-4 focus-within:ring-vault-accent/10 transition-all duration-200 shadow-sm hover:border-slate-300 dark:hover:border-white/10">
            <User size={16} className="absolute left-3.5 text-slate-400 dark:text-slate-500" />
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Professor John Doe"
              className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-vault-fg placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-medium"
            />
          </div>
        </div>

        {/* Email input */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Institutional Email
          </label>
          <div className="relative flex items-center rounded-xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 focus-within:bg-white dark:focus-within:bg-[#070b14]/50 focus-within:border-vault-accent focus-within:ring-4 focus-within:ring-vault-accent/10 transition-all duration-200 shadow-sm hover:border-slate-300 dark:hover:border-white/10">
            <Mail size={16} className="absolute left-3.5 text-slate-400 dark:text-slate-500" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu"
              className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-vault-fg placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-medium"
            />
          </div>
        </div>

        {/* Password input */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Password
          </label>
          <div className="relative flex items-center rounded-xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 focus-within:bg-white dark:focus-within:bg-[#070b14]/50 focus-within:border-vault-accent focus-within:ring-4 focus-within:ring-vault-accent/10 transition-all duration-200 shadow-sm hover:border-slate-300 dark:hover:border-white/10">
            <Lock size={16} className="absolute left-3.5 text-slate-400 dark:text-slate-500" />
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-vault-fg placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-medium"
            />
          </div>
        </div>

        {/* Submit action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-vault-accent to-vault-cyan hover:from-vault-accent/95 hover:to-vault-cyan/95 disabled:from-vault-accent/50 disabled:to-vault-cyan/50 text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-vault-accent/15 dark:shadow-vault-accent/25 hover:shadow-vault-accent/25 dark:hover:shadow-vault-accent/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/35 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Request Account Access</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="text-xs text-center text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="text-vault-accent hover:underline font-semibold">
          Sign In
        </Link>
      </div>
    </div>
  )
}
