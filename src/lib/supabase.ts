import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

// Database types
export interface FormularioNome {
  id: number;
  vaga_do_form: string;
}

export interface FormularioPergunta {
  id: number;
  q1: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
  q6?: string;
  q8?: string;
  q9?: string;
  q10?: string;
  q11?: string;
  q12?: string;
  q13?: string;
  q14?: string;
  q15?: string;
}

export interface FormularioResposta {
  id: number;
  response_id?: string;
  user_name: string;
  user_email?: string;
  a1?: string;
  a2?: string;
  a3?: string;
  a4?: string;
  a5?: string;
  a6?: string;
  a7?: string;
  a8?: string;
  a9?: string;
  a10?: string;
  a11?: string;
  a12?: string;
  a13?: string;
  a14?: string;
  a15?: string;
  cv_bucket_link?: string;
}

export interface FormularioChatHistory {
  id: number;
  session_id: string;
  message: {
    sender: 'user' | 'assistant' | 'system';
    text: string;
    timestamp: string;
  };
  created_at: string;
}

export interface FormularioCandidateAnalysis {
  id: number;
  response_id: string;
  job_title: string;
  overall_score: number | null;
  technical_score: number | null;
  behavioral_score: number | null;
  cultural_fit_score: number | null;
  experience_score: number | null;
  strengths: string[];
  concerns: string[];
  red_flags: string[];
  decision: 'HIRE' | 'NO_HIRE' | 'INTERVIEW';
  reasoning: string | null;
  next_steps: string[];
  development_areas: string[];
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW';
  full_analysis_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
} 