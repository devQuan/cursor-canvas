import { describe, expect, it } from 'vitest';
import { shouldAutoOpenPanel } from '../../src/services/panelAutoOpen';

describe('shouldAutoOpenPanel', () => {
  it('opens when auto-open is enabled and a workspace is available', () => {
    expect(
      shouldAutoOpenPanel({
        autoOpenEnabled: true,
        hasWorkspace: true,
        closedByUser: false,
        panelAlreadyOpen: false,
      }),
    ).toBe(true);
  });

  it('does not open when the user closed the panel in this workspace', () => {
    expect(
      shouldAutoOpenPanel({
        autoOpenEnabled: true,
        hasWorkspace: true,
        closedByUser: true,
        panelAlreadyOpen: false,
      }),
    ).toBe(false);
  });

  it('does not open when auto-open is disabled', () => {
    expect(
      shouldAutoOpenPanel({
        autoOpenEnabled: false,
        hasWorkspace: true,
        closedByUser: false,
        panelAlreadyOpen: false,
      }),
    ).toBe(false);
  });
});
