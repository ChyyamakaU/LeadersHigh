import { Link } from 'react-router-dom'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { StatCard } from '../../components/dashboard/StatCard'
import { TableComponent } from '../../components/dashboard/TableComponent'
import { Badge } from '../../components/ui/Badge'
import { User, ClipboardList, Activity } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export default function PrefectDashboard() {
  const stats = [
    { title: 'Students Supervised', value: '34', subtitle: 'Under your care', trend: { value: '3%', positive: true }, icon: User },
    { title: 'Active Tasks', value: '8', subtitle: 'Pending completion', trend: { value: '2%', positive: false }, icon: ClipboardList },
    { title: 'Attendance Today', value: '32/34', subtitle: 'Present today', trend: { value: '94%', positive: true }, icon: Activity },
  ]

  const supervisedStudents = [
    { name: 'Alice Learner', class: 'JSS 1A', duty: 'Sweeping', status: 'Pending' },
    { name: 'Bob Scholar', class: 'JSS 1A', duty: 'Assembly setup', status: 'Completed' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-deep dark:text-snow">Prefect Dashboard</h1>
        <p className="text-slate dark:text-steel">Manage your supervised students and duties</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-heading font-semibold text-deep dark:text-snow">Supervised Students</h2>
          </CardHeader>
          <CardBody>
            <TableComponent
              columns={['Name', 'Class', 'Duty', 'Status']}
              data={supervisedStudents.map((s) => ({
                name: s.name,
                class: s.class,
                duty: s.duty,
                status: <Badge variant={s.status === 'Completed' ? 'success' : 'warning'}>{s.status}</Badge>,
              }))}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-heading font-semibold text-deep dark:text-snow">Quick Actions</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <Button variant="info" className="w-full" as={Link} to="/prefect/students">
              <User className="w-4 h-4 mr-2" /> View Students
            </Button>
            <Button variant="primary" className="w-full" as={Link} to="/prefect/tasks">
              <ClipboardList className="w-4 h-4 mr-2" /> Create Task
            </Button>
            <Button variant="warning" className="w-full" as={Link} to="/prefect/attendance">
              <Activity className="w-4 h-4 mr-2" /> Record Attendance
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
