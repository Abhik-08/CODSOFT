import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'

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
      setError(err.message || 'Failed to authenticate with Google')
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
      setIsForgotPassword(false) // Toggle back after successful send
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 text-left">
      {/* stylized logo */}
      {!isForgotPassword && (
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
      )}

      {/* Dynamic Header based on Login vs Forgot Password state */}
      <div className="text-center lg:text-left space-y-1">
        <h3 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white transition-all">
          {isForgotPassword ? 'Reset password' : 'Login to your Account'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isForgotPassword 
            ? 'Enter your institutional email to reset access' 
            : 'See what is going on with your business'}
        </p>
      </div>

      {/* Alert Banners */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg animate-fadeIn">
          <AlertCircle size={15} className="shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {message && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-vault-emerald text-xs rounded-lg animate-fadeIn">
          <CheckCircle2 size={15} className="shrink-0" />
          <p className="font-medium">{message}</p>
        </div>
      )}

      {/* Social Oauth / Google Authentication Section */}
      {!isForgotPassword && (
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-[#151419] border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10 active:scale-[0.98] px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {/* Google icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Dotted / dashed separator line */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-dashed border-slate-200 dark:border-white/10"></div>
            <span className="flex-shrink mx-4 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">or Sign in with Email</span>
            <div className="flex-grow border-t border-dashed border-slate-200 dark:border-white/10"></div>
          </div>
        </div>
      )}

      <form 
        onSubmit={isForgotPassword ? handleForgotPasswordSubmit : handleEmailLogin} 
        className="space-y-4"
      >
        {/* Email Address Input */}
        <div className="space-y-1">
          <label htmlFor="email" className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
            Email
          </label>
          <div className="relative flex items-center rounded-lg border border-slate-200 dark:border-white/10 focus-within:border-[#781f5a] focus-within:ring-2 focus-within:ring-[#781f5a]/10 bg-white dark:bg-[#151419] transition-all shadow-sm">
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mail@abc.com"
              className="w-full bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
            />
          </div>
        </div>

        {/* Password Input (Hidden if inside Forgot Password flow) */}
        {!isForgotPassword && (
          <div className="space-y-1">
            <label htmlFor="password" className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Password
            </label>
            <div className="relative flex items-center rounded-lg border border-slate-200 dark:border-white/10 focus-within:border-[#781f5a] focus-within:ring-2 focus-within:ring-[#781f5a]/10 bg-white dark:bg-[#151419] transition-all shadow-sm pr-10">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required={!isForgotPassword}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••••••••"
                className="w-full bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-[#781f5a] dark:hover:text-[#eaacd2] transition-colors focus:outline-none flex items-center justify-center"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* Remember me & Forgot password row */}
        {!isForgotPassword && (
          <div className="flex justify-between items-center text-xs font-semibold pt-1">
            <label className="flex items-center gap-2 text-slate-500 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-[#781f5a] focus:ring-[#781f5a] cursor-pointer accent-[#781f5a]"
              />
              <span>Remember Me</span>
            </label>
            <button
              type="button"
              onClick={() => setIsForgotPassword(true)}
              className="text-[#781f5a] hover:text-[#8e296c] dark:text-[#eaacd2] hover:underline transition-colors font-bold cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>
        )}

        {/* Submit Actions */}
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
                <span>{isForgotPassword ? 'Send Reset Instructions' : 'Login'}</span>
                {!isForgotPassword && <ArrowRight size={14} />}
              </>
            )}
          </button>
        </div>

        {/* Forgot Password back navigation */}
        {isForgotPassword && (
          <button
            type="button"
            onClick={() => setIsForgotPassword(false)}
            className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors mt-2 cursor-pointer"
          >
            Back to Sign In
          </button>
        )}
      </form>

      {!isForgotPassword && (
        <div className="text-xs text-center text-slate-500 pt-2">
          Not Registered Yet?{' '}
          <Link to="/register" className="text-[#781f5a] dark:text-[#eaacd2] hover:underline font-bold">
            Create an account
          </Link>
        </div>
      )}
    </div>
  )
}
