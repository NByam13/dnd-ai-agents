import { fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Show from '@/pages/campaign/show';
import { formSpy, setPageProps } from '@/test/inertia-mock-state';

vi.mock('@inertiajs/react');

const races = [
    { value: 'human', label: 'Human' },
    { value: 'half_orc', label: 'Half-Orc' },
];

const campaign = { id: 7, name: 'The Lost Mines' };

const characterClasses = [
    {
        value: 'barbarian',
        label: 'Barbarian',
        stats: { str: 15, dex: 13, con: 14, int: 8, wis: 12, cha: 10 },
    },
    {
        value: 'wizard',
        label: 'Wizard',
        stats: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
    },
];

const renderShow = () =>
    render(<Show campaign={campaign} characterClasses={characterClasses} />);

beforeEach(() => {
    formSpy.mockClear();
    setPageProps({ races });
});

describe('Campaign Show — character creation', () => {
    it('renders a form that posts to the campaign character endpoint', () => {
        renderShow();

        expect(formSpy).toHaveBeenCalledWith({
            action: '/campaign/7/character',
            method: 'post',
        });
    });

    it('renders a name field and an option for every class passed from the backend', () => {
        const { container, getByText } = renderShow();

        expect(container.querySelector('input[name="name"]')).not.toBeNull();
        expect(getByText('Barbarian')).toBeDefined();
        expect(getByText('Wizard')).toBeDefined();
    });

    it('renders an option for every race shared from the backend', () => {
        const { getByText } = renderShow();

        expect(getByText('Human')).toBeDefined();
        expect(getByText('Half-Orc')).toBeDefined();
    });

    it('renders an optional backstory field', () => {
        const { container } = renderShow();

        expect(
            container.querySelector('textarea[name="backstory"]'),
        ).not.toBeNull();
    });

    it('shows the selected class stat block on the right when a class is clicked', () => {
        const { getByTestId } = renderShow();

        fireEvent.click(getByTestId('class-option-barbarian'));

        const statBlock = getByTestId('stat-block');
        expect(statBlock.textContent).toContain('STR');
        expect(statBlock.textContent).toContain('15');
        expect(statBlock.textContent).toContain('INT');
        expect(statBlock.textContent).toContain('8');
    });

    it('builds the form payload from the selections so the backend gets name, race and class', () => {
        const { container, getByTestId } = renderShow();

        fireEvent.change(container.querySelector('input[name="name"]')!, {
            target: { value: 'Grog' },
        });
        fireEvent.change(container.querySelector('textarea[name="backstory"]')!, {
            target: { value: 'Raised by wolves.' },
        });
        fireEvent.click(getByTestId('race-option-half_orc'));
        fireEvent.click(getByTestId('class-option-barbarian'));

        expect(
            container.querySelector<HTMLInputElement>('input[name="name"]')!.value,
        ).toBe('Grog');
        expect(
            container.querySelector<HTMLTextAreaElement>(
                'textarea[name="backstory"]',
            )!.value,
        ).toBe('Raised by wolves.');
        expect(
            container.querySelector<HTMLInputElement>('input[name="race"]')!.value,
        ).toBe('half_orc');
        expect(
            container.querySelector<HTMLInputElement>('input[name="class"]')!.value,
        ).toBe('barbarian');
    });

    it('disables submission until a name, race and class are all chosen', () => {
        const { container, getByTestId } = renderShow();

        const submit = getByTestId('begin-adventure-button') as HTMLButtonElement;
        expect(submit.disabled).toBe(true);

        fireEvent.change(container.querySelector('input[name="name"]')!, {
            target: { value: 'Grog' },
        });
        fireEvent.click(getByTestId('race-option-half_orc'));
        fireEvent.click(getByTestId('class-option-barbarian'));

        expect(submit.disabled).toBe(false);
    });
});
