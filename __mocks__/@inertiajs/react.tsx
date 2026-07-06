import type { ReactNode } from 'react';
import { formSpy, pageProps } from '@/test/inertia-mock-state';

/**
 * Manual module mock for `@inertiajs/react`, auto-loaded by Vitest when a spec
 * calls `vi.mock('@inertiajs/react')`. Only the exports the pages actually use
 * are stubbed (Head, usePage, Form). Drive/assert via `@/test/inertia-mock-state`.
 */

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
