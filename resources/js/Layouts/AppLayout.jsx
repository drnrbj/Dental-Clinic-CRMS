import { useState } from 'react'
import { Link, usePage, router } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import { can, hasRole } from '@/Utils/can'

function getInitials(name) {
  if (!name) return '??'
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function getRoleLabel(role) {
  return { admin: 'Admin', receptionist: 'Receptionist', dentist: 'Dentist' }[role] ?? role
}

function getRoleBadgeClass(role) {
  return {
    admin:        'bg-blue-50 text-blue-600',
    receptionist: 'bg-purple-50 text-purple-600',
    dentist:      'bg-green-50 text-green-600',
  }[role] ?? 'bg-gray-100 text-gray-600'
}

// Icons as tiny inline components to keep JSX clean
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Clipboard: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  Billing: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Hamburger: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
}

export default function AppLayout({ children, title }) {
  const { url, props } = usePage()
  const { auth, flash } = props
  const user = auth?.user

  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [flashDismissed, setFlashDismissed] = useState(false)

  // ── Role-based nav links ─────────────────────────────────────────────────────
  // Built inside component so `user` is in scope.
  const navLinks = [
    {
      href: '/dashboard',
      name: 'Dashboard',
      icon: <Icons.Dashboard />,
      show: true, // all roles
    },
    {
      href: '/patients',
      name: 'Patients',
      icon: <Icons.Users />,
      show: true, // all roles can view patients
    },
    {
      href: '/appointments',
      name: 'Appointments',
      icon: <Icons.Calendar />,
      show: true, // all roles
    },
    {
      // Dentists get "My Treatments"; others get the admin "Treatments" list
      href: user?.role === 'dentist' ? '/my-treatments' : '/treatments',
      name: user?.role === 'dentist' ? 'My Treatments' : 'Treatments',
      icon: <Icons.Clipboard />,
      show: true, // all roles; dentists see their own, admins/receptionists see full list
    },
    {
      href: '/billing',
      name: 'Billing',
      icon: <Icons.Billing />,
      // Dentists do NOT see Billing
      show: hasRole(user, 'admin', 'receptionist'),
    },
  ].filter(link => link.show)

  const handleLogout = () => {
    router.post('/logout')
  }

  const isActive = (href) => url === href || url.startsWith(href + '/')

  return (
    <>
      <Head title={title ? `${title} — BobbyDent` : 'BobbyDent'} />

      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200
            flex flex-col transition-transform duration-200 ease-in-out
            lg:static lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
            <span className="text-2xl">🦷</span>
            <span className="text-xl font-bold text-blue-600 tracking-tight">BobbyDent</span>
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-lg
                  ${isActive(link.href)
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </nav>

          {/* User info + role badge */}
          {user && (
            <div className="px-4 py-4 border-t border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {getInitials(user.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeClass(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ── Main area ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar */}
          <header className="h-18 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
            {/* Left: hamburger + page title */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Icons.Hamburger />
              </button>
              {title && (
                <h1 className="text-base font-semibold text-gray-900">{title}</h1>
              )}
            </div>

            {/* Right: user dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setDropdownOpen(o => !o)}
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                  {getInitials(user?.name)}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-32 truncate">
                  {user?.name ?? 'User'}
                </span>
                <Icons.ChevronDown />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                    {/* Role indicator in dropdown */}
                    <div className="px-4 py-2.5 border-b border-gray-50">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getRoleBadgeClass(user?.role)}`}>
                        {getRoleLabel(user?.role)}
                      </span>
                    </div>
                    <button
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Profile
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      onClick={handleLogout}
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Flash — success */}
            {!flashDismissed && flash?.success && (
              <div className="flex items-center justify-between bg-green-50 text-green-700 border border-green-200 rounded-lg px-4 py-3 mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">{flash.success}</span>
                </div>
                <button onClick={() => setFlashDismissed(true)} className="text-green-400 hover:text-green-700 ml-3 flex-shrink-0">
                  <Icons.Close />
                </button>
              </div>
            )}
            {/* Flash — error */}
            {!flashDismissed && flash?.error && (
              <div className="flex items-center justify-between bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3 mb-4">
                <span className="text-sm">{flash.error}</span>
                <button onClick={() => setFlashDismissed(true)} className="text-red-400 hover:text-red-700 ml-3 flex-shrink-0">
                  <Icons.Close />
                </button>
              </div>
            )}

            {children}
          </main>
        </div>
      </div>
    </>
  )
}