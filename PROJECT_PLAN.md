# DnD AI Agents — Project Plan

## Context
A mob-programming workshop for junior developers at Vehikl. The project is a 1-player D&D game backed by 3 AI agents (1 DM + 2 NPC party members) that teaches how AI context windows work, how separate agent contexts diverge, how orchestration routes messages, and how "travel journal" summarisation compresses context between sessions. Lives at `/Users/nick/Code/Vehikl/dnd-ai-agents`.

---

## Decisions Locked In

| Decision | Answer |
|---|---|
| Teaching goals | Context windows filling up; separate agent contexts; orchestration patterns; prompt engineering; travel journal / lore summary context compression |
| Session format | Mob programming (rotating driver → navigator) on shared remote desktop |
| Tech stack | Laravel (PHP) + Inertia.js + React + TypeScript |
| LLM provider | Anthropic Claude (Sonnet for DM, Haiku for NPCs) |
| Turn model | DM sets scene → Human acts or passes → NPCs react → NPCs can chain react once |
| Context inspector | Token counter + message history + journal snapshots + system prompt viewer |
| Game world | Save files: load existing OR start new (player-built character, optional setting notes, randomised NPC party) |
| Dice mechanics | Lightweight d20 + proficiency modifier; build on later |
| Persistence | DB with journal summaries; loading a save demonstrates context compression |
| Deployment | Local dev, shared screen |

---

## Architecture

```
Laravel Backend
├── Eloquent Models
│   ├── GameSession      (id, status, world_description, created_at)
│   ├── Character        (id, session_id, name, race, class, stats JSON, is_player, is_agent)
│   ├── AgentContext     (id, session_id, agent_role, messages JSON, token_count, system_prompt)
│   ├── JournalEntry     (id, session_id, agent_role, summary, turn_number, created_at)
│   └── TurnMessage      (id, session_id, speaker, content, token_count, turn_number)
│
├── Services
│   ├── AnthropicClient          (wrapper around Anthropic PHP SDK)
│   ├── DmAgentService           (world narration, result adjudication, journal compression)
│   ├── NpcAgentService          (character-voiced reactions and actions)
│   ├── TurnOrchestrator         (drives the turn sequence, dispatches agent calls)
│   ├── ContextManager           (tracks token counts, triggers journal compression at threshold)
│   └── DiceService              (d20 rolls + proficiency modifier)
│
└── HTTP / Inertia
    ├── GameSessionController
    ├── CharacterController
    └── TurnController           (POST /turn → drives one full turn, streams responses)

React Frontend (Inertia)
├── Pages
│   ├── Home                     (load save / new game)
│   ├── CharacterCreation        (race, class, proficiencies, stat distribution)
│   └── Game                     (split-pane: game chat + context inspector)
│
└── Components
    ├── GameChat                 (DM narration, NPC dialogue, player input, turn controls)
    ├── TurnControls             (Act / Pass to NPC1 / Pass to NPC2)
    ├── ContextInspector         (tabbed: DM | NPC1 | NPC2)
    │   ├── TokenMeter           (live progress bar vs model limit)
    │   ├── MessageHistory       (collapsible message array)
    │   ├── JournalSnapshot      (compressed summary injected at load)
    │   └── SystemPromptViewer   (read-only display of agent's system prompt)
    └── CharacterCard            (race, class, HP, stats summary)
```

---

## Turn Flow

```
1.  DM agent called → narrates scene / result
2.  Player prompt: [Act] [Pass → NPC1] [Pass → NPC2]
    │
    ├── Player Acts:
    │     Player submits action text
    │     → DiceService.roll() if action requires check
    │     → DM agent adjudicates + narrates result
    │     → NPC1 reaction call   (system: "react briefly, ≤2 sentences, no new threads")
    │     → NPC2 chain-reaction  (system: "react to NPC1 if relevant, ≤2 sentences")
    │     → back to step 2
    │
    └── Player Passes to NPC:
          Designated NPC takes full action call
          → DM narrates result
          → Other NPC reaction call (once)
          → back to step 2
```

---

## Context Management (Teaching Centrepiece)

