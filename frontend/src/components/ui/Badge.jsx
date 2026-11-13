import { cn } from '@/lib/utils'

export function Badge({ className, variant = 'slate', ...props }) {
  const variants = {
    success: 'bg-success text-white',
    warning: 'bg-warning text-white',
    danger: 'bg-danger text-white',
    info: 'bg-info text-white',
    slate: 'bg-mist text-deep dark:bg-slate dark:text-snow',
  }

  return (
    <span
      className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider', variants[variant], className)}
      {...props}
    />
  )
}
