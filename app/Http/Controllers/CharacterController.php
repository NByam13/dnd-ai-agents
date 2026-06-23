<?php

namespace App\Http\Controllers;

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
            'is_agent' => false,
        ]);

        $this->createAccompanyingCharacters($campaign);

        return to_route('campaign.show', ['campaign' => $campaign]);
    }

    private function createAccompanyingCharacters(Campaign $campaign)
    {
        Character::factory(2)->for($campaign)->isAgent()->create();
    }
}
