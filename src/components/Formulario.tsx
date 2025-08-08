import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Upload, User, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../lib/supabase'
import { FormularioNome, FormularioPergunta, FormSubmissionData, SubmitStatus, formSubmissionSchema } from '@/types'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type FormData = FormSubmissionData

const Formulario: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formularioNome, setFormularioNome] = useState<FormularioNome | null>(null);
  const [formularioPerguntas, setFormularioPerguntas] = useState<FormularioPergunta | null>(null);
  const form = useForm<FormData>({
    resolver: zodResolver(formSubmissionSchema),
    defaultValues: { user_name: '', user_email: '' }
  })
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
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

  // removed: local setState input handler; using react-hook-form register instead

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCurriculumFile(file);
    }
  };

  const uploadCurriculum = async (file: File): Promise<string | null> => {
    try {
      const fileName = `curriculum_${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
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

  const onSubmit = form.handleSubmit(async (values) => {
    if (!formularioNome || !formularioPerguntas) return

    try {
      setSubmitting(true)
      setSubmitStatus('idle')

      let curriculumUrl: string | null = null
      if (curriculumFile) {
        curriculumUrl = await uploadCurriculum(curriculumFile)
      }

      const generateResponseId = () => {
        const timestamp = Date.now().toString(36)
        const randomStr = Math.random().toString(36).substring(2, 8)
        return `RESP_${timestamp}_${randomStr}`.toUpperCase()
      }

      const responseId = generateResponseId()

      const answersData: Record<string, string> = {}
      Object.keys(values).forEach((key) => {
        if (key !== 'user_name' && key !== 'user_email') {
          const val = values[key as keyof FormData]
          if (typeof val === 'string') answersData[key] = val
        }
      })

      const submissionData = {
        id: formularioNome.id,
        response_id: responseId,
        user_name: values.user_name,
        user_email: values.user_email || null,
        ...answersData
      }

      const { error: formError } = await supabase
        .from('formularios_respostas')
        .insert([submissionData])

      if (formError) {
        console.error('Error submitting form:', formError)
        setSubmitStatus('error')
        return
      }

      if (curriculumUrl) {
        const replyData = {
          curriculum_url: curriculumUrl,
          user_name: values.user_name,
          user_email: values.user_email || null,
          form_id: formularioNome.id,
          submitted_at: new Date().toISOString()
        }

        const { error: replyError } = await supabase
          .from('reply')
          .insert([replyData])

        if (replyError) {
          console.error('Error storing curriculum link:', replyError)
        }
      }

      setSubmitStatus('success')
      setTimeout(() => {
        navigate('/')
      }, 3000)
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitStatus('error')
    } finally {
      setSubmitting(false)
    }
  })

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
      <div className="flex flex-col h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Carregando formulário...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!formularioNome || !formularioPerguntas) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Formulário não encontrado</h2>
            <p className="text-text-secondary mb-4">O formulário solicitado não existe ou foi removido.</p>
            <Button onClick={() => navigate('/')}>Voltar ao início</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="glass-effect border-b border-border px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">Formulário de Candidatura</h1>
            <p className="text-xs sm:text-sm text-text-secondary truncate">{formularioNome.vaga_do_form}</p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 min-h-0 overflow-y-auto scroll-container smooth-scroll px-3 sm:px-4 py-4 sm:py-6">
        <div className="max-w-2xl mx-auto">
          {submitStatus === 'success' ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">Candidatura Enviada!</h2>
              <p className="text-text-secondary">Obrigado por se candidatar. Entraremos em contato em breve.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                  Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Nome Completo *</label>
                      <Input
                        type="text"
                        {...form.register('user_name')}
                        placeholder="Seu nome completo"
                        hasError={!!form.formState.errors.user_name}
                        className="text-sm"
                      />
                      {form.formState.errors.user_name && (
                        <p className="mt-1 text-xs text-destructive">{form.formState.errors.user_name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                      <Input
                        type="email"
                        {...form.register('user_email')}
                        placeholder="seu@email.com"
                        hasError={!!form.formState.errors.user_email}
                        className="text-sm"
                      />
                      {form.formState.errors.user_email && (
                        <p className="mt-1 text-xs text-destructive">{form.formState.errors.user_email.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Curriculum Upload */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                    Currículo (Opcional)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 sm:p-6 text-center">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="curriculum-upload"
                    />
                    <label htmlFor="curriculum-upload" className="cursor-pointer">
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-2" />
                      <p className="text-sm sm:text-base text-foreground mb-1 break-all">
                        {curriculumFile ? curriculumFile.name : 'Clique para selecionar arquivo'}
                      </p>
                      <p className="text-xs sm:text-sm text-text-secondary">PDF, DOC ou DOCX (máx. 5MB)</p>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Questions */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                    Perguntas Qualificatórias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 sm:space-y-6">
                    {getQuestions().map((q, index) => (
                      <div key={q.id}>
                        <label className="block text-sm font-medium text-foreground mb-2 leading-relaxed">
                          {index + 1}. {q.question}
                        </label>
                        <Textarea
                          {...form.register(q.field as keyof FormData)}
                          placeholder="Digite sua resposta..."
                          className="min-h-[80px] sm:min-h-[100px] text-sm resize-y"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-center pt-2">
                <Button 
                  type="submit" 
                  disabled={submitting || !form.getValues('user_name')} 
                  className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="ml-2">Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="ml-2">Enviar Candidatura</span>
                    </>
                  )}
                </Button>
              </div>

              {submitStatus === 'error' && (
                <div className="text-center p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-destructive mx-auto mb-2" />
                  <p className="text-destructive">Erro ao enviar candidatura. Tente novamente.</p>
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