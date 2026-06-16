<?php

namespace App\Http\Controllers;

use App\Enums\CharacterClass;
use App\Http\Requests\CreateCharacterRequest;
use App\Models\Campaign;

class CharacterController extends Controller
{
    public function store(CreateCharacterRequest $request, Campaign $campaign)
    {
        $validated = $request->validated();
        $class = CharacterClass::from($validated['class']);

        $campaign->characters()->create([
            'name' => $validated['name'],
            'race' => $validated['race'],
            'class' => $class->value,
            'stats' => $class->statBlock(),
            'is_agent' => false,
        ]);

        $this->createAccompanyingCharacters($campaign);

        return to_route('campaign.show', ['campaign' => $campaign]);
    }

    private function createAccompanyingCharacters(Campaign $campaign)
    {
        $class1 = CharacterClass::from('barbarian');

        $campaign->characters()->create([
            'name' => 'Grog',
            'race' => 'Orc',
            'class' => $class1->value,
            'stats' => $class1->statBlock(),
            'is_agent' => true,
        ]
        );

        $class2 = CharacterClass::from('wizard');

        $campaign->characters()->create([
            'name' => 'Nick Byam',
            'race' => 'Gnome',
            'class' => $class2->value,
            'stats' => $class2->statBlock(),
            'is_agent' => true,
        ]
        );
    }
}
