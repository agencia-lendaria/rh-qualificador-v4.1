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