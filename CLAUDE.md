# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Architecture Overview

This is a React TypeScript application for HR recruitment tools, specifically for generating job descriptions and dynamic application forms. The system has three main functionalities:

### Core Components Architecture

1. **App.tsx** - Main router and state management hub
   - Manages chat state at top level
   - Handles session management with Supabase
   - Routes between main interface and individual forms

2. **Navigation.tsx** - Tab-based navigation between:
   - Chat interface (Job Description Generator)
   - Forms Dashboard

3. **ChatInterface** - Job description generation via webhook integration
4. **FormsDashboard** - Management interface for generated forms
5. **Formulario** - Dynamic form component for job applications

### Database Schema (Supabase)

The application uses 4 main tables:
- `formularios_nomes` - Form metadata (job titles, form IDs)
- `formularios_perguntas` - Form questions (q1-q15 fields)
- `formularios_respostas` - Candidate responses (a1-a15 fields)
- `formularios_chat_histories` - Chat session persistence
- `formularios_candidate_analysis` - AI analysis of candidates

### External Integrations

- **Webhook Integration**: `https://n8nwebhook-ops.agencialendaria.ai/webhook/d7da636a-b358-4111-9828-e4171b94e275`
  - Used for job description generation and form question generation
  - Requires session_id and jobDescription in payload

### Key Technical Patterns

- State management flows up from components to App.tsx
- Supabase client configured in `src/lib/supabase.ts` with TypeScript interfaces
- React Router handles `/formulario/:id` dynamic routes
- Message persistence with session-based chat history
- File upload integration with Supabase storage buckets

### Styling

- Tailwind CSS with custom brand colors and gradients
- Glass morphism design patterns
- Custom animations (pulse-magenta, shadow effects)
- Responsive design with mobile considerations

## Important Notes

- Supabase credentials are currently hardcoded in `src/lib/supabase.ts` - should be moved to environment variables
- The webhook URL is production-specific and embedded in the generate form logic
- Form questions are limited to 15 fields (q1-q15) with corresponding answers (a1-a15)
- Session IDs follow pattern: `chat_{timestamp}_{random}`