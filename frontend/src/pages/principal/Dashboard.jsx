import { Link } from 'react-router-dom'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { StatCard } from '../../components/dashboard/StatCard'
import { TableComponent } from '../../components/dashboard/TableComponent'
import { Badge } from '../../components/ui/Badge'
import { Users, User, ClipboardList, Activity, Bell } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export default function PrincipalDashboard() {
  const stats = [
    { title: 'Total Users', value: '1,247', subtitle: 'All registered users', trend: { value: '12%', positive: true }, icon: Users },
    { title: 'Staff Members', value: '45', subtitle: 'Active staff', trend: { value: '3%', positive: true }, icon: User },
    { title: 'Prefects', value: '23', subtitle: 'Student leaders', trend: { value: '2%', positive: true }, icon: User },
    { title: 'Students', value: '1,179', subtitle: 'Enrolled students', trend: { value: '5%', positive: true }, icon: Users },
  ]

  const recentStaff = [
    { name: 'Jane Teacher', role: 'Staff - Mathematics', status: 'Active', joined: '2024-01-15' },
    { name: 'Mike Monitor', role: 'Prefect - Sanitation', status: 'Active', joined: '2024-02-01' },
    { name: 'Alice Learner', role: 'Student - JSS 1A', status: 'Active', joined: '2024-03-10' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-deep dark:text-snow">Principal Dashboard</h1>
        <p className="text-slate dark:text-steel">School overview and administrative controls</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-heading font-semibold text-deep dark:text-snow">Recent Activities</h2>
          </CardHeader>
          <CardBody>
            <TableComponent
              columns={['Name', 'Role', 'Status', 'Joined']}
              data={recentStaff.map((s) => ({
                name: s.name,
                role: s.role,
                status: <Badge variant="success">Active</Badge>,
                joined: s.joined,
              }))}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-heading font-semibold text-deep dark:text-snow">Quick Actions</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <Button variant="primary" className="w-full" as={Link} to="/principal/staff">
              <Users className="w-4 h-4 mr-2" /> Manage Staff
            </Button>
            <Button variant="secondary" className="w-full" as={Link} to="/principal/prefects">
              <User className="w-4 h-4 mr-2" /> Manage Prefects
            </Button>
            <Button variant="info" className="w-full" as={Link} to="/principal/students">
              <Users className="w-4 h-4 mr-2" /> Manage Students
            </Button>
            <Button variant="warning" className="w-full" as={Link} to="/principal/tasks">
              <ClipboardList className="w-4 h-4 mr-2" /> Manage Tasks
            </Button>
            <Button variant="ghost" className="w-full" as={Link} to="/principal/attendance">
              <Activity className="w-4 h-4 mr-2" /> View Attendance
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
