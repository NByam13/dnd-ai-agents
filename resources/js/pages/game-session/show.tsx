import { Head } from '@inertiajs/react';
import { Eye, Send, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { AbilityScores, CharacterSummary } from '@/types/game';

/** A character as it arrives from Eloquent — race/class are raw enum values. */
type CampaignCharacter = {
    id: number;
    name: string;
    race: string;
    class: string;
    stats: AbilityScores;
    is_agent: boolean;
    backstory: string | null;
};

interface ShowProps {
    session: {
        id: number;
        campaign: {
            id: number;
            name: string;
            world_description: string | null;
            characters: CampaignCharacter[];
        };
    };
}

/** Turn a snake_case enum value into a display label: half_orc → Half-Orc. */
function formatEnumLabel(value: string): string {
    return value
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('-');
}

function toSummary(character: CampaignCharacter): CharacterSummary {
    return {
        ...character,
        race: formatEnumLabel(character.race),
        class: formatEnumLabel(character.class),
    };
}

export default function Show({ session }: ShowProps) {
    const { campaign } = session;
    const characters = campaign.characters.map(toSummary);

    return (
        <>
            <Head title={campaign.name} />

            <div className="flex h-screen flex-col bg-gradient-to-b from-[#1a1410] via-[#0f0c0a] to-black text-amber-50">
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" />

                {/* Session header */}
                <header className="flex items-center justify-between border-b border-amber-900/50 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Sparkles className="size-5 text-amber-400" />
                        <div>
                            <h1 className="font-serif text-xl text-amber-100">
                                {campaign.name}
                            </h1>
                            <p className="text-xs tracking-widest text-amber-200/50 uppercase">
                                Session #{session.id}
                            </p>
                        </div>
                    </div>
                    <ul className="hidden items-center gap-2 sm:flex">
                        {characters.map((character) => (
                            <li
                                key={character.id}
                                className={cn(
                                    'rounded-full border px-3 py-1 text-xs',
                                    character.is_agent
                                        ? 'border-amber-800/60 text-amber-200/70'
                                        : 'border-amber-400 text-amber-100',
                                )}
                                title={`${character.race} ${character.class}`}
                            >
                                {character.name}
                            </li>
                        ))}
                    </ul>
                </header>

                {/* Two-pane shell: chat left, context inspector right */}
                <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_20rem]">
                    {/* Chat room */}
                    <section className="flex min-h-0 flex-col">
                        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-8">
                            {/* Placeholder opening narration */}
                            <div className="max-w-2xl">
                                <p className="mb-1 text-xs tracking-widest text-amber-300/80 uppercase">
                                    Dungeon Master
                                </p>
                                <div className="rounded-xl rounded-tl-sm border border-amber-900/50 bg-gradient-to-b from-[#241b12] to-[#160f0a] p-4 leading-relaxed text-amber-200/80">
                                    <p className="italic text-amber-200/50">
                                        The Dungeon Master is preparing the
                                        opening scene. Once the turn engine is
                                        wired up, narration and party dialogue
                                        will stream into this feed.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Prompt input */}
                        <div className="border-t border-amber-900/50 px-6 py-4">
                            <div className="flex items-end gap-3">
                                <Textarea
                                    rows={2}
                                    disabled
                                    placeholder="What do you do? (turn input coming soon)"
                                    className="resize-none border-amber-800/60 bg-black/40 text-amber-50 placeholder:text-amber-200/30"
                                />
                                <Button
                                    type="button"
                                    size="lg"
                                    disabled
                                    className="gap-2 bg-amber-500 text-black hover:bg-amber-400"
                                >
                                    <Send className="size-4" />
                                    Send
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* AI Context Window — placeholder for a later slice */}
                    <aside className="hidden min-h-0 flex-col border-l border-amber-900/50 lg:flex">
                        <div className="flex items-center gap-2 border-b border-amber-900/50 px-4 py-4">
                            <Eye className="size-4 text-amber-400" />
                            <h2 className="font-serif text-sm tracking-wide text-amber-100">
                                AI Context Window
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto px-4 py-6">
                            <div className="rounded-lg border border-dashed border-amber-800/50 bg-black/20 p-4 text-center text-xs leading-relaxed text-amber-200/40">
                                Token meters, message history, system prompts,
                                and journal snapshots for the DM and each
                                companion will live here.
                                <span className="mt-2 block text-amber-300/50">
                                    Coming in a later slice.
                                </span>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}
