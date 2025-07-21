import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Eye, 
  Users, 
  FileText, 
  Calendar, 
  Search, 
  Filter,
  Download,
  Trash2,
  Plus,
  ExternalLink,
  User,
  BarChart3
} from 'lucide-react';
import { supabase, FormularioNome, FormularioPergunta, FormularioResposta, FormularioCandidateAnalysis } from '../lib/supabase';

interface FormWithStats {
  id: number;
  vaga_do_form: string;
  created_at: string;
  responses_count: number;
  questions_count: number;
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

const FormsDashboard: React.FC = () => {
  const navigate = useNavigate();
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
  const [filterStatus, setFilterStatus] = useState<'all' | 'with-responses' | 'no-responses'>('all');
  const [responsesWithAnalysis, setResponsesWithAnalysis] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      
      // Get all forms with response counts
      const { data: formsData, error: formsError } = await supabase
        .from('formularios_nomes')
        .select('*')
        .order('id', { ascending: false });

      if (formsError) {
        console.error('Error loading forms:', formsError);
        return;
      }

      // Get response counts and actual question counts for each form
      const formsWithStats = await Promise.all(
        formsData.map(async (form) => {
          const { count: responsesCount } = await supabase
            .from('formularios_respostas')
            .select('*', { count: 'exact', head: true })
            .eq('id', form.id);

          // Load actual questions data to count non-empty questions
          const { data: questionsData, error: questionsError } = await supabase
            .from('formularios_perguntas')
            .select('*')
            .eq('id', form.id)
            .single();

          let questionsCount = 0;
          if (questionsData && !questionsError) {
            // Count only non-empty questions
            questionsCount = Object.keys(questionsData).filter(key => {
              const value = questionsData[key as keyof FormularioPergunta];
              return key.startsWith('q') && value && typeof value === 'string' && value.trim();
            }).length;
          }

          return {
            ...form,
            responses_count: responsesCount || 0,
            questions_count: questionsCount
          };
        })
      );

      setForms(formsWithStats);
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFormResponses = async (formId: number) => {
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
  };

  const handleFormClick = (form: FormWithStats) => {
    setSelectedForm(form);
    setViewMode('responses');
    loadFormResponses(form.id);
  };

  const handleApplicantClick = (applicant: FormResponse) => {
    setSelectedApplicant(applicant);
    setViewMode('applicant');
  };

  const handleBackToForms = () => {
    setSelectedForm(null);
    setFormResponses([]);
    setFormQuestions(null);
    setSelectedApplicant(null);
    setViewMode('forms');
  };

  const loadCandidateAnalysis = async (responseId: string) => {
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
  };

  const handleBackToResponses = () => {
    setSelectedApplicant(null);
    setCandidateAnalysis(null);
    setViewMode('responses');
  };

  const handleViewAnalysis = async (applicant: FormResponse) => {
    setSelectedApplicant(applicant);
    setViewMode('analysis');
    await loadCandidateAnalysis(applicant.response_id || '');
  };

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.vaga_do_form.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'with-responses' && form.responses_count > 0) ||
      (filterStatus === 'no-responses' && form.responses_count === 0);
    
