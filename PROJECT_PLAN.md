# DnD AI Agents — Project Plan

## Context
A mob-programming workshop for junior developers at Vehikl. The project is a 1-player D&D game backed by 3 AI agents (1 DM + 2 NPC party members) that teaches how AI context windows work, how separate agent contexts diverge, how orchestration routes messages, and how "travel journal" summarisation compresses context between sessions.

**Where we are (2026-07-21):** The player creates their hero, the AI party spawns with backstories, and `character/index` renders the full party via `CharacterCard` **and now carries the "Begin the Adventure" button** that POSTs to `game_session.store`. Creating a session **seeds the DM's `AgentContext`** (persistent system prompt + an opening-context message built from the world seed and the whole party's character sheets) and lands on `game_session.show`, which is now a **chat-room placeholder** (message feed + disabled turn input + a reserved "AI Context Window" rail). **Next:** seed the **2 NPC** `AgentContext` rows, then generate the DM's **opening narration** (the first live AI call), then wire the turn loop. That's the remaining heart of slice 14.

> **Race representation — RESOLVED (2026-06-23):** `race` is now enum-backed end to end. `CreateCharacterRequest` validates it with `Rule::enum(Races::class)`, the controller reads it as a `Races` enum, the factory stores `$race->value`, and the frontend race picker is fed from `Races::options()` shared globally via `HandleInertiaRequests` — single source of truth, backend ↔ frontend parity.

---

## Session Log — 2026-07-21

Accomplished this session:

1. **`GameSessionController::show()` + page built.** Fixed the broken binding (was `Campaign $campaign` on a `/session/{session}` route → now `GameSession $session`), renders `game-session/show` with the campaign + party. Backend feature test asserts the Inertia component + props (uses `withoutVite()`).
2. **`withoutVite()` moved into the base `TestCase::setUp()`** — the first page-rendering feature test needed it; now global so future page tests don't depend on a Vite build.
3. **DM context seeding (mechanical, no live call).** `game_session.store` now creates the session **and** seeds a DM `AgentContext`: `agent_role='dm'`, `character_id=null`, `system_prompt` = `DungeonMasterAgent::instructions()` (fleshed out into a real persistent DM role), `messages` = one opening-context message assembled from the world seed + every character's sheet/stats/backstory. New migration makes `agent_contexts.character_id` **nullable** (the DM has no `Character`).
4. **"Begin the Adventure" wired on `character/index`.** An Inertia `<Form>` POSTs to `game_session.store`; removed the button from `show`. Session-creation trigger decided: a button on the party-review page (not chained onto hero submit).
5. **`game_session.show` reshaped into a chat-room placeholder.** Session header + party roster, a message feed with a placeholder DM turn, a disabled turn input + Send, and a reserved "AI Context Window" rail (further slice).

**Open / diverged:**
- **NPC contexts not seeded yet** — only the DM. The 2 NPC `AgentContext` rows are the next step (needs a `PartyMemberAgent` built from a `Character`).
- **No live AI call yet** — DM seeding is purely mechanical (deliberate split, per the 12/13 rhythm). The DM's opening narration is its own next step; the chat feed is a placeholder until then.
- `openingContextFor()` is **DM-framed** ("open the adventure…") — reusing it verbatim for NPCs would be wrong; the shared *facts* need splitting from the role-specific framing (see Follow-ups).
- `agent_role` is a **raw string** (`'dm'`) — candidate for an `AgentRole` enum once NPCs land (see Follow-ups).
- Context/sheet assembly is **inline in the controller** and duplicates `CharacterController::backstoryPromptFor()` (see Follow-ups).
- Minor: the game-session test's namespace is still `Tests\Http\Controllers` (lives under `tests/Feature/Http/Controllers/`).

## Session Log — 2026-07-01

Accomplished this session:

1. **Slice 12 UI delivered.** `character/index` page + reusable `CharacterCard` (race/class/stats/backstory), shared `game.ts` types, `character.index` route; `CharacterController::store` redirects to the review page. Frontend formats raw enum values (`half_orc` → `Half-Orc`). Spec added.
2. **Backstory display fixed** — `whitespace-pre-line` + capped height with scroll on the card.
3. **Removed throwaway `campaign/view.tsx`** (superseded by `character/index`).
4. **Slice 14 started.** `GameSessionController::store` + routes (`game_session.store`, `game_session.show`) + `CampaignFactory`/`HasFactory` + feature test asserting session creation and redirect.

**Open / diverged:**
- `game_session.show` route references a `GameSessionController::show()` that **doesn't exist yet** — following the store redirect will error. **← next step.**
- Session creation is a **standalone POST endpoint**, not the tail of hero submission (store still lands on `character.index`), and seeds **no `AgentContext` rows / system prompts / synopsis** — the core of slice 14 remains.
- Minor: the game-session test's namespace is `Tests\Http\Controllers` but it lives under `tests/Feature/Http/Controllers/`.

