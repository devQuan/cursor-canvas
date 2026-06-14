import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import ScenePanel from '../../src/webview/components/GamePreview/ScenePanel';
import { useCanvasStore } from '../../src/webview/store/canvasStore';
import { resetCanvasStore } from '../helpers/resetCanvasStore';

describe('ScenePanel', () => {
  beforeEach(() => {
    resetCanvasStore();
  });

  it('shows empty state when no scene objects are detected', () => {
    useCanvasStore.setState({ sceneObjects: [] });

    render(<ScenePanel />);

    expect(
      screen.getByText(/No scene objects detected yet/i),
    ).toBeInTheDocument();
  });

  it('renders type badges for scene objects', () => {
    useCanvasStore.setState({
      sceneObjects: [
        { id: 'cam', name: 'Main Camera', type: 'camera', visible: true },
        { id: 'mesh', name: 'Hero', type: 'mesh', visible: true },
      ],
    });

    render(<ScenePanel />);

    expect(screen.getByText('Camera')).toBeInTheDocument();
    expect(screen.getByText('Mesh')).toBeInTheDocument();
  });
});
