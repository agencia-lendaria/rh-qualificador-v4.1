import { z } from 'zod'

// Base form interfaces from Supabase
export interface FormularioNome {
  id: number
  job_title: string
  form_id: string
  created_at: string
}

export interface FormularioPergunta {
  id: number
  q1?: string
  q2?: string
  q3?: string
  q4?: string
  q5?: string
  q6?: string
  q7?: string
  q8?: string
  q9?: string
  q10?: string
  q11?: string
  q12?: string
  q13?: string
  q14?: string
  q15?: string
}

export interface FormularioResposta {
  id: number
  response_id: string
  user_name: string
  user_email: string | null
  user_phone?: string | null
  created_at: string
  cv_bucket_link?: string | null
  a1?: string | null
  a2?: string | null
  a3?: string | null
  a4?: string | null
  a5?: string | null
  a6?: string | null
  a7?: string | null
  a8?: string | null
  a9?: string | null
  a10?: string | null
  a11?: string | null
  a12?: string | null
  a13?: string | null
  a14?: string | null
  a15?: string | null
}

// Extended interfaces for UI components
export interface FormWithStats extends FormularioNome {
  responseCount?: number
  lastResponseDate?: string
}

export interface ProcessedResponse {
  id: number
  response_id: string
  user_name: string
  user_email: string | null
  user_phone?: string | null
  created_at: string
  cv_bucket_link?: string | null
  answers: Record<string, string>
}

// Form submission types
export const formSubmissionSchema = z
  .object({
    user_name: z.string().min(1, 'Nome é obrigatório'),
    user_email: z.string().email('Email inválido').optional().or(z.literal('')),
    user_phone: z.string().optional().or(z.literal('')),
  })
  .passthrough()

export type FormSubmissionData = z.infer<typeof formSubmissionSchema>

// Form validation states
export type SubmitStatus = 'idle' | 'success' | 'error'
export type ViewMode = 'forms' | 'responses'

// Export interfaces
export interface FormCardProps {
  form: FormWithStats
  onFormClick: (form: FormWithStats) => void
  onExport?: (form: FormWithStats) => void
  onDelete?: (id: number) => void
}

export interface ResponseCardProps {
  response: ProcessedResponse
  index: number
  formQuestions: FormularioPergunta | null
  responsesWithAnalysis?: Array<{ response_id: string; analysis?: unknown }>
  onApplicantClick: (response: ProcessedResponse) => void
  onViewAnalysis?: (responseId: string) => void
}

// Filter types
export interface FormFilters {
  search: string
  status: 'all' | 'active' | 'archived'
  dateRange?: {
    start: Date
    end: Date
  }
}