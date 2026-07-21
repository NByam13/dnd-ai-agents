import { Form, Head } from '@inertiajs/react';
import { ScrollText, Sparkles, Swords, Users } from 'lucide-react';

import { CharacterCard } from '@/components/character-card';
import { Button } from '@/components/ui/button';
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

interface IndexProps {
    campaign: {
        id: number;
        name: string;
        world_description: string | null;
        characters: CampaignCharacter[];
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

export default function Index({ campaign }: IndexProps) {
    const characters = campaign.characters.map(toSummary);
    const hero = characters.find((character) => !character.is_agent) ?? null;
    const companions = characters.filter((character) => character.is_agent);

    return (
        <>
            <Head title={campaign.name} />

            <div className="min-h-screen bg-gradient-to-b from-[#1a1410] via-[#0f0c0a] to-black text-amber-50">
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" />

                <div className="mx-auto max-w-6xl px-6 py-12">
                    {/* Header */}
                    <header className="mb-10 text-center">
                        <div className="mb-4 flex items-center justify-center gap-3 text-amber-400">
                            <Sparkles className="size-5" />
                            <span className="text-sm tracking-[0.3em] uppercase">
                                Campaign
                            </span>
                            <Sparkles className="size-5" />
                        </div>
                        <h1 className="font-serif text-4xl font-bold tracking-wide text-amber-100 sm:text-5xl">
                            {campaign.name}
                        </h1>
                    </header>

                    {/* World description */}
                    <section className="mb-12">
                        <div className="mb-6 flex items-center gap-4">
                            <ScrollText className="size-5 text-amber-400" />
                            <h2 className="font-serif text-2xl text-amber-100">
                                The World
                            </h2>
                            <div className="h-px flex-1 bg-amber-800/40" />
                        </div>

                        <div className="rounded-xl border border-amber-900/50 bg-gradient-to-b from-[#241b12] to-[#160f0a] p-6">
                            {campaign.world_description ? (
                                <p className="leading-relaxed text-amber-200/80">
                                    {campaign.world_description}
                                </p>
                            ) : (
                                <p className="text-center text-sm text-amber-200/40">
                                    No world description was set for this
                                    campaign. The tale is yet unwritten.
                                </p>
                            )}
                        </div>
                    </section>

                    {/* The Party */}
                    <section>
                        <div className="mb-6 flex items-center gap-4">
                            <Users className="size-5 text-amber-400" />
                            <h2 className="font-serif text-2xl text-amber-100">
                                The Party
                            </h2>
                            <div className="h-px flex-1 bg-amber-800/40" />
                        </div>

                        {characters.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {hero && (
                                    <CharacterCard
                                        key={hero.id}
                                        character={hero}
                                    />
                                )}
                                {companions.map((companion) => (
                                    <CharacterCard
                                        key={companion.id}
                                        character={companion}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-amber-900/50 bg-black/30 p-6 text-center text-sm text-amber-200/40">
                                No heroes have joined this campaign yet.
                            </div>
                        )}
                    </section>

                    {/* Begin the adventure — creates the game session and seeds the DM */}
                    <section className="mt-12 flex flex-col items-center gap-4 text-center">
                        <p className="text-amber-200/60">
                            Your party is assembled. When you begin, the Dungeon
                            Master takes up the tale.
                        </p>
                        <Form
                            action={`/campaign/${campaign.id}/session`}
                            method="post"
                        >
                            <Button
                                type="submit"
                                size="lg"
                                className="gap-2 bg-amber-500 text-black hover:bg-amber-400"
                            >
                                <Swords className="size-5" />
                                Begin the Adventure
                            </Button>
                        </Form>
                    </section>
                </div>
            </div>
        </>
    );
}
