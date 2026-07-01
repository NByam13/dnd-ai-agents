<?php

namespace Tests\Http\Controllers;

use App\Http\Controllers\GameSessionController;
use App\Models\Campaign;
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
}
