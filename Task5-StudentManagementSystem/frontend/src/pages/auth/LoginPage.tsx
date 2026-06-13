import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { EduVaultLogo } from '../../components/common/EduVaultLogo'

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, resetPassword } = useAuthContext()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      await loginWithGoogle()
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google.')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailLogin = async (e: any) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter both your email and password.')
      return
    }
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      await loginWithEmail(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPasswordSubmit = async (e: any) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address to reset your password.')
      return
    }
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      await resetPassword(email)
      setMessage('A password reset link has been dispatched to your email.')
      setIsForgotPassword(false)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 text-left">
      {/* Logo */}
      {!isForgotPassword && (
        <div className="flex justify-center lg:justify-start">
          <EduVaultLogo showText={true} iconSize={58} textSize="text-2xl" />
        </div>
      )}

      {/* Header */}
      <div className="text-center lg:text-left space-y-1 pt-2">
        <h3 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white transition-all">
          {isForgotPassword ? 'Reset Access' : 'Sign In'}
        </h3>
        <p className="text-xs font-semibold text-slate-450 dark:text-slate-500">
          {isForgotPassword
            ? 'Enter your institutional email to reset access'
            : 'Access EduVault Academic Intelligence Platform'}
        </p>
      </div>

      {/* Alert Banners */}
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-xl animate-fadeIn">
          <AlertCircle size={15} className="shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {message && (
        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-vault-emerald text-xs font-semibold rounded-xl animate-fadeIn">
          <CheckCircle2 size={15} className="shrink-0" />
          <p className="font-medium">{message}</p>
        </div>
      )}

      {/* Google Login */}
      {!isForgotPassword && (
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-[#151419] border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10 active:scale-[0.98] px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350 transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Separator */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-dashed border-slate-200 dark:border-white/10"></div>
            <span className="flex-shrink mx-4 text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-wider">or sign in with email</span>
            <div className="flex-grow border-t border-dashed border-slate-200 dark:border-white/10"></div>
          </div>
        </div>
      )}

      <form
        onSubmit={isForgotPassword ? handleForgotPasswordSubmit : handleEmailLogin}
        className="space-y-4"
      >
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">
            Email
          </label>
          <div className="relative flex items-center rounded-xl border border-slate-200 dark:border-white/10 focus-within:border-vault-accent focus-within:ring-4 focus-within:ring-vault-accent/10 bg-white dark:bg-[#151419] transition-all shadow-sm">
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@institution.edu"
              className="w-full bg-transparent px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none font-semibold"
            />
          </div>
        </div>

        {/* Password */}
        {!isForgotPassword && (
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">
              Password
            </label>
            <div className="relative flex items-center rounded-xl border border-slate-200 dark:border-white/10 focus-within:border-vault-accent focus-within:ring-4 focus-within:ring-vault-accent/10 bg-white dark:bg-[#151419] transition-all shadow-sm pr-10">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required={!isForgotPassword}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••••••••"
                className="w-full bg-transparent px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-vault-accent transition-colors focus:outline-none flex items-center justify-center"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* Remember me & Forgot password */}
        {!isForgotPassword && (
          <div className="flex justify-between items-center text-xs font-bold pt-1">
            <label className="flex items-center gap-2 text-slate-450 dark:text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-vault-accent focus:ring-vault-accent cursor-pointer accent-vault-accent"
              />
              <span>Remember Me</span>
            </label>
            <button
              type="button"
              onClick={() => setIsForgotPassword(true)}
              className="text-vault-accent hover:text-vault-accent/90 transition-colors font-extrabold cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>
        )}

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-vault-accent to-vault-cyan hover:opacity-95 disabled:opacity-50 text-white font-black text-xs py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-vault-accent/10"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/35 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isForgotPassword ? 'Send Reset Instructions' : 'Launch Platform'}</span>
                {!isForgotPassword && <ArrowRight size={14} />}
              </>
            )}
          </button>
        </div>

        {/* Back to sign in */}
        {isForgotPassword && (
          <button
            type="button"
            onClick={() => setIsForgotPassword(false)}
            className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-bold transition-colors mt-2 cursor-pointer"
          >
            Back to Sign In
          </button>
        )}
      </form>

      {!isForgotPassword && (
        <div className="text-xs text-center font-semibold text-slate-450 dark:text-slate-500 pt-2">
          Not Registered Yet?{' '}
          <Link to="/register" className="text-vault-accent hover:underline font-extrabold">
            Create Account
          </Link>
        </div>
      )}
    </div>
  )
}