    return matchesSearch && matchesFilter;
  });

  const exportResponses = (formId: number, formName: string) => {
    const responses = formResponses.map(response => {
      const row: any = {
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
  };

  const deleteForm = async (formId: number) => {
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

      // Reload forms
      loadForms();
      if (selectedForm?.id === formId) {
        handleBackToForms();
      }
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-dark">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-brand-magenta border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-brand-gray">Carregando formulários...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-dark">
      {/* Header */}
      <div className="glass border-b border-gold/20 px-6 py-4 shadow-elegant">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-semibold text-white">Dashboard de Formulários</h1>
              <p className="text-sm text-brand-gray">
                {viewMode === 'forms' && 'Gerencie seus formulários de candidatura'}
                {viewMode === 'responses' && selectedForm && `Candidaturas: ${selectedForm.vaga_do_form} • ${responsesWithAnalysis.size} analisados`}
                {viewMode === 'applicant' && selectedApplicant && `Candidato: ${selectedApplicant.user_name}`}
                {viewMode === 'analysis' && selectedApplicant && `Análise: ${selectedApplicant.user_name}`}
              </p>
            </div>
          </div>
          
          {viewMode === 'responses' && selectedForm && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => exportResponses(selectedForm.id, selectedForm.vaga_do_form)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
              <button
                onClick={() => deleteForm(selectedForm.id)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'forms' && (
          // Forms List View
          <div className="flex flex-col h-full">
            {/* Search and Filter */}
            <div className="p-6 border-b border-brand-purple/20">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-gray" />
                  <input
                    type="text"
                    placeholder="Buscar formulários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-brand-darker/50 border border-brand-purple/20 rounded-lg text-white placeholder-brand-gray focus:outline-none focus:border-brand-purple"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-brand-gray" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="bg-brand-darker/50 border border-brand-purple/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-purple"
                  >
                    <option value="all">Todos</option>
                    <option value="with-responses">Com respostas</option>
                    <option value="no-responses">Sem respostas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Forms Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredForms.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-brand-gray mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {searchTerm || filterStatus !== 'all' ? 'Nenhum formulário encontrado' : 'Nenhum formulário criado'}
                  </h3>
                  <p className="text-brand-gray">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Tente ajustar os filtros de busca.' 
                      : 'Crie seu primeiro formulário na aba "Gerador de Job Description".'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredForms.map((form) => (
                    <div
                      key={form.id}
                      onClick={() => handleFormClick(form)}
                      className="bg-brand-darker/50 rounded-xl p-6 border border-brand-purple/20 hover:border-brand-purple/40 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-brand-purple transition-colors">
                            {form.vaga_do_form}
                          </h3>
                          <p className="text-sm text-brand-gray">
                            Criado em {form.created_at ? new Date(form.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-brand-purple" />
                          <span className="text-sm font-medium text-brand-purple">
                            {form.responses_count}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-brand-gray">
                          <div className="flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>{form.questions_count} perguntas</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{form.responses_count} candidatos</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <a
                            href={`/formulario/${form.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 text-brand-gray hover:text-brand-purple transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>

                      {form.responses_count > 0 && (
                        <div className="mt-4 pt-4 border-t border-brand-purple/20">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-green-400 font-medium">
                              ✓ Ativo
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                exportResponses(form.id, form.vaga_do_form);
                              }}
                              className="text-sm text-brand-purple hover:text-brand-purple/80 transition-colors"
                            >
                              Exportar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'responses' && (
          // Responses List View
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-brand-purple/20">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToForms}
                  className="flex items-center space-x-2 px-4 py-2 bg-brand-purple/20 text-brand-purple rounded-lg hover:bg-brand-purple/30 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedForm?.vaga_do_form}</h2>
                  <p className="text-sm text-brand-gray">
                    {formResponses.length} candidatura{formResponses.length !== 1 ? 's' : ''} • {formQuestions ? Object.keys(formQuestions).filter(key => {
                      const value = formQuestions[key as keyof FormularioPergunta];
                      return key.startsWith('q') && value && typeof value === 'string' && value.trim();
                    }).length : 0} perguntas
                  </p>
                </div>
              </div>
              
              <a
                href={`/formulario/${selectedForm?.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/80 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Ver Formulário</span>
              </a>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingResponses ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : formResponses.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-brand-gray mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Nenhuma candidatura ainda</h3>
                  <p className="text-brand-gray">Quando candidatos preencherem o formulário, suas respostas aparecerão aqui.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formResponses.map((response) => (
                    <div
                      key={response.id}
                      onClick={() => handleApplicantClick(response)}
                      className="bg-brand-darker/50 rounded-xl p-4 border border-brand-purple/20 hover:border-brand-purple/40 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-brand-purple/20 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-brand-purple" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-brand-purple transition-colors">
                              {response.user_name}
                            </h3>
                            <p className="text-sm text-brand-gray">
                              {response.response_id && `${response.response_id} • `}
                              {response.user_email && `${response.user_email} • `}
                              {response.created_at ? new Date(response.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'Data não disponível'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {responsesWithAnalysis.has(response.response_id || '') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewAnalysis(response);
                              }}
                              className="flex items-center space-x-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                            >
                              <BarChart3 className="w-4 h-4" />
                              <span>Analisado</span>
                            </button>
                          )}
                          {response.cv_bucket_link && (
                            <a
                              href={response.cv_bucket_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center space-x-1 px-3 py-1 bg-brand-purple/20 text-brand-purple rounded-lg text-sm hover:bg-brand-purple/30 transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              <span>CV</span>
                            </a>
                          )}
                          <Eye className="w-4 h-4 text-brand-gray group-hover:text-brand-purple transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'applicant' && (
          // Individual Applicant View
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-brand-purple/20">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToResponses}
                  className="flex items-center space-x-2 px-4 py-2 bg-brand-purple/20 text-brand-purple rounded-lg hover:bg-brand-purple/30 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedApplicant?.user_name}</h2>
                  <p className="text-sm text-brand-gray">
                    {selectedApplicant?.response_id && `${selectedApplicant.response_id} • `}
                    {selectedApplicant?.user_email && `${selectedApplicant.user_email} • `}
                    {selectedApplicant && selectedApplicant.created_at ? new Date(selectedApplicant.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Data não disponível'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {responsesWithAnalysis.has(selectedApplicant?.response_id || '') && (
                  <button
                    onClick={() => handleViewAnalysis(selectedApplicant!)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-500/80 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Ver Análise</span>
                  </button>
                )}
                {selectedApplicant?.cv_bucket_link && (
                  <a
                    href={selectedApplicant.cv_bucket_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/80 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Ver CV</span>
                  </a>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {formQuestions && selectedApplicant && (
                <div className="space-y-6">
                  {Object.keys(selectedApplicant.answers).map((answerKey) => {
                    const questionNumber = answerKey.replace('a', '');
                    const questionKey = `q${questionNumber}` as keyof FormularioPergunta;
                    const question = formQuestions[questionKey];
                    
                    if (!question || typeof question !== 'string') return null;
                    
                    return (
                      <div key={answerKey} className="bg-brand-darker/50 rounded-xl p-6 border border-brand-purple/20">
                        <h4 className="text-lg font-semibold text-brand-purple mb-3">
                          {question}
                        </h4>
                        <p className="text-gray-200 text-sm leading-relaxed">
                          {selectedApplicant.answers[answerKey]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'analysis' && (
          // Analysis View
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-brand-purple/20 flex-shrink-0">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToResponses}
                  className="flex items-center space-x-2 px-4 py-2 bg-brand-purple/20 text-brand-purple rounded-lg hover:bg-brand-purple/30 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-white">Análise do Candidato</h2>
                  <p className="text-sm text-brand-gray">
                    {selectedApplicant?.user_name} • {selectedApplicant?.response_id}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pb-20">
              {loadingAnalysis ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : candidateAnalysis ? (
                <div className="space-y-6">
                  {/* Decision, Scores, and Confidence Level */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Decision Card */}
                    <div className="bg-brand-darker/50 rounded-xl p-6 border border-brand-purple/20">
                      <h3 className="text-lg font-semibold text-white mb-4">Decisão</h3>
                      <div className={`inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold ${
                        candidateAnalysis.decision === 'HIRE' ? 'bg-green-500/20 text-green-400' :
                        candidateAnalysis.decision === 'INTERVIEW' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {candidateAnalysis.decision === 'HIRE' ? '✓ CONTRATAR' :
                         candidateAnalysis.decision === 'INTERVIEW' ? '? ENTREVISTAR' :
                         '✗ NÃO CONTRATAR'}
                      </div>
                      {candidateAnalysis.reasoning && (
                        <p className="text-sm text-gray-300 mt-3">{candidateAnalysis.reasoning}</p>
                      )}
                    </div>

                    {/* Scores Card */}
                    <div className="bg-brand-darker/50 rounded-xl p-6 border border-brand-purple/20">
                      <h3 className="text-lg font-semibold text-white mb-4">Pontuações</h3>
                      <div className="space-y-3">
                        {candidateAnalysis.overall_score !== null && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">Geral</span>
                              <span className="text-white font-semibold">{candidateAnalysis.overall_score}/100</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-brand-purple to-brand-magenta h-2 rounded-full transition-all duration-300"
                                style={{ width: `${candidateAnalysis.overall_score}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        {candidateAnalysis.technical_score !== null && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">Técnico</span>
                              <span className="text-white font-semibold">{candidateAnalysis.technical_score}/100</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${candidateAnalysis.technical_score}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        {candidateAnalysis.behavioral_score !== null && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">Comportamental</span>
                              <span className="text-white font-semibold">{candidateAnalysis.behavioral_score}/100</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${candidateAnalysis.behavioral_score}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        {candidateAnalysis.cultural_fit_score !== null && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">Fit Cultural</span>
                              <span className="text-white font-semibold">{candidateAnalysis.cultural_fit_score}/100</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-brand-gold to-yellow-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${candidateAnalysis.cultural_fit_score}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        {candidateAnalysis.experience_score !== null && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">Experiência</span>
                              <span className="text-white font-semibold">{candidateAnalysis.experience_score}/100</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${candidateAnalysis.experience_score}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Confidence Level Card */}
                    <div className="bg-brand-darker/50 rounded-xl p-6 border border-brand-purple/20">
                      <h3 className="text-lg font-semibold text-white mb-4">Nível de Confiança da Análise</h3>
                      <div className="flex flex-col space-y-3">
                        <div className={`inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold ${
                          candidateAnalysis.confidence_level === 'HIGH' ? 'bg-green-500/20 text-green-400' :
                          candidateAnalysis.confidence_level === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {candidateAnalysis.confidence_level === 'HIGH' ? 'ALTO' :
                           candidateAnalysis.confidence_level === 'MEDIUM' ? 'MÉDIO' :
                           'BAIXO'}
                        </div>
                        <p className="text-sm text-gray-300">
                          {candidateAnalysis.confidence_level === 'HIGH' ? 'Análise muito confiável' :
                           candidateAnalysis.confidence_level === 'MEDIUM' ? 'Análise moderadamente confiável' :
                           'Análise com baixa confiança'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Strengths and Concerns */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div className="bg-brand-darker/50 rounded-xl p-6 border border-green-500/20">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Pontos Fortes
                      </h3>
                      {candidateAnalysis.strengths.length > 0 ? (
                        <ul className="space-y-2">
                          {candidateAnalysis.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-green-400 mt-1">✓</span>
                              <span className="text-gray-200 text-sm">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400 text-sm">Nenhum ponto forte identificado.</p>
                      )}
                    </div>

                    {/* Concerns */}
                    <div className="bg-brand-darker/50 rounded-xl p-6 border border-yellow-500/20">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                        Preocupações
                      </h3>
                      {candidateAnalysis.concerns.length > 0 ? (
                        <ul className="space-y-2">
                          {candidateAnalysis.concerns.map((concern, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-yellow-400 mt-1">⚠</span>
                              <span className="text-gray-200 text-sm">{concern}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400 text-sm">Nenhuma preocupação identificada.</p>
                      )}
                    </div>
                  </div>

                  {/* Red Flags */}
                  {candidateAnalysis.red_flags.length > 0 && (
                    <div className="bg-brand-darker/50 rounded-xl p-6 border border-red-500/20">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        Red Flags
                      </h3>
                      <ul className="space-y-2">
                        {candidateAnalysis.red_flags.map((flag, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-red-400 mt-1">🚨</span>
                            <span className="text-gray-200 text-sm">{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Next Steps and Development Areas */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Next Steps */}
                    <div className="bg-brand-darker/50 rounded-xl p-6 border border-brand-purple/20">
                      <h3 className="text-lg font-semibold text-white mb-4">Próximos Passos</h3>
                      {candidateAnalysis.next_steps.length > 0 ? (
                        <ul className="space-y-2">
                          {candidateAnalysis.next_steps.map((step, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-brand-purple mt-1">→</span>
                              <span className="text-gray-200 text-sm">{step}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400 text-sm">Nenhum próximo passo definido.</p>
                      )}
                    </div>

                    {/* Development Areas */}
                    <div className="bg-brand-darker/50 rounded-xl p-6 border border-brand-purple/20">
                      <h3 className="text-lg font-semibold text-white mb-4">Áreas de Desenvolvimento</h3>
                      {candidateAnalysis.development_areas.length > 0 ? (
                        <ul className="space-y-2">
                          {candidateAnalysis.development_areas.map((area, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-brand-purple mt-1">📈</span>
                              <span className="text-gray-200 text-sm">{area}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400 text-sm">Nenhuma área de desenvolvimento identificada.</p>
                      )}
                    </div>
                  </div>


                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-brand-gray mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Análise não encontrada</h3>
                  <p className="text-brand-gray">Esta análise ainda não foi gerada para este candidato.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormsDashboard; 