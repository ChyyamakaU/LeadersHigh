import { Link } from 'react-router-dom'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { StatCard } from '../../components/dashboard/StatCard'
import { TableComponent } from '../../components/dashboard/TableComponent'
import { Badge } from '../../components/ui/Badge'
import { Users, User, ClipboardList, Activity } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export default function StaffDashboard() {
  const stats = [
    { title: 'Prefects Managed', value: '23', subtitle: 'Active prefects', trend: { value: '2%', positive: true }, icon: Users },
    { title: 'Students Managed', value: '456', subtitle: 'Under supervision', trend: { value: '5%', positive: true }, icon: User },
    { title: 'Pending Tasks', value: '12', subtitle: 'Awaiting completion', trend: { value: '5%', positive: false }, icon: ClipboardList },
  ]

  const recentStudents = [
    { name: 'Alice Learner', role: 'JSS 1A', prefect: 'Mike Monitor', status: 'Active' },
    { name: 'Bob Scholar', role: 'JSS 1B', prefect: 'Sarah Hall', status: 'Active' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-deep dark:text-snow">Staff Dashboard</h1>
        <p className="text-slate dark:text-steel">Manage prefects and students under your supervision</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-heading font-semibold text-deep dark:text-snow">Student Records</h2>
          </CardHeader>
          <CardBody>
            <TableComponent
              columns={['Name', 'Class', 'Assigned Prefect', 'Status']}
              data={recentStudents.map((s) => ({
                name: s.name,
                class: s.role,
                prefect: s.prefect,
                status: <Badge variant="success">Active</Badge>,
              }))}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-heading font-semibold text-deep dark:text-snow">Quick Actions</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <Button variant="secondary" className="w-full" as={Link} to="/staff/prefects">
              <Users className="w-4 h-4 mr-2" /> Manage Prefects
            </Button>
            <Button variant="secondary" className="w-full" as={Link} to="/staff/students">
              <User className="w-4 h-4 mr-2" /> Manage Students
            </Button>
            <Button variant="info" className="w-full" as={Link} to="/staff/tasks">
              <ClipboardList className="w-4 h-4 mr-2" /> View Tasks
            </Button>
            <Button variant="warning" className="w-full" as={Link} to="/staff/attendance">
              <Activity className="w-4 h-4 mr-2" /> Record Attendance
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
