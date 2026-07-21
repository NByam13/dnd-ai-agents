<?php

namespace App\Enums;

enum AgentRole: string
{
    case DUNGEON_MASTER = 'dm';
    case PLAYER = 'pl';
}
