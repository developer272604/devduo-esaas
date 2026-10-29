import { NOT_DEMO_ERROR } from '@/lib/demo';

/** Shown instead of the store when the build is not in demo mode but has no real adapters yet. */
export function NotDemo() {
  return (
    <main className="boundary" role="alert">
      <h1>This build needs real services</h1>
      <p>{NOT_DEMO_ERROR}</p>
    </main>
  );
}
