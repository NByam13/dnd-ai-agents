<?php

namespace Database\Factories;

use App\Enums\CharacterClass;
use App\Enums\Races;
use App\Models\Character;
use Illuminate\Database\Eloquent\Factories\Factory;
use RPGFaker\RPGFaker;

class CharacterFactory extends Factory
{
    protected $model = Character::class;

    public function definition(): array
    {
        $class = $this->faker->randomElement(CharacterClass::cases());
        $race = $this->faker->randomElement(Races::cases());

        $faker = new RPGFaker(['race' => $race->value]);

        return [
            'name' => $faker->name,
            'race' => $race,
            'class' => $class->value,
            'stats' => $class->statBlock(),
            'is_agent' => false,
        ];
    }

    public function isAgent(): self
    {
        return $this->state(fn (array $attributes) => ['is_agent' => true]);
    }
}
