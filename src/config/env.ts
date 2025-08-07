// Environment variables validation and configuration

interface EnvConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  WEBHOOK_CHAT_URL: string;
  WEBHOOK_FORM_GENERATOR_URL: string;
}

// Required environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY', 
  'VITE_WEBHOOK_CHAT_URL',
  'VITE_WEBHOOK_FORM_GENERATOR_URL'
] as const;

// Validate and get environment variables
function validateEnvVars(): EnvConfig {
  const missingVars: string[] = [];
  
  for (const envVar of requiredEnvVars) {
    if (!import.meta.env[envVar]) {
      missingVars.push(envVar);
    }
  }
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missingVars.join('\n')}\n\nPlease check your .env file and ensure all required variables are set.`
    );
  }
  
  return {
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    WEBHOOK_CHAT_URL: import.meta.env.VITE_WEBHOOK_CHAT_URL,
    WEBHOOK_FORM_GENERATOR_URL: import.meta.env.VITE_WEBHOOK_FORM_GENERATOR_URL,
  };
}

// Export validated configuration
export const env = validateEnvVars();
export type { EnvConfig };