import { cn } from '@/lib/utils'

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="bg-white dark:bg-deep rounded-xl border border-mist dark:border-slate shadow-xl w-full max-w-md mx-4 animate-slide-in">
        <div className="px-6 py-4 border-b border-mist dark:border-slate flex justify-between items-center">
          {title && <h3 className="text-lg font-heading font-semibold text-deep dark:text-snow">{title}</h3>}
          <button
            onClick={onClose}
            className="text-slate hover:text-deep dark:text-steel dark:hover:text-snow"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  )
}
