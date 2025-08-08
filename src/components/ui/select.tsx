import * as React from 'react'
import { cn } from '@/lib/utils'

export interface NativeSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean
}

export function Select({ className, hasError, children, ...props }: NativeSelectProps) {
  return (
    <select
      className={cn(
        // Base styling with improved contrast
        'flex h-10 w-full rounded-md px-3 py-2 text-sm ring-offset-background',
        // Enhanced background and text contrast
        'bg-surface-raised text-text-primary border-2',
        // Focus states with better visibility
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'focus:border-primary focus:bg-surface-elevated',
        // Hover states for better UX
        'hover:bg-surface-elevated hover:border-primary/50 transition-all duration-200',
        // Disabled state
        'disabled:cursor-not-allowed disabled:opacity-50',
        // Error state or default border
        hasError ? 'border-destructive focus-visible:ring-destructive' : 'border-border',
        // Dropdown arrow styling
        'appearance-none bg-[url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzY2NjY2NiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHN2Zz4K")] bg-no-repeat bg-[right_12px_center] bg-[length:12px_8px] pr-10',
        className
      )}
      aria-invalid={hasError || undefined}
      {...props}
    >
      {children}
    </select>
  )
}

