import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import VideoStage from '../../src/webview/components/VideoPreview/VideoStage';
import { useCanvasStore } from '../../src/webview/store/canvasStore';
import { resetCanvasStore } from '../helpers/resetCanvasStore';

describe('VideoStage', () => {
  beforeEach(() => {
    resetCanvasStore();
  });

  it('shows waiting message when there are no frames', () => {
    render(<VideoStage />);
    expect(
      screen.getByText(/Waiting for video output/i),
    ).toBeInTheDocument();
  });

  it('renders only the latest frame as a full-panel preview', () => {
    useCanvasStore.setState({
      frames: [
        {
          frameIndex: 1,
          framePath: 'https://example.com/frame_0001.png',
          timestamp: 0,
        },
        {
          frameIndex: 2,
          framePath: 'https://example.com/frame_0002.png',
          timestamp: 2,
        },
      ],
      videoPreviewStatus: 'generating',
    });

    render(<VideoStage />);

    expect(screen.getByAltText('Video preview')).toHaveAttribute(
      'src',
      'https://example.com/frame_0002.png',
    );
    expect(screen.queryByAltText('Frame 1')).not.toBeInTheDocument();
    expect(screen.getByText(/Live preview/i)).toBeInTheDocument();
    expect(screen.getByText(/Updating/i)).toBeInTheDocument();
  });
});
