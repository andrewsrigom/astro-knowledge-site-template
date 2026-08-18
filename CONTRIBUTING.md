# Contributing

Thanks for contributing to `astro-knowledge-site-template`.

## Local setup

```bash
pnpm install
pnpm init:template
pnpm verify:starter
pnpm dev
```

Node `22` is the canonical runtime for this repository.

For public validation flows:

```bash
pnpm verify:starter
pnpm docs:smoke
```

For an external content repo:

```bash
pnpm init:content-repo ../sample-content
SITE_CONTENT_DIR=../sample-content pnpm verify:external
```

## Branch and PR flow

- Branch from `main`
- Keep PRs focused and small enough to review quickly
- Link the issue when the change is tied to one
- Prefer updating docs in the same PR when behavior changes

## Before opening a PR

- Run `pnpm verify:starter`
- Run `pnpm docs:smoke` when links, docs, or screenshots changed
- Confirm the starter flow still works on a clean clone
- Confirm external content still works when the PR touches scaffold, sync, or manifest expectations
- Update `README.md`, `docs/`, or `.env.example` when user-facing setup changes
- Add or refresh screenshots when the public UI or onboarding flow changes visibly
- Keep both `examples/starter-content` and `templates/content-repo` compatible with the current shell contract

## Contract changes

If you change the content contract or sync flow, update all of these in the same PR:

- `README.md`
- `docs/external-content.md`
- `examples/starter-content`
- `templates/content-repo`
- `CHANGELOG.md`

## Releases

Release notes should always include a short `What changed for adopters` section.

That section should describe setup, migration, validation, or deployment changes from the point of view of someone cloning the template.

## Community threads

- Public roadmap: <https://github.com/andrewsrigom/astro-knowledge-site-template/issues/1>
- Showcase / built with this template: <https://github.com/andrewsrigom/astro-knowledge-site-template/issues/2>
