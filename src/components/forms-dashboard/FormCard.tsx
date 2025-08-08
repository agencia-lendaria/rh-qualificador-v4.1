import React from 'react'
import { Calendar, CheckCircle, Clock, Download, ExternalLink, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface FormWithStats {
  id: number;
  vaga_do_form: string;
  created_at: string;
  responses_count: number;
  questions_count: number;
  questionCount: number;        // Número de perguntas do formulário
  candidateCount: number;       // Número de candidatos que se candidataram
  averageScore: number | null;  // Score médio dos candidatos (se houver análise)
  lastActivity: string | null;  // Data da última candidatura
  status: 'active' | 'draft' | 'closed'; // Status do formulário
}

interface FormCardProps {
  form: FormWithStats
  onFormClick: (form: FormWithStats) => void
  onExport: (formName: string) => void
  onDelete: (formId: number) => void
}

export function FormCard({ form, onFormClick, onExport, onDelete }: FormCardProps) {
  const engagement = Math.min(100, form.candidateCount * 10)
  const statusColor = form.status === 'active' ? 'status-success' : form.status === 'draft' ? 'status-warning' : 'status-info'

  const handleCardClick = () => {
    onFormClick(form)
  }

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation()
    onExport(form.vaga_do_form)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(form.id)
  }

  const handleViewForm = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(`/formulario/${form.id}`, '_blank')
  }

  return (
    <div className="modern-card cursor-pointer group animate-fade-in hover:scale-105 transition-all duration-300" onClick={handleCardClick}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="text-xs text-text-muted font-medium uppercase tracking-wider">Form #{form.id}</div>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-text-primary mb-2 group-hover:text-primary transition-colors line-clamp-2">{form.vaga_do_form}</h3>
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-text-secondary">
            <Calendar className="w-3 h-3" />
            <span>{form.created_at ? new Date(form.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'N/A'}</span>
          </div>
        </div>
        <div className={`status-badge ${statusColor} text-xs`}>
          {form.status === 'active' ? (
            <>
              <CheckCircle className="w-3 h-3" />
              <span>Ativo</span>
            </>
          ) : form.status === 'draft' ? (
            <>
              <Clock className="w-3 h-3" />
              <span>Draft</span>
            </>
          ) : (
            <>
              <Clock className="w-3 h-3" />
              <span>Fechado</span>
            </>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-primary mb-1">{form.candidateCount}</div>
          <div className="text-xs text-text-secondary uppercase tracking-wide">Candidatos</div>
        </div>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-secondary mb-1">{form.questionCount}</div>
          <div className="text-xs text-text-secondary uppercase tracking-wide">Perguntas</div>
        </div>
      </div>

      {/* Progress */}
      {form.candidateCount > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-secondary">Engajamento</span>
            <span className="text-xs font-medium text-text-primary">{engagement}%</span>
          </div>
          <Progress value={engagement} />
        </div>
      )}

      {/* Score */}
      {form.averageScore && (
        <div className="mb-4 p-2 bg-success/10 rounded-lg border border-success/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">Score Médio</span>
            <span className="text-sm font-bold text-success">{Math.round(form.averageScore)}/100</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="btn-modern btn-primary shimmer-button text-xs px-3 sm:px-4 py-2 sm:py-2.5 font-medium"
            onClick={handleViewForm}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            <span>Visualizar</span>
          </Button>

          {form.candidateCount > 0 && (
            <Button
              variant="outline"
              className="btn-modern btn-success shimmer-button text-xs px-3 sm:px-4 py-2 sm:py-2.5 font-medium"
              onClick={handleExport}
            >
              <Download className="w-3 h-3 mr-1" />
              <span>Exportar</span>
            </Button>
          )}
        </div>
        
        <Button
          variant="outline"
          className="btn-modern shimmer-button text-xs px-2 py-1.5"
          style={{ backgroundColor: '#2D3748', color: 'white', borderColor: '#2D3748' }}
          onClick={handleDelete}
        >
          <Download className="w-3 h-3" />
        </Button>
      </div>
    </div>
  )
}

