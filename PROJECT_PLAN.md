# DnD AI Agents — Project Plan

## Context
A mob-programming workshop for junior developers at Vehikl. The project is a 1-player D&D game backed by 3 AI agents (1 DM + 2 NPC party members) that teaches how AI context windows work, how separate agent contexts diverge, how orchestration routes messages, and how "travel journal" summarisation compresses context between sessions.

**Where we are (2026-06-16):** The player can create their own hero (name + race + class → stats), and submitting the hero now **spawns the two AI party members** (random class + race, class stat block, `is_agent = true`) via a `CharacterFactory` — backend + feature test done (slice 12). **Remaining in slice 12:** render the spawned party in the UI (`CharacterCard`) + a frontend test. Then slice 13 adds AI-written backstories at spawn, and slice 14 stands up the `GameSession` + agent contexts that the agents will reason from. That's the "game resources" foundation everything else builds on.

> **Open issue to resolve before/while finishing slice 12:** race storage is inconsistent — the `CharacterFactory` stores `race` as the `Races` enum object, while `CharacterController` stores the player's race as a raw string (e.g. `'Half-Orc'`, which doesn't even match a `Races` value). Race isn't validated against the `Races` enum anywhere. Pick one representation (enum-backed, validated like `class`) before this hardens.

---

## Decisions Locked In

| Decision | Answer |
|---|---|
| Teaching goals | Context windows filling up; separate agent contexts; orchestration patterns; prompt engineering; travel journal / lore summary context compression |
| Session format | Mob programming (rotating driver → navigator) on shared remote desktop |
| Tech stack | Laravel (PHP) + Inertia.js + React + TypeScript |
| LLM integration | **`laravel/ai` package (v0.7.2)** with Anthropic as the default provider — NOT a hand-rolled SDK wrapper. Agents live in `app/Ai/Agents/`. |
| Turn model | DM sets scene → Human acts or passes → NPCs react → NPCs can chain react once |
| Context inspector | Token counter + message history + journal snapshots + system prompt viewer |
| Game world | Player-built hero + randomised AI party + optional world description seed |
| Campaign vs. session | A `Campaign` can be planned with nobody at the table. A `GameSession` **cannot begin until every player has a character** — the human's hero AND both AI party members. So completing character creation ("Begin the Adventure") is the moment the first `GameSession` starts and agent contexts are seeded. |
| Player character | Player chooses race + class; stats derived from the class's fixed stat block |
| AI party members | Created automatically when the player submits their hero. **Random class, class's fixed stat block.** Each gets an AI-generated backstory at spawn. |
| Dice mechanics | Lightweight d20 + proficiency modifier; build on later |
| Persistence | DB with journal summaries; loading a save demonstrates context compression |
| Deployment | Local dev, shared screen |

---

## Architecture

