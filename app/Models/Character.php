<?php

namespace App\Models;

use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Character extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'name',
        'race',
        'class',
        'stats',
        'is_agent',
        'backstory',
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

    #[Scope]
    protected function isAgent(Builder $builder, bool $isAgent = true): void
    {
        $builder->where('is_agent', $isAgent);
    }
}
