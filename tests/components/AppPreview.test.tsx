import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppPreview from '../../src/webview/components/AppPreview';
import { useCanvasStore } from '../../src/webview/store/canvasStore';
import { resetCanvasStore } from '../helpers/resetCanvasStore';

vi.mock('../../src/webview/hooks/useMessageBridge', () => ({
  postToExtension: vi.fn(),
  useMessageBridge: vi.fn(),
}));

describe('AppPreview', () => {
  beforeEach(() => {
    resetCanvasStore();
  });

  it('renders iframe when server status is ready', () => {
    useCanvasStore.setState({
      port: 5173,
      portSource: 'config',
      serverStatus: 'ready',
    });

    render(<AppPreview />);

    const iframe = screen.getByTitle('App preview');
    expect(iframe).toHaveAttribute('src', 'http://localhost:5173');
  });

  it('shows loading overlay when server status is starting', () => {
    useCanvasStore.setState({
      port: 5173,
      serverStatus: 'starting',
    });

    render(<AppPreview />);
    expect(screen.getByText(/Starting dev server/i)).toBeInTheDocument();
  });

  it('shows unreachable state when server status is unreachable', () => {
    useCanvasStore.setState({
      port: 5173,
      serverStatus: 'unreachable',
    });

    render(<AppPreview />);
    expect(
      screen.getByText(/No server found on port 5173/i),
    ).toBeInTheDocument();
  });
});
