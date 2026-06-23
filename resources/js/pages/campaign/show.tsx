import { Form, Head, usePage } from '@inertiajs/react';
import {
    Axe,
    BookOpen,
    Cross,
    Dices,
    Feather,
    Moon,
    Music,
    Shield,
    Sparkles,
    Sword,
    Wand2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type AbilityScores = {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
};

interface CharacterClassOption {
    value: string;
    label: string;
    stats: AbilityScores;
}

interface ShowProps {
    campaign: { id: number; name: string };
    characterClasses: CharacterClassOption[];
}

/** Display-only chrome for each class. Stat values are the backend's source of truth. */
const CLASS_DISPLAY: Record<
    string,
    { icon: LucideIcon; role: string; description: string }
> = {
    fighter: {
        icon: Sword,
        role: 'Martial',
        description:
            'A master of weapons and armor, unmatched on the front line.',
    },
    barbarian: {
        icon: Axe,
        role: 'Martial',
        description: 'A primal warrior whose rage turns wounds into fury.',
    },
    paladin: {
        icon: Shield,
        role: 'Martial',
        description: 'A holy knight bound by oath, armored in faith and steel.',
    },
    rogue: {
        icon: Feather,
        role: 'Skirmisher',
        description:
            'A shadow in the dark, striking from stealth with deadly precision.',
    },
    wizard: {
        icon: Wand2,
        role: 'Caster',
        description:
            'A scholar of arcane secrets, bending reality with spell and rune.',
    },
    cleric: {
        icon: Cross,
        role: 'Support',
        description:
            'A divine champion who heals allies and smites the unworthy.',
    },
    bard: {
        icon: Music,
        role: 'Support',
        description:
            'A silver-tongued performer weaving magic through song and story.',
    },
    warlock: {
        icon: Moon,
        role: 'Caster',
        description:
            'A wielder of borrowed power, sworn to an otherworldly patron.',
    },
};

const ABILITIES: { key: keyof AbilityScores; short: string; name: string }[] = [
    { key: 'str', short: 'STR', name: 'Strength' },
    { key: 'dex', short: 'DEX', name: 'Dexterity' },
    { key: 'con', short: 'CON', name: 'Constitution' },
    { key: 'int', short: 'INT', name: 'Intelligence' },
    { key: 'wis', short: 'WIS', name: 'Wisdom' },
    { key: 'cha', short: 'CHA', name: 'Charisma' },
];

/** A score of 13+ is a strength worth highlighting; 8 is the classic dump stat. */
function abilityTone(score: number): string {
    if (score >= 14) {
        return 'text-emerald-300';
    }

    if (score >= 13) {
        return 'text-amber-200';
    }

    if (score <= 8) {
        return 'text-rose-300/80';
    }

    return 'text-amber-100/70';
}

export default function Show({ campaign, characterClasses }: ShowProps) {
    const { races } = usePage().props;
    const [characterName, setCharacterName] = useState('');
    const [selectedRace, setSelectedRace] = useState<string | null>(null);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);

    const chosenRace = races.find((r) => r.value === selectedRace) ?? null;
    const chosenClass =
        characterClasses.find((c) => c.value === selectedClass) ?? null;
    const canBeginAdventure =
        characterName.trim().length > 0 &&
        selectedRace !== null &&
        selectedClass !== null;

    return (
        <>
            <Head title="Choose Your Hero" />

            <div className="min-h-screen bg-gradient-to-b from-[#1a1410] via-[#0f0c0a] to-black text-amber-50">
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" />

                <div className="mx-auto max-w-6xl px-6 py-12">
                    {/* Header */}
                    <header className="mb-10 text-center">
                        <div className="mb-4 flex items-center justify-center gap-3 text-amber-400">
                            <Sparkles className="size-5" />
                            <span className="text-sm tracking-[0.3em] uppercase">
                                {campaign.name}
                            </span>
                            <Sparkles className="size-5" />
                        </div>
                        <h1 className="font-serif text-4xl font-bold tracking-wide text-amber-100 sm:text-5xl">
                            Choose Your Hero
                        </h1>
                        <p className="mx-auto mt-4 max-w-xl text-amber-200/70">
                            Name yourself, choose your lineage, and answer the
                            call of your class. Your class decides your ability
                            scores — chosen for you, for now.
                        </p>
                    </header>

                    <Form
                        action={`/campaign/${campaign.id}/character`}
                        method="post"
                        className="grid gap-8 lg:grid-cols-3"
                    >
                        {/* Hidden fields carry the selections to the backend */}
                        <input
                            type="hidden"
                            name="race"
                            value={selectedRace ?? ''}
                        />
                        <input
                            type="hidden"
                            name="class"
                            value={selectedClass ?? ''}
                        />

                        {/* Left: identity + class picker */}
                        <div className="space-y-10 lg:col-span-2">
                            <section className="space-y-3">
                                <Label
                                    htmlFor="character-name"
                                    className="text-sm tracking-widest text-amber-300 uppercase"
                                >
                                    Hero Name
                                </Label>
                                <Input
                                    id="character-name"
                                    name="name"
                                    value={characterName}
                                    onChange={(e) =>
                                        setCharacterName(e.target.value)
                                    }
                                    placeholder="e.g. Thorne Ironheart"
                                    className="border-amber-800/60 bg-black/40 text-lg text-amber-50 placeholder:text-amber-200/30 focus-visible:border-amber-500"
                                />
                            </section>

                            <section className="space-y-3">
                                <Label
                                    htmlFor="character-backstory"
                                    className="text-sm tracking-widest text-amber-300 uppercase"
                                >
                                    Backstory{' '}
                                    <span className="text-amber-200/40 normal-case">
                                        (optional)
                                    </span>
                                </Label>
                                <Textarea
                                    id="character-backstory"
                                    name="backstory"
                                    rows={5}
                                    placeholder="What drove your hero to answer the call? Their origins, scars, and ambitions…"
                                    className="border-amber-800/60 bg-black/40 text-amber-50 placeholder:text-amber-200/30 focus-visible:border-amber-500"
                                />
                            </section>

                            <section className="space-y-3">
                                <span className="block text-sm tracking-widest text-amber-300 uppercase">
                                    Lineage
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {races.map((race) => (
                                        <button
                                            key={race.value}
                                            type="button"
                                            data-testid={`race-option-${race.value}`}
                                            aria-pressed={
                                                selectedRace === race.value
                                            }
                                            onClick={() =>
                                                setSelectedRace(race.value)
                                            }
                                            className={cn(
                                                'rounded-full border px-4 py-1.5 text-sm transition-colors',
                                                selectedRace === race.value
                                                    ? 'border-amber-400 bg-amber-500/20 text-amber-100'
                                                    : 'border-amber-800/50 text-amber-200/70 hover:border-amber-600 hover:text-amber-100',
                                            )}
                                        >
                                            {race.label}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <div className="mb-6 flex items-center gap-4">
                                    <BookOpen className="size-5 text-amber-400" />
                                    <h2 className="font-serif text-2xl text-amber-100">
                                        Answer the Call
                                    </h2>
                                    <div className="h-px flex-1 bg-amber-800/40" />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {characterClasses.map((characterClass) => {
                                        const display =
                                            CLASS_DISPLAY[characterClass.value];
                                        const Icon = display?.icon ?? Sword;
                                        const isSelected =
                                            selectedClass ===
                                            characterClass.value;

                                        return (
                                            <Card
                                                key={characterClass.value}
                                                role="button"
                                                tabIndex={0}
                                                data-testid={`class-option-${characterClass.value}`}
                                                aria-pressed={isSelected}
                                                onClick={() =>
                                                    setSelectedClass(
                                                        characterClass.value,
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === 'Enter' ||
                                                        e.key === ' '
                                                    ) {
                                                        e.preventDefault();
                                                        setSelectedClass(
                                                            characterClass.value,
                                                        );
                                                    }
                                                }}
                                                className={cn(
                                                    'cursor-pointer border-amber-900/50 bg-gradient-to-b from-[#241b12] to-[#160f0a] py-4 transition-all hover:-translate-y-1 hover:border-amber-600 hover:shadow-lg hover:shadow-amber-950/50',
                                                    isSelected &&
                                                        'border-amber-400 ring-2 ring-amber-500/50',
                                                )}
                                            >
                                                <CardHeader className="flex-row items-center gap-3 px-4">
                                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-amber-700/60 bg-amber-500/10 text-amber-300">
                                                        <Icon className="size-5" />
                                                    </span>
                                                    <div className="space-y-1">
                                                        <CardTitle className="font-serif text-lg text-amber-100">
                                                            {
                                                                characterClass.label
                                                            }
                                                        </CardTitle>
                                                        {display && (
                                                            <Badge
                                                                variant="outline"
                                                                className="border-amber-700/60 text-amber-300/80"
                                                            >
                                                                {display.role}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </CardHeader>
                                                {display && (
                                                    <CardContent className="px-4">
                                                        <CardDescription className="text-amber-200/60">
                                                            {
                                                                display.description
                                                            }
                                                        </CardDescription>
                                                    </CardContent>
                                                )}
                                            </Card>
                                        );
                                    })}
                                </div>
                            </section>
                        </div>

                        {/* Right: stat block preview + action */}
                        <aside className="lg:col-span-1">
                            <div className="sticky top-8 space-y-6">
                                <Card
                                    data-testid="stat-block"
                                    className="border-amber-900/50 bg-gradient-to-b from-[#241b12] to-[#160f0a] py-6"
                                >
                                    <CardHeader className="px-6">
                                        <CardTitle className="font-serif text-xl text-amber-100">
                                            {chosenClass
                                                ? `${chosenClass.label} — Ability Scores`
                                                : 'Ability Scores'}
                                        </CardTitle>
                                        <CardDescription className="text-amber-200/60">
                                            {chosenClass
                                                ? 'Set by your class. Fixed for this first adventure.'
                                                : 'Choose a class to reveal its stat block.'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="px-6">
                                        {chosenClass ? (
                                            <dl className="space-y-2">
                                                {ABILITIES.map((ability) => {
                                                    const score =
                                                        chosenClass.stats[
                                                            ability.key
                                                        ];

                                                    return (
                                                        <div
                                                            key={ability.key}
                                                            className="flex items-center justify-between rounded-md border border-amber-900/40 bg-black/30 px-4 py-2"
                                                        >
                                                            <dt className="flex items-baseline gap-2">
                                                                <span className="text-sm font-semibold tracking-widest text-amber-300">
                                                                    {
                                                                        ability.short
                                                                    }
                                                                </span>
                                                                <span className="text-xs text-amber-200/50">
                                                                    {
                                                                        ability.name
                                                                    }
                                                                </span>
                                                            </dt>
                                                            <dd
                                                                className={cn(
                                                                    'font-serif text-xl tabular-nums',
                                                                    abilityTone(
                                                                        score,
                                                                    ),
                                                                )}
                                                            >
                                                                {score}
                                                            </dd>
                                                        </div>
                                                    );
                                                })}
                                            </dl>
                                        ) : (
                                            <p className="py-6 text-center text-sm text-amber-200/40">
                                                No class chosen yet.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>

                                <div className="rounded-xl border border-amber-900/50 bg-black/30 p-6 text-center">
                                    <p className="mb-4 text-sm text-amber-200/80">
                                        {canBeginAdventure ? (
                                            <>
                                                <span className="font-serif text-amber-100">
                                                    {characterName}
                                                </span>{' '}
                                                the {chosenRace?.label}{' '}
                                                {chosenClass?.label} stands
                                                ready.
                                            </>
                                        ) : (
                                            'Complete your hero to begin the journey.'
                                        )}
                                    </p>
                                    <Button
                                        type="submit"
                                        size="lg"
                                        data-testid="begin-adventure-button"
                                        disabled={!canBeginAdventure}
                                        className="w-full gap-2 bg-amber-600 text-amber-50 hover:bg-amber-500 disabled:bg-amber-900/40 disabled:text-amber-200/40"
                                    >
                                        <Dices className="size-5" />
                                        Begin the Adventure
                                    </Button>
                                </div>
                            </div>
                        </aside>
                    </Form>
                </div>
            </div>
        </>
    );
}