```
Laravel Backend
├── Eloquent Models  (all built ✅)
│   ├── Campaign         (id, name, world_description, timestamps)
│   ├── GameSession      (id, campaign_id, synopsis, timestamps)
│   ├── Character        (id, campaign_id, name, race, class, stats JSON, is_agent[, backstory])
│   ├── AgentContext     (id, game_session_id, character_id, agent_role, messages JSON, token_count, system_prompt)
│   ├── JournalEntry     (id, game_session_id, agent_role, summary, turn_number, timestamps)
│   └── TurnMessage      (id, game_session_id, speaker, content, token_count, turn_number)
│
├── Enums
│   ├── CharacterClass   (Fighter, Barbarian, Paladin, Rogue, Wizard, Cleric, Bard, Warlock)
│   │                     → label(), statBlock(), options()
│   └── Races            (Human, Elf, Dwarf, Halfling, Half-Orc, Tiefling, Dragonborn, Gnome)
│                         — not yet wired into validation; see open issue
│
├── AI Layer  (laravel/ai — app/Ai/Agents/)
│   ├── DungeonMasterAgent   (scaffolded; world narration, result adjudication, journal compression)
│   ├── NpcAgent / PartyMemberAgent  (character-voiced reactions + actions; built from a Character)
│   └── conversation persistence via laravel/ai's agent_conversations tables
│
├── HTTP / Inertia
│   ├── CampaignController       (store, show)   ✅
│   ├── CharacterController      (store)          ✅ player; → spawns AI party next
│   └── TurnController           (POST /turn → drives one full turn)   [later]
│
└── Services (as needed, thin)
    ├── TurnOrchestrator     (drives the turn sequence, dispatches agent calls)   [later]
    ├── ContextManager       (tracks token counts, triggers journal compression)  [later]
    └── DiceService          (d20 rolls + proficiency modifier)                    [later]

React Frontend (Inertia)
├── Pages
│   ├── welcome.tsx              ✅ new campaign (name + world_description)
│   ├── campaign/show.tsx        ✅ character creation (name, race, class, live stat preview)
│   └── Game                     [later] split-pane: game chat + context inspector
│
└── Components
    ├── CharacterCard            party member display (race, class, stats, backstory)
    ├── GameChat / TurnControls  [later]
    └── ContextInspector + TokenMeter / MessageHistory / JournalSnapshot / SystemPromptViewer  [later]
```

> **Note — we are NOT building a custom `AnthropicClient`.** The old plan assumed a hand-rolled SDK wrapper plus `DmAgentService` / `NpcAgentService`. The project already standardises on `laravel/ai`: configure agents as `Laravel\Ai\Contracts\Agent` classes under `app/Ai/Agents/`, let the package handle the Anthropic call + token accounting + conversation persistence.

---

## Turn Flow (target — built in a later phase)

```
1.  DM agent called → narrates scene / result
2.  Player prompt: [Act] [Pass → NPC1] [Pass → NPC2]
    ├── Player Acts:  DiceService.roll() if needed → DM adjudicates → NPC1 reacts → NPC2 chain-reacts → back to 2
    └── Player Passes: designated NPC acts → DM narrates → other NPC reacts once → back to 2
```

---

## Context Management (Teaching Centrepiece — later phase)

- Every API response → update `AgentContext.token_count` for that agent.
- **Compression threshold:** at ~70% of model limit, summarise the message history into a `JournalEntry` ("Summarise these events in 3–5 sentences from [agent]'s perspective."), clear the long `messages` array, inject the summary as a leading system message next call.
- **Session load:** inject latest `JournalEntry` as context prefix — loading a save = loading a compressed snapshot.
- **Inspector:** token meter shows the fill; journal tab shows the compressed output — the before/after is the teaching moment.

---

## Character Creation

**Player hero (built ✅):**
- Choose race (Human, Elf, Dwarf, Halfling, Half-Orc, Tiefling, Dragonborn, Gnome)
- Choose class (8 `CharacterClass` cases) → stats come from the class's fixed `statBlock()`
- Live stat-block preview; "Begin the Adventure" submits

**AI party members (next):**
- Two of them, `is_agent = true`, created automatically when the player submits.
- **Random class**, using that class's fixed `statBlock()`. Random race.
- Each gets an AI-generated backstory at spawn, derived from race/class/stats.

**New game inputs (built ✅):** optional `world_description` seed on the welcome page → later fed to the DM as world-generation context.

---

## Dice Mechanics (Lightweight v1 — later phase)
- `DiceService::roll(int $sides = 20): int`
- Proficiency bonus (+2 base) on proficient rolls; DC preset or set by DM; DM narrates success/failure.

---

## Build Order

Human-led mob programming throughout. **Every feature ships as a vertical slice: failing tests first → an action (controller / agent) → the UI piece that feeds it.** Test-first is the default.

### Phase 1 — Project Setup ✅
1. ✅ Laravel 13 + React starter kit (Inertia v3, React 19, TS, Tailwind v4, Pest, shadcn).
2. ✅ Inertia + React + TS pre-configured.
3. ✅ `laravel/ai` installed, Anthropic set as default provider in `config/ai.php` (`ANTHROPIC_API_KEY` in `.env`).
4. ✅ Build/lint/types clean. DB is pgsql (DBngin, db `dnd_ai_agents`).

