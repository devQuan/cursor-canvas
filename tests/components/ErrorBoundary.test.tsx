import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ErrorBoundary from '../../src/webview/components/ErrorBoundary';

function BrokenPreview(): never {
  throw new Error('Render failed on purpose');
}

describe('ErrorBoundary', () => {
  it('shows fallback UI when a child throws', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary label="Video preview">
        <BrokenPreview />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Video preview failed to render')).toBeInTheDocument();
    expect(screen.getByText('Render failed on purpose')).toBeInTheDocument();

    errorSpy.mockRestore();
  });

  it('recovers when Try again is clicked', async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let shouldThrow = true;

    function MaybeBroken(): JSX.Element {
      if (shouldThrow) {
        throw new Error('Temporary failure');
      }

      return <p>Recovered content</p>;
    }

    render(
      <ErrorBoundary label="App preview">
        <MaybeBroken />
      </ErrorBoundary>,
    );

    expect(screen.getByText('App preview failed to render')).toBeInTheDocument();

    shouldThrow = false;
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(screen.getByText('Recovered content')).toBeInTheDocument();

    errorSpy.mockRestore();
  });
});
