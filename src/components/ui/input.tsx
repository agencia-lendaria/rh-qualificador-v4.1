import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
  label?: string
  description?: string
  errorMessage?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, label, description, errorMessage, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || generatedId
    const descriptionId = description ? `${inputId}-description` : undefined
    const errorId = errorMessage ? `${inputId}-error` : undefined
    
    const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined
    const isInvalid = hasError || Boolean(errorMessage)

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
            {props.required && (
              <span className="text-destructive ml-1" aria-label="obrigatório">*</span>
            )}
          </label>
        )}
        
        {description && (
          <p 
            id={descriptionId} 
            className="text-sm text-text-secondary"
          >
            {description}
          </p>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'flex h-10 w-full rounded-lg border bg-surface px-3 py-2 text-sm text-text-primary transition-colors',
            'placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-raised',
            'hover:border-primary/50 focus:border-primary',
            isInvalid 
              ? 'border-destructive focus-visible:ring-destructive' 
              : 'border-border',
            className
          )}
          aria-invalid={isInvalid || undefined}
          aria-describedby={ariaDescribedBy}
          {...props}
        />
        
        {errorMessage && (
          <p 
            id={errorId}
            className="text-sm text-destructive flex items-center gap-1"
            role="alert"
          >
            <span className="inline-block w-4 h-4 text-xs">⚠</span>
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }

