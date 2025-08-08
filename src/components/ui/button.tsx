import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg hover:shadow-xl hover:scale-105 focus-visible:ring-primary',
        secondary: 'border border-border bg-surface-raised text-text-primary hover:bg-surface-elevated hover:border-primary focus-visible:ring-primary',
        success: 'bg-gradient-to-r from-success to-success-light text-white shadow-lg hover:shadow-xl hover:scale-105 focus-visible:ring-success',
        warning: 'bg-gradient-to-r from-warning to-warning-light text-white shadow-lg hover:shadow-xl hover:scale-105 focus-visible:ring-warning',
        destructive: 'bg-gradient-to-r from-error to-error-light text-white shadow-lg hover:shadow-xl hover:scale-105 focus-visible:ring-error',
        ghost: 'bg-transparent text-text-primary hover:bg-surface-raised hover:text-text-primary focus-visible:ring-primary',
        info: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105 focus-visible:ring-blue-500'
      },
      size: {
        sm: 'h-8 px-3 py-1.5 text-xs',
        md: 'h-10 px-4 py-2 text-sm',
        lg: 'h-12 px-6 py-3 text-base'
      },
      isLoading: {
        true: 'cursor-wait opacity-75',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      isLoading: false
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loadingText?: string
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant,
  size,
  isLoading,
  leftIcon,
  rightIcon,
  children,
  disabled,
  loadingText,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => {
  const isDisabled = disabled || Boolean(isLoading)
  
  // Generate accessible label for loading state
  const effectiveAriaLabel = ariaLabel || (isLoading && loadingText ? `${loadingText}...` : undefined)
  
  // Screen reader text for loading state
  const loadingSpinner = isLoading ? (
    <svg 
      className="animate-spin -ml-1 mr-2 h-4 w-4" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ) : null

  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, isLoading }), className)}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      aria-label={effectiveAriaLabel}
      aria-describedby={ariaDescribedBy}
      {...props}
    >
      {isLoading && loadingSpinner}
      {leftIcon && !isLoading ? <span className="mr-2 inline-flex items-center" aria-hidden="true">{leftIcon}</span> : null}
      <span className="inline-flex items-center">
        {isLoading && loadingText ? loadingText : children}
      </span>
      {rightIcon && !isLoading ? <span className="ml-2 inline-flex items-center" aria-hidden="true">{rightIcon}</span> : null}
      {isLoading && (
        <span className="sr-only">
          {loadingText || 'Carregando'}, aguarde...
        </span>
      )}
    </button>
  )
})

Button.displayName = 'Button'

export { Button }

export { buttonVariants }

