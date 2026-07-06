import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Welcome from '@/pages/welcome';
import { formSpy } from '@/test/inertia-mock-state';

vi.mock('@inertiajs/react');

beforeEach(() => {
    formSpy.mockClear();
});

describe('Welcome Page', () => {
    it('renders a campaign creation form that posts to /campaign/store', () => {
        render(<Welcome />);

        expect(formSpy).toHaveBeenCalledWith({
            action: '/campaign/store',
            method: 'post',
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
