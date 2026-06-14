import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VideoPlayer from '../../src/webview/components/VideoPreview/VideoPlayer';
import { useCanvasStore } from '../../src/webview/store/canvasStore';
import { resetCanvasStore } from '../helpers/resetCanvasStore';

vi.mock('../../src/webview/hooks/useMessageBridge', () => ({
  postToExtension: vi.fn(),
  useMessageBridge: vi.fn(),
}));

describe('VideoPlayer', () => {
  beforeEach(() => {
    resetCanvasStore();
  });

  it('renders a full-panel video element when videoUrl is set', () => {
    useCanvasStore.setState({
      videoUrl: 'https://example.com/output.mp4',
      videoViewMode: 'player',
    });

    render(<VideoPlayer />);

    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', 'https://example.com/output.mp4');
    expect(video).toHaveClass('h-full', 'w-full', 'object-contain');
  });

  it('returns null when videoUrl is missing', () => {
    const { container } = render(<VideoPlayer />);
    expect(container).toBeEmptyDOMElement();
  });
});
