import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { LogOut, Menu, Sun, Moon, Home, Users, User, ClipboardList, Bell, Activity, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/principal/staff', label: 'Staff', icon: Users },
  { path: '/principal/prefects', label: 'Prefects', icon: User },
  { path: '/principal/students', label: 'Students', icon: User },
  { path: '/principal/tasks', label: 'Tasks', icon: ClipboardList },
  { path: '/principal/attendance', label: 'Attendance', icon: Activity },
  { path: '/principal/announcements', label: 'Announcements', icon: Bell },
  { path: '/principal/audit-logs', label: 'Audit Logs', icon: Activity },
  { path: '/principal/settings', label: 'Settings', icon: Settings },
]

const STAFF_NAV_ITEMS = [
  { path: '/staff', label: 'Dashboard', icon: Home },
  { path: '/staff/prefects', label: 'Prefects', icon: Users },
  { path: '/staff/students', label: 'Students', icon: User },
  { path: '/staff/tasks', label: 'Tasks', icon: ClipboardList },
  { path: '/staff/attendance', label: 'Attendance', icon: Activity },
]

const PREFECT_NAV_ITEMS = [
  { path: '/prefect', label: 'Dashboard', icon: Home },
  { path: '/prefect/students', label: 'Students', icon: User },
  { path: '/prefect/tasks', label: 'Tasks', icon: ClipboardList },
  { path: '/prefect/attendance', label: 'Attendance', icon: Activity },
]

const STUDENT_NAV_ITEMS = [
  { path: '/student', label: 'Dashboard', icon: Home },
  { path: '/student/tasks', label: 'My Tasks', icon: ClipboardList },
  { path: '/student/attendance', label: 'Attendance', icon: Activity },
]

export function Sidebar() {
  const { user } = useAuth()
  const location = useLocation()

  const navItems = user && user.role === 'principal'
    ? NAV_ITEMS
    : user && user.role === 'staff'
    ? STAFF_NAV_ITEMS
    : user && user.role === 'prefect'
    ? PREFECT_NAV_ITEMS
    : STUDENT_NAV_ITEMS

  return (
    <aside className="hidden lg:flex lg:w-64 flex-col border-r border-mist dark:border-slate bg-sidebar text-deep dark:text-snow">
      <div className="px-6 py-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-info rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">LH</span>
        </div>
        <span className="font-heading font-bold text-lg tracking-tight">LeadersHigh</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-mist dark:border-slate">
        <div className="flex items-center gap-3 p-2 bg-mist/50 dark:bg-slate rounded-lg">
          <div className="w-8 h-8 rounded-full bg-deep dark:bg-slate flex items-center justify-center">
            <span className="text-white text-xs font-medium">{user && user.firstName ? user.firstName[0] : ''}{user && user.lastName ? user.lastName[0] : ''}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-deep dark:text-snow">{user && user.firstName} {user && user.lastName}</p>
            <p className="text-xs text-slate dark:text-steel capitalize">{user && user.role}</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-mist dark:border-slate">
        <button
          onClick={() => {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
          }}
          className="sidebar-link text-danger hover:bg-red-50 dark:hover:bg-danger/10 flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}

export function MobileSidebar({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex flex-col lg:hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm onClick={onClose}" />
      <div className="relative w-72 bg-sidebar text-deep dark:text-snow flex flex-col h-full shadow-2xl">
        <div className="px-6 py-4 flex items-center justify-between border-b border-mist dark:border-slate">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-info rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LH</span>
            </div>
            <span className="font-heading font-bold text-lg tracking-tight">LeadersHigh</span>
          </div>
          <button onClick={onClose} className="text-steel hover:text-deep dark:text-steel dark:hover:text-snow">
            ✕
          </button>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = window.location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`sidebar-link ${isActive ? 'bg-info text-white' : ''}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-mist dark:border-slate">
          <button
            onClick={() => {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              window.location.href = '/login'
            }}
            className="sidebar-link text-danger hover:bg-red-50 dark:hover:bg-danger/10 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

export function Header({ onMenuToggle }) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-deep/80 backdrop-blur border-b border-mist dark:border-slate">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-slate hover:text-deep dark:text-steel dark:hover:text-snow rounded-md hover:bg-mist dark:hover:bg-slate"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-heading font-semibold text-deep dark:text-snow hidden sm:block">School Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate hover:text-deep dark:text-steel dark:hover:text-snow rounded-md hover:bg-mist dark:hover:bg-slate"
            title="Toggle theme"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          <div className="hidden md:flex items-center gap-3 p-2 bg-mist/50 dark:bg-slate rounded-lg">
            <div className="w-8 h-8 rounded-full bg-deep dark:bg-slate flex items-center justify-center">
              <span className="text-white text-xs font-medium">{user && user.firstName ? user.firstName[0] : ''}{user && user.lastName ? user.lastName[0] : ''}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-deep dark:text-snow">{user && user.firstName} {user && user.lastName}</p>
              <p className="text-xs text-slate dark:text-steel capitalize">{user && user.role}</p>
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              window.location.href = '/login'
            }}
            className="btn btn-ghost btn-sm text-danger hover:bg-red-50 dark:hover:bg-danger/10"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
