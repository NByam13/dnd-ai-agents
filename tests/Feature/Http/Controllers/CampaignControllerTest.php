<?php

namespace Tests\Http\Controllers;

use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class CampaignControllerTest extends TestCase
{
    #[Test]
    public function will_create_a_new_campaign(): void
    {
        $payload = ['name' => 'Test Campaign', 'world_description' => 'Test Scenario'];

        $response = $this->post(route('campaign.store'), $payload);

        $this->assertDatabaseHas('campaigns', $payload);

        $response->assertRedirect(route('campaign.show', ['campaign' => 1]));
    }
}
