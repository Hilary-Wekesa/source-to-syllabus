# Resource Curation

> **When to read this:** During Phase 2.5 (briefs) and Phase 3 (writing Level Up sections). Every Level Up card ends with a curated resource list — these are the rules for choosing and formatting the links.

The resource lists are one of the highest-value parts of the course: they turn a finished course into a launchpad for deeper learning. A random search returns noise; a curated list from someone who understands the concept is a gift. Treat these links with the care of a mentor handing a junior engineer exactly the right thing to read next.

## The One Unbreakable Rule: Never Invent a URL

A made-up URL that 404s destroys the learner's trust in the entire course. If you are not confident a URL is real and stable:
- Prefer the **canonical, stable source**: official documentation, the project's own site, a well-known reference (MDN, the language's official docs, a major framework's docs).
- Link the **homepage or docs root** rather than guessing a deep path (`https://react.dev` over a guessed `https://react.dev/learn/some-page-you-are-unsure-exists`).
- When you have web access, **verify** the link resolves before including it. When you don't, fall back to canonical sources you are certain of.

## What Makes a Good Resource

Pick 2-4 per Level Up, ideally mixing formats so different learners are served:

- **Docs** — the authoritative reference for the concept or tool (MDN, official language/framework docs, RFCs for protocols). Best for accuracy and "the real spec."
- **Article** — a well-written explainer or deep-dive from a reputable source or a respected engineer's blog. Best for "how a practitioner thinks about this."
- **Video** — a visual/animated explanation (Computerphile, Fireship, official conference talks, a well-known educator). Best for intuition on hard-to-visualize ideas.
- **Course** — a structured deeper path (freeCodeCamp, a university OpenCourseWare, a canonical book) for learners who want to go all the way.
- **Repo** — a reference implementation or the source project itself, when reading real code is the best next step.

## Quality Bar

- **Authoritative or well-regarded.** Prefer official docs, recognized educators, and established publications over random blogspam.
- **Stable.** Prefer sources unlikely to move or disappear (official docs, major channels) over ephemeral links.
- **On-point.** Each link must map to the specific concept in that Level Up, not just the general topic. The one-line "why" must state what the learner gets from it.
- **Right altitude.** At least one resource should meet a beginner; at least one should push an ambitious learner deeper.

## Canonical Sources to Reach For (reliable, stable)

- **Web platform:** MDN Web Docs (`developer.mozilla.org`).
- **Languages/frameworks:** the official docs — `docs.python.org`, `react.dev`, `nodejs.org/docs`, `go.dev/doc`, `doc.rust-lang.org`, `kotlinlang.org/docs`, etc.
- **CS fundamentals & visual intuition:** Computerphile, MIT OpenCourseWare, freeCodeCamp, Khan Academy, `refactoring.guru` (patterns), `roadmap.sh` (learning paths).
- **System design & production practice:** the engineering blogs of major companies, `martinfowler.com`, the official docs of the specific service (Stripe, Postgres, Redis, etc.).
- **The project's own ecosystem:** the docs of the exact libraries/frameworks the codebase uses — always relevant, always worth linking.

## Format

Use the `.resource-list` / `.resource-item` HTML pattern in `interactive-elements.md`. Each item:
- A **type badge** (`docs` / `article` / `video` / `course` / `repo`).
- A **title** (the real title of the resource, not a paraphrase).
- A **source** (`developer.mozilla.org`, `youtube.com · Computerphile`, etc.) so the learner knows the provenance.
- A one-line **why** stating exactly what the learner gains.
- `target="_blank" rel="noopener"` so links open in a new tab and the course stays put.
