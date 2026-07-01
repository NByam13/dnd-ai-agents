import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import View from '@/pages/campaign/view';
import type { CharacterSummary } from '@/types/game';

vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual('@inertiajs/react');

    return {
        ...actual,
        Head: () => <></>,
    };
});

const campaign = {
    id: 7,
    name: 'The Lost Mines',
    world_description: 'A frozen frontier ruled by warring clans.',
};

const hero: CharacterSummary = {
    id: 1,
    name: 'Grog',
    race: 'Half-Orc',
    class: 'Barbarian',
    stats: { str: 15, dex: 13, con: 14, int: 8, wis: 12, cha: 10 },
    is_agent: false,
    backstory: 'Raised by wolves.',
};

const companions: CharacterSummary[] = [
    {
        id: 2,
        name: 'Vex',
        race: 'Elf',
        class: 'Wizard',
        stats: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
        is_agent: true,
        backstory: 'A scholar of forbidden runes.',
    },
    {
        id: 3,
        name: 'Pike',
        race: 'Gnome',
        class: 'Cleric',
        stats: { str: 10, dex: 12, con: 13, int: 11, wis: 15, cha: 14 },
        is_agent: true,
        backstory: null,
    },
];

const renderView = (characters: CharacterSummary[] = [hero, ...companions]) =>
    render(<View campaign={campaign} characters={characters} />);

describe('Campaign View', () => {
    it('renders the campaign name and world description', () => {
        const { getByText } = renderView();

        expect(getByText('The Lost Mines')).toBeDefined();
        expect(
            getByText('A frozen frontier ruled by warring clans.'),
        ).toBeDefined();
    });

    it('falls back to a placeholder when there is no world description', () => {
        const { getByText } = render(
            <View
                campaign={{ ...campaign, world_description: null }}
                characters={[hero]}
            />,
        );

        expect(getByText(/tale is yet unwritten/i)).toBeDefined();
    });

    it('renders a card for every character in the party', () => {
        const { getByTestId } = renderView();

        expect(getByTestId('character-card-1')).toBeDefined();
        expect(getByTestId('character-card-2')).toBeDefined();
        expect(getByTestId('character-card-3')).toBeDefined();
    });

    it('shows a character name, lineage, class and stats', () => {
        const { getByTestId } = renderView();

        const card = getByTestId('character-card-1');
        expect(card.textContent).toContain('Grog');
        expect(card.textContent).toContain('Half-Orc');
        expect(card.textContent).toContain('Barbarian');
        expect(card.textContent).toContain('STR');
        expect(card.textContent).toContain('15');
    });

    it('marks the human hero and the AI companions distinctly', () => {
        const { getByTestId } = renderView();

        expect(getByTestId('character-card-1').textContent).toContain('You');
        expect(getByTestId('character-card-2').textContent).toContain(
            'AI Companion',
        );
    });

    it('renders a backstory when present', () => {
        const { getByTestId } = renderView();

        expect(getByTestId('character-card-2').textContent).toContain(
            'A scholar of forbidden runes.',
        );
    });
});
