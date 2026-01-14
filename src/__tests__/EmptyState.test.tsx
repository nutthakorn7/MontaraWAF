import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from '@/components/ui/EmptyState';

describe('EmptyState Component', () => {
  it('renders no-data variant', () => {
    render(<EmptyState variant="no-data" />);
    // Use getAllByText since there are multiple matches
    const elements = screen.getAllByText(/no data/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('renders error variant', () => {
    render(<EmptyState variant="error" />);
    const elements = screen.getAllByText(/error/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('renders with custom title', () => {
    render(<EmptyState variant="no-data" title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('renders with custom description', () => {
    render(<EmptyState variant="no-data" description="Custom description" />);
    expect(screen.getByText('Custom description')).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    render(
      <EmptyState 
        variant="no-data" 
        action={{ label: 'Retry', onClick: () => {} }}
      />
    );
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});
