import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import EmptyState from '../../src/webview/components/EmptyState';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        title="No frames yet"
        description="Start generating to see frames here."
      />,
    );

    expect(screen.getByText('No frames yet')).toBeInTheDocument();
    expect(
      screen.getByText('Start generating to see frames here.'),
    ).toBeInTheDocument();
  });

  it('renders an optional action button', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <EmptyState
        title="Waiting"
        description="Nothing here yet."
        action={{ label: 'Refresh', onClick }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows error variant label', () => {
    render(
      <EmptyState
        title="Failed"
        description="Something went wrong."
        variant="error"
      />,
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
