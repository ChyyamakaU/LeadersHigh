import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Card, CardBody } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Lock, Mail, User, ShieldAlert } from 'lucide-react'

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    login(emailOrUsername, password)
      .then(() => {
        navigate('/')
      })
      .catch((err) => {
        setError(err.message || 'Login failed. Please try again.')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <div className="min-h-screen bg-snow dark:bg-primary flex items-center justify-center p-4 sm:p-8 lg:p-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardBody className="p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-info rounded-xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-deep dark:text-snow">Welcome Back</h1>
            <p className="text-slate dark:text-steel mt-2">Sign in to your school management account</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-md bg-danger/10 border border-danger/20 text-danger text-sm dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email or Username</label>
              <Input
                type="text"
                placeholder="Enter your email or username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate dark:text-steel mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-info hover:underline font-medium">
              Contact administrator
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  )
}
