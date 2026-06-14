import React from 'react';

const ScenePanel = React.memo(() => {
  return (
    <aside className="flex h-full flex-col border-l border-canvas-border bg-canvas-surface p-3">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-canvas-muted">
        Scene
      </h3>
      <p className="text-sm text-canvas-muted">No scene objects detected yet.</p>
    </aside>
  );
});

ScenePanel.displayName = 'ScenePanel';

export default ScenePanel;
