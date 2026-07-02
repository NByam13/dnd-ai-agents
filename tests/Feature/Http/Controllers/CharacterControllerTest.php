<?php

namespace Tests\Feature\Http\Controllers;

use App\Ai\Agents\BackstoryAgent;
use App\Enums\CharacterClass;
use App\Models\Campaign;
use App\Models\Character;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class CharacterControllerTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        BackstoryAgent::fake(fn () => 'A fake backstory.');
    }

    #[Test]
    public function will_create_a_new_character_for_the_campaign(): void
    {
        $campaign = Campaign::factory()->create();
        $character = Character::factory()->make();

        $response = $this->post(route('character.store', ['campaign' => $campaign]),
            $character->only(['name', 'race', 'class']),
        );

        $this->assertDatabaseHas('characters', [
            'campaign_id' => $campaign->id,
            'name' => $character->name,
            'race' => $character->race,
            'class' => $character->class,
            'is_agent' => false,
        ]);

        $response->assertRedirect(route('character.index', ['campaign' => $campaign]));
    }

    #[Test]
    public function stores_the_player_supplied_backstory(): void
    {
        $campaign = Campaign::factory()->create();
        $character = Character::factory()->make();

        $this->post(route('character.store', ['campaign' => $campaign]),
            $character->only(['name', 'race', 'class', 'backstory']),
        );

        $this->assertDatabaseHas('characters', [
            'campaign_id' => $campaign->id,
            'name' => $character->name,
            'backstory' => $character->backstory,
            'is_agent' => false,
        ]);
    }

    #[Test]
    public function fills_the_stats_with_the_class_default_stat_block(): void
    {
        $campaign = Campaign::factory()->create();
        $character = Character::factory()->make();

        $this->post(route('character.store', ['campaign' => $campaign]),
            $character->only(['name', 'race', 'class'])
        );

        $this->assertSame(
            CharacterClass::from($character->class)->statBlock(),
            Character::query()->first()->stats
        );
    }

    #[Test]
    public function derives_a_distinct_stat_block_per_class(): void
    {
        $campaign = Campaign::factory()->create();
        $character = Character::factory()->make([
            'class' => CharacterClass::Wizard->value,
        ]);

        $this->post(
            route('character.store', ['campaign' => $campaign]),
            $character->only(['name', 'race', 'class'])
        )->assertRedirect();

        $wizard = Character::query()->first();

        $stats = CharacterClass::Wizard->statBlock();
        $this->assertSame($stats['int'], $wizard->stats['int']);
        $this->assertSame($stats['str'], $wizard->stats['str']);
    }

    #[Test]
    public function the_client_cannot_override_the_stat_block(): void
    {
        $campaign = Campaign::factory()->create();
        $character = Character::factory()->wizard()->make([
            'stats' => ['str' => 20, 'dex' => 20, 'con' => 20, 'int' => 20, 'wis' => 20, 'cha' => 20],
        ]);

        $this->post(
            route('character.store', ['campaign' => $campaign]),
            $character->only(['name', 'race', 'class', 'stats'])
        )->assertRedirect();

        $character = Character::query()->first();

        $this->assertSame(8, $character->stats['str']);
    }

    #[Test]
    public function rejects_an_unknown_class(): void
    {
        $campaign = Campaign::factory()->create();

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
        $campaign = Campaign::factory()->create();

        $response = $this->post(route('character.store', ['campaign' => $campaign]), [
            'name' => 'Nobody',
            'race' => 'kobold',
            'class' => CharacterClass::Wizard->value,
        ]);

        $response->assertSessionHasErrors('race');
        $this->assertDatabaseCount('characters', 0);
    }

    #[Test]
    public function requires_a_name_race_and_class(): void
    {
        $campaign = Campaign::factory()->create();

        $response = $this->post(
            route('character.store', ['campaign' => $campaign]),
            []
        );

        $response->assertSessionHasErrors(['name', 'race', 'class']);
        $this->assertDatabaseCount('characters', 0);
    }

    #[Test]
    public function it_will_create_two_additional_ai_agents_for_the_campaign(): void
    {
        $campaign = Campaign::factory()->create();
        $character = Character::factory()->make();

        $this->post(route('character.store', ['campaign' => $campaign]),
            $character->only(['name', 'race', 'class']),
        );

        $this->assertDatabaseCount('characters', 3);
        $this->assertTrue(Character::query()->isAgent()->count() === 2);
    }

    #[Test]
    public function it_generates_and_stores_a_backstory_for_each_ai_agent(): void
    {
        $agentsBackStory = 'Forged in the embereld wastes.';
        BackstoryAgent::fake(fn () => $agentsBackStory);
        $character = Character::factory()->make();

        $campaign = Campaign::factory()->create();

        $this->post(route('character.store', ['campaign' => $campaign]),
            $character->only(['name', 'race', 'class']),
        );

        $agents = $campaign->characters()->isAgent()->get();
        $hero = $campaign->characters()->isAgent(false)->first();

        $this->assertCount(2, $agents);
        $agents->each(
            fn (Character $agent) => $this->assertSame($agentsBackStory, $agent->backstory),
        );
        $this->assertNull($hero->backstory);
        BackstoryAgent::assertPrompted(fn ($prompt) => str_contains($prompt->prompt, 'Ability scores:'));
    }
}
