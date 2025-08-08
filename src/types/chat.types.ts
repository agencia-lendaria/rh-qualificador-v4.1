// Chat interface types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: {
    jobDescription?: string
    formGenerated?: boolean
    formId?: string
  }
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

// Webhook types for chat integration
export interface WebhookRequest {
  session_id: string
  jobDescription: string
  action?: 'generate_form' | 'generate_description'
}

export interface WebhookResponse {
  success: boolean
  data?: {
    formId?: string
    questions?: Record<string, string>
    description?: string
  }
  error?: string
}

// Chat component props
export interface ChatInterfaceProps {
  sessionId?: string
  onFormGenerated?: (formId: string) => void
}

export interface MessageListProps {
  messages: ChatMessage[]
  isLoading: boolean
}

export interface MessageItemProps {
  message: ChatMessage
  isLast: boolean
}

export interface ComposerProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
  disabled?: boolean
}

// Chat states
export type ChatState = 'idle' | 'loading' | 'error' | 'success'
export type MessageRole = 'user' | 'assistant'