- Every API response → `ContextManager` updates `AgentContext.token_count` for that agent.
- **Compression threshold**: when an agent's context reaches ~70% of model limit, `ContextManager` triggers a journal compression:
  1. Sends full message history to Claude with prompt: *"Summarise these events in 3–5 sentences from [agent]'s perspective."*
  2. Saves result as a `JournalEntry`.
  3. Clears the long `messages` array; inserts the summary as a leading system message in the next call.
- **Session load**: injects the latest `JournalEntry` as context prefix — students see that loading a save = loading a compressed snapshot.
- **Inspector**: token meter visually shows the fill, and the journal snapshot tab shows the compressed output — the "before/after" is the teaching moment.

---

## Character Creation

**Player character:**
- Choose race (Human, Elf, Dwarf, Halfling, Half-Orc, Gnome, Tiefling, Dragonborn)
- Choose class (Fighter, Wizard, Rogue, Cleric, Ranger, Paladin, Bard, Druid)
- Distribute ability scores (point-buy or standard array)
- Select class proficiencies

**NPC party members (default):**
- Race + class + stats randomised on session creation
- Player can optionally customise before starting

**New game optional inputs:**
- Setting notes (e.g. "dark gothic horror", "high seas adventure") → fed to DM as world generation context

---

## Dice Mechanics (Lightweight v1)

- `DiceService::roll(int $sides = 20): int` — PHP random
- Proficiency bonus (+2 base, can grow) added to rolls where character is proficient
- DC (difficulty class) either preset per action type or set by DM agent in its narration context
- DM narrates success/failure based on roll vs DC

---

## Build Order

Human-led mob programming throughout. AI tools assist with boilerplate and lookups; humans drive all design decisions.

### Phase 1 — Project Setup ✅
1. ✅ `laravel new dnd-ai-agents --react --git --database=pgsql --pest --npm --force` — Laravel 13 + React starter kit (Inertia v3, React 19, TypeScript, Tailwind v4, Pest, Radix UI, shadcn components)
2. ✅ Inertia.js + React + TypeScript pre-configured by starter kit (no manual setup needed)
3. ⬜ Add the Anthropic PHP SDK via Composer; add `.env` key placeholder _(moved to Phase 3)_
4. ✅ Build passes (`npm run build`), types clean, ESLint clean. `@/` alias added to `vite.config.ts`; tsconfig already had paths. CLAUDE.md committed.
   - Note: DB is pgsql, `.env` pre-configured for DBngin on 127.0.0.1:5432, db name `dnd_ai_agents` — user needs to create that database in DBngin before running migrations.

### Phase 2 — Database Schema
5. ✅ Write migration for `campaigns` table (id, world_description, timestamps)
5. ✅ Write migration for `game_sessions` (id, campaign_id, synopsis, timestamps)
6. ✅ Write migration for `characters` (id, campaign_id, name, race, class, stats JSON, is_agent)
7. ✅ Write migration for `agent_contexts` (id, game_session_id, character_id, agent_role, messages JSON, token_count, system_prompt) — FK named `game_session_id` to follow Laravel convention against the `game_sessions` table.
8. ✅ Write migration for `journal_entries` (id, game_session_id, agent_role, summary, turn_number, timestamps)
9. ✅ Write migration for `turn_messages` (id, game_session_id, speaker, content, token_count, turn_number)
10. ✅ Create Eloquent models + relationships for all six tables (Campaign, GameSession, Character, AgentContext, JournalEntry, TurnMessage) with fillable + casts (`stats`/`messages` → array, `is_agent` → bool) and matching belongsTo/hasMany relations.

### Phase 3 — Anthropic Service Layer
11. Write `AnthropicClient` service — wraps the SDK, sends a message array, returns content + token counts
12. Write a quick smoke-test (Tinker or a test route) to confirm a live Claude API call works
13. Add token-count parsing to `AnthropicClient` — store input + output tokens from each response

### Phase 4 — Character Creation
14. Build `CharacterController` — store a new `Character` + `GameSession` from form data
15. Build the Home page (Inertia) — "New Game" button + optional setting notes textarea
16. Build the `CharacterCreation` page — race picker, class picker, stat point-buy form
17. Wire up form submission → controller → DB → redirect to Game page stub
18. Add NPC randomisation on session create (random race + class + stats for the 2 agent characters)

