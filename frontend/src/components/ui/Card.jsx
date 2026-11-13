import { cn } from '@/lib/utils'

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn('bg-white rounded-xl border border-mist shadow-sm overflow-hidden dark:bg-deep dark:border-slate dark:shadow-none', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }) {
  return (
    <div className={cn('px-6 py-4 border-b border-mist dark:border-slate', className)}>
      {children}
    </div>
  )
}

export function CardBody({ className, children }) {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  )
}
