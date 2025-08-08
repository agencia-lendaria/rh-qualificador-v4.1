// Common types used across the application

// Navigation types
export type NavigationTab = 'chat' | 'forms' | 'meetings'

export interface NavigationProps {
  activeTab: NavigationTab
  onTabChange: (tab: NavigationTab) => void
}

// Theme types
export type Theme = 'light' | 'dark' | 'system' | 'high-contrast'

export interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

// Loading states
export interface LoadingState {
  isLoading: boolean
  error?: string | null
  message?: string
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Pagination types
export interface PaginationState {
  page: number
  limit: number
  total: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showPageNumbers?: boolean
  className?: string
}

// Sort and filter types
export interface SortConfig<T = string> {
  field: T
  direction: 'asc' | 'desc'
}

export interface FilterConfig {
  field: string
  value: unknown
  operator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like'
}

// Form validation types
export interface ValidationError {
  field: string
  message: string
}

export interface FormState<T = Record<string, unknown>> {
  data: T
  errors: ValidationError[]
  isValid: boolean
  isDirty: boolean
  isSubmitting: boolean
}

// File types
export interface FileUpload {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

// Toast notification types
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

// Generic component props
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
  'data-testid'?: string
}

// Accessibility types
export interface A11yProps {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-selected'?: boolean
  role?: string
}