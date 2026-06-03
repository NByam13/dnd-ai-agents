<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateCampaignRequest;
use App\Models\Campaign;
use Inertia\Inertia;

class CampaignController extends Controller
{
    public function create(CreateCampaignRequest $request)
    {
        $campaign = Campaign::create($request->validated());

        return to_route(route('campaign.show', $campaign ), [
            'campaign' => $campaign,
        ]);
    }

    public function show(Campaign $campaign)
    {
        return Inertia::render('Campaign/Show', [$campaign]);
    }
}
