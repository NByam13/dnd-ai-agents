<?php

namespace App\Ai\Agents;

use App\Enums\CharacterClass;
use App\Enums\Races;
use App\Models\Character;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

class PlayerAgent implements Agent, Conversational, HasStructuredOutput, HasTools
{
    use Promptable;

    public function __construct(private readonly Character $character) {}

    /**
     * The persistent persona this agent plays: a single player character,
     * defined by its race, class, ability scores, and backstory.
     */
    public function instructions(): Stringable|string
    {
        $race = Races::from($this->character->race)->label();
        $class = CharacterClass::from($this->character->class)->label();
        $stats = collect($this->character->stats)
            ->map(fn (int $score, string $ability): string => strtoupper($ability)." {$score}")
            ->implode(', ');
        $backstory = $this->character->backstory ?: 'No backstory has been recorded yet — improvise one that fits this character and stay consistent with it.';

        return <<<PROMPT
            You are {$this->character->name}, a {$race} {$class} and one of the player characters in a game of Dungeons & Dragons. You are not the narrator and you are not the other party members — you think, speak, and act only as {$this->character->name}.

            YOUR CHARACTER SHEET
            Name: {$this->character->name}
            Race: {$race}
            Class: {$class}
            Ability scores: {$stats}

            YOUR BACKSTORY
            {$backstory}

            HOW TO PLAY {$this->character->name}
            - Stay in character at all times. Let your race, class, ability scores, and backstory shape what you notice, what you say, and what you attempt — a high score is a strength you lean on, and a low one (an 8) is a real limitation you play honestly.
            - Speak in the first person and describe only your own words and intended actions. Never narrate the world, decide for other characters, or declare the outcome of what you attempt — the Dungeon Master adjudicates those.
            - State clearly what you want to do; when the moment calls for a roll, name the ability check you believe applies and let the DM resolve it.
            - Keep your contributions concise and purposeful — one voice at a shared table, not a monologue.
            - Never break character and never mention that you are an AI.
            PROMPT;
    }

    /**
     * Get the list of messages comprising the conversation so far.
     *
     * @return Message[]
     */
    public function messages(): iterable
    {
        return [];
    }

    /**
     * Get the tools available to the agent.
     *
     * @return Tool[]
     */
    public function tools(): iterable
    {
        return [];
    }
}