## Session Log — 2026-06-23

Accomplished this session:

1. **Race standardised on the `Races` enum.** Added `Races::label()` + `Races::options()`; `CreateCharacterRequest` validates `race` with `Rule::enum`; controller reads `race`/`class` as enums (`$request->enum(...)`) and stores backing values; `CharacterFactory` stores `$race->value`. New `rejects_an_unknown_race` test; existing tests moved to enum values.
2. **Race options shared backend → frontend.** `HandleInertiaRequests::share()` now exposes `races` (from `Races::options()`); typed via `RaceOption` in `resources/js/types/game.ts` + the `sharedPageProps` augmentation. `campaign/show.tsx` reads `races` from `usePage()` and submits enum values; the hardcoded `RACES` constant is gone.
3. **Optional player backstory.** Wired the (pre-existing) `backstory` column through `Character` `$fillable`, `CreateCharacterRequest` (`nullable|string|max:5000`), the controller, a new `ui/textarea.tsx`, and an optional Backstory field on `campaign/show.tsx`. Fixed a `Textarea` vs `Input` background inconsistency (dropped `dark:bg-input/30` to match this project's `Input`).
4. **Slice 13 — AI backstories at spawn (see slice 13 below for detail).** New `BackstoryAgent`; controller generates + persists a backstory per AI agent; faked-gateway feature test.

Suite green throughout (PHP in Docker; vitest/lint/types under Node 24).

## Next Session — Intentions

1. **Seed the 2 NPC `AgentContext` rows.** One per `is_agent` character, `character_id` set, `agent_role='npc'`, `system_prompt` = a persona built from that `Character` (name/race/class/stats/backstory) via a new `PartyMemberAgent`. Fold in the shared-facts/role-framing split and (likely) an `AgentRole` enum while here.
2. **Generate the DM's opening narration.** The first live AI call: feed the seeded DM context to `DungeonMasterAgent`, persist the narration (as a `TurnMessage` and/or into the DM's `messages`), render it in the chat feed. Also settles slice 11's still-owed live smoke test.
3. **Make the chat room live.** Enable the turn input → a `TurnController`/orchestrator path → append responses to the feed.
4. **Carry-overs:** batch backstories into one AI call; concurrency/queue decision (see Follow-ups).

## Follow-ups

- **`AgentRole` enum.** `agent_role` is currently a raw string (`'dm'`). Introduce an enum (`dm`, `npc`, …) as NPC seeding lands, so roles are type-safe end to end like `Races`/`CharacterClass`.
- **Split shared context facts from role-specific framing.** `GameSessionController::openingContextFor()` mixes the *facts* (world seed + party sheets) with a *DM-only* call to action ("open the adventure…"). Factor the facts into a shared block so DM and NPC contexts can share it, with the persona/role living entirely in each agent's `system_prompt`.
- **Extract character-sheet / persona building.** `characterSheetFor()` (in `GameSessionController`) and `CharacterController::backstoryPromptFor()` both assemble race/class/stats prose from a `Character`. Pull this into one place (a `Character` method or a small service) before a third copy appears with `PartyMemberAgent`.
- **Dedup `toSummary`/`formatEnumLabel`.** Identical enum-label formatting lives in both `character/index.tsx` and `game-session/show.tsx`; extract to a shared util.
- **Kick off AI player generation as queued jobs (non-blocking on create).** Currently `CharacterController::createAccompanyingCharacters()` generates each AI party member's backstory via a **synchronous** `BackstoryAgent` call inside the request that creates the hero — so hero submission blocks on 2 sequential Anthropic round-trips. Dispatch this work to queued jobs instead so character creation returns immediately; the UI reveals each AI player's backstory as its job completes. Ties into the open "batch backstories into one AI call" + concurrency decision.

## Future Improvements (parking lot)

- **Player-character backstory generation.** Let the human hero's backstory be AI-generated too — either fully, or expanded from a few bullet points the player provides. Consider a UI toggle on the creation page to choose self-written vs. generated (vs. bullet-assisted).

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

11. **AI integration proof.** Flesh out one agent class under `app/Ai/Agents/` enough to send a prompt and return text via `laravel/ai`.
    - ✅ *Faked path:* effectively done via slice 13 — `BackstoryAgent` sends a real prompt through `laravel/ai` and the feature test fakes the gateway and asserts the response flows back through our code path.
    - ⬜ *Smoke:* still owed — one Tinker / temporary-route call against the **live** Anthropic API to confirm credentials + wiring (needs `ANTHROPIC_API_KEY`). No live call has been made yet.
    - *UI:* none (foundation slice).

