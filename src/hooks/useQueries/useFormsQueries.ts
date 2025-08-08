import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, type FormularioPergunta, type FormularioResposta } from '@/lib/supabase'

export function useFormsList() {
  return useQuery({
    queryKey: ['forms-list'],
    queryFn: async () => {
      const { data: formsData, error: formsError } = await supabase
        .from('formularios_nomes')
        .select('*')
        .order('id', { ascending: false })

      if (formsError) throw formsError
      return formsData
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}

export function useFormQuestions(formId: number | null) {
  return useQuery({
    queryKey: ['form-questions', formId],
    enabled: Boolean(formId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('formularios_perguntas')
        .select('*')
        .eq('id', formId as number)
        .single()

      if (error) throw error
      return data as FormularioPergunta
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (questions don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 2
  })
}

export function useFormResponses(formId: number | null) {
  return useQuery({
    queryKey: ['form-responses', formId],
    enabled: Boolean(formId),
    queryFn: async () => {
      const { data: responsesData, error: responsesError } = await supabase
        .from('formularios_respostas')
        .select('*')
        .eq('id', formId as number)
        .order('created_at', { ascending: false })

      if (responsesError) throw responsesError

      // Transform responses to include answers object
      const transformedResponses = responsesData.map(response => {
        const answers: { [key: string]: string } = {}
        for (let i = 1; i <= 15; i++) {
          const answerKey = `a${i}` as keyof FormularioResposta
          const answer = response[answerKey]
          if (answer && typeof answer === 'string') {
            answers[`a${i}`] = answer
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
        }
      })

      // Remove duplicates based on response_id
      const uniqueResponses = transformedResponses.filter((response, index, self) => 
        index === self.findIndex(r => r.response_id === response.response_id)
      )

      return uniqueResponses
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (responses change more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 3
  })
}

// Prefetch utility for better UX
export function usePrefetchForm() {
  const queryClient = useQueryClient()
  
  return {
    prefetchQuestions: (formId: number) => {
      queryClient.prefetchQuery({
        queryKey: ['form-questions', formId],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('formularios_perguntas')
            .select('*')
            .eq('id', formId)
            .single()

          if (error) throw error
          return data as FormularioPergunta
        },
        staleTime: 10 * 60 * 1000
      })
    },
    prefetchResponses: (formId: number) => {
      queryClient.prefetchQuery({
        queryKey: ['form-responses', formId],
        queryFn: async () => {
          const { data: responsesData, error: responsesError } = await supabase
            .from('formularios_respostas')
            .select('*')
            .eq('id', formId)
            .order('created_at', { ascending: false })

          if (responsesError) throw responsesError
          return responsesData
        },
        staleTime: 2 * 60 * 1000
      })
    }
  }
}

