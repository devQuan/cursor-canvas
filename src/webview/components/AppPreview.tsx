import React from 'react';
import EmptyState from './EmptyState';

const AppPreview = React.memo(() => {
  return (
    <EmptyState
      title="App preview ready"
      description="Open a web project and start your dev server. The live localhost iframe will appear here in Phase 3."
    />
  );
});

AppPreview.displayName = 'AppPreview';

export default AppPreview;
