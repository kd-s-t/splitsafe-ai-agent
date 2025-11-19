import { ComponentType, lazy, Suspense } from 'react';

// Lazy load heavy components to improve initial bundle size
// React lazy loading components
export const LazyPDFViewerModal = lazy(() => import('./PDFViewerModal')) as ComponentType<unknown>;

export const LazyRightSidebar = lazy(() => import('@/modules/agent/components/RightSidebar')) as ComponentType<{ onToggle: () => void }>;

// Wrapper components with Suspense boundaries
export const LazyPDFViewerModalWithSuspense = (props: unknown) => (
  <Suspense fallback={<div className="flex items-center justify-center p-4">Loading PDF viewer...</div>}>
    <LazyPDFViewerModal {...props as Record<string, unknown>} />
  </Suspense>
);

export const LazyRightSidebarWithSuspense = (props: { onToggle: () => void }) => (
  <Suspense fallback={<div className="w-80 bg-card rounded-lg p-4">Loading AI assistant...</div>}>
    <LazyRightSidebar {...props} />
  </Suspense>
);

// Note: Pages are now lazy-loaded by React Router, so these are no longer needed
// But kept for backward compatibility if used elsewhere
