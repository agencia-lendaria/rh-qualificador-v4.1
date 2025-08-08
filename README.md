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