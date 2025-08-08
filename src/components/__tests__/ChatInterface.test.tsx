import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChatInterface } from '../ChatInterface';
import type { ChatMessage } from '../../types';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
  },
}));

// Mock fetch for webhook calls
global.fetch = vi.fn();

// Helper to wrap with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Mock env config
vi.mock('../../config/env', () => ({
  env: {
    WEBHOOK_URL: 'https://test-webhook.com/webhook',
  },
}));

describe('ChatInterface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock session storage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(() => 'chat_123_abc'),
        setItem: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders chat interface correctly', async () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <ChatInterface 
          messages={[]}
          onSendMessage={() => {}}
          isLoading={false}
          sessionId="test-session"
        />
      </Wrapper>
    );

    expect(screen.getByText(/descrição de vaga/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/descreva a vaga que deseja criar/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /gerar descrição/i })).toBeInTheDocument();
  });

  it('displays existing messages', async () => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'user',
        content: 'Olá!',
        timestamp: new Date(),
      },
      {
        id: '2',
        role: 'assistant',
        content: 'Olá! Como posso ajudá-lo?',
        timestamp: new Date(),
      },
    ];

    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <ChatInterface 
          messages={messages}
          onSendMessage={() => {}}
          isLoading={false}
          sessionId="test-session"
        />
      </Wrapper>
    );

    expect(screen.getByText('Olá!')).toBeInTheDocument();
    expect(screen.getByText('Olá! Como posso ajudá-lo?')).toBeInTheDocument();
  });

  it('handles message input and sends message', async () => {
    const mockOnSendMessage = vi.fn();
    const user = userEvent.setup();
    const Wrapper = createWrapper();

    render(
      <Wrapper>
        <ChatInterface 
          messages={[]}
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          sessionId="test-session"
        />
      </Wrapper>
    );

    const input = screen.getByPlaceholderText(/descreva a vaga que deseja criar/i);
    const button = screen.getByRole('button', { name: /gerar descrição/i });

    await user.type(input, 'Preciso de um desenvolvedor React');
    await user.click(button);

    expect(mockOnSendMessage).toHaveBeenCalledWith('Preciso de um desenvolvedor React');
  });

  it('prevents sending empty messages', async () => {
    const mockOnSendMessage = vi.fn();
    const user = userEvent.setup();
    const Wrapper = createWrapper();

    render(
      <Wrapper>
        <ChatInterface 
          messages={[]}
          onSendMessage={mockOnSendMessage}
          isLoading={false}
          sessionId="test-session"
        />
      </Wrapper>
    );

    const button = screen.getByRole('button', { name: /gerar descrição/i });
    await user.click(button);

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('disables input while loading', async () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <ChatInterface 
          messages={[]}
          onSendMessage={() => {}}
          isLoading={true}
          sessionId="test-session"
        />
      </Wrapper>
    );

    const input = screen.getByPlaceholderText(/descreva a vaga que deseja criar/i);
    const button = screen.getByRole('button', { name: /gerando/i });

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('shows typing indicator while loading', async () => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'user',
        content: 'Teste',
        timestamp: new Date(),
      },
    ];

    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <ChatInterface 
          messages={messages}
          onSendMessage={() => {}}
          isLoading={true}
          sessionId="test-session"
        />
      </Wrapper>
    );

    expect(screen.getByText(/digitando/i)).toBeInTheDocument();
  });

  it('renders markdown content correctly', async () => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'assistant',
        content: '## Título\n\n**Texto em negrito**\n\n- Item de lista',
        timestamp: new Date(),
      },
    ];

    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <ChatInterface 
          messages={messages}
          onSendMessage={() => {}}
          isLoading={false}
          sessionId="test-session"
        />
      </Wrapper>
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Título');
    expect(screen.getByText('Texto em negrito')).toBeInTheDocument();
    expect(screen.getByText('Item de lista')).toBeInTheDocument();
  });

  it('handles form generation button click', async () => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'assistant',
        content: 'Descrição da vaga criada.',
        timestamp: new Date(),
        metadata: {
          jobDescription: 'Vaga para desenvolvedor',
        },
      },
    ];

    // Mock fetch for webhook
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const user = userEvent.setup();
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <ChatInterface 
          messages={messages}
          onSendMessage={() => {}}
          isLoading={false}
          sessionId="test-session"
        />
      </Wrapper>
    );

    const generateFormButton = screen.getByRole('button', { name: /gerar formulário/i });
    await user.click(generateFormButton);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://n8nwebhook-ops.agencialendaria.ai/webhook/d7da636a-b358-4111-9828-e4171b94e275',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: 'test-session',
          jobDescription: 'Vaga para desenvolvedor',
          action: 'generate_form',
        }),
      })
    );
  });

  it('shows error state when webhook fails', async () => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'assistant',
        content: 'Descrição da vaga criada.',
        timestamp: new Date(),
        metadata: {
          jobDescription: 'Vaga para desenvolvedor',
        },
      },
    ];

    // Mock fetch to fail
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    const user = userEvent.setup();
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <ChatInterface 
          messages={messages}
          onSendMessage={() => {}}
          isLoading={false}
          sessionId="test-session"
        />
      </Wrapper>
    );

    const generateFormButton = screen.getByRole('button', { name: /gerar formulário/i });
    await user.click(generateFormButton);

    await waitFor(() => {
      expect(screen.getByText(/erro ao gerar formulário/i)).toBeInTheDocument();
    });
  });

  it('scrolls to bottom when new messages arrive', async () => {
    const scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'user',
        content: 'Primeira mensagem',
        timestamp: new Date(),
      },
    ];

    const Wrapper = createWrapper();
    
    const { rerender } = render(
      <Wrapper>
        <ChatInterface 
          messages={messages}
          onSendMessage={() => {}}
          isLoading={false}
          sessionId="test-session"
        />
      </Wrapper>
    );

    // Add new message
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: '2',
        role: 'assistant',
        content: 'Segunda mensagem',
        timestamp: new Date(),
      },
    ];

    rerender(
      <Wrapper>
        <ChatInterface 
          messages={newMessages}
          onSendMessage={() => {}}
          isLoading={false}
          sessionId="test-session"
        />
      </Wrapper>
    );

    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalled();
    });
  });
});