import { cn } from '@/lib/utils'

export function Button({ className, variant = 'primary', size = 'md', disabled, ...props }) {
  const variants = {
    primary: 'bg-deep text-white hover:bg-slate focus:ring-deep',
    secondary: 'bg-mist text-deep hover:bg-steel focus:ring-steel',
    success: 'bg-success text-white hover:bg-[#1e6a47] focus:ring-success',
    warning: 'bg-warning text-white hover:bg-[#a6732d] focus:ring-warning',
    danger: 'bg-danger text-white hover:bg-[#ad4a4a] focus:ring-danger',
    info: 'bg-info text-white hover:bg-[#3f6d8c] focus:ring-info',
    ghost: 'bg-transparent text-slate hover:bg-mist focus:ring-steel',
  }

  const sizes = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={cn(
        'btn inline-flex items-center justify-center rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    />
  )
}
