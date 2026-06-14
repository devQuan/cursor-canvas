import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import FrameStrip from '../../src/webview/components/VideoPreview/FrameStrip';
import { useCanvasStore } from '../../src/webview/store/canvasStore';
import { resetCanvasStore } from '../helpers/resetCanvasStore';

describe('FrameStrip', () => {
  beforeEach(() => {
    resetCanvasStore();
  });

  it('shows empty waiting message when there are no frames', () => {
    render(<FrameStrip />);
    expect(
      screen.getByText(/Waiting for frames in the output folder/i),
    ).toBeInTheDocument();
  });

  it('renders thumbnails and timestamps for each frame', () => {
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
    });

    render(<FrameStrip />);

    expect(screen.getByAltText('Frame 1')).toBeInTheDocument();
    expect(screen.getByAltText('Frame 2')).toBeInTheDocument();
    expect(screen.getByText('0:02')).toBeInTheDocument();
  });
});
