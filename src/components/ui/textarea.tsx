import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean
  label?: string
  description?: string
  errorMessage?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, label, description, errorMessage, id, rows = 3, ...props }, ref) => {
    const generatedId = React.useId()
    const textareaId = id || generatedId
    const descriptionId = description ? `${textareaId}-description` : undefined
    const errorId = errorMessage ? `${textareaId}-error` : undefined
    
    const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined
    const isInvalid = hasError || Boolean(errorMessage)

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={textareaId}
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

        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'flex w-full rounded-lg border bg-surface px-3 py-2 text-sm text-text-primary transition-colors',
            'placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-raised resize-y',
            'hover:border-primary/50 focus:border-primary',
            isInvalid
              ? 'border-destructive focus-visible:ring-destructive'
              : 'border-border',
            className
          )}
          rows={rows}
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
Textarea.displayName = 'Textarea'

