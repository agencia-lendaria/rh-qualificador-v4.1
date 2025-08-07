# Design System detalhado da aplicação.

O sistema utiliza **Tailwind CSS**, como indicado pelas variáveis `--tw-*` no código, sobre um tema escuro e moderno.

---

## 🎨 Paleta de Cores (Color Palette)

A paleta de cores primária é definida em variáveis CSS na raiz (`:root`), facilitando a consistência e a manutenção.

| Cor | Variável CSS | Hex Code | Uso Principal |
| :--- | :--- | :--- | :--- |
| Magenta | `--magenta` | `#E91E63` | Balões de chat do usuário, fundo do logo. |
| Gold | `--gold` | `#C5B17F` | Botões primários, abas ativas. |
| Dark | `--dark` | `#1F2937` | Fundo de cards, balões de chat da IA, campos de input. |
| Darker | `--darker` | `#111827` | Fundo principal da página (`<body>`), header. |
| Purple Dark | `--purple-dark`| `#4D004D` | Borda/sombra de destaque nos cards do dashboard. |
| Gray | `--gray` | `#666666` | Ícones, texto de placeholder, scrollbar. |
| Green | `--green` | `#22C55E` | Status "Ativo". |

---

## ✍️ Tipografia (Typography)

-   **Fonte Principal**: `Inter`, `sans-serif`.
-   **Suavização de Fonte**: `antialiased` para garantir uma leitura nítida em telas de alta resolução.
-   **Estilos**:
    -   **Títulos de Card**: `font-weight: bold;` cor roxo claro/magenta. Ex: "Líder de Vendas Pleno".
    -   **Texto Principal**: Peso normal, cor branca ou cinza claro. Usado no corpo das mensagens de chat e descrições.
    -   **Metadados**: Texto menor e mais fino, cor `--gray`. Usado para informações secundárias como datas, contagem de candidatos e timestamps.

---

## 🧩 Componentes (Components)

### Botões (Buttons)

1.  **Botão Primário / Aba Ativa**:
    -   **Fundo**: `--gold` (`#C5B17F`).
    -   **Texto**: Cor escura (provavelmente `--darker`).
    -   **Bordas**: Arredondadas (`border-radius`).
    -   **Exemplos**: "Dashboard de Formulários", "Gerar Formulário".

2.  **Botão Secundário (Link)**:
    -   **Fundo**: Transparente.
    -   **Texto**: Cor `--gold` (`#C5B17F`).
    -   **Exemplo**: "Exportar".

3.  **Botão de Ação (Ícone)**:
    -   **Fundo**: Cor escura (provavelmente `--dark`).
    -   **Ícone**: Cor `--gray`.
    -   **Bordas**: Arredondadas.
    -   **Exemplo**: Ícone de envio de mensagem.

### Cards

-   **Fundo**: `--dark` (`#1F2937`).
-   **Bordas**: Arredondadas e com uma borda superior ou sombra na cor `--purple-dark` (`#4D004D`).
-   **Estrutura Interna**: Título, seguido por metadados com ícones (`--gray`) e texto, e um rodapé com status e ações.

### Balões de Chat (Chat Bubbles)

-   **Balão da IA (Esquerda)**:
    -   **Fundo**: `--dark` (`#1F2937`).
    -   **Texto**: Branco/Cinza claro.
    -   **Bordas**: Arredondadas.

-   **Balão do Usuário (Direita)**:
    -   **Fundo**: `--magenta` (`#E91E63`).
    -   **Texto**: Branco.
    -   **Bordas**: Arredondadas.

### Campos de Entrada (Input Fields)

-   **Input de Chat**:
    -   **Fundo**: `--dark` (`#1F2937`).
    -   **Texto do Placeholder**: `--gray` (`#666666`).
    -   **Bordas**: Sem bordas visíveis, integrado ao layout.

-   **Input de Busca**:
    -   **Fundo**: `--dark` (`#1F2937`).
    -   **Ícone**: Ícone de busca na cor `--gray`.
    -   **Bordas**: Borda sutil na cor `--gray`.

### Outros Elementos

-   **Tags de Status**: Texto com cor indicativa (`--green` para "Ativo") e um ícone correspondente.
-   **Scrollbar**: Estilizada para se adequar ao tema escuro.
    -   **Trilho (`track`)**: `--darker` (`#111827`).
    -   **Polegar (`thumb`)**: `--gray` (`#666666`) com bordas arredondadas.