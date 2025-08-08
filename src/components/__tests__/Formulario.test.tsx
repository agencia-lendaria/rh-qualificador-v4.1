import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Formulario } from '../Formulario';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    insert: vi.fn().mockReturnThis(),
  },
}));

// Mock useParams
const mockUseParams = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => mockUseParams(),
  };
});

// Helper component to wrap with router
const FormularioWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Formulario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ id: 'test-form-id' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <FormularioWrapper>
        <Formulario />
      </FormularioWrapper>
    );
    
    expect(screen.getByText('Carregando formulário...')).toBeInTheDocument();
  });

  it('renders form when data is loaded', async () => {
    render(
      <FormularioWrapper>
        <Formulario />
      </FormularioWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Desenvolvedor Frontend')).toBeInTheDocument();
    });

    expect(screen.getByText('Qual sua experiência com React?')).toBeInTheDocument();
    expect(screen.getByText('Como você trabalha em equipe?')).toBeInTheDocument();
  });

  it('renders required name and email fields', async () => {
    render(
      <FormularioWrapper>
        <Formulario />
      </FormularioWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
  });

  it('shows validation errors for required fields', async () => {
    render(
      <FormularioWrapper>
        <Formulario />
      </FormularioWrapper>
    );

    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enviar candidatura/i })).toBeInTheDocument();
    });

    // Try to submit without filling required fields
    await user.click(screen.getByRole('button', { name: /enviar candidatura/i }));

    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(
      <FormularioWrapper>
        <Formulario />
      </FormularioWrapper>
    );

    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /enviar candidatura/i });

    // Fill name to avoid that validation error
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
    
    // Enter invalid email
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
    });
  });

  it('allows empty email field', async () => {
    mockSupabase.insert.mockResolvedValue({ data: {}, error: null });

    render(
      <FormularioWrapper>
        <Formulario />
      </FormularioWrapper>
    );

    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    });

    // Fill only required name field
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
    
    // Submit with empty email (should be allowed)
    await user.click(screen.getByRole('button', { name: /enviar candidatura/i }));

    await waitFor(() => {
      expect(mockSupabase.insert).toHaveBeenCalled();
    });
  });

  it('submits form with valid data', async () => {
    mockSupabase.insert.mockResolvedValue({ data: {}, error: null });

    render(
      <FormularioWrapper>
        <Formulario />
      </FormularioWrapper>
    );

    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    });

    // Fill form fields
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
    await user.type(screen.getByLabelText(/email/i), 'joao@email.com');
    
    // Fill first question
    const question1Input = screen.getByLabelText(/qual sua experiência com react/i);
    await user.type(question1Input, '5 anos de experiência');

    // Submit form
    await user.click(screen.getByRole('button', { name: /enviar candidatura/i }));

    await waitFor(() => {
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        form_id: 'test-form-id',
        user_name: 'João Silva',
        user_email: 'joao@email.com',
        a1: '5 anos de experiência',
        a2: '',
        a3: '',
        a4: '',
        a5: '',
        a6: '',
        a7: '',
        a8: '',
        a9: '',
        a10: '',
        a11: '',
        a12: '',
        a13: '',
        a14: '',
        a15: '',
      });
    });
  });

  it('shows success message after successful submission', async () => {
    mockSupabase.insert.mockResolvedValue({ data: {}, error: null });

    render(
      <FormularioWrapper>
        <Formulario />
      </FormularioWrapper>
    );

    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    });

    // Fill and submit form
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
    await user.click(screen.getByRole('button', { name: /enviar candidatura/i }));

    await waitFor(() => {
      expect(screen.getByText(/candidatura enviada com sucesso/i)).toBeInTheDocument();
    });
  });

  it('shows error message on submission failure', async () => {
    mockSupabase.insert.mockResolvedValue({ 
      data: null, 
      error: { message: 'Database error' } 
    });

    render(
      <FormularioWrapper>
        <Formulario />
      </FormularioWrapper>
    );

    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    });

    // Fill and submit form
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
    await user.click(screen.getByRole('button', { name: /enviar candidatura/i }));

    await waitFor(() => {
      expect(screen.getByText(/erro ao enviar candidatura/i)).toBeInTheDocument();
    });
  });

  it('disables submit button while submitting', async () => {
    // Make insert promise hang to test loading state
    let resolveInsert: (value: any) => void;
    const insertPromise = new Promise(resolve => {
      resolveInsert = resolve;
    });
    mockSupabase.insert.mockReturnValue(insertPromise);

    render(
      <FormularioWrapper>
        <Formulario />
      </FormularioWrapper>
    );

    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /enviar candidatura/i });
    
    // Fill and submit form
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
    await user.click(submitButton);

    // Button should be disabled while submitting
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/enviando/i)).toBeInTheDocument();

    // Resolve the promise to finish the test
    resolveInsert!({ data: {}, error: null });
  });

  it('handles form not found error', async () => {
    mockSupabase.single.mockResolvedValue({
      data: null,
      error: { message: 'Form not found' },
    });

    render(
      <FormularioWrapper>
        <Formulario />
      </FormularioWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/formulário não encontrado/i)).toBeInTheDocument();
    });
  });
});