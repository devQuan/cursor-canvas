import React from 'react';
import type { SceneObject } from '../../../types';
import { useCanvasStore } from '../../store/canvasStore';

const TYPE_LABELS: Record<SceneObject['type'], string> = {
  mesh: 'Mesh',
  camera: 'Camera',
  light: 'Light',
  group: 'Group',
  unknown: 'Node',
};

const TYPE_COLORS: Record<SceneObject['type'], string> = {
  mesh: 'bg-sky-500/20 text-sky-300',
  camera: 'bg-violet-500/20 text-violet-300',
  light: 'bg-amber-500/20 text-amber-300',
  group: 'bg-emerald-500/20 text-emerald-300',
  unknown: 'bg-canvas-border text-canvas-muted',
};

const ScenePanel = React.memo(() => {
  const sceneObjects = useCanvasStore((state) => state.sceneObjects);
  const engine = useCanvasStore((state) => state.engine);

  return (
    <aside className="flex h-full min-w-0 flex-col border-l border-canvas-border bg-canvas-surface">
      <div className="border-b border-canvas-border px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-canvas-muted">
            Scene
          </h3>
          <span className="rounded bg-canvas-bg px-2 py-0.5 font-mono text-[10px] uppercase text-canvas-muted">
            {engine}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {sceneObjects.length === 0 ? (
          <p className="px-1 py-2 text-sm text-canvas-muted">
            No scene objects detected yet.
          </p>
        ) : (
          <ul className="space-y-1">
            {sceneObjects.map((object) => (
              <li
                key={object.id}
                className="flex items-center justify-between gap-2 rounded border border-canvas-border bg-canvas-bg px-2 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-canvas-text">
                    {object.visible ? '◆' : '◇'} {object.name}
                  </p>
                </div>
                <span
                  className={[
                    'shrink-0 rounded px-2 py-0.5 text-[10px] font-medium uppercase',
                    TYPE_COLORS[object.type],
                  ].join(' ')}
                >
                  {TYPE_LABELS[object.type]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
});

ScenePanel.displayName = 'ScenePanel';

export default ScenePanel;
