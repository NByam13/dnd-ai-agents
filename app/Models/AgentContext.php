<?php

namespace App\Models;

use App\Enums\AgentRole;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentContext extends Model
{
    protected $fillable = [
        'game_session_id',
        'character_id',
        'agent_role',
        'messages',
        'token_count',
        'system_prompt',
    ];

    protected $casts = [
        'messages' => 'array',
        'token_count' => 'integer',
        'agent_role' => AgentRole::class,
    ];

    public function gameSession(): BelongsTo
    {
        return $this->belongsTo(GameSession::class);
    }

    public function character(): BelongsTo
    {
        return $this->belongsTo(Character::class);
    }
}
