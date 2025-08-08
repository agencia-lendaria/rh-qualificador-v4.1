// Meeting analysis types
export interface UploadedDocument {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: Date
  status: 'uploading' | 'uploaded' | 'processing' | 'processed' | 'error'
  url?: string
  bucketPath?: string
}

export interface MeetingAnalysis {
  id: string
  documentId: string
  summary: string
  keyPoints: string[]
  actionItems: string[]
  participants: string[]
  duration?: number
  createdAt: Date
}

export interface AnalysisResult {
  success: boolean
  data?: MeetingAnalysis
  error?: string
}

// Component props
export interface UploadAreaProps {
  onFileUpload: (file: File) => Promise<void>
  disabled?: boolean
  maxSize?: number
  acceptedTypes?: string[]
}

export interface DocumentsListProps {
  documents: UploadedDocument[]
  onRemove: (id: string) => void
  onAnalyze?: (id: string) => void
}

export interface DocumentItemProps {
  document: UploadedDocument
  onRemove: (id: string) => void
  onAnalyze?: (id: string) => void
}

// Upload states
export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'
export type DocumentStatus = 'uploading' | 'uploaded' | 'processing' | 'processed' | 'error'

// File validation
export interface FileValidation {
  maxSize: number // in bytes
  allowedTypes: string[]
  maxFiles?: number
}

export const DEFAULT_FILE_VALIDATION: FileValidation = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['.pdf', '.doc', '.docx', '.txt'],
  maxFiles: 5
}

// Analysis filters
export interface AnalysisFilters {
  dateRange?: {
    start: Date
    end: Date
  }
  status?: DocumentStatus[]
  search?: string
}