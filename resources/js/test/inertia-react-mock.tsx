import type { ReactNode } from 'react';
import { vi } from 'vitest';

/**
 * Module mock for `@inertiajs/react`, for page component tests.
 *
 * Wire it up at the top of a spec with:
 *   vi.mock('@inertiajs/react', () => import('@/test/inertia-react-mock'));
 * then drive `usePage` via `setPageProps` and assert on `formSpy`.
 *
 * Only the exports the pages actually use are stubbed (Head, usePage, Form).
 */

/** Records the `action`/`method` each rendered `<Form>` is configured with. */
export const formSpy = vi.fn();

let pageProps: Record<string, unknown> = {};

/** Set the props returned by `usePage().props` for the next render. */
export const setPageProps = (props: Record<string, unknown>): void => {
    pageProps = props;
};

export const Head = (): ReactNode => <></>;

export const usePage = () => ({ props: pageProps });

export const Form = ({
    action,
    method,
    children,
}: {
    action: string;
    method: string;
    children: ReactNode;
}): ReactNode => {
    formSpy({ action, method });

    return (
        <form action={action} method={method}>
            {children}
        </form>
    );
};