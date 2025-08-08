import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { FormsDashboard } from '../FormsDashboard';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
  },
}));

// Mock React Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper to wrap with providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const mockFormsData = [
  {
    id: 1,
    job_title: 'Desenvolvedor Frontend',
    form_id: 'form-001',
    created_at: '2025-01-23T10:00:00Z',
  },
  {
    id: 2,
    job_title: 'Designer UX/UI',
    form_id: 'form-002',
    created_at: '2025-01-22T15:30:00Z',
  },
  {
    id: 3,
    job_title: 'Gerente de Projetos',
    form_id: 'form-003',
    created_at: '2025-01-21T09:15:00Z',
  },
];

const mockResponsesData = [
  { form_id: 'form-001' },
  { form_id: 'form-001' },
  { form_id: 'form-002' },
];

describe('FormsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders dashboard header correctly', async () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <FormsDashboard />
      </Wrapper>
    );

    expect(screen.getByText('Formulários Criados')).toBeInTheDocument();
    expect(screen.getByText(/gerencie e visualize os formulários/i)).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <FormsDashboard />
      </Wrapper>
    );

    expect(screen.getByText(/carregando formulários/i)).toBeInTheDocument();
  });

  it('displays forms list when data is loaded', async () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <FormsDashboard />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Desenvolvedor Frontend')).toBeInTheDocument();
    });

    expect(screen.getByText('Designer UX/UI')).toBeInTheDocument();
    expect(screen.getByText('Gerente de Projetos')).toBeInTheDocument();
  });

  it('displays response counts for forms', async () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <FormsDashboard />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('2 respostas')).toBeInTheDocument();
    });

    expect(screen.getByText('1 resposta')).toBeInTheDocument();
    expect(screen.getByText('0 respostas')).toBeInTheDocument();
  });

  it('filters forms by search term', async () => {
    const user = userEvent.setup();
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <FormsDashboard />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Desenvolvedor Frontend')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/pesquisar formulários/i);
    await user.type(searchInput, 'Frontend');

    // Should show only matching form
    expect(screen.getByText('Desenvolvedor Frontend')).toBeInTheDocument();
    expect(screen.queryByText('Designer UX/UI')).not.toBeInTheDocument();
    expect(screen.queryByText('Gerente de Projetos')).not.toBeInTheDocument();
  });

  it('sorts forms by date', async () => {
    const user = userEvent.setup();
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <FormsDashboard />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Desenvolvedor Frontend')).toBeInTheDocument();
    });

    const sortSelect = screen.getByRole('combobox');
    await user.click(sortSelect);
    
    const oldestOption = screen.getByText('Mais antigos');
    await user.click(oldestOption);

    // Forms should be reordered (oldest first)
    const formTitles = screen.getAllByTestId(/form-title-/);
    expect(formTitles[0]).toHaveTextContent('Gerente de Projetos');
    expect(formTitles[2]).toHaveTextContent('Desenvolvedor Frontend');
  });

  it('navigates to form when view button is clicked', async () => {
    const user = userEvent.setup();
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <FormsDashboard />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Desenvolvedor Frontend')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByText(/visualizar/i);
    await user.click(viewButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/formulario/form-001');
  });

  it('shows empty state when no forms exist', async () => {
    // Mock empty response
    mockSupabase.select.mockResolvedValue({
      data: [],
      error: null,
    });

    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <FormsDashboard />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/nenhum formulário encontrado/i)).toBeInTheDocument();
    });
  });

  it('shows error state when data loading fails', async () => {
    // Mock error response
    mockSupabase.select.mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });

    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <FormsDashboard />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/erro ao carregar formulários/i)).toBeInTheDocument();
    });
  });

  it('displays correct statistics in header', async () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <FormsDashboard />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('3 formulários')).toBeInTheDocument();
    });
  });

  it('handles pagination when there are many forms', async () => {
    // Mock large dataset
    const manyForms = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      job_title: `Vaga ${i + 1}`,
      form_id: `form-${String(i + 1).padStart(3, '0')}`,
      created_at: new Date(2025, 0, i + 1).toISOString(),
    }));

    mockSupabase.select.mockResolvedValue({
      data: manyForms,
      error: null,
    });

    const user = userEvent.setup();
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <FormsDashboard />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Vaga 1')).toBeInTheDocument();
    });

    // Should show pagination controls
    const nextButton = screen.getByRole('button', { name: /próxima/i });
    expect(nextButton).toBeInTheDocument();
    
    await user.click(nextButton);
    
    // Should show different forms on next page
    expect(screen.queryByText('Vaga 1')).not.toBeInTheDocument();
    expect(screen.getByText('Vaga 21')).toBeInTheDocument();
  });

  it('copies form link to clipboard', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    const user = userEvent.setup();
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <FormsDashboard />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Desenvolvedor Frontend')).toBeInTheDocument();
    });

    const copyButtons = screen.getAllByRole('button', { name: /copiar link/i });
    await user.click(copyButtons[0]);

    expect(mockWriteText).toHaveBeenCalledWith(
      expect.stringContaining('/formulario/form-001')
    );
  });

  it('shows copy success feedback', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    const user = userEvent.setup();
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <FormsDashboard />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Desenvolvedor Frontend')).toBeInTheDocument();
    });

    const copyButtons = screen.getAllByRole('button', { name: /copiar link/i });
    await user.click(copyButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/link copiado/i)).toBeInTheDocument();
    });
  });
});