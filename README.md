# RH Qualificador v4.1

Plataforma de recrutamento com IA para geração automática de descrições de vagas e formulários de candidatura personalizados.

## Início Rápido

### Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd rh-qualificador-v4.1

# Instale as dependências
npm install

# Configure as variáveis de ambiente
# Crie um arquivo .env na raiz do projeto com:
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
VITE_WEBHOOK_CHAT_URL=url_webhook_chat
VITE_WEBHOOK_FORM_GENERATOR_URL=url_webhook_form
```

### Como Executar

```bash
# Iniciar em modo desenvolvimento (porta 5173)
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Executar linter
npm run lint
```

## Configuração do Supabase

### Tabelas Necessárias

O sistema utiliza 5 tabelas principais no Supabase:

1. **formularios_nomes** - Metadados dos formulários
2. **formularios_perguntas** - Perguntas dos formulários (q1-q15)
3. **formularios_respostas** - Respostas dos candidatos (a1-a15)
4. **formularios_chat_histories** - Histórico de conversas
5. **formularios_candidate_analysis** - Análises de IA dos candidatos

### Storage Buckets

Configure um bucket para armazenamento de CVs:
- Nome: `cv_uploads`
- Público: Não
- Tamanho máximo: 10MB

## Fluxos Principais

### 1. Gerar Descrição de Vaga
- Acesse a aba "Chat"
- Descreva os requisitos da vaga
- A IA gerará uma descrição profissional
- Clique em "Gerar Formulário" para criar o formulário de candidatura

### 2. Compartilhar Formulário
- Após gerar, copie o link do formulário
- URL: `http://localhost:5173/formulario/{id}`
- Envie para os candidatos

### 3. Gerenciar Candidaturas
- Acesse a aba "Dashboard"
- Visualize todas as vagas e candidatos
- Analise as respostas e CVs enviados

## Serviços Externos

### Webhooks Configurados

#### 1. Chat Webhook
- **Função**: Processar mensagens e gerar descrições de vagas
- **Input**:
```json
{
  "message": "string",
  "timestamp": "ISO 8601",
  "sender": "user",
  "session_id": "chat_xxx"
}
```
- **Output**:
```json
{
  "message": "descrição da vaga gerada",
  "timestamp": "ISO 8601",
  "sender": "assistant"
}
```

#### 2. Form Generator Webhook
- **Função**: Gerar perguntas personalizadas
- **Input**:
```json
{
  "jobDescription": "descrição completa da vaga",
  "session_id": "chat_xxx"
}
```
- **Output**:
```json
{
  "formId": 123,
  "questions": {
    "q1": "pergunta 1",
    "q2": "pergunta 2"
  },
  "jobTitle": "título da vaga"
}
```

## Documentação Completa

Para informações detalhadas, consulte:
- [Documentação Técnica](docs/TECHNICAL_DOC.md) - Arquitetura, APIs e configurações
- [PRD - Product Requirements](docs/PRD.md) - Requisitos, roadmap e métricas

## Suporte

Para dúvidas ou problemas, consulte a documentação completa ou entre em contato com a equipe de desenvolvimento.

## Licença

Propriedade da Agência Lendária. Todos os direitos reservados. 
=======
# Sistema de Geração de Job Description e Formulários

Este é um sistema completo para geração de job descriptions e formulários de candidatura dinâmicos.

## Funcionalidades

### 1. Gerador de Job Description
- Interface de chat para gerar job descriptions personalizadas
- Integração com webhook para processamento de mensagens
- Suporte a markdown para formatação rica

### 2. Gerador de Perguntas Qualificatórias
- Geração de perguntas qualificatórias baseadas na descrição da vaga
- Botão "Generate Formulário" para criar formulários dinâmicos
- Integração com banco de dados Supabase

### 3. Formulários Dinâmicos
- Formulários de candidatura gerados automaticamente
- Campos dinâmicos baseados nas perguntas geradas
- Upload de currículo
- Armazenamento de respostas no banco de dados

## Estrutura do Banco de Dados

### Tabelas
- `formularios_nomes`: Armazena o nome da vaga e ID do formulário
- `formularios_perguntas`: Armazena as perguntas do formulário (q1-q15)
- `formularios_respostas`: Armazena as respostas dos candidatos

## Como Usar

### Gerar Job Description
1. Acesse a aba "Gerador de Job Description"
2. Digite a descrição da vaga
3. Receba a job description formatada

### Gerar Formulário de Candidatura
1. Acesse a aba "Gerador de Perguntas Qualificatórias"
2. Cole a descrição da vaga
3. Clique em "Gerar Perguntas"
4. Após receber as perguntas, clique em "Generate Formulário"
5. O sistema criará um formulário dinâmico no banco de dados
6. Acesse o link gerado para visualizar o formulário

### Formulário de Candidatura
- URL: `/formulario/:id`
- Campos obrigatórios: Nome completo
- Campos opcionais: Email, Currículo
- Perguntas dinâmicas baseadas na geração anterior

## Tecnologias Utilizadas

- React 18
- TypeScript
- Tailwind CSS
- Supabase (Banco de dados)
- Lucide React (Ícones)
- React Router DOM (Roteamento)
- React Markdown (Renderização de markdown)

## Configuração

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente do Supabase
4. Execute: `npm run dev`

## Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://tscrabcd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhb...
```
