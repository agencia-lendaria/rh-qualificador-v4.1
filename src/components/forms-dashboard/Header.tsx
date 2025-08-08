import React from 'react'
import { BarChart3 } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle?: string
  right?: React.ReactNode
}

export function Header({ title, subtitle, right }: HeaderProps) {
  return (
    <div className="glass-effect border-b border-border px-4 sm:px-6 py-4 sm:py-6 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary truncate">{title}</h1>
              {subtitle ? <p className="text-sm sm:text-base text-text-secondary truncate">{subtitle}</p> : null}
            </div>
          </div>
          {right && <div className="flex-shrink-0">{right}</div>}
        </div>
      </div>
    </div>
  )
}

