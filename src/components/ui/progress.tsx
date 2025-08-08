import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number // 0-100
}

export function Progress({ className, value = 0, ...props }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className={cn('relative h-2 w-full overflow-hidden rounded bg-muted', className)} {...props}>
      <div
        className="h-full w-full flex-1 bg-primary"
        style={{ width: `${clamped}%`, transition: 'width 200ms ease' }}
        aria-hidden
      />
      <span className="sr-only" role="status" aria-live="polite">{clamped}%</span>
    </div>
  )
}

