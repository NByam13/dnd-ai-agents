<?php

namespace App\Http\Controllers;

use App\Ai\Agents\BackstoryAgent;
use App\Enums\CharacterClass;
use App\Enums\Races;
use App\Http\Requests\CreateCharacterRequest;
use App\Models\Campaign;
use App\Models\Character;

class CharacterController extends Controller
{
    public function store(CreateCharacterRequest $request, Campaign $campaign)
    {
        $race = $request->enum('race', Races::class);
        $class = $request->enum('class', CharacterClass::class);

        $campaign->characters()->create([
            'name' => $request->validated('name'),
            'race' => $race->value,
            'class' => $class->value,
            'stats' => $class->statBlock(),
            'backstory' => $request->validated('backstory'),
            'is_agent' => false,
        ]);

        $this->createAccompanyingCharacters($campaign);

        return to_route('campaign.show', ['campaign' => $campaign]);
    }

    private function createAccompanyingCharacters(Campaign $campaign): void
    {
        $agents = Character::factory(2)->for($campaign)->isAgent()->create();

        foreach ($agents as $agent) {
            $agent->update([
                'backstory' => BackstoryAgent::make()->prompt($this->backstoryPromptFor($agent))->text,
            ]);
        }
    }

    private function backstoryPromptFor(Character $character): string
    {
        $race = Races::from($character->race)->label();
        $class = CharacterClass::from($character->class)->label();
        $stats = collect($character->stats)
            ->map(fn (int $score, string $ability): string => strtoupper($ability)." {$score}")
            ->implode(', ');

        return "Write a backstory for {$character->name}, a {$race} {$class}. Ability scores: {$stats}.";
    }
}
