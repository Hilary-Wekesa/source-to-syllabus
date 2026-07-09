# Source-to-Syllabus

A **Claude Code / Cowork skill** that turns any codebase into a beautiful, **multi-page interactive HTML course** — from plain-English intuition all the way to proper software-engineering depth.

For each project it:

1. **Analyzes the codebase first** and saves a written analysis report (also rendered as an in-course page).
2. **Teaches how it was built**, module by module, in real implementation order — each step with a *what / why / how* and a TL;DR.
3. **Upskills you as an engineer** — every module has an **Overview** page (intuition, build journey, one quiz) and a **Deep Dive** page (complexity & performance, alternatives & tradeoffs, failure modes & concurrency, and hands-on exercises with primary-source reading).

The output is a self-contained multi-page site (shared stylesheet + script + sidebar): an index/syllabus, a codebase-analysis page, an architecture page, and per module an Overview + Deep Dive. It runs in the browser with **no build step**, has a **light/dark toggle**, a **Simply/Technically** inline toggle, and adapts depth to a **beginner → advanced** level you pick up front.

## Install

### Option A — Claude Code plugin (one command, auto-updates)

```
/plugin marketplace add Hilary-Wekesa/source-to-syllabus
/plugin install source-to-syllabus@source-to-syllabus
```

Update later with:

```
/plugin marketplace update source-to-syllabus
```

### Option B — copy into your skills folder (no plugin system)

```
git clone https://github.com/Hilary-Wekesa/source-to-syllabus ~/.claude/skills/source-to-syllabus
```

Both methods work off the same `SKILL.md` at the repo root, so either one enables the skill. The `.claude-plugin/` directory is used only by the plugin installer and is ignored by the plain skills loader.

## Usage

Once installed, just point the skill at a project:

- "Turn this codebase into a course"
- "Make a course from https://github.com/user/repo"
- "Teach me how this project was built and make me a better engineer"

It will ask how deep you want to go, analyze the code, and generate the course.

## Repository layout

```
SKILL.md                     # the skill definition (auto-discovered at plugin root)
README.md
LICENSE                      # MIT
.claude-plugin/
  marketplace.json           # plugin catalog (source: "./")
  plugin.json                # plugin manifest
references/                  # content philosophy, templates, design system,
                             # interactive-element patterns, and the pre-built
                             # styles.css / main.js / page shell / build.sh
```

## Versioning

`plugin.json` intentionally has **no `version` field**, so Claude Code uses the **commit SHA** as the version — every push to `main` is picked up as an update (`/plugin marketplace update`), no manual bumps. If you prefer explicit releases, add a semver `"version"` to `plugin.json` and bump it each release. (A pinned-but-stale version silently blocks updates for existing users.)

## License

MIT © 2026 Hilary Wekesa
