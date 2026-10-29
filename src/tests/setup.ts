import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { loadAllTemplates } from '@/templates';

// Vitest runs without globals here, so Testing Library cannot register its own cleanup.
afterEach(() => cleanup());

// Templates load on demand in the app; the tests want every catalogue available up front.
await loadAllTemplates();
