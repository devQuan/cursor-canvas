import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import DeviceSwitcher from '../../src/webview/components/AppPreview/DeviceSwitcher';
import { useCanvasStore } from '../../src/webview/store/canvasStore';
import { resetCanvasStore } from '../helpers/resetCanvasStore';

describe('DeviceSwitcher', () => {
  beforeEach(() => {
    resetCanvasStore();
  });

  it('renders all preview device options', () => {
    render(<DeviceSwitcher />);

    expect(screen.getByRole('button', { name: 'Desktop' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'iPhone 15 Pro' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pixel 8' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'iPad Pro 11" Portrait' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'iPad Pro 11" Landscape' })).toBeInTheDocument();
  });

  it('updates preview device in the store when clicked', async () => {
    const user = userEvent.setup();
    render(<DeviceSwitcher />);

    await user.click(screen.getByRole('button', { name: 'Pixel 8' }));

    expect(useCanvasStore.getState().previewDevice).toBe('android-phone');
  });

  it('supports ipad landscape selection', async () => {
    const user = userEvent.setup();
    render(<DeviceSwitcher />);

    await user.click(screen.getByRole('button', { name: 'iPad Pro 11" Landscape' }));

    expect(useCanvasStore.getState().previewDevice).toBe('ipad-pro-landscape');
  });
});
