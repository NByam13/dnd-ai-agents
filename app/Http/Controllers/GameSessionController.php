<?php

namespace App\Http\Controllers;

use App\Ai\Agents\DungeonMasterAgent;
use App\Ai\Agents\PlayerAgent;
use App\Enums\AgentRole;
use App\Enums\CharacterClass;
use App\Enums\Races;
use App\Models\Campaign;
use App\Models\Character;
use App\Models\GameSession;
use Inertia\Inertia;

class GameSessionController extends Controller
{
    // Beginning the adventure: stand up a game session for the campaign and
    // seed the Dungeon Master's context so it has everything it needs to open
    // the story, then hand off to the game session page.
    public function store(Campaign $campaign)
    {
        $campaign->load('characters');

        $session = $campaign->gameSessions()->create();

        $this->seedDungeonMasterContext($session, $campaign);

        $this->makeAgents($session, $campaign);

        return to_route('game_session.show', ['session' => $session]);
    }

    // session overview / setup confirmation page — the last look at the campaign
    // world and party before the adventure begins.
    public function show(GameSession $session)
    {
        $session->load('campaign.characters');

        return Inertia::render('game-session/show', [
            'session' => [
                'id' => $session->id,
                'campaign' => [
                    'id' => $session->campaign->id,
                    'name' => $session->campaign->name,
                    'world_description' => $session->campaign->world_description,
                    'characters' => $session->campaign->characters,
                ],
            ],
        ]);
    }

    private function makeAgents(GameSession $session, Campaign $campaign): void
    {
        // make some agents and attach them to campaign
        $campaign->characters->each(function (Character $character) use ($campaign) {
            // make agent
            $character->agentContexts()->create([
                'character_id' => null,
                'agent_role' => AgentRole::PLAYER,
                'system_prompt' => (string) (new PlayerAgent($character))->instructions(),
                'messages' => [[
                    'role' => 'user',
                    'content' => $this->openingContextFor($campaign),
                ]],
                'token_count' => 0,
            ]);
        });
    }

    // Give the DM its persistent role (system prompt) plus an opening context
    // message built from the world seed and the full party's character sheets.
    private function seedDungeonMasterContext(GameSession $session, Campaign $campaign): void
    {
        $session->agentContexts()->create([
            'character_id' => null,
            'agent_role' => AgentRole::DUNGEON_MASTER,
            'system_prompt' => (string) (new DungeonMasterAgent)->instructions(),
            'messages' => [[
                'role' => 'user',
                'content' => $this->openingContextFor($campaign),
            ]],
            'token_count' => 0,
        ]);
    }

    private function openingContextFor(Campaign $campaign): string
    {
        $world = $campaign->world_description
            ?: 'No world description was provided. Invent a fitting realm for the party.';

        $party = $campaign->characters
            ->map(fn (Character $character): string => $this->characterSheetFor($character))
            ->implode("\n\n");

        return <<<CONTEXT
            You are about to run a new campaign. Here is everything established so far.

            THE WORLD
            {$world}

            THE PARTY
            {$party}

            When you are ready, open the adventure: set the first scene, establish where the party finds itself, and invite them to act.
            CONTEXT;
    }

    private function characterSheetFor(Character $character): string
    {
        $race = Races::from($character->race)->label();
        $class = CharacterClass::from($character->class)->label();
        $stats = collect($character->stats)
            ->map(fn (int $score, string $ability): string => strtoupper($ability)." {$score}")
            ->implode(', ');
        $backstory = $character->backstory ?: 'No backstory recorded.';

        return <<<SHEET
            {$character->name} — {$race} {$class}
            Ability scores: {$stats}
            Backstory: {$backstory}
            SHEET;
    }
}
