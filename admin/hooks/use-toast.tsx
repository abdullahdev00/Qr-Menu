// Simple toast hook for admin panel
import { useState, useCallback } from 'react'

interface Toast {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

interface ToastState {
  toasts: (Toast & { id: string })[]
}

let toastCount = 0

export function useToast() {
  const [state, setState] = useState<ToastState>({ toasts: [] })

  const toast = useCallback(({ title, description, variant = 'default' }: Toast) => {
    const id = (++toastCount).toString()
    const newToast = { id, title, description, variant }
    
    setState(prev => ({
      toasts: [...prev.toasts, newToast]
    }))

    // Auto remove after 5 seconds
    setTimeout(() => {
      setState(prev => ({
        toasts: prev.toasts.filter(t => t.id !== id)
      }))
    }, 5000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setState(prev => ({
      toasts: prev.toasts.filter(t => t.id !== id)
    }))
  }, [])

  return {
    toast,
    dismiss,
    toasts: state.toasts
  }
}