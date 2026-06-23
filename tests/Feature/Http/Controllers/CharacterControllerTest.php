<?php

namespace Tests\Http\Controllers;

use App\Ai\Agents\BackstoryAgent;
use App\Models\Campaign;
use App\Models\Character;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class CharacterControllerTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Every character.store spawns two AI party members and asks the
        // backstory agent to write each one. Fake the AI gateway so the suite
        // never makes a live Anthropic call.
        BackstoryAgent::fake(fn () => 'A fake backstory.');
    }

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
    public function stores_the_player_supplied_backstory(): void
    {
        $campaign = $this->campaign();

        $this->post(route('character.store', ['campaign' => $campaign]), [
            'name' => 'Grog',
            'race' => 'half_orc',
            'class' => 'barbarian',
            'backstory' => 'Raised by wolves in the Stonefang foothills.',
        ]);

        $this->assertDatabaseHas('characters', [
            'campaign_id' => $campaign->id,
            'name' => 'Grog',
            'backstory' => 'Raised by wolves in the Stonefang foothills.',
            'is_agent' => false,
        ]);
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

    #[Test]
    public function it_generates_and_stores_a_backstory_for_each_ai_agent(): void
    {
        BackstoryAgent::fake(fn () => 'Forged in the embereld wastes.');

        $campaign = $this->campaign();

        $this->post(route('character.store', ['campaign' => $campaign]), [
            'name' => 'Grog',
            'race' => 'half_orc',
            'class' => 'barbarian',
        ]);

        $agents = Character::query()->where('is_agent', true)->get();

        $this->assertCount(2, $agents);
        $agents->each(
            fn (Character $agent) => $this->assertSame('Forged in the embereld wastes.', $agent->backstory),
        );

        // The backstory prompt is built from each agent's character sheet.
        BackstoryAgent::assertPrompted(fn ($prompt) => str_contains($prompt->prompt, 'Ability scores:'));

        // The human hero keeps whatever backstory they supplied (none here) —
        // the AI only writes for the party members.
        $this->assertNull(Character::query()->where('is_agent', false)->first()->backstory);
    }
}
