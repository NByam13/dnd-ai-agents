<?php

namespace App\Http\Controllers;

use App\Enums\CharacterClass;
use App\Http\Requests\CreateCampaignRequest;
use App\Models\Campaign;
use Inertia\Inertia;

class CampaignController extends Controller
{
    public function create(CreateCampaignRequest $request)
    {
        $campaign = Campaign::create($request->validated());

        return to_route('campaign.show', ['campaign' => $campaign]);
    }

    public function show(Campaign $campaign)
    {
        // character creation page
        return Inertia::render('campaign/show', [
            'campaign' => $campaign,
            'characterClasses' => CharacterClass::options(),
        ]);
    }
}