### Phase 2 — Database Schema & Models ✅
5. ✅ Migrations for `campaigns`, `game_sessions`, `characters`, `agent_contexts`, `journal_entries`, `turn_messages` (+ `laravel/ai` conversation tables).
6. ✅ Eloquent models + relationships + casts (`stats`/`messages` → array, `is_agent` → bool) for all six tables.

### Phase 3 — Player Character Creation ✅
7. ✅ Welcome page → `CampaignController@store` (name + optional world_description) → redirect to campaign.
8. ✅ `campaign/show.tsx` character-creation page: name input, race picker, class cards, live stat preview, disabled-until-complete submit.
9. ✅ `CharacterController@store` + `CreateCharacterRequest`: validates name/race/class, derives stats from `CharacterClass::statBlock()`, creates the player Character (`is_agent = false`).
10. ✅ Tests: `CharacterControllerTest` (validation, per-class stats, no client stat override) + `campaign/show.spec.tsx` (form target, class options, stat preview, payload, button state).

---

### Phase 4 — AI Party & Game Resources  ⟵ **CURRENT FOCUS**
> Goal (per the user): get the hero created **and** stand up the game resources — the AI party plus the `GameSession`/agent contexts — so the agents have something to reason from.
> Each numbered item below is one vertical slice. **Slices 12 and 13 together deliver "AI party spawned with backstories"; they're split only to keep the mechanical spawn separate from the AI call so each step is inspectable.**

11. **AI integration proof.** Flesh out one agent class (`DungeonMasterAgent` or a new `NpcAgent`) under `app/Ai/Agents/` enough to send a prompt and return text via `laravel/ai`.
    - *Tests:* a feature test that **fakes** the `laravel/ai` gateway and asserts we get a response back through our code path.
    - *Smoke:* one Tinker / temporary-route call against the live Anthropic API to confirm credentials + wiring.
    - *UI:* none (foundation slice) — keep it minimal.

12. **Spawn the AI party on hero submit.** ⟳ *backend done, UI remaining.* When `CharacterController@store` saves the player, also create **two** `Character` records with `is_agent = true`, a **random `CharacterClass`** (using its fixed `statBlock()`) and a random race.
    - ✅ *Action:* `CharacterController::createAccompanyingCharacters()` spawns the pair via `Character::factory(2)->for($campaign)->isAgent()->create()`. The `CharacterFactory` randomises class + race and uses `andreasindal/rpgfaker` (new dependency) for names; new `Races` enum added; `HasFactory` added to `Character`.
    - ✅ *Tests:* `it_will_create_two_additional_ai_agents_for_the_campaign` asserts 3 characters total with exactly 2 `is_agent = true`. *(Diverged from plan: test asserts counts only — does not yet assert valid classes/stats per agent, nor explicitly that the player stays `is_agent = false`.)*
    - ⬜ *UI:* render the party (`CharacterCard`) on `campaign/show` after creation (or on the post-create screen); frontend test for the party display. **← next step.**
    - ⚠️ *Cleanup carried forward:* race representation inconsistency (factory enum object vs. controller raw string; race unvalidated) — see the open issue note at the top. The test file also has a `// TODO: clean up the tests` (copy-pasted payloads).

13. **Generate agent backstories at spawn.** Add a `backstory` (text, nullable) column to `characters` via `php artisan make:migration`. During the spawn flow (slice 12), call an NPC/backstory agent to write a short backstory from race/class/stats and persist it.
    - *Tests:* feature test **fakes** the AI gateway, asserts a backstory is saved for each agent character.
    - *UI:* show the backstory on each `CharacterCard`.

