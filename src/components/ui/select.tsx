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
        'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        hasError ? 'border-destructive focus-visible:ring-destructive' : 'border-input',
        className
      )}
      aria-invalid={hasError || undefined}
      {...props}
    >
      {children}
    </select>
  )
}

