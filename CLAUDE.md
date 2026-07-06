# DnD AI Agents — Claude Guidelines

## Laravel Conventions
- Always use `php artisan make:*` to generate Laravel resources (migrations, models, controllers, requests, resources, etc.). Never hand-write boilerplate that Artisan can generate.
- Use Laravel's resource classes (`php artisan make:resource`) as controller return types.
- Use FormRequest classes (`php artisan make:request`) for all controller input validation — no inline `$request->validate()`.
- Follow Laravel naming and structure conventions throughout (singular model names, plural table names, RESTful controller methods, etc.).

## Package Management
- Never edit `package.json` directly. Always use `npm install <package>` to add dependencies.
- Use Composer for PHP packages — never edit `composer.json` directly.

## Testing
- See [TESTING.md](TESTING.md) for full test standards (backend + frontend conventions, faking AI agents, how to run each suite).
- Work test-first: write feature tests before implementing the feature. Let failing tests drive the implementation.
- Prefer feature tests (hitting HTTP endpoints) over unit tests by default. Add unit tests only where logic is complex enough to warrant isolation.
- Run the test suite after every non-trivial change: `php artisan test`.

## Code Quality — Run Before Finishing Any Task
- **Backend:** `./vendor/bin/pint` — fix style before considering backend work done.
- **Frontend:** `npm run lint:check && npm run types:check` — must pass before considering frontend work done.

## Plan Tracking
- After completing a build order step, update the plan file at `PROJECT_PLAN.md` — mark the step complete and note anything that diverged from the original design.
