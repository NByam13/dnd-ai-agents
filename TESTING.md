# Testing Standards — for AI Agents

This file tells an AI agent how to write and run tests in this repo so they match
existing conventions. Read it before writing any test. When in doubt, open a
neighbouring test and mirror it exactly.

## Golden rules

1. **Test-first.** Write a failing test that describes the desired behaviour
   *before* writing the implementation. A red test is intentional — never edit a
   test to pass against incomplete code.
2. **Feature tests by default.** Hit real HTTP endpoints (backend) and render real
   pages (frontend). Add isolated unit tests only when logic is complex enough to
   warrant it.
3. **Test behaviour and contracts, not implementation.** Assert on what the user /
   the backend / the database observes — not on private internals.
4. **Cover the negatives.** Every feature needs happy-path *plus* validation
   failures, authorization boundaries, and "client cannot override server-owned
   data" cases.
5. **Keep tests scoped to the ticket.** Don't add tests for unrelated behaviour;
   flag gaps you notice instead.

---

## Backend — Pest / PHPUnit (`tests/`)

We use **class-based PHPUnit-style** tests (not Pest's functional `it()` syntax).

- Extend `Tests\TestCase`, namespace mirrors the directory
  (`Tests\Feature\Http\Controllers`).
- One class per subject; test methods are `snake_case` and read as sentences,
  annotated with `#[Test]` (`use PHPUnit\Framework\Attributes\Test;`).
- Feature tests live under `tests/Feature/...`; mirror the app structure
  (`Http/Controllers/CharacterControllerTest.php` tests `CharacterController`).

### Structure — Arrange / Act / Assert

```php
#[Test]
public function will_create_a_new_character_for_the_campaign(): void
{
    $campaign = Campaign::factory()->create();
    $character = Character::factory()->make();

    $response = $this->post(
        route('character.store', ['campaign' => $campaign]),
        $character->only(['name', 'race', 'class']),
    );

    $this->assertDatabaseHas('characters', [
        'campaign_id' => $campaign->id,
        'name'        => $character->name,
    ]);
    $response->assertRedirect(route('character.index', ['campaign' => $campaign]));
}
```

### Conventions

- **Routes:** always reference by name via `route('character.store', [...])` —
  never hard-code URL strings.
- **Assertions:** prefer database + response assertions —
  `assertDatabaseHas`, `assertDatabaseCount`, `assertRedirect`,
  `assertSessionHasErrors`.
- **Validation:** every FormRequest rule gets a test. Assert both
  `assertSessionHasErrors([...])` *and* that nothing was persisted
  (`assertDatabaseCount('characters', 0)`).
- **Security / server-owned data:** prove the client can't override values the
  server controls (e.g. `the_client_cannot_override_the_stat_block`).

### Faking AI agents

AI agents must never hit a live model in tests. Fake them in `setUp()` or per-test:

```php
BackstoryAgent::fake(fn () => 'A fake backstory.');
// ...act...
BackstoryAgent::assertPrompted(fn ($prompt) => str_contains($prompt->prompt, 'Ability scores:'));
```

Assert on the *prompt contract* (what we send the model), not on generated text.

### Running backend tests

- **Must run inside Docker** — the `pgsql` host won't resolve on the host machine.
- Project is using Laravel Sail for dockerization.
  - **Make Sure App is Running In Docker** via `docker ps` 
- `sail artisan test` (whole suite) or `sail artisan test --filter=CharacterController`.
- Note: `RefreshDatabase` is currently disabled in `tests/Pest.php`; follow the
  existing per-test setup rather than assuming a clean DB is auto-provided.

---

## Frontend — Vitest + Testing Library (`resources/js/**/__tests__/`)

- Test files are `*.spec.tsx`, colocated in a `__tests__/` dir next to the page
  (`pages/campaign/__tests__/show.spec.tsx`).
- Environment is `jsdom` with Vitest globals enabled (see `vite.config.ts`);
  still import `describe/it/expect/vi` explicitly, as existing tests do.

### Mocking Inertia

Pages depend on `@inertiajs/react`. There is one shared manual mock — don't
re-declare an inline factory per spec. Two files back it:

- `__mocks__/@inertiajs/react.tsx` — the module replacement, auto-loaded by
  Vitest. It stubs only the exports the pages use (`Head`, `usePage`, `Form`) and
  must live at the repo root (adjacent to `node_modules`) for Vitest to find it.
- `resources/js/test/inertia-mock-state.ts` — the test-only spy and page-prop
  state (`formSpy`, `setPageProps`), kept under `@/` so specs import it cleanly.

Activate it with a bare `vi.mock` (no factory), then drive/assert via the state
helpers:

```tsx
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Show from '@/pages/campaign/show';
import { formSpy, setPageProps } from '@/test/inertia-mock-state';

vi.mock('@inertiajs/react');

const races = [{ value: 'human', label: 'Human' }];

beforeEach(() => {
    formSpy.mockClear();       // reset call history between tests
    setPageProps({ races });   // what usePage().props returns this render
});

it('posts to the campaign character endpoint', () => {
    render(<Show campaign={{ id: 7, name: 'The Lost Mines' }} characterClasses={[]} />);

    expect(formSpy).toHaveBeenCalledWith({
        action: '/campaign/7/character',
        method: 'post',
    });
});
```

A spec that renders no `<Form>` and reads no page props (e.g. `character/index`)
just needs the `vi.mock('@inertiajs/react')` line — no helper import.

The mock deliberately omits the `...actual` passthrough: it exports only
`Head`/`usePage`/`Form`. If a page under test imports another Inertia export
(`Link`, `router`, …), add a stub for it to `__mocks__/@inertiajs/react.tsx`.

### Conventions

- Give each test a small `renderX()` helper that supplies props.
- **Selectors, in order of preference:** `getByText` / `getByRole` for
  user-visible content → `data-testid` for interactive elements
  (`class-option-barbarian`, `stat-block`, `begin-adventure-button`) →
  `container.querySelector('input[name="..."]')` for form fields.
- Drive interactions with `fireEvent` (`click`, `change`).
- **Assert the backend contract:** that the form posts to the right
  action/method and builds a payload with the field names the backend expects
  (`name`, `race`, `class`, `backstory`). This is the most valuable frontend
  assertion — it's the seam between the two test suites.

### Running frontend tests

- `npx vitest` (watch) or `npx vitest run` (once). There is no npm `test`
  script yet — run vitest directly.

---

## Before you call any task done

- **Backend:** `./vendor/bin/pint` and `php artisan test` (both in Docker) both green.
- **Frontend:** `npx vitest run`, `npm run lint:check`, and `npm run types:check`
  all pass.
