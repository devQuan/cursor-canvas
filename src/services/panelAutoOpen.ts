export function shouldAutoOpenPanel(options: {
  autoOpenEnabled: boolean;
  hasWorkspace: boolean;
  closedByUser: boolean;
  panelAlreadyOpen: boolean;
}): boolean {
  if (options.panelAlreadyOpen) {
    return false;
  }

  if (options.closedByUser) {
    return false;
  }

  if (!options.autoOpenEnabled) {
    return false;
  }

  return options.hasWorkspace;
}
