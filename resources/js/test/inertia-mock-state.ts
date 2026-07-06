import { vi } from 'vitest';

/**
 * Shared state for the `@inertiajs/react` module mock in
 * `__mocks__/@inertiajs/react.tsx`. Lives under `@/test` so specs can reach it
 * with the same alias they use everywhere else, and so the mock module's own
 * exports mirror the real package surface (Head, usePage, Form).
 */

/** Records the `action`/`method` each rendered `<Form>` is configured with. */
export const formSpy = vi.fn();

/** Props served by the mocked `usePage()`; a live binding the mock reads. */
export let pageProps: Record<string, unknown> = {};

/** Set the props returned by `usePage().props` for the next render. */
export const setPageProps = (props: Record<string, unknown>): void => {
    pageProps = props;
};
