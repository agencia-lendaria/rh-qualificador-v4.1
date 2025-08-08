import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from '../badge';

describe('Badge', () => {
  it('renders correctly', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    render(<Badge data-testid="badge">Default</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-[color:rgba(99,102,241,0.1)]');
    expect(badge).toHaveClass('text-[color:#6366f1]');
  });

  it('applies secondary variant styles', () => {
    render(<Badge variant="secondary" data-testid="badge">Secondary</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-secondary');
    expect(badge).toHaveClass('text-secondary-foreground');
  });

  it('applies success variant styles', () => {
    render(<Badge variant="success" data-testid="badge">Success</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-success');
    expect(badge).toHaveClass('text-success-foreground');
  });

  it('applies info variant styles', () => {
    render(<Badge variant="info" data-testid="badge">Info</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-info');
    expect(badge).toHaveClass('text-info-foreground');
  });

  it('applies destructive variant styles', () => {
    render(<Badge variant="destructive" data-testid="badge">Destructive</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-destructive');
    expect(badge).toHaveClass('text-destructive-foreground');
  });

  it('applies outline variant styles', () => {
    render(<Badge variant="outline" data-testid="badge">Outline</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('border');
    expect(badge).toHaveClass('border-input');
    expect(badge).toHaveClass('bg-background');
  });

  it('applies base styles', () => {
    render(<Badge data-testid="badge">Badge</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('inline-flex');
    expect(badge).toHaveClass('items-center');
    expect(badge).toHaveClass('rounded-full');
    expect(badge).toHaveClass('px-2.5');
    expect(badge).toHaveClass('py-0.5');
    expect(badge).toHaveClass('text-xs');
    expect(badge).toHaveClass('font-semibold');
  });

  it('applies custom className', () => {
    render(<Badge className="custom-class" data-testid="badge">Custom</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('custom-class');
  });

  it('renders children correctly', () => {
    render(
      <Badge>
        <span>Icon</span>
        Text
      </Badge>
    );
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('spreads additional props', () => {
    render(<Badge data-testid="badge" title="Badge title">Badge</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveAttribute('title', 'Badge title');
  });
});