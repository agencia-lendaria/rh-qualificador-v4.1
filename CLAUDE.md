# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Development Tips

- don't ask to run npm dev, It's usually running already

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

# Security prompt:

Please check through all the code you just wrote and make sure it follows security best practices. make sure there are no sensitive information in the front and and there are no vulnerabilities that can be exploited

# MCP
Utilize os MCPs (Model Context Protocol) abaixo para determinadas tarefas.
- **supabase** -> Utilizar para implementar soluções completas de backend incluindo:
    - Banco de dados PostgreSQL com RLS (Row Level Security)
    - Sistema de autenticação (GoTrue) com JWT
    - API RESTful automática via PostgREST
    - Armazenamento de arquivos (Storage)
    - Funcionalidades Realtime para colaboração
    - Edge Functions para lógica serverless
    - Seguir convenções snake_case para tabelas e campos
- **context7** -> Utilizar para acessar documentação oficial sempre atualizada de bibliotecas e frameworks.
- **Ref-suportebemstar** -> Use a ferramenta Ref quando seu código precisar de informações ou documentação técnica atualizada sobre APIs, bibliotecas ou frameworks. A ferramenta é ideal para buscar e ler documentações de forma rápida e eficiente em termos de tokens, tanto em fontes públicas quanto privadas. Ela também contém a documentação oficial sempre atualizada de bibliotecas e frameworks e é mais otimizada para buscar exatamente o que precisa.
- **@magicuidesign/mcp** -> Utilizar para criar e implementar componentes modernos de UI, seguindo boas práticas de design, acessibilidade e responsividade. Priorizar componentes reutilizáveis e consistência visual.
- **playwright** -> Use esta ferramenta para automatizar interações com navegadores web, incluindo navegação, preenchimento de formulários, cliques em elementos, captura de screenshots e extração de dados de páginas web. O Playwright suporta múltiplos navegadores (Chrome, Firefox, Safari) e pode executar operações tanto em modo headless quanto com interface gráfica. Essa ferramenta é fundamental para realizar testes, ver os erros que aparecem no console para criar planos de ação para corrigir. Importante: Sempre que usar essa ferramenta, certifique-se de que a URL esteja correta.
- **shadcn-ui** -> Utilizar a ferramenta MCP para construir interfaces com componentes estilizados via Tailwind CSS.
    - Importar componentes
    - Customizar via `components.json` e arquivo de temas
    - Priorizar composição de componentes pequenos e reutilizáveis
    - Usar `data-testid` para testes com Playwright
    - Seguir padrões de acessibilidade (aria-label, roles)

# CHANGELOGS

At the end of each task, create a file in the "changelog" folder with the details of the task execution to be used as a reference for future implementations.

# ANOTHER
- Design System descrito no arquivo -> DESIGN_SYSTEM.md

- `npm run dev` já está em execução na porta http://localhost:5173/