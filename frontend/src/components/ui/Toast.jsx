import { createContext, useContext, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ title, description, variant = 'default' }) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, title, description, variant }])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-2">
        {toasts.map(({ id, title, description, variant }) => (
          <div
            key={id}
            className={cn(
              'w-96 rounded-lg border p-4 shadow-lg transition-all',
              variant === 'destructive' 
                ? 'bg-destructive text-destructive-foreground border-destructive' 
                : 'bg-background border-border'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {title && <div className="font-semibold">{title}</div>}
                {description && <div className="text-sm mt-1 opacity-90">{description}</div>}
              </div>
              <button
                onClick={() => dismissToast(id)}
                className="ml-4 opacity-70 hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