### Phase 5 — Agent Services
19. Write `DmAgentService` — builds the DM system prompt (world lore, rules, tone), calls `AnthropicClient`
20. Write `NpcAgentService` — builds the NPC system prompt from a `Character` record, calls `AnthropicClient`
21. Write system prompt templates (plain PHP strings or Blade templates) for DM and NPC roles
22. Smoke-test both services via Tinker — confirm DM narrates a scene, NPC responds in character

### Phase 6 — Turn Orchestrator
23. Write `TurnOrchestrator::playerActs(string $action)` — calls DM → NPC1 reaction → NPC2 chain-reaction
24. Write `TurnOrchestrator::playerPasses(string $npcRole)` — calls designated NPC → DM narrates → other NPC reacts
25. Write `TurnController` — POST `/turn` endpoint that delegates to `TurnOrchestrator`, returns all responses as JSON
26. Test the full turn loop end-to-end via a cURL or Postman call

### Phase 7 — Game UI (Left Pane)
27. Build the `Game` page layout — two-column shell (chat left, inspector right placeholder)
28. Build `GameChat` component — renders the message feed (DM narration, NPC dialogue, player input)
29. Build `TurnControls` component — "Act" text input + "Pass to NPC1 / NPC2" buttons
30. Wire `TurnControls` → POST `/turn` → append responses to `GameChat` feed

### Phase 8 — Context Inspector (Right Pane)
31. Build `ContextInspector` shell — tabbed panel with DM / NPC1 / NPC2 tabs
32. Build `TokenMeter` component — progress bar (tokens used / model limit)
33. Build `MessageHistory` component — collapsible list of the agent's raw message array
34. Build `SystemPromptViewer` component — read-only display of the agent's system prompt
35. Wire inspector to live data — `TurnController` response includes updated `AgentContext` snapshots

### Phase 9 — Context Manager & Journal Compression
36. Write `ContextManager::updateTokenCount(AgentContext, int $tokens)` — increments stored count
37. Write `ContextManager::shouldCompress(AgentContext): bool` — returns true at ~70% of model limit
38. Write `ContextManager::compress(AgentContext)` — calls Claude to summarise, saves `JournalEntry`, resets messages
39. Plug `ContextManager` into `TurnOrchestrator` — check + compress after each agent call
40. Build `JournalSnapshot` component — shows the latest compressed summary in the inspector tab

### Phase 10 — Save & Load
41. Add `GameSession` status transitions (active / saved / completed) + a `PUT /session/{id}/save` endpoint
42. Update the Home page to list existing saved sessions with last-played timestamp
43. Write session-resume logic — on load, inject latest `JournalEntry` as leading context message
44. Test the save → reload → play cycle; confirm token meter starts from summary, not from zero

### Phase 11 — Dice Mechanics
45. Write `DiceService::roll(int $sides = 20): int`
46. Add proficiency bonus lookup to `Character` model (based on class + level, start at +2)
47. Update `TurnOrchestrator` — detect action keywords that require a check, call `DiceService`, include roll result in DM prompt
48. Display roll result in `GameChat` feed ("🎲 You rolled a 14 + 2 proficiency = 16")

### Phase 12 — Polish
49. Build `CharacterCard` component — race, class, HP, stat block thumbnail
50. Add NPC party display to the Game page header
51. Add loading spinners / skeleton states while agent calls are in-flight
52. Error handling — failed API calls surface a friendly message in the chat feed
53. Final demo run-through: full new game → 10 turns → compression fires → save → reload → continue

---

## Verification / Demo Script

1. Start new game → create character → generate world from setting notes
2. Play 3–4 turns (watch token counters climb in inspector)
3. Trigger context compression manually (or wait for threshold) — students see the journal snapshot appear
4. Save the session → close → reload — confirm journal is the context, not full history
5. Pass action to NPC → observe NPC chain reaction → confirm reactions are constrained
6. Make a roll-required action → see dice result + DM narration adjust to success/failure
