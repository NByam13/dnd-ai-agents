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

        return to_route('campaign.show', ['campaign' => $campaign]);
    }
}
