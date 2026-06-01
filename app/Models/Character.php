<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Character extends Model
{
    protected $fillable = [
        'campaign_id',
        'name',
        'race',
        'class',
        'stats',
        'is_agent',
    ];

    protected $casts = [
        'stats' => 'array',
        'is_agent' => 'boolean',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function agentContexts(): HasMany
    {
        return $this->hasMany(AgentContext::class);
    }
}
