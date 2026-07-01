import {
    Axe,
    Cross,
    Feather,
    Moon,
    Music,
    Shield,
    Sword,
    Wand2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AbilityScores, CharacterSummary } from '@/types/game';

/** Icon chrome per class, keyed by the lowercased class label. */
const CLASS_ICONS: Record<string, LucideIcon> = {
    fighter: Sword,
    barbarian: Axe,
    paladin: Shield,
    rogue: Feather,
    wizard: Wand2,
    cleric: Cross,
    bard: Music,
    warlock: Moon,
};

const ABILITIES: { key: keyof AbilityScores; short: string }[] = [
    { key: 'str', short: 'STR' },
    { key: 'dex', short: 'DEX' },
    { key: 'con', short: 'CON' },
    { key: 'int', short: 'INT' },
    { key: 'wis', short: 'WIS' },
    { key: 'cha', short: 'CHA' },
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

interface CharacterCardProps {
    character: CharacterSummary;
}

export function CharacterCard({ character }: CharacterCardProps) {
    const Icon = CLASS_ICONS[character.class.toLowerCase()] ?? Sword;

    return (
        <Card
            data-testid={`character-card-${character.id}`}
            className={cn(
                'border-amber-900/50 bg-gradient-to-b from-[#241b12] to-[#160f0a] py-6',
                !character.is_agent && 'border-amber-500/60 ring-1 ring-amber-500/30',
            )}
        >
            <CardHeader className="flex-row items-center gap-3 px-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-amber-700/60 bg-amber-500/10 text-amber-300">
                    <Icon className="size-5" />
                </span>
                <div className="space-y-1">
                    <CardTitle className="font-serif text-lg text-amber-100">
                        {character.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-amber-200/60">
                            {character.race} {character.class}
                        </span>
                        <Badge
                            variant="outline"
                            className={cn(
                                'border-amber-700/60 text-amber-300/80',
                                !character.is_agent &&
                                    'border-amber-400 text-amber-200',
                            )}
                        >
                            {character.is_agent ? 'AI Companion' : 'You'}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 px-6">
                <dl className="grid grid-cols-3 gap-2">
                    {ABILITIES.map((ability) => {
                        const score = character.stats[ability.key];

                        return (
                            <div
                                key={ability.key}
                                className="flex flex-col items-center rounded-md border border-amber-900/40 bg-black/30 py-2"
                            >
                                <dt className="text-xs font-semibold tracking-widest text-amber-300">
                                    {ability.short}
                                </dt>
                                <dd
                                    className={cn(
                                        'font-serif text-lg tabular-nums',
                                        abilityTone(score),
                                    )}
                                >
                                    {score}
                                </dd>
                            </div>
                        );
                    })}
                </dl>

                {character.backstory && (
                    <p className="max-h-40 overflow-y-auto text-sm leading-relaxed whitespace-pre-line text-amber-200/70">
                        {character.backstory}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
