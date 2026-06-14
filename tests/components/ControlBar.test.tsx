import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ControlBar from '../../src/webview/components/ControlBar';
import { postToExtension } from '../../src/webview/hooks/useMessageBridge';
import { useCanvasStore } from '../../src/webview/store/canvasStore';
import { resetCanvasStore } from '../helpers/resetCanvasStore';

vi.mock('../../src/webview/hooks/useMessageBridge', () => ({
  postToExtension: vi.fn(),
  useMessageBridge: vi.fn(),
}));

describe('ControlBar', () => {
  beforeEach(() => {
    resetCanvasStore();
    vi.mocked(postToExtension).mockClear();
  });

  it('renders three track buttons', () => {
    render(<ControlBar onRefresh={vi.fn()} />);

    expect(screen.getByRole('tab', { name: 'app' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'game' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'video' })).toBeInTheDocument();
  });

  it('shows the active track with selected state', () => {
    useCanvasStore.setState({ activeTrack: 'game' });
    render(<ControlBar onRefresh={vi.fn()} />);

    expect(screen.getByRole('tab', { name: 'game' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('sends OVERRIDE_TRACK when a track button is clicked', async () => {
    const user = userEvent.setup();
    render(<ControlBar onRefresh={vi.fn()} />);

    await user.click(screen.getByRole('tab', { name: 'video' }));

    expect(postToExtension).toHaveBeenCalledWith({
      type: 'OVERRIDE_TRACK',
      track: 'video',
    });
  });

  it('shows Auto badge text in auto mode', () => {
    render(<ControlBar onRefresh={vi.fn()} />);
    expect(screen.getByText(/Auto: App/i)).toBeInTheDocument();
  });

  it('shows Manual badge text in manual mode', () => {
    useCanvasStore.setState({ activeTrack: 'game', trackMode: 'manual' });
    render(<ControlBar onRefresh={vi.fn()} />);
    expect(screen.getByText(/Manual: Game/i)).toBeInTheDocument();
  });

  it('sends REQUEST_REFRESH when refresh is clicked', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();

    render(<ControlBar onRefresh={onRefresh} />);
    await user.click(screen.getByRole('button', { name: 'Refresh detection' }));

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
