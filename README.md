# DnD AI Agents

A 1-player D&D game backed by three AI agents — one Dungeon Master and two NPC party members — built as a mob-programming workshop for junior developers at Vehikl.

The game is a vehicle for teaching how LLMs actually work: context windows filling up, separate agent contexts diverging, orchestration routing messages between agents, and "travel journal" summarisation compressing context between sessions.

---

## What You'll Learn

- **Context windows** — a live token meter shows each agent's context filling up as the game progresses
- **Separate agent contexts** — the DM and each NPC maintain independent message histories and diverge naturally
- **Orchestration** — a turn orchestrator routes actions between agents in a defined sequence
- **Prompt engineering** — system prompts shape each agent's voice, role, and constraints
- **Context compression** — when an agent's context hits ~70% of its limit, the session history is summarised into a "travel journal" entry; loading a save injects that snapshot instead of the full history

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel (PHP) |
| Frontend | Inertia.js + React + TypeScript |
| Styling | Tailwind CSS v4 |
| LLM | Anthropic Claude (Sonnet for DM, Haiku for NPCs) |
| Database | PostgreSQL |
| Testing | Pest |

---

## Architecture Overview

```
Laravel Backend
├── Models: GameSession, Character, AgentContext, JournalEntry, TurnMessage
├── Services
│   ├── AnthropicClient       — wraps the Anthropic PHP SDK
│   ├── DmAgentService        — DM narration, scene-setting, result adjudication
│   ├── NpcAgentService       — character-voiced NPC reactions and actions
│   ├── TurnOrchestrator      — drives the turn sequence, dispatches agent calls
│   ├── ContextManager        — tracks token counts, triggers journal compression
│   └── DiceService           — d20 rolls + proficiency modifier
└── HTTP: GameSessionController, CharacterController, TurnController

React Frontend (Inertia)
├── Pages: Home, CharacterCreation, Game
└── Components
    ├── GameChat              — message feed (DM narration, NPC dialogue, player input)
    ├── TurnControls          — Act / Pass to NPC1 / Pass to NPC2
    ├── ContextInspector      — tabbed panel: DM | NPC1 | NPC2
    │   ├── TokenMeter        — live progress bar vs model limit
    │   ├── MessageHistory    — collapsible raw message array
    │   ├── JournalSnapshot   — compressed summary injected at load
    │   └── SystemPromptViewer
    └── CharacterCard         — race, class, HP, stat block
```

---

## Turn Flow

```
1. DM narrates the scene
2. Player chooses: [Act] [Pass → NPC1] [Pass → NPC2]

   Player Acts:
     → Player submits action text
     → DiceService rolls if a check is required
     → DM adjudicates + narrates result
     → NPC1 reacts (≤2 sentences)
     → NPC2 chain-reacts to NPC1 (≤2 sentences)
     → back to step 2

   Player Passes to NPC:
     → Designated NPC takes a full action
     → DM narrates result
     → Other NPC reacts once
     → back to step 2
```

---

## Getting Started

### Prerequisites

- PHP 8.5+
- Composer
- Node.js 24+
- PostgreSQL

### Setup

```bash
git clone <repo-url>
cd dnd-ai-agents

composer install
npm ci

cp .env.example .env
php artisan key:generate
```

Create a PostgreSQL database named `dnd_ai_agents`, then update `DB_*` variables in `.env`.

Add your Anthropic API key to `.env`:

```env
ANTHROPIC_API_KEY=sk-ant-...
```

```bash
php artisan migrate
npm run build
php artisan serve
```

### Alternative Setup

```bash
sail up -d
sail artisan migrate
npm run dev
```

### Running Tests

```bash
php artisan test
# or
./vendor/bin/pest
```

---

## Project Plan

See [`PROJECT_PLAN.md`](PROJECT_PLAN.md) for the full build order, architecture decisions, and teaching goals.
