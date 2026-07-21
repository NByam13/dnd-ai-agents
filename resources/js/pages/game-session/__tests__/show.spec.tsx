import { render } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it } from 'vitest';
import Show from '@/pages/game-session/show';

type SessionProp = ComponentProps<typeof Show>['session'];

const session: SessionProp = {
    id: 42,
    campaign: {
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
        ],
    },
};

const renderShow = (props = session) => render(<Show session={props} />);

describe('Game Session (chat room placeholder)', () => {
    it('renders the campaign name and session number in the header', () => {
        const { getByText } = renderShow();

        expect(getByText('The Lost Mines')).toBeDefined();
        expect(getByText(/session #42/i)).toBeDefined();
    });

    it('lists each party member in the header roster', () => {
        const { getByText } = renderShow();

        expect(getByText('Grog')).toBeDefined();
        expect(getByText('Vex')).toBeDefined();
    });

    it('shows a chat feed with a Dungeon Master turn', () => {
        const { getByText } = renderShow();

        expect(getByText('Dungeon Master')).toBeDefined();
    });

    it('offers a (disabled) turn input and send control', () => {
        const { getByRole } = renderShow();

        const input = getByRole('textbox');
        expect(input).toBeDefined();
        expect(input).toHaveProperty('disabled', true);

        const send = getByRole('button', { name: /send/i });
        expect(send).toHaveProperty('disabled', true);
    });

    it('reserves a placeholder AI Context Window pane for a later slice', () => {
        const { getByText } = renderShow();

        expect(getByText(/ai context window/i)).toBeDefined();
        expect(getByText(/coming in a later slice/i)).toBeDefined();
    });
});
