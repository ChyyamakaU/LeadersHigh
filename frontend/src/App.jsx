import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import DashboardLayout from './components/layout/DashboardLayout'
import Login from './pages/auth/Login'
import PrincipalDashboard from './pages/principal/Dashboard'
import StaffDashboard from './pages/staff/Dashboard'
import PrefectDashboard from './pages/prefect/Dashboard'
import StudentDashboard from './pages/student/Dashboard'

function RequireAuth({ children, roles }) {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-snow dark:bg-deep">
        <div className="animate-ping rounded-full h-8 w-8 bg-info"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user && user.role)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-snow dark:bg-deep text-deep dark:text-snow">
        <h1 className="text-2xl font-heading font-bold mb-2">Access Denied</h1>
        <p className="text-slate dark:text-steel">You do not have permission to view this page.</p>
        <button
          onClick={() => window.history.back()}
          className="mt-6 btn btn-primary"
        >
          Go Back
        </button>
      </div>
    )
  }

  return <>{children}</>
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<PrincipalDashboard />} />
          <Route path="principal" element={<PrincipalDashboard />} />
          <Route path="staff" element={<RequireAuth roles={['principal', 'staff']}><StaffDashboard /></RequireAuth>} />
          <Route path="prefect" element={<RequireAuth roles={['principal', 'staff', 'prefect']}><PrefectDashboard /></RequireAuth>} />
          <Route path="student" element={<RequireAuth roles={['principal', 'staff', 'prefect', 'student']}><StudentDashboard /></RequireAuth>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
