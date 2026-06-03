import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Welcome from '@/pages/welcome';

const mocks = vi.hoisted(() => ({
    router: {
        get: vi.fn()
    }
}))

vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual('@inertiajs/react');

    return {
        ...actual,
        Head: () => <></>,
        router: mocks.router
    };
});

describe('Welcome Page', () => {
    it('renders correctly', () => {
        const wrapper = render(<Welcome />);
        const button = wrapper.getByTestId('new-game-button');

        expect(button).toBeDefined();
        button.click();

        expect(mocks.router.get).toHaveBeenCalled();
    });
});
