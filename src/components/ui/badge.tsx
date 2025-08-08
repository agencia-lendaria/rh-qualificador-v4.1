import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
  {
    variants: {
      variant: {
        success: 'border-transparent bg-[color:rgba(16,185,129,0.1)] text-[color:#10b981]',
        info: 'border-transparent bg-[color:rgba(99,102,241,0.1)] text-[color:#6366f1]',
        warning: 'border-transparent bg-[color:rgba(245,158,11,0.1)] text-[color:#f59e0b]',
        destructive: 'border-transparent bg-destructive text-destructive-foreground'
      }
    },
    defaultVariants: {
      variant: 'info'
    }
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { badgeVariants }

