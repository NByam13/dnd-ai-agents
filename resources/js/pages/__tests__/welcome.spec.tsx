import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Welcome from '@/pages/welcome';

const mocks = vi.hoisted(() => ({
    form: vi.fn()
}))

vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual('@inertiajs/react');

    return {
        ...actual,
        Head: () => <></>,
        Form: ({ action, method, children }: { action: string; method: string; children: React.ReactNode }) => {
            mocks.form({ action, method });

            return <form action={action} method={method}>{children}</form>;
        }
    };
});

describe('Welcome Page', () => {
    it('renders a campaign creation form that posts to /campaign/store', () => {
        render(<Welcome />);

        expect(mocks.form).toHaveBeenCalledWith({
            action: '/campaign/store',
            method: 'post'
        });
    });

    it('renders the campaign name and world description fields', () => {
        const wrapper = render(<Welcome />);

        expect(wrapper.container.querySelector('input[name="name"]')).not.toBeNull();
        expect(wrapper.container.querySelector('textarea[name="world_description"]')).not.toBeNull();
    });

    it('renders the New Game submit button', () => {
        const wrapper = render(<Welcome />);
        const button = wrapper.getByTestId('new-game-button');

        expect(button).toBeDefined();
        expect(button.getAttribute('type')).toBe('submit');
    });
});