12. ✅ **Spawn the AI party on hero submit.** *(complete 2026-07-01)* When `CharacterController@store` saves the player, also create **two** `Character` records with `is_agent = true`, a **random `CharacterClass`** (using its fixed `statBlock()`) and a random race.
    - ✅ *Action:* `CharacterController::createAccompanyingCharacters()` spawns the pair via `Character::factory(2)->for($campaign)->isAgent()->create()`. The `CharacterFactory` randomises class + race and uses `andreasindal/rpgfaker` (new dependency) for names; new `Races` enum added; `HasFactory` added to `Character`.
    - ✅ *Tests:* `it_will_create_two_additional_ai_agents_for_the_campaign` asserts 3 characters total with exactly 2 `is_agent = true`. *(Diverged from plan: test asserts counts only — does not yet assert valid classes/stats per agent, nor explicitly that the player stays `is_agent = false`.)*
    - ✅ *UI (2026-07-01):* `character/index` page renders the party via a reusable `CharacterCard` (name, race/class, stats, backstory); `character.index` GET route; `store` redirects there; frontend spec added. Raw enum values formatted to labels on the frontend.
    - ✅ *Cleanup done (2026-06-23):* race representation standardised on the `Races` enum (validated in `CreateCharacterRequest`, controller reads the enum, factory stores `->value`, frontend fed from `Races::options()` shared via `HandleInertiaRequests`). ⚠️ Still open: the test file's `// TODO: clean up the tests` (copy-pasted payloads).

13. ✅ **Generate agent backstories at spawn.** *(done 2026-06-23)* `backstory` column (nullable `longText`) in place; the spawn flow calls a backstory agent per AI character and persists the result.
    - ✅ *Action:* `app/Ai/Agents/BackstoryAgent.php` — a `laravel/ai` agent (`#[Provider('anthropic')]`, `#[Model('claude-sonnet-4-6')]`, DM-style `instructions()`). `CharacterController::createAccompanyingCharacters()` loops the two agents and saves `BackstoryAgent::make()->prompt(...)->text`; the per-character prompt is built from race/class/stats in `backstoryPromptFor()`.
    - ✅ *Tests:* `it_generates_and_stores_a_backstory_for_each_ai_agent` fakes the gateway (`BackstoryAgent::fake()` in `setUp()` covers the whole class so no test makes a live call); asserts each agent's backstory, that the prompt is character-derived (`assertPrompted`), and that the human hero's backstory is untouched.
    - ✅ *UI (2026-07-01):* the backstory renders on each `CharacterCard` (`whitespace-pre-line`, height-capped with scroll).
    - *Diverged from plan:* dedicated `BackstoryAgent` rather than reusing the DM agent; model switched Opus → **Sonnet**; backstory length is "a couple paragraphs"; calls are **synchronous + unguarded** for now (see Next Session intentions: batch into one call, revisit concurrency). No live smoke test run yet — slice 11 still owes one.

14. ⟳ **Begin the first `GameSession` + seed agent contexts.** *(mostly done — 2026-07-21; NPC seeding + opening narration remain)* Character creation *completing* is what starts the session: once the player's hero and both AI party members exist (slices 12–13), the "Begin the Adventure" action creates a `GameSession` for the campaign and seeds `AgentContext` rows, each with a `system_prompt` built from its character (race/class/stats/backstory) and the campaign's `world_description`. Per the invariant, the session can't be created before the full party exists — this slice depends on 12.
    - ✅ *Session creation:* `GameSessionController::store` creates a `GameSession` for a campaign and redirects to `game_session.show`; routes `game_session.store` (POST) + `game_session.show` (GET); `CampaignFactory` + `Campaign` `HasFactory`; feature test asserts creation + redirect.
    - ✅ *`show()` + page (2026-07-21):* fixed the binding (`GameSession $session`); `game-session/show` is a **chat-room placeholder** — session header + party roster, a message feed with a placeholder DM turn, a disabled turn input + Send, and a reserved "AI Context Window" rail. Backend + frontend specs added.
    - ⟳ *`AgentContext` seeding:* **DM done (2026-07-21)** — `agent_role='dm'`, `character_id=null` (new nullable migration), `system_prompt` from `DungeonMasterAgent::instructions()`, `messages` = opening context (world + party sheets); mechanical, no live call. ⬜ **NPC rows still to seed** (needs `PartyMemberAgent`). ⬜ `synopsis` not set. ⬜ DM opening narration (first live call) not generated.
    - ✅ *Wiring (2026-07-21):* trigger decided — "Begin the Adventure" `<Form>` on `character/index` POSTs to `game_session.store` (not chained onto hero submit).
    - *Diverged from plan:* session creation split into a dedicated `GameSessionController@store` endpoint rather than the tail of `CharacterController@store`; DM system prompt lives on `DungeonMasterAgent` (fleshed out from the stub) and is read back for the seed. Minor: the test's namespace is `Tests\Http\Controllers` but it lives under `tests/Feature/Http/Controllers/`.

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
