<?php

namespace App\Ai\Agents;

use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider('anthropic')]
#[Model('claude-sonnet-4-6')]
class BackstoryAgent implements Agent
{
    use Promptable;

    /**
     * The system prompt that shapes every backstory this agent writes.
     */
    public function instructions(): Stringable|string
    {
        return <<<'PROMPT'
            You are a Dungeon Master writing short origin stories for Dungeons & Dragons party members.
            Given a character's name, race, class, and ability scores, write a vivid backstory of a couple paragraphs from the third person.
            Let the ability scores colour the personality — a high score
            is a defining strength, an 8 is a flaw worth naming. Respond with the backstory prose only:
            no preamble, no headings, no quotation marks.
            PROMPT;
    }
}
