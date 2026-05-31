import { useState } from 'react'
import { useForm, Head } from '@inertiajs/react'
import { can } from '@/Utils/can'
import EmptyState, { Icons } from '@/Components/EmptyState'
import { SubmitButton } from '@/Components/Spinner'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm({
    email:    '',
    password: '',
    remember: false,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    form.post('/login')
  }

  return (
    <>
      <Head title="Sign In — BobbyDent" />

      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start pt-20 px-4">
        {/* Card */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🦷</div>
            <h1 className="text-2xl font-bold text-blue-600 tracking-tight">BobbyDent Clinic</h1>
            <p className="text-sm text-gray-500 mt-1">Staff Portal — Sign in to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={form.data.email}
                onChange={e => form.setData('email', e.target.value)}
                autoComplete="email"
                autoFocus
                placeholder="you@bobbydent.com"
                className={`
                  w-full px-3 py-2.5 text-sm border rounded-lg bg-white
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors
                  ${form.errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'}
                `}
              />
              {form.errors.email && (
                <p className="text-red-500 text-sm mt-1">{form.errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <span className="text-xs text-gray-400 cursor-not-allowed select-none">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.data.password}
                  onChange={e => form.setData('password', e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`
                    w-full px-3 py-2.5 pr-10 text-sm border rounded-lg bg-white
                    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-colors
                    ${form.errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'}
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {form.errors.password && (
                <p className="text-red-500 text-sm mt-1">{form.errors.password}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={form.data.remember}
                onChange={e => form.setData('remember', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none">
                Keep me signed in
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={form.processing}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {form.processing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-8">
            BobbyDent Clinic Management System · Staff access only
          </p>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-4 w-full max-w-md bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
          <p className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">Demo Credentials</p>
          <div className="space-y-1 text-xs text-blue-600 font-mono">
            <p><span className="text-blue-400">admin</span> · admin@bobbydent.com · password</p>
            <p><span className="text-blue-400">reception</span> · reception@bobbydent.com · password</p>
            <p><span className="text-blue-400">dentist</span> · dentist@bobbydent.com · password</p>
          </div>
        </div>
      </div>
    </>
  )
}