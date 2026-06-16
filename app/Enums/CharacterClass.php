<?php

namespace App\Enums;

enum CharacterClass: string
{
    case Fighter = 'fighter';
    case Barbarian = 'barbarian';
    case Paladin = 'paladin';
    case Rogue = 'rogue';
    case Wizard = 'wizard';
    case Cleric = 'cleric';
    case Bard = 'bard';
    case Warlock = 'warlock';

    public function label(): string
    {
        return ucfirst($this->value);
    }

    /**
     * The class's default ability scores, built from the standard array
     * (15, 14, 13, 12, 10, 8) arranged to match the class's expected
     * proficiencies — e.g. a barbarian leans on STR and dumps INT, while a
     * wizard does the reverse. Simplified for the first pass: fixed, not editable.
     *
     * @return array{str: int, dex: int, con: int, int: int, wis: int, cha: int}
     */
    public function statBlock(): array
    {
        return match ($this) {
            self::Fighter => ['str' => 15, 'dex' => 13, 'con' => 14, 'int' => 8, 'wis' => 12, 'cha' => 10],
            self::Barbarian => ['str' => 15, 'dex' => 13, 'con' => 14, 'int' => 8, 'wis' => 12, 'cha' => 10],
            self::Paladin => ['str' => 15, 'dex' => 10, 'con' => 13, 'int' => 8, 'wis' => 12, 'cha' => 14],
            self::Rogue => ['str' => 8, 'dex' => 15, 'con' => 13, 'int' => 14, 'wis' => 12, 'cha' => 10],
            self::Wizard => ['str' => 8, 'dex' => 14, 'con' => 13, 'int' => 15, 'wis' => 12, 'cha' => 10],
            self::Cleric => ['str' => 13, 'dex' => 10, 'con' => 14, 'int' => 8, 'wis' => 15, 'cha' => 12],
            self::Bard => ['str' => 8, 'dex' => 14, 'con' => 13, 'int' => 10, 'wis' => 12, 'cha' => 15],
            self::Warlock => ['str' => 8, 'dex' => 13, 'con' => 14, 'int' => 10, 'wis' => 12, 'cha' => 15],
        };
    }

    /**
     * Shape each class for the character-creation page: the value the form
     * submits, a display label, and the stat block to preview on selection.
     *
     * @return list<array{value: string, label: string, stats: array{str: int, dex: int, con: int, int: int, wis: int, cha: int}}>
     */
    public static function options(): array
    {
        return array_map(fn (self $class): array => [
            'value' => $class->value,
            'label' => $class->label(),
            'stats' => $class->statBlock(),
        ], self::cases());
    }
}
