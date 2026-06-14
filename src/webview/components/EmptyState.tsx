import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
}

const EmptyState = React.memo(({ title, description }: EmptyStateProps) => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
      <div className="rounded-full border border-canvas-border px-3 py-1 text-xs font-mono uppercase tracking-wider text-canvas-muted">
        Preview
      </div>
      <h2 className="text-base font-medium text-canvas-text">{title}</h2>
      <p className="max-w-sm text-sm text-canvas-muted">{description}</p>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;
