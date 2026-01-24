'use client';

import dynamic from 'next/dynamic';

const UI5HybridWrapper = dynamic(() => import('./layout-floorplan-page'), {
  ssr: false,
});

export default function ClientLayoutLoader({ children }: { children: React.ReactNode }) {
  return <UI5HybridWrapper>{children}</UI5HybridWrapper>;
}
