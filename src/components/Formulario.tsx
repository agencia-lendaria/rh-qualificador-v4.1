import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, User, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase, FormularioNome, FormularioPergunta } from '../lib/supabase';

interface FormData {
  user_name: string;
  user_email: string;
  [key: string]: string;
}

const Formulario: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formularioNome, setFormularioNome] = useState<FormularioNome | null>(null);
  const [formularioPerguntas, setFormularioPerguntas] = useState<FormularioPergunta | null>(null);
  const [formData, setFormData] = useState<FormData>({
    user_name: '',
    user_email: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [curriculumFile, setCurriculumFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      loadFormulario(parseInt(id));
    }
  }, [id]);

  const loadFormulario = async (formId: number) => {
    try {
      setLoading(true);
      
      // Load form name
      const { data: nomeData, error: nomeError } = await supabase
        .from('formularios_nomes')
        .select('*')
        .eq('id', formId)
        .single();

      if (nomeError) {
        console.error('Error loading form name:', nomeError);
        return;
      }

      setFormularioNome(nomeData);

      // Load form questions
      const { data: perguntasData, error: perguntasError } = await supabase
        .from('formularios_perguntas')
        .select('*')
        .eq('id', formId)
        .single();

      if (perguntasError) {
        console.error('Error loading form questions:', perguntasError);
        return;
      }

      setFormularioPerguntas(perguntasData);
    } catch (error) {
      console.error('Error loading formulario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCurriculumFile(file);
    }
  };

  const uploadCurriculum = async (file: File): Promise<string | null> => {
    try {
      const fileName = `curriculum_${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('curriculum-uploads')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading curriculum:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('curriculum-uploads')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading curriculum:', error);
      return null;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formularioNome || !formularioPerguntas) return;

    try {
      setSubmitting(true);
      setSubmitStatus('idle');

      let curriculumUrl = null;
      if (curriculumFile) {
        curriculumUrl = await uploadCurriculum(curriculumFile);
      }

      // Generate a random response ID
      const generateResponseId = () => {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 8);
        return `RESP_${timestamp}_${randomStr}`.toUpperCase();
      };

      const responseId = generateResponseId();

      // Create submission data without the base fields
      const answersData: any = {};
      Object.keys(formData).forEach(key => {
        if (key !== 'user_name' && key !== 'user_email') {
          answersData[key] = formData[key];
        }
      });

      // First, insert into formularios_respostas table
      const submissionData = {
        id: formularioNome.id,
        response_id: responseId,
        user_name: formData.user_name,
        user_email: formData.user_email,
        ...answersData
      };

      const { error: formError } = await supabase
        .from('formularios_respostas')
        .insert([submissionData]);

      if (formError) {
        console.error('Error submitting form:', formError);
        setSubmitStatus('error');
        return;
      }

      // Then, insert curriculum link into reply table
      if (curriculumUrl) {
        const replyData = {
          curriculum_url: curriculumUrl,
          user_name: formData.user_name,
          user_email: formData.user_email,
          form_id: formularioNome.id,
          submitted_at: new Date().toISOString()
        };

        const { error: replyError } = await supabase
          .from('reply')
          .insert([replyData]);

        if (replyError) {
          console.error('Error storing curriculum link:', replyError);
          // Don't fail the entire submission if just the curriculum link fails
        }
      }

      setSubmitStatus('success');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const getQuestions = () => {
    if (!formularioPerguntas) return [];
    
    const questions = [];
    for (let i = 1; i <= 15; i++) {
      const questionKey = `q${i}` as keyof FormularioPergunta;
      const question = formularioPerguntas[questionKey];
      if (question && typeof question === 'string' && question.trim()) {
        questions.push({
          id: i,
          question: question,
          field: `a${i}`
        });
      }
    }
    return questions;
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-dark">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-brand-magenta border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-brand-gray">Carregando formulário...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!formularioNome || !formularioPerguntas) {
    return (
      <div className="flex flex-col h-screen bg-dark">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Formulário não encontrado</h2>
            <p className="text-brand-gray mb-4">O formulário solicitado não existe ou foi removido.</p>
            <button
              onClick={() => navigate('/')}
              className="btn-magenta text-white px-6 py-3 rounded-lg"
            >
              Voltar ao início
            </button>
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
          <div>
            <h1 className="text-xl font-semibold text-white">Formulário de Candidatura</h1>
            <p className="text-sm text-brand-gray">{formularioNome.vaga_do_form}</p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {submitStatus === 'success' ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">Candidatura Enviada!</h2>
              <p className="text-brand-gray">Obrigado por se candidatar. Entraremos em contato em breve.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="bg-brand-darker/50 rounded-xl p-6 border border-brand-purple/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-brand-purple" />
                  Informações Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.user_name}
                      onChange={(e) => handleInputChange('user_name', e.target.value)}
                      className="w-full px-4 py-3 input-elegant rounded-lg"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.user_email}
                      onChange={(e) => handleInputChange('user_email', e.target.value)}
                      className="w-full px-4 py-3 input-elegant rounded-lg"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Curriculum Upload */}
              <div className="bg-brand-darker/50 rounded-xl p-6 border border-brand-purple/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Upload className="w-5 h-5 mr-2 text-brand-purple" />
                  Currículo (Opcional)
                </h3>
                <div className="border-2 border-dashed border-brand-purple/30 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="curriculum-upload"
                  />
                  <label htmlFor="curriculum-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-brand-purple mx-auto mb-2" />
                    <p className="text-gray-200 mb-1">
                      {curriculumFile ? curriculumFile.name : 'Clique para selecionar arquivo'}
                    </p>
                    <p className="text-sm text-brand-gray">
                      PDF, DOC ou DOCX (máx. 5MB)
                    </p>
                  </label>
                </div>
              </div>

              {/* Questions */}
              <div className="bg-brand-darker/50 rounded-xl p-6 border border-brand-purple/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-brand-purple" />
                  Perguntas Qualificatórias
                </h3>
                <div className="space-y-6">
                  {getQuestions().map((q, index) => (
                    <div key={q.id}>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        {index + 1}. {q.question}
                      </label>
                      <textarea
                        value={formData[q.field] || ''}
                        onChange={(e) => handleInputChange(q.field, e.target.value)}
                        className="w-full px-4 py-3 input-elegant rounded-lg resize-none"
                        rows={3}
                        placeholder="Digite sua resposta..."
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={submitting || !formData.user_name}
                  className={`px-8 py-4 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-300 ${
                    submitting || !formData.user_name
                      ? 'bg-brand-gray/20 text-brand-gray/50 cursor-not-allowed'
                      : 'btn-purple text-white hover:shadow-purple active:scale-95'
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Enviar Candidatura</span>
                    </>
                  )}
                </button>
              </div>

              {submitStatus === 'error' && (
                <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 mx-auto mb-2" />
                  <p className="text-red-400">Erro ao enviar candidatura. Tente novamente.</p>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Formulario; 