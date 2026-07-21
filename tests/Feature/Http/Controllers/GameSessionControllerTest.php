<?php

namespace Tests\Http\Controllers;

use App\Ai\Agents\DungeonMasterAgent;
use App\Enums\CharacterClass;
use App\Enums\Races;
use App\Models\Campaign;
use App\Models\Character;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class GameSessionControllerTest extends TestCase
{
    #[Test]
    public function new_game_session_can_be_created()
    {
        $campaign = Campaign::factory()->create();

        $response = $this->post(route('game_session.store', $campaign))
            ->assertRedirect();

        $newGameSession = $campaign->gameSessions()->first();

        $response->assertRedirect(route('game_session.show', ['session' => $newGameSession]));
    }

    #[Test]
    public function show_renders_the_session_overview_with_its_campaign_and_party()
    {
        $campaign = Campaign::factory()->create();
        Character::factory(3)->for($campaign)->create();
        $session = $campaign->gameSessions()->create();

        $this->get(route('game_session.show', ['session' => $session]))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('game-session/show')
                ->where('session.id', $session->id)
                ->where('session.campaign.name', $campaign->name)
                ->where('session.campaign.world_description', $campaign->world_description)
                ->has('session.campaign.characters', 3)
            );
    }

    #[Test]
    public function creating_a_session_seeds_a_dungeon_master_context()
    {
        $campaign = Campaign::factory()->create([
            'world_description' => 'A frozen frontier ruled by warring clans.',
        ]);
        Character::factory()->for($campaign)->create([
            'name' => 'Grog',
            'race' => Races::HALF_ORC->value,
            'class' => CharacterClass::Barbarian->value,
            'backstory' => 'Raised by wolves in the northern wastes.',
        ]);

        $this->post(route('game_session.store', $campaign));

        $dungeonMaster = $campaign->gameSessions()->sole()->agentContexts()->sole();

        $this->assertSame('dm', $dungeonMaster->agent_role);
        $this->assertNull($dungeonMaster->character_id);
        $this->assertSame(
            (string) (new DungeonMasterAgent)->instructions(),
            $dungeonMaster->system_prompt,
        );

        $openingContext = collect($dungeonMaster->messages)->pluck('content')->implode("\n");
        $this->assertStringContainsString('frozen frontier', $openingContext);
        $this->assertStringContainsString('Grog', $openingContext);
        $this->assertStringContainsString('Half-Orc', $openingContext);
        $this->assertStringContainsString('Barbarian', $openingContext);
        $this->assertStringContainsString('Raised by wolves', $openingContext);
    }
}
