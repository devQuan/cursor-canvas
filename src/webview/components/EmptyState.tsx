import React from 'react';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  title: string;
  description: string;
  action?: EmptyStateAction;
  variant?: 'default' | 'error';
}

const EmptyState = React.memo(
  ({ title, description, action, variant = 'default' }: EmptyStateProps) => {
    const isError = variant === 'error';

    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <div
          className={[
            'rounded-full border px-3 py-1 text-xs font-mono uppercase tracking-wider',
            isError
              ? 'border-canvas-error/40 text-canvas-error'
              : 'border-canvas-border text-canvas-muted',
          ].join(' ')}
        >
          {isError ? 'Error' : 'Preview'}
        </div>
        <h2 className="text-base font-medium text-canvas-text">{title}</h2>
        <p className="max-w-sm text-sm text-canvas-muted">{description}</p>
        {action ? (
          <button
            type="button"
            onClick={action.onClick}
            className="rounded border border-canvas-border px-3 py-1.5 text-xs text-canvas-text hover:bg-canvas-surface"
          >
            {action.label}
          </button>
        ) : null}
      </div>
    );
  },
);

EmptyState.displayName = 'EmptyState';

export default EmptyState;
