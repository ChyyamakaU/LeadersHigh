import { Link } from 'react-router-dom'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { StatCard } from '../../components/dashboard/StatCard'
import { TableComponent } from '../../components/dashboard/TableComponent'
import { Badge } from '../../components/ui/Badge'
import { User, ClipboardList, Activity } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export default function StudentDashboard() {
  const stats = [
    { title: 'My Tasks', value: '5', subtitle: 'Assigned to you', trend: { value: '2', positive: false }, icon: ClipboardList },
    { title: 'Completed', value: '3', subtitle: 'Finished tasks', trend: { value: '60%', positive: true }, icon: User },
    { title: 'Attendance', value: '94%', subtitle: 'Present this term', trend: { value: '3%', positive: true }, icon: Activity },
  ]

  const myTasks = [
    { title: 'Sweep Classroom', due: '2024-03-15', status: 'In Progress' },
    { title: 'Organize Assembly', due: '2024-03-18', status: 'Pending' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-deep dark:text-snow">Student Dashboard</h1>
        <p className="text-slate dark:text-steel">View your profile, tasks, and attendance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-heading font-semibold text-deep dark:text-snow">Your Tasks</h2>
          </CardHeader>
          <CardBody>
            <TableComponent
              columns={['Task', 'Due Date', 'Status']}
              data={myTasks.map((t) => ({
                task: t.title,
                due: t.due,
                status: <Badge variant={t.status === 'Completed' ? 'success' : 'warning'}>{t.status}</Badge>,
              }))}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-heading font-semibold text-deep dark:text-snow">Profile</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-deep flex items-center justify-center">
                <span className="text-white text-xl font-medium">S</span>
              </div>
              <div>
                <p className="font-medium text-deep dark:text-snow">Alice Learner</p>
                <p className="text-sm text-slate dark:text-steel">JSS 1A - STU001</p>
              </div>
            </div>
            <div className="pt-4 border-t border-mist dark:border-slate">
              <Button variant="ghost" className="w-full text-left">
                Edit Profile
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
