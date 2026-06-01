<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TurnMessage extends Model
{
    protected $fillable = [
        'game_session_id',
        'speaker',
        'content',
        'token_count',
        'turn_number',
    ];

    protected $casts = [
        'token_count' => 'integer',
        'turn_number' => 'integer',
    ];

    public function gameSession(): BelongsTo
    {
        return $this->belongsTo(GameSession::class);
    }
}
