<?php

namespace Tests\Http\Controllers;

use App\Models\Campaign;
use App\Models\Character;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class CharacterControllerTest extends TestCase
{

    // TODO: Come back here to clean up the tests.
    private function campaign(): Campaign
    {
        return Campaign::create([
            'name' => 'Test Campaign',
            'world_description' => 'A test world',
        ]);
    }

    #[Test]
    public function will_create_a_new_character_for_the_campaign(): void
    {
        $campaign = $this->campaign();

        $response = $this->post(route('character.store', ['campaign' => $campaign]), [
            'name' => 'Grog',
            'race' => 'half_orc',
            'class' => 'barbarian',
        ]);

        $this->assertDatabaseHas('characters', [
            'campaign_id' => $campaign->id,
            'name' => 'Grog',
            'race' => 'half_orc',
            'class' => 'barbarian',
            'is_agent' => false,
        ]);

        $response->assertRedirect(route('campaign.show', ['campaign' => $campaign]));
    }

    #[Test]
    public function fills_the_stats_with_the_class_default_stat_block(): void
    {
        $campaign = $this->campaign();

        $this->post(route('character.store', ['campaign' => $campaign]), [
            'name' => 'Grog',
            'race' => 'half_orc',
            'class' => 'barbarian',
        ]);

        // Barbarian: high STR, low INT.
        $this->assertSame([
            'str' => 15,
            'dex' => 13,
            'con' => 14,
            'int' => 8,
            'wis' => 12,
            'cha' => 10,
        ], Character::query()->first()->stats);
    }

    #[Test]
    public function derives_a_distinct_stat_block_per_class(): void
    {
        $campaign = $this->campaign();

        $this->post(route('character.store', ['campaign' => $campaign]), [
            'name' => 'Merlin',
            'race' => 'elf',
            'class' => 'wizard',
        ]);

        $wizard = Character::query()->first();

        // Wizard: high INT, low STR — the mirror image of the barbarian.
        $this->assertSame(15, $wizard->stats['int']);
        $this->assertSame(8, $wizard->stats['str']);
    }

    #[Test]
    public function the_client_cannot_override_the_stat_block(): void
    {
        $campaign = $this->campaign();

        $this->post(route('character.store', ['campaign' => $campaign]), [
            'name' => 'Cheater',
            'race' => 'human',
            'class' => 'wizard',
            'stats' => ['str' => 20, 'dex' => 20, 'con' => 20, 'int' => 20, 'wis' => 20, 'cha' => 20],
        ]);

        $character = Character::query()->first();

        $this->assertSame(8, $character->stats['str']);
    }

    #[Test]
    public function rejects_an_unknown_class(): void
    {
        $campaign = $this->campaign();

        $response = $this->post(route('character.store', ['campaign' => $campaign]), [
            'name' => 'Nobody',
            'race' => 'human',
            'class' => 'kobold-wrangler',
        ]);

        $response->assertSessionHasErrors('class');
        $this->assertDatabaseCount('characters', 0);
    }

    #[Test]
    public function rejects_an_unknown_race(): void
    {
        $campaign = $this->campaign();

        $response = $this->post(route('character.store', ['campaign' => $campaign]), [
            'name' => 'Nobody',
            'race' => 'kobold',
            'class' => 'wizard',
        ]);

        $response->assertSessionHasErrors('race');
        $this->assertDatabaseCount('characters', 0);
    }

    #[Test]
    public function requires_a_name_race_and_class(): void
    {
        $campaign = $this->campaign();

        $response = $this->post(route('character.store', ['campaign' => $campaign]), []);

        $response->assertSessionHasErrors(['name', 'race', 'class']);
        $this->assertDatabaseCount('characters', 0);
    }

    #[Test]
    public function it_will_create_two_additional_ai_agents_for_the_campaign(): void
    {
        $campaign = $this->campaign();

        $this->post(route('character.store', ['campaign' => $campaign]), [
            'name' => 'Cheater',
            'race' => 'human',
            'class' => 'wizard',
            'stats' => ['str' => 20, 'dex' => 20, 'con' => 20, 'int' => 20, 'wis' => 20, 'cha' => 20],
        ]);

        $this->assertDatabaseCount('characters', 3);
        $this->assertTrue(Character::query()->where('is_agent', true)->count() === 2);
    }
}
