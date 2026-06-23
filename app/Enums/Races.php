<?php

namespace App\Enums;

enum Races: string
{
    case HUMAN = 'human';
    case ELF = 'elf';
    case DWARF = 'dwarf';
    case HALFLING = 'halfling';
    case HALF_ORC = 'half_orc';
    case TIEFLING = 'tiefling';
    case DRAGONBORN = 'dragonborn';
    case GNOME = 'gnome';

    public function label(): string
    {
        return match ($this) {
            self::HUMAN => 'Human',
            self::ELF => 'Elf',
            self::DWARF => 'Dwarf',
            self::HALFLING => 'Halfling',
            self::HALF_ORC => 'Half-Orc',
            self::TIEFLING => 'Tiefling',
            self::DRAGONBORN => 'Dragonborn',
            self::GNOME => 'Gnome',
        };
    }

    /**
     * Shape each race for the character-creation page: the value the form
     * submits and a display label. Shared with the frontend via Inertia so the
     * picker is always in parity with this enum.
     *
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(fn (self $race): array => [
            'value' => $race->value,
            'label' => $race->label(),
        ], self::cases());
    }
}
