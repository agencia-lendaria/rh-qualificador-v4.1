import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ArrowLeft, 
  Eye, 
  Users, 
  FileText, 
  Download,
  Trash2,
  ExternalLink,
  User,
  BarChart3,
  Plus,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Zap
} from 'lucide-react';
import { Filters as DashboardFilters, type FilterStatus, type SortBy } from '@/components/forms-dashboard/Filters'
import { Header as DashboardHeader } from '@/components/forms-dashboard/Header'
import { FormCard } from '@/components/forms-dashboard/FormCard'
import { supabase, FormularioPergunta, FormularioResposta, FormularioCandidateAnalysis } from '../lib/supabase';
import { useFormsList } from '@/hooks/useQueries/useFormsQueries'
import { Button } from '@/components/ui/button'
import { VirtualizedList } from '@/components/VirtualizedList'

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

interface FormResponse {
  id: number;
  response_id?: string;
  user_name: string;
  user_email?: string;
  created_at: string;
  cv_bucket_link?: string;
  answers: { [key: string]: string };
}

type ViewMode = 'forms' | 'responses' | 'applicant' | 'analysis';


// Types for components (removed unused virtualizer types)

// Memoized Response Card Component
const ResponseCard = React.memo<{
  response: FormResponse;
  index: number;
  formQuestions: FormularioPergunta | null;
  responsesWithAnalysis: Set<string>;
  onApplicantClick: (applicant: FormResponse) => void;
  onViewAnalysis: (applicant: FormResponse) => void;
}>(({
  response,
  index,
  formQuestions,
  responsesWithAnalysis,
  onApplicantClick,
  onViewAnalysis
}) => {
  const handleCardClick = useCallback(() => {
    onApplicantClick(response);
  }, [response, onApplicantClick]);

  const handleProfileClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onApplicantClick(response);
  }, [response, onApplicantClick]);

  const handleAnalysisClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onViewAnalysis(response);
  }, [response, onViewAnalysis]);

  const formattedDate = useMemo(() => {
    return response.created_at ? new Date(response.created_at).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'N/A';
  }, [response.created_at]);

  const questionsCount = useMemo(() => {
    return formQuestions ? Object.keys(formQuestions).filter(key => {
      const value = formQuestions[key as keyof FormularioPergunta];
      return key.startsWith('q') && value && typeof value === 'string' && value.trim();
    }).length : 0;
  }, [formQuestions]);

  const hasAnalysis = useMemo(() => {
    return responsesWithAnalysis.has(response.response_id || '');
  }, [responsesWithAnalysis, response.response_id]);

  return (
    <div
      onClick={handleCardClick}
      className="modern-card cursor-pointer group animate-fade-in hover:scale-105 transition-all duration-300"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Candidate Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="avatar bg-gradient-to-br from-primary to-primary-dark">
          <User className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors truncate">
            {response.user_name}
          </h3>
          <p className="text-sm text-text-secondary truncate">
            {response.user_email || response.response_id}
          </p>
        </div>
      </div>

      {/* Submission Info */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Data de submissão</span>
          <span className="text-text-primary font-medium">
            {formattedDate}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Respostas</span>
          <span className="text-text-primary font-medium">
            {Object.keys(response.answers).length} de {questionsCount}
          </span>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        {hasAnalysis && (
          <div className="status-badge status-success">
            <Award className="w-3 h-3" />
            <span>Analisado</span>
          </div>
        )}
        {response.cv_bucket_link && (
          <div className="status-badge status-info">
            <FileText className="w-3 h-3" />
            <span>CV Anexo</span>
          </div>
        )}
        {!hasAnalysis && (
          <div className="status-badge status-warning">
            <Clock className="w-3 h-3" />
            <span>Pendente</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 pt-4 border-t border-border">
        <Button 
          onClick={handleProfileClick}
          variant="secondary"
          className="text-xs px-3 py-2 flex-1"
        >
          <Eye className="w-3 h-3" />
          <span>Ver Perfil</span>
        </Button>
        
        {hasAnalysis && (
          <Button
            onClick={handleAnalysisClick}
            variant="success"
            className="text-xs px-3 py-2"
          >
            <BarChart3 className="w-3 h-3" />
            <span>Análise</span>
          </Button>
        )}
        
        {response.cv_bucket_link && (
          <a
            href={response.cv_bucket_link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="btn-modern btn-primary text-xs px-3 py-2"
          >
            <FileText className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
});

// Memoized Header Actions Component
const HeaderActions = React.memo<{
  selectedForm: FormWithStats;
  onExport: (formName: string) => void;
  onDelete: (formId: number) => void;
}>(({
  selectedForm,
  onExport,
  onDelete
}) => {
  const handleExport = useCallback(() => {
    onExport(selectedForm.vaga_do_form);
  }, [onExport, selectedForm.vaga_do_form]);

  const handleDelete = useCallback(() => {
    onDelete(selectedForm.id);
  }, [onDelete, selectedForm.id]);

  return (
    <div className="flex items-center space-x-3">
      <button onClick={handleExport} className="btn-modern btn-success shimmer-button">
        <Download className="w-4 h-4" />
        <span>Exportar</span>
      </button>
      <button onClick={handleDelete} className="btn-modern btn-error">
        <Trash2 className="w-4 h-4" />
        <span>Excluir</span>
      </button>
    </div>
  );
});

// Memoized Responses Header Component
const ResponsesHeader = React.memo<{
  formResponses: FormResponse[];
  formQuestions: FormularioPergunta | null;
  responsesWithAnalysis: Set<string>;
}>(({
  formResponses,
  formQuestions,
  responsesWithAnalysis
}) => {
  const questionsCount = useMemo(() => {
    return formQuestions ? Object.keys(formQuestions).filter(key => {
      const value = formQuestions[key as keyof FormularioPergunta];
      return key.startsWith('q') && value && typeof value === 'string' && value.trim();
    }).length : 0;
  }, [formQuestions]);

  const candidatureText = useMemo(() => {
    return `${formResponses.length} candidatura${formResponses.length !== 1 ? 's' : ''}`;
  }, [formResponses.length]);

  return (
    <div className="flex items-center space-x-4 text-sm text-text-secondary mt-1">
      <div className="flex items-center space-x-1">
        <Users className="w-3 h-3" />
        <span>{candidatureText}</span>
      </div>
      <div className="flex items-center space-x-1">
        <FileText className="w-3 h-3" />
        <span>{questionsCount} perguntas</span>
      </div>
      <div className="flex items-center space-x-1">
        <Award className="w-3 h-3" />
        <span>{responsesWithAnalysis.size} analisados</span>
      </div>
    </div>
  );
});

// Memoized Applicant Summary Component
const ApplicantSummary = React.memo<{
  selectedApplicant: FormResponse;
  formQuestions: FormularioPergunta | null;
  responsesWithAnalysis: Set<string>;
}>(({
  selectedApplicant,
  formQuestions,
  responsesWithAnalysis
}) => {
  const answersCount = useMemo(() => {
    return Object.keys(selectedApplicant.answers).length;
  }, [selectedApplicant.answers]);

  const totalQuestions = useMemo(() => {
    return formQuestions ? Object.keys(formQuestions).filter(key => {
      const value = formQuestions[key as keyof FormularioPergunta];
      return key.startsWith('q') && value && typeof value === 'string' && value.trim();
    }).length : 0;
  }, [formQuestions]);

  const analysisStatus = useMemo(() => {
    const hasAnalysis = responsesWithAnalysis.has(selectedApplicant.response_id || '');
    return {
      symbol: hasAnalysis ? '✓' : '...',
      className: hasAnalysis ? 'text-success' : 'text-warning'
    };
  }, [responsesWithAnalysis, selectedApplicant.response_id]);

  return (
    <div className="modern-card">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-text-primary">Resumo da Candidatura</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            {answersCount}
          </div>
          <div className="text-sm text-text-secondary uppercase tracking-wide">
            Respostas Enviadas
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-secondary mb-1">
            {totalQuestions}
          </div>
          <div className="text-sm text-text-secondary uppercase tracking-wide">
            Perguntas Totais
          </div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold mb-1 ${analysisStatus.className}`}>
            {analysisStatus.symbol}
          </div>
          <div className="text-sm text-text-secondary uppercase tracking-wide">
            Status Análise
          </div>
        </div>
      </div>
      
      {selectedApplicant.cv_bucket_link && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-center">
            <div className="status-badge status-success">
              <FileText className="w-3 h-3" />
              <span>Currículo Anexado</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Memoized Answers List Component
const AnswersList = React.memo<{
  answers: { [key: string]: string };
  formQuestions: FormularioPergunta | null;
}>(({
  answers,
  formQuestions
}) => {
  const answerItems = useMemo(() => {
    return Object.keys(answers).map((answerKey, index) => {
      const questionNumber = answerKey.replace('a', '');
      const questionKey = `q${questionNumber}` as keyof FormularioPergunta;
      const question = formQuestions?.[questionKey];
      
      if (!question || typeof question !== 'string') return null;
      
      return {
        key: answerKey,
        questionNumber,
        question,
        answer: answers[answerKey],
        index
      };
    }).filter(Boolean);
  }, [answers, formQuestions]);

  return (
    <>
      {answerItems.map((item) => {
        if (!item) return null;
        
        return (
          <div 
            key={item.key} 
            className="modern-card animate-fade-in"
            style={{ animationDelay: `${item.index * 0.05}s` }}
          >
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">
                  {item.questionNumber}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-text-primary mb-4 leading-relaxed">
                  {item.question}
                </h4>
                <div className="bg-surface p-4 rounded-lg border-l-4 border-primary">
                  <p className="text-text-primary leading-relaxed whitespace-pre-wrap">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
});

const FormsDashboard: React.FC = () => {
  const [forms, setForms] = useState<FormWithStats[]>([]);
  const [selectedForm, setSelectedForm] = useState<FormWithStats | null>(null);
  const [formResponses, setFormResponses] = useState<FormResponse[]>([]);
  const [formQuestions, setFormQuestions] = useState<FormularioPergunta | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<FormResponse | null>(null);
  const [candidateAnalysis, setCandidateAnalysis] = useState<FormularioCandidateAnalysis | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('forms');
  const [loading, setLoading] = useState(true);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [responsesWithAnalysis, setResponsesWithAnalysis] = useState<Set<string>>(new Set());

  const { data: formsData } = useFormsList()

  // Dashboard Statistics State
  const [dashboardStats, setDashboardStats] = useState({
    totalForms: 0,
    totalCandidates: 0,
    activeFormsCount: 0,
    averagePerForm: 0
  });

  useEffect(() => {
    async function loadDashboardData() {
      if (!formsData) return
      setLoading(true)
      try {
        // 1. Busca todos os formulários (dados básicos já vêm do formsData)
        const formsData_local = formsData || [];
        
        // 2. Para cada formulário, busca dados adicionais em paralelo
        const formsWithStats = await Promise.all(
          formsData_local.map(async (form: { id: number; vaga_do_form: string; created_at: string }) => {
            // Executa todas as consultas em paralelo para cada formulário
            const [questionsResult, candidateCountResult, analysisResult, lastResponseResult] = 
              await Promise.all([
                // Consulta perguntas
                supabase.from('formularios_perguntas').select('*').eq('id', form.id).single(),
                // Conta candidatos
                supabase.from('formularios_respostas').select('*', { count: 'exact', head: true }).eq('id', form.id),
                // Busca análises 
                supabase.from('formularios_candidate_analysis').select('overall_score').eq('job_title', form.vaga_do_form),
                // Última atividade
                supabase.from('formularios_respostas').select('created_at').eq('id', form.id).order('created_at', { ascending: false }).limit(1)
              ]);
              
            // Processa questões (q1 até q15)
            let questionCount = 0;
            if (questionsResult.data) {
              for (let i = 1; i <= 15; i++) {
                const questionKey = `q${i}` as keyof FormularioPergunta;
                const question = questionsResult.data[questionKey];
                if (question && typeof question === 'string' && question.trim()) {
                  questionCount++;
                }
              }
            }

            // Determina status baseado na quantidade de perguntas
            const status: 'active' | 'draft' | 'closed' = questionCount === 0 ? 'draft' : 'active';
            
            // Conta candidatos
            const candidateCount = candidateCountResult.count || 0;
            
            // Calcula score médio
            const averageScore = analysisResult.data && analysisResult.data.length > 0
              ? analysisResult.data.reduce((sum, item) => sum + (item.overall_score || 0), 0) / analysisResult.data.length
              : null;
              
            // Última atividade
            const lastActivity = lastResponseResult.data && lastResponseResult.data.length > 0 
              ? lastResponseResult.data[0].created_at 
              : null;

            return {
              ...form,
              questionCount,
              candidateCount,
              averageScore,
              lastActivity,
              status,
              responses_count: candidateCount,
              questions_count: questionCount
            };
          })
        );

        // 3. Calcula estatísticas agregadas
        const stats = {
          totalForms: formsWithStats.length,
          totalCandidates: formsWithStats.reduce((sum, form) => sum + form.candidateCount, 0),
          activeFormsCount: formsWithStats.filter(form => form.status === 'active').length,
          averagePerForm: formsWithStats.length > 0 
            ? Math.round(formsWithStats.reduce((sum, form) => sum + form.candidateCount, 0) / formsWithStats.length)
            : 0
        };
        
        setForms(formsWithStats);
        setDashboardStats(stats);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [formsData])

  // Implementa filtros e ordenação baseado no TEMP_QUERY_DASHBOARD.md
  const filteredAndSortedForms = useMemo(() => {
    return forms
      .filter(form => {
        // Filtro de busca textual no nome da vaga
        const matchesSearch = form.vaga_do_form.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filtro por status
        const matchesFilter = filterStatus === 'all' || form.status === filterStatus;
        
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        // Ordenação conforme especificado no documento
        switch (sortBy) {
          case 'name':
            return a.vaga_do_form.localeCompare(b.vaga_do_form);
          case 'candidates':
            return b.candidateCount - a.candidateCount;
          case 'score':
            return (b.averageScore || 0) - (a.averageScore || 0);
          case 'date':
          default:
            return b.id - a.id; // Mais recentes primeiro
        }
      });
  }, [forms, searchTerm, filterStatus, sortBy]);

  const loadFormResponses = useCallback(async (formId: number) => {
    try {
      setLoadingResponses(true);
      
      // Load form questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('formularios_perguntas')
        .select('*')
        .eq('id', formId)
        .single();

      if (questionsError) {
        console.error('Error loading form questions:', questionsError);
        return;
      }

      setFormQuestions(questionsData);

      // Load form responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('formularios_respostas')
        .select('*')
        .eq('id', formId)
        .order('created_at', { ascending: false });

      if (responsesError) {
        console.error('Error loading form responses:', responsesError);
        return;
      }

      // Transform responses to include answers object
      const transformedResponses = responsesData.map(response => {
        const answers: { [key: string]: string } = {};
        for (let i = 1; i <= 15; i++) {
          const answerKey = `a${i}` as keyof FormularioResposta;
          const answer = response[answerKey];
          if (answer && typeof answer === 'string') {
            answers[`a${i}`] = answer;
          }
        }
        
        return {
          id: response.id,
          response_id: response.response_id,
          user_name: response.user_name,
          user_email: response.user_email,
          created_at: response.created_at,
          cv_bucket_link: response.cv_bucket_link,
          answers
        };
      });

      // Remove duplicates based on response_id
      const uniqueResponses = transformedResponses.filter((response, index, self) => 
        index === self.findIndex(r => r.response_id === response.response_id)
      );

      setFormResponses(uniqueResponses);

      // Load analysis data for all responses
      const responseIds = uniqueResponses.map(r => r.response_id).filter(Boolean);
      if (responseIds.length > 0) {
        const { data: analysisData, error: analysisError } = await supabase
          .from('formularios_candidate_analysis')
          .select('response_id')
          .in('response_id', responseIds);

        if (!analysisError && analysisData) {
          const analyzedResponseIds = new Set(analysisData.map(a => a.response_id));
          setResponsesWithAnalysis(analyzedResponseIds);
        }
      }
    } catch (error) {
      console.error('Error loading form responses:', error);
    } finally {
      setLoadingResponses(false);
    }
  }, []);

  const handleFormClick = useCallback((form: FormWithStats) => {
    setSelectedForm(form);
    setViewMode('responses');
    loadFormResponses(form.id);
  }, [loadFormResponses]);

  const handleApplicantClick = useCallback((applicant: FormResponse) => {
    setSelectedApplicant(applicant);
    setViewMode('applicant');
  }, []);

  const handleBackToForms = useCallback(() => {
    setSelectedForm(null);
    setFormResponses([]);
    setFormQuestions(null);
    setSelectedApplicant(null);
    setViewMode('forms');
  }, []);

  const loadCandidateAnalysis = useCallback(async (responseId: string) => {
    try {
      setLoadingAnalysis(true);
      
      const { data, error } = await supabase
        .from('formularios_candidate_analysis')
        .select('*')
        .eq('response_id', responseId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error loading candidate analysis:', error);
        return;
      }

      setCandidateAnalysis(data);
    } catch (error) {
      console.error('Error loading candidate analysis:', error);
    } finally {
      setLoadingAnalysis(false);
    }
  }, []);

  const handleBackToResponses = useCallback(() => {
    setSelectedApplicant(null);
    setCandidateAnalysis(null);
    setViewMode('responses');
  }, []);

  const handleViewAnalysis = useCallback(async (applicant: FormResponse) => {
    setSelectedApplicant(applicant);
    setViewMode('analysis');
    await loadCandidateAnalysis(applicant.response_id || '');
  }, [loadCandidateAnalysis]);

  // Removido antigo filteredForms - agora usa filteredAndSortedForms implementado acima

  const exportResponses = useCallback((formName: string) => {
    const responses = formResponses.map(response => {
      const row: Record<string, string> = {
        'ID da Resposta': response.response_id || '',
        'Nome': response.user_name,
        'Email': response.user_email || '',
        'Data': new Date(response.created_at).toLocaleDateString('pt-BR'),
        'CV': response.cv_bucket_link || ''
      };

      // Add answers
      Object.keys(response.answers).forEach(key => {
        const questionNumber = key.replace('a', '');
        row[`Pergunta ${questionNumber}`] = response.answers[key];
      });

      return row;
    });

    const csvContent = [
      Object.keys(responses[0]).join(','),
      ...responses.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `respostas_${formName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [formResponses]);

  const deleteForm = useCallback(async (formId: number) => {
    if (!confirm('Tem certeza que deseja excluir este formulário? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      // Delete responses first
      await supabase
        .from('formularios_respostas')
        .delete()
        .eq('id', formId);

      // Delete questions
      await supabase
        .from('formularios_perguntas')
        .delete()
        .eq('id', formId);

      // Delete form name
      await supabase
        .from('formularios_nomes')
        .delete()
        .eq('id', formId);

      // Reload forms via query invalidation in future; for now, rebuild stats
      setForms((prev) => prev.filter((f) => f.id !== formId))
      if (selectedForm?.id === formId) {
        handleBackToForms();
      }
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  }, [selectedForm, handleBackToForms]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">Carregando formulários...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Modern Header */}
      <DashboardHeader
        title={
          (viewMode === 'forms' && 'Dashboard de Formulários') ||
          (viewMode === 'responses' && 'Candidaturas') ||
          (viewMode === 'applicant' && 'Perfil do Candidato') ||
          (viewMode === 'analysis' && 'Análise Inteligente') ||
          ''
        }
        subtitle={
          (viewMode === 'forms' && 'Gerencie e monitore seus formulários de candidatura') ||
          (viewMode === 'responses' && selectedForm && `${selectedForm.vaga_do_form} • ${formResponses.length} candidatos • ${responsesWithAnalysis.size} analisados`) ||
          (viewMode === 'applicant' && selectedApplicant && `${selectedApplicant.user_name} • ${selectedApplicant.user_email}`) ||
          (viewMode === 'analysis' && selectedApplicant && `Análise detalhada de ${selectedApplicant.user_name}`) ||
          undefined
        }
        right={viewMode === 'responses' && selectedForm ? (
          <HeaderActions
            selectedForm={selectedForm}
            onExport={exportResponses}
            onDelete={deleteForm}
          />
        ) : undefined}
      />

      {/* Content */}
      <div className="flex-1 min-h-0">
        {viewMode === 'forms' && (
          // Forms List View
          <div className="flex flex-col">
            {/* Statistics Cards */}
            <div className="p-4 md:p-6 border-b border-border bg-gradient-to-r from-background to-surface">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  {/* Total Forms */}
                  <div className="modern-card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg sm:rounded-xl flex items-center justify-center">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-text-muted uppercase tracking-wide">Total</p>
                        <p className="text-lg sm:text-xl font-bold text-text-primary">{dashboardStats.totalForms}</p>
                        <p className="text-xs text-text-secondary">Formulários</p>
                      </div>
                    </div>
                  </div>

                  {/* Total Candidates */}
                  <div className="modern-card bg-gradient-to-br from-success/5 to-success/10 border-success/20">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-success to-success-light rounded-lg sm:rounded-xl flex items-center justify-center">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-text-muted uppercase tracking-wide">Total</p>
                        <p className="text-lg sm:text-xl font-bold text-text-primary">{dashboardStats.totalCandidates}</p>
                        <p className="text-xs text-text-secondary">Candidatos</p>
                      </div>
                    </div>
                  </div>

                  {/* Active Forms */}
                  <div className="modern-card bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-secondary to-secondary-dark rounded-lg sm:rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-text-muted uppercase tracking-wide">Ativos</p>
                        <p className="text-lg sm:text-xl font-bold text-text-primary">{dashboardStats.activeFormsCount}</p>
                        <p className="text-xs text-text-secondary">Formulários</p>
                      </div>
                    </div>
                  </div>

                  {/* Average per Form */}
                  <div className="modern-card bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-warning to-warning-light rounded-lg sm:rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-text-muted uppercase tracking-wide">Média</p>
                        <p className="text-lg sm:text-xl font-bold text-text-primary">{dashboardStats.averagePerForm}</p>
                        <p className="text-xs text-text-secondary">Por formulário</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Search and Filter */}
            <DashboardFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            {/* Modern Forms Grid */}
            <div className="flex-1 min-h-0 overflow-y-auto scroll-container smooth-scroll">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {filteredAndSortedForms.length === 0 ? (
                  <div className="text-center py-20 animate-fade-in">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <FileText className="w-12 h-12 text-text-muted" />
                    </div>
                    <h3 className="text-2xl font-bold text-text-primary mb-3">
                      {searchTerm || filterStatus !== 'all' ? 'Nenhum formulário encontrado' : 'Crie seu primeiro formulário'}
                    </h3>
                    <p className="text-text-secondary max-w-md mx-auto leading-relaxed">
                      {searchTerm || filterStatus !== 'all' 
                        ? 'Tente ajustar os filtros de busca ou criar um novo formulário.' 
                        : 'Comece gerando uma job description na aba "Chat" e depois crie seu formulário automaticamente.'}
                    </p>
                    {!searchTerm && filterStatus === 'all' && (
                      <button className="btn-modern btn-primary mt-6 shimmer-button">
                        <Plus className="w-4 h-4" />
                        <span>Ir para Chat</span>
                      </button>
                    )}
                  </div>
                ) : filteredAndSortedForms.length > 30 ? (
                  // Use virtualization for very large form lists
                  <VirtualizedList
                    items={filteredAndSortedForms}
                    height={600}
                    estimateSize={() => 320}
                    getItemKey={(form) => `form-${form.id}`}
                    className="w-full px-6"
                    renderItem={(form) => (
                      <div className="pb-6 w-full">
                        <FormCard
                          key={form.id}
                          form={form}
                          onFormClick={handleFormClick}
                          onExport={exportResponses}
                          onDelete={deleteForm}
                        />
                      </div>
                    )}
                  />
                ) : (
                  // Use regular grid for smaller lists  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 lg:gap-6">
                    {filteredAndSortedForms.map((form) => (
                      <FormCard
                        key={form.id}
                        form={form}
                        onFormClick={handleFormClick}
                        onExport={exportResponses}
                        onDelete={deleteForm}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'responses' && (
          // Modern Responses List View
          <div className="flex flex-col min-h-0">
            <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-border flex-shrink-0">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                      <Button
                      onClick={handleBackToForms}
                        variant="secondary"
                        className="px-3 py-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Voltar</span>
                      </Button>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-text-primary truncate">{selectedForm?.vaga_do_form}</h2>
                      <ResponsesHeader
                        formResponses={formResponses}
                        formQuestions={formQuestions}
                        responsesWithAnalysis={responsesWithAnalysis}
                      />
                    </div>
                  </div>
                  
                  <a
                    href={`/formulario/${selectedForm?.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-modern btn-primary shimmer-button px-3 py-2 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">Ver Formulário</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto scroll-container smooth-scroll">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {loadingResponses ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center animate-fade-in">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-text-secondary">Carregando candidaturas...</p>
                    </div>
                  </div>
                ) : formResponses.length === 0 ? (
                  <div className="text-center py-20 animate-fade-in">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Users className="w-12 h-12 text-text-muted" />
                    </div>
                    <h3 className="text-2xl font-bold text-text-primary mb-3">Aguardando candidaturas</h3>
                    <p className="text-text-secondary max-w-md mx-auto leading-relaxed">
                      Compartilhe o link do formulário para começar a receber candidaturas. Todas as respostas aparecerão aqui em tempo real.
                    </p>
                    <div className="mt-6">
                      <a
                        href={`/formulario/${selectedForm?.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-modern btn-primary shimmer-button"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Compartilhar Formulário</span>
                      </a>
                    </div>
                  </div>
                ) : formResponses.length > 20 ? (
                  // Use virtualization for large lists
                  <VirtualizedList
                    items={formResponses}
                    height={600}
                    estimateSize={() => 300}
                    getItemKey={(response) => `response-${response.id}`}
                    className="w-full"
                    renderItem={(response, index) => (
                      <div className="px-6 pb-6">
                        <ResponseCard
                          key={response.id}
                          response={response}
                          index={index}
                          formQuestions={formQuestions}
                          responsesWithAnalysis={responsesWithAnalysis}
                          onApplicantClick={handleApplicantClick}
                          onViewAnalysis={handleViewAnalysis}
                        />
                      </div>
                    )}
                  />
                ) : (
                  // Use regular grid for smaller lists
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {formResponses.map((response, index) => (
                      <ResponseCard
                        key={response.id}
                        response={response}
                        index={index}
                        formQuestions={formQuestions}
                        responsesWithAnalysis={responsesWithAnalysis}
                        onApplicantClick={handleApplicantClick}
                        onViewAnalysis={handleViewAnalysis}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'applicant' && (
          // Modern Individual Applicant View
          <div className="flex flex-col min-h-0">
            <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-border flex-shrink-0">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <button
                      onClick={handleBackToResponses}
                      className="btn-modern btn-secondary px-3 py-2 flex-shrink-0"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Voltar</span>
                    </button>
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="avatar bg-gradient-to-br from-primary to-primary-dark flex-shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary truncate">{selectedApplicant?.user_name}</h2>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-text-secondary mt-1">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span className="truncate">{selectedApplicant?.response_id}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span className="text-xs">
                              {selectedApplicant && selectedApplicant.created_at ? new Date(selectedApplicant.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                year: window.innerWidth > 640 ? 'numeric' : undefined,
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'Data não disponível'}
                            </span>
                          </div>
                          {selectedApplicant?.user_email && (
                            <div className="flex items-center space-x-1 min-w-0">
                              <span className="hidden sm:inline">•</span>
                              <span className="truncate text-xs">{selectedApplicant.user_email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                    {responsesWithAnalysis.has(selectedApplicant?.response_id || '') && (
                      <Button variant="success" className="shimmer-button px-3 py-2 text-sm" onClick={() => handleViewAnalysis(selectedApplicant!)}>
                        <BarChart3 className="w-4 h-4" />
                        <span className="hidden sm:inline">Ver Análise IA</span>
                      </Button>
                    )}
                    {selectedApplicant?.cv_bucket_link && (
                      <a href={selectedApplicant.cv_bucket_link} target="_blank" rel="noopener noreferrer" className="btn-modern btn-primary px-3 py-2 text-sm">
                        <FileText className="w-4 h-4" />
                        <span className="hidden sm:inline">Baixar CV</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto scroll-container smooth-scroll">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {formQuestions && selectedApplicant && (
                  <div className="space-y-8">
                    {/* Candidate Summary */}
                    <ApplicantSummary
                      selectedApplicant={selectedApplicant}
                      formQuestions={formQuestions}
                      responsesWithAnalysis={responsesWithAnalysis}
                    />

                    {/* Q&A Section */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-secondary to-secondary-dark rounded-xl flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary">Respostas Detalhadas</h3>
                      </div>
                      
                      <AnswersList
                        answers={selectedApplicant.answers}
                        formQuestions={formQuestions}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'analysis' && (
          // Analysis View
          <div className="flex flex-col min-h-0">
            <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-border flex-shrink-0">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <Button
                      onClick={handleBackToResponses}
                      variant="secondary"
                      className="px-3 py-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Voltar</span>
                    </Button>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-text-primary">Análise do Candidato</h2>
                      <p className="text-sm text-text-secondary">
                        {selectedApplicant?.user_name} • {selectedApplicant?.response_id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto scroll-container smooth-scroll">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              {loadingAnalysis ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center animate-fade-in">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Carregando análise...</h3>
                    <p className="text-text-secondary">Processando dados do candidato com IA</p>
                  </div>
                </div>
              ) : candidateAnalysis ? (
                <div className="space-y-6">
                  {/* Hero Decision Card - Two Column Layout */}
                  <div className="modern-card bg-gradient-to-br from-surface-raised to-surface-elevated border-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Column - Reasoning Text */}
                      <div className="flex flex-col justify-center">
                        {candidateAnalysis.reasoning && (
                          <div className="bg-surface p-6 rounded-lg border-l-4 border-primary">
                            <p className="text-text-primary leading-relaxed text-base">
                              {candidateAnalysis.reasoning}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right Column - Decision Status and Score */}
                      <div className="flex flex-col items-center justify-center space-y-6">
                        {/* Decision Status */}
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-3 mb-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                              candidateAnalysis.decision === 'HIRE' ? 'bg-gradient-to-br from-success to-success-light text-white' :
                              candidateAnalysis.decision === 'INTERVIEW' ? 'bg-gradient-to-br from-warning to-warning-light text-white' :
                              'bg-gradient-to-br from-error to-error-light text-white'
                            }`}>
                              {candidateAnalysis.decision === 'HIRE' ? '✓' :
                               candidateAnalysis.decision === 'INTERVIEW' ? '?' :
                               '✗'}
                            </div>
                            <div className={`status-badge ${
                              candidateAnalysis.confidence_level === 'HIGH' ? 'status-success' :
                              candidateAnalysis.confidence_level === 'MEDIUM' ? 'status-warning' :
                              'status-error'
                            }`}>
                              <Target className="w-3 h-3" />
                              <span>Confiança {candidateAnalysis.confidence_level === 'HIGH' ? 'Alta' :
                                 candidateAnalysis.confidence_level === 'MEDIUM' ? 'Média' : 'Baixa'}</span>
                            </div>
                          </div>
                          <h2 className="text-2xl lg:text-3xl font-bold text-text-primary mb-6">
                            {candidateAnalysis.decision === 'HIRE' ? 'RECOMENDADO' :
                             candidateAnalysis.decision === 'INTERVIEW' ? 'PARA ENTREVISTA' :
                             'NÃO RECOMENDADO'}
                          </h2>
                        </div>

                        {/* Overall Score Circle */}
                        {candidateAnalysis.overall_score !== null && (
                          <div className="relative w-32 h-32">
                            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                              <circle
                                cx="60"
                                cy="60"
                                r="52"
                                fill="none"
                                stroke="#374151"
                                strokeWidth="6"
                                opacity="0.2"
                              />
                              <circle
                                cx="60"
                                cy="60"
                                r="52"
                                fill="none"
                                stroke="url(#progressGradient)"
                                strokeWidth="6"
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                                strokeDasharray={`${2 * Math.PI * 52}`}
                                strokeDashoffset={`${2 * Math.PI * 52 * (1 - candidateAnalysis.overall_score / 100)}`}
                              />
                              <defs>
                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#8b5cf6" />
                                  <stop offset="100%" stopColor="#3b82f6" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-primary">{candidateAnalysis.overall_score}</div>
                                <div className="text-xs text-text-muted uppercase tracking-wider">Score Geral</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Scores Grid - More Compact */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {candidateAnalysis.technical_score !== null && (
                      <div className="modern-card text-center py-4">
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="text-xl font-bold text-primary">{candidateAnalysis.technical_score}</div>
                            <div className="text-xs text-text-secondary uppercase tracking-wide">Técnico</div>
                          </div>
                        </div>
                        <div className="progress-bar h-2">
                          <div 
                            className="progress-fill bg-gradient-to-r from-primary to-primary-light h-full"
                            style={{ width: `${candidateAnalysis.technical_score}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {candidateAnalysis.behavioral_score !== null && (
                      <div className="modern-card text-center py-4">
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-secondary to-secondary-dark rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="text-xl font-bold text-secondary">{candidateAnalysis.behavioral_score}</div>
                            <div className="text-xs text-text-secondary uppercase tracking-wide">Comportamental</div>
                          </div>
                        </div>
                        <div className="progress-bar h-2">
                          <div 
                            className="progress-fill bg-gradient-to-r from-secondary to-secondary-light h-full"
                            style={{ width: `${candidateAnalysis.behavioral_score}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {candidateAnalysis.cultural_fit_score !== null && (
                      <div className="modern-card text-center py-4">
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-success to-success-light rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="text-xl font-bold text-success">{candidateAnalysis.cultural_fit_score}</div>
                            <div className="text-xs text-text-secondary uppercase tracking-wide">Fit Cultural</div>
                          </div>
                        </div>
                        <div className="progress-bar h-2">
                          <div 
                            className="progress-fill bg-gradient-to-r from-success to-success-light h-full"
                            style={{ width: `${candidateAnalysis.cultural_fit_score}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {candidateAnalysis.experience_score !== null && (
                      <div className="modern-card text-center py-4">
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-warning to-warning-light rounded-lg flex items-center justify-center">
                            <Award className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="text-xl font-bold text-warning">{candidateAnalysis.experience_score}</div>
                            <div className="text-xs text-text-secondary uppercase tracking-wide">Experiência</div>
                          </div>
                        </div>
                        <div className="progress-bar h-2">
                          <div 
                            className="progress-fill bg-gradient-to-r from-warning to-warning-light h-full"
                            style={{ width: `${candidateAnalysis.experience_score}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Insights Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    {/* Strengths */}
                    <div className="modern-card border-success/20 bg-gradient-to-br from-success/5 to-transparent">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-success to-success-light rounded-xl flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary">Pontos Fortes</h3>
                      </div>
                      {candidateAnalysis.strengths.length > 0 ? (
                        <div className="space-y-3">
                          {candidateAnalysis.strengths.map((strength, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-success/5 rounded-lg border border-success/10">
                              <div className="w-6 h-6 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <CheckCircle className="w-3 h-3 text-success" />
                              </div>
                              <span className="text-text-primary leading-relaxed">{strength}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 bg-text-muted/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <AlertCircle className="w-6 h-6 text-text-muted" />
                          </div>
                          <p className="text-text-muted">Nenhum ponto forte identificado</p>
                        </div>
                      )}
                    </div>

                    {/* Concerns */}
                    <div className="modern-card border-warning/20 bg-gradient-to-br from-warning/5 to-transparent">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-warning to-warning-light rounded-xl flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary">Preocupações</h3>
                      </div>
                      {candidateAnalysis.concerns.length > 0 ? (
                        <div className="space-y-3">
                          {candidateAnalysis.concerns.map((concern, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-warning/5 rounded-lg border border-warning/10">
                              <div className="w-6 h-6 bg-warning/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <AlertCircle className="w-3 h-3 text-warning" />
                              </div>
                              <span className="text-text-primary leading-relaxed">{concern}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 bg-text-muted/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="w-6 h-6 text-text-muted" />
                          </div>
                          <p className="text-text-muted">Nenhuma preocupação identificada</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Red Flags */}
                  {candidateAnalysis.red_flags.length > 0 && (
                    <div className="modern-card border-error/30 bg-gradient-to-br from-error/10 to-transparent mb-8">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-error to-error-light rounded-xl flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary">Red Flags Críticos</h3>
                      </div>
                      <div className="space-y-3">
                        {candidateAnalysis.red_flags.map((flag, index) => (
                          <div key={index} className="flex items-start space-x-3 p-4 bg-error/10 rounded-lg border border-error/20">
                            <div className="w-6 h-6 bg-error/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <AlertCircle className="w-3 h-3 text-error" />
                            </div>
                            <span className="text-text-primary font-medium leading-relaxed">{flag}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Items */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Next Steps */}
                    <div className="modern-card border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary">Próximos Passos</h3>
                      </div>
                      {candidateAnalysis.next_steps.length > 0 ? (
                        <div className="space-y-3">
                          {candidateAnalysis.next_steps.map((step, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-primary font-bold text-xs">
                                {index + 1}
                              </div>
                              <span className="text-text-primary leading-relaxed">{step}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 bg-text-muted/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <Target className="w-6 h-6 text-text-muted" />
                          </div>
                          <p className="text-text-muted">Nenhum próximo passo definido</p>
                        </div>
                      )}
                    </div>

                    {/* Development Areas */}
                    <div className="modern-card border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-secondary to-secondary-dark rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary">Áreas de Crescimento</h3>
                      </div>
                      {candidateAnalysis.development_areas.length > 0 ? (
                        <div className="space-y-3">
                          {candidateAnalysis.development_areas.map((area, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-secondary/5 rounded-lg border border-secondary/10">
                              <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <TrendingUp className="w-3 h-3 text-secondary" />
                              </div>
                              <span className="text-text-primary leading-relaxed">{area}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 bg-text-muted/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <TrendingUp className="w-6 h-6 text-text-muted" />
                          </div>
                          <p className="text-text-muted">Nenhuma área de desenvolvimento identificada</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 animate-fade-in">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="w-12 h-12 text-text-muted" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-3">Análise não disponível</h3>
                  <p className="text-text-secondary max-w-md mx-auto leading-relaxed mb-6">
                    Esta análise ainda não foi processada. O sistema analisará automaticamente as respostas do candidato em breve.
                  </p>
                  <div className="status-badge status-warning">
                    <Clock className="w-3 h-3" />
                    <span>Processamento pendente</span>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormsDashboard; 