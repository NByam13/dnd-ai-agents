<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\GameSession;
use Illuminate\Http\Request;

class GameSessionController extends Controller
{

    public function store(Request $request, Campaign $campaign) {

        $session = GameSession::create([
            'campaign_id' => $campaign->id,
        ]);

        return to_route('game_session.show', ['session' => $session]);
    }

    // create a game session for the campaign
        // get the initial prompt for the dungeon master agent
        // redirect to the show page for the campaign

    // show the current game session for the campaign
        // return a page where the user and agents will interact with the story
}
