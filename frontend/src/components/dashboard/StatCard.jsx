import { Card, CardBody } from '../ui/Card'
import { Badge } from '../ui/Badge'

export function StatCard({ title, value, subtitle, trend, icon: Icon }) {
  const trendColor = trend && trend.positive ? 'text-success' : 'text-danger'

  return (
    <Card className="animate-fade-in">
      <CardBody>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate dark:text-steel">{title}</p>
            <h3 className="text-2xl font-heading font-bold text-deep dark:text-snow mt-1">{value}</h3>
            {subtitle && <p className="text-xs text-slate dark:text-steel mt-0.5">{subtitle}</p>}
          </div>
          {Icon && <Icon className="w-8 h-8 text-mist dark:text-slate" />}
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1">
            <span className={trendColor && `text-xs font-medium ${trendColor}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </span>
            <span className="text-xs text-slate dark:text-steel">vs last period</span>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