14. **Begin the first `GameSession` + seed agent contexts.** Character creation *completing* is what starts the session: once the player's hero and both AI party members exist (slices 12–13), the "Begin the Adventure" action ends by creating a `GameSession` for the campaign and seeding `AgentContext` rows for the DM + two NPC agents, each with a `system_prompt` built from its character (race/class/stats/backstory) and the campaign's `world_description`. Per the invariant, the session can't be created before the full party exists — this slice depends on 12.
    - *Action:* `GameSession` creation + `AgentContext` seeding, as the tail of the character-creation submit (in `CharacterController@store` or a dedicated `GameSessionController@store` it delegates to).
    - *Tests:* feature test asserts that submitting the hero produces a `GameSession` and three `AgentContext` rows with the right `agent_role` + non-empty `system_prompt`; redirect now targets the game session.
    - *UI:* redirect lands on a Game page stub showing the seeded party + DM.

---

### Phase 5 — DM & NPC Agent Behaviour
15. Build out `DungeonMasterAgent` — system prompt (world lore, rules, tone), narrates a scene.
16. Build `NpcAgent` / `PartyMemberAgent` — system prompt assembled from a `Character` (incl. backstory), responds in character.
17. System-prompt templates (PHP strings / Blade) for DM and NPC roles.
18. Smoke-test both via Tinker; feature tests with the AI gateway faked.

### Phase 6 — Turn Orchestrator + Turn Endpoint
19. `TurnOrchestrator::playerActs(string $action)` — DM → NPC1 reaction → NPC2 chain-reaction.
20. `TurnOrchestrator::playerPasses(string $npcRole)` — NPC acts → DM narrates → other NPC reacts once.
21. `TurnController` — `POST /turn`, delegates to the orchestrator, persists `TurnMessage`s, returns responses.
22. End-to-end test of the full turn loop (AI faked).

### Phase 7 — Game UI (Left Pane)
23. `Game` page layout — two-column shell (chat left, inspector placeholder right).
24. `GameChat` — message feed (DM narration, NPC dialogue, player input).
25. `TurnControls` — "Act" input + "Pass to NPC1 / NPC2" buttons; wire → `POST /turn` → append to feed.

### Phase 8 — Context Inspector (Right Pane)
26. `ContextInspector` shell — tabbed DM / NPC1 / NPC2.
27. `TokenMeter` — progress bar (tokens used / model limit).
28. `MessageHistory` — collapsible raw message array.
29. `SystemPromptViewer` — read-only system prompt.
30. Wire inspector to live data — turn responses include updated `AgentContext` snapshots.

### Phase 9 — Context Manager & Journal Compression
31. `ContextManager::updateTokenCount()` / `shouldCompress()` (~70% threshold) / `compress()` (summarise → `JournalEntry` → reset messages).
32. Plug into `TurnOrchestrator` — check + compress after each agent call.
33. `JournalSnapshot` component — latest compressed summary in the inspector.

### Phase 10 — Save & Load
34. `GameSession` status transitions (active / saved / completed) + `PUT /session/{id}/save`.
35. Home/welcome lists saved sessions with last-played timestamp.
36. Session-resume — inject latest `JournalEntry` as leading context; verify token meter starts from the summary, not zero.

### Phase 11 — Dice Mechanics
37. `DiceService::roll()`; proficiency bonus on `Character` (+2 base).
38. Orchestrator detects check-requiring actions, rolls, includes result in DM prompt; show roll in `GameChat`.

### Phase 12 — Polish & Demo
39. NPC party display in the Game header; loading/skeleton states during agent calls; friendly error surfacing on failed calls.
40. Final demo run-through: new game → create hero → AI party spawns with backstories → play turns → compression fires → save → reload → continue.

---

## Verification / Demo Script
1. New game → create hero → AI party spawns (random classes, backstories) → game session + contexts seeded.
2. Play 3–4 turns (watch token counters climb in the inspector).
3. Trigger context compression — journal snapshot appears.
4. Save → close → reload — confirm the journal is the context, not full history.
5. Pass an action to an NPC → observe the constrained chain reaction.
6. Roll-required action → dice result + DM narration adjusts to success/failure.
