import { vi } from 'vitest';

/**
 * Global test setup (see `test.setupFiles` in `vite.config.ts`).
 *
 * Applies the shared `@inertiajs/react` manual mock
 * (`__mocks__/@inertiajs/react.tsx`) to every spec, so individual tests don't
 * repeat `vi.mock('@inertiajs/react')`. Drive/assert via `@/test/inertia-mock-state`.
 */
vi.mock('@inertiajs/react');
