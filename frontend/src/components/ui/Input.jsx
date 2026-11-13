import { cn } from '@/lib/utils'

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'block w-full px-4 py-2.5 text-sm text-deep bg-white border border-mist rounded-md focus:border-info focus:ring-2 focus:ring-info focus:ring-opacity-20 transition-all duration-200 dark:bg-deep dark:text-snow dark:border-slate',
        className
      )}
      {...props}
    />
  )
}
