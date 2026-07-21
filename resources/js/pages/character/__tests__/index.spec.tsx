import { render } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it } from 'vitest';
import Index from '@/pages/character/index';

type CampaignProp = ComponentProps<typeof Index>['campaign'];

const campaign: CampaignProp = {
    id: 7,
    name: 'The Lost Mines',
    world_description: 'A frozen frontier ruled by warring clans.',
    characters: [
        {
            id: 1,
            name: 'Grog',
            race: 'half_orc',
            class: 'barbarian',
            stats: { str: 15, dex: 13, con: 14, int: 8, wis: 12, cha: 10 },
            is_agent: false,
            backstory: 'Raised by wolves.',
        },
        {
            id: 2,
            name: 'Vex',
            race: 'elf',
            class: 'wizard',
            stats: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
            is_agent: true,
            backstory: 'A scholar of forbidden runes.',
        },
        {
            id: 3,
            name: 'Pike',
            race: 'gnome',
            class: 'cleric',
            stats: { str: 10, dex: 12, con: 13, int: 11, wis: 15, cha: 14 },
            is_agent: true,
            backstory: null,
        },
    ],
};

const renderIndex = (props = campaign) => render(<Index campaign={props} />);

describe('Character Index', () => {
    it('renders the campaign name and world description', () => {
        const { getByText } = renderIndex();

        expect(getByText('The Lost Mines')).toBeDefined();
        expect(
            getByText('A frozen frontier ruled by warring clans.'),
        ).toBeDefined();
    });

    it('falls back to a placeholder when there is no world description', () => {
        const { getByText } = renderIndex({
            ...campaign,
            world_description: null,
        });

        expect(getByText(/tale is yet unwritten/i)).toBeDefined();
    });

    it('renders a card for every character in the party', () => {
        const { getByTestId } = renderIndex();

        expect(getByTestId('character-card-1')).toBeDefined();
        expect(getByTestId('character-card-2')).toBeDefined();
        expect(getByTestId('character-card-3')).toBeDefined();
    });

    it('formats raw enum values into display labels', () => {
        const { getByTestId } = renderIndex();

        const card = getByTestId('character-card-1');
        expect(card.textContent).toContain('Half-Orc');
        expect(card.textContent).toContain('Barbarian');
    });

    it('shows each character name and stats', () => {
        const { getByTestId } = renderIndex();

        const card = getByTestId('character-card-1');
        expect(card.textContent).toContain('Grog');
        expect(card.textContent).toContain('STR');
        expect(card.textContent).toContain('15');
    });

    it('marks the human hero and the AI companions distinctly', () => {
        const { getByTestId } = renderIndex();

        expect(getByTestId('character-card-1').textContent).toContain('You');
        expect(getByTestId('character-card-2').textContent).toContain(
            'AI Companion',
        );
    });

    it('renders a backstory when present', () => {
        const { getByTestId } = renderIndex();

        expect(getByTestId('character-card-2').textContent).toContain(
            'A scholar of forbidden runes.',
        );
    });

    it('offers a form to begin the adventure that creates the game session', () => {
        const { getByRole } = renderIndex();

        const button = getByRole('button', { name: /begin the adventure/i });
        expect(button).toBeDefined();

        const form = button.closest('form');
        expect(form?.getAttribute('action')).toBe('/campaign/7/session');
        expect(form?.getAttribute('method')?.toLowerCase()).toBe('post');
    });
});
