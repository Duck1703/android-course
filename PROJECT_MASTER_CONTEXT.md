# Project Master Context

> Reverse-engineered audit of this repository (generated 2026-09-03). Evidence-based: every architecturally
> important claim cites a file path. Labels: **VERIFIED** = directly demonstrated by code/config/content;
> **INFERRED** = strongly implied; **POSSIBLE ISSUE** = evidence suggests a concern; **UNKNOWN** = cannot be
> established from repository evidence. Investigation method: direct reading of all data files, both pages,
> the layout, all shared components, the progress library, docs, representative lessons/quizzes (full reads),
> heading/frontmatter scans of all 79 lesson-family files, file mtimes, git status, and a real `astro build`
> (exit 0, 23 pages) plus `astro check` (0 errors / 0 warnings / 64 hints) run during this audit.

## 1. Executive Summary

1. **What is this project?** A **local-only, static Vietnamese-language learning website** that teaches
   Android/Kotlin/Jetpack Compose to complete beginners. It is a rewrite ("diễn giải lại", not a copy) of the
   commercial book *Android Fundamentals by Tutorials* v1.0.0 (Kodeco, 2024) + its companion Android projects
   (`aaf-materials/`). The site is meant to run on the owner's machine only (`README.md` explicitly targets a
   non-technical user running `npm run dev` locally); it is not licensed for public deployment
   (`docs/SOURCE_MAP.md` §2.5, `docs/PROJECT_PLAN.md` Quyết định #7).
2. **What technology powers it?** **Astro 7.2.7 static output** (`web/package.json`), TypeScript strict,
   zero client frameworks, zero runtime dependencies beyond Astro itself. Client interactivity (theme,
   search, progress, quiz scoring, code copy buttons) is small vanilla-JS `<script>` blocks. No backend, no
   database, no env vars, no auth. **VERIFIED**.
3. **How is course content represented?** Not Markdown, not MDX: each lesson is a **hand-written Astro
   component** in `web/src/components/lessons/ChNN[_sub]Name.astro` containing Vietnamese prose + Kotlin/XML
   snippets embedded as template literals rendered via Astro's `<Code>` component. A **registry**
   (`web/src/data/lessons.ts`, slug → `{Lesson, Quiz}`) wires components to routes; the syllabus lives in
   `web/src/data/chapters.ts`. Book text (extracted EPUB → Markdown in `content/book/`) and Android sample
   code (`aaf-materials/`) are reference sources, never rendered directly. **VERIFIED**.
4. **How does a learner navigate?** Homepage (dashboard: hero, progress panel, 22 chapter cards grouped in
   3 modules) → `/chapters/<slug>/` lesson pages with breadcrumb, reading stats, TOC sidebar, prev/next
   cards, a "mark as learned" toggle, and a per-lesson quiz. A topbar search (build-time JSON index,
   client-side, Vietnamese-diacritic-insensitive) jumps to chapters/sections. **VERIFIED**
   (`web/src/pages/index.astro`, `web/src/pages/chapters/[slug].astro`, `web/src/layouts/BaseLayout.astro`).
5. **How is progress stored?** An array of completed slugs in `localStorage` key `hoc-android-tv:progress`,
   with a one-time slug-migration mechanism (`SPLIT_MAP`, `SCHEMA_VERSION = 4`) so progress survives
   chapter splits. Quiz answers are **not** persisted. Progress is per-browser/per-device; there is no
   account system. **VERIFIED** (`web/src/lib/progress.ts`).
6. **Structurally strong:** clean separation syllabus (`chapters.ts`) / registry (`lessons.ts`) / lesson
   components / presentation; build-time derived stats (`lessonStats.ts`) that avoid duplicating syllabus
   data; deliberate progress-migration design; disciplined internal docs (`docs/*.md`); verified build.
7. **Structurally weak:** the repo is **mid-migration** ("Task 48 chapter split"). 27 split lesson files +
   1 split quiz exist on disk but are **not wired** into the registry/syllabus, while 6 superseded monolith
   files and 1 stale duplicate variant remain; live content is therefore duplicated across two generations
   of files (~56k lines of `.astro`). ~450 scratch artifacts (`web/.*.txt`, 289 files in `web/scripts/`)
   are untracked and un-ignored. No tests, no CI, no lint/format scripts, no `astro.config`.
8. **Biggest curriculum concerns:** (a) live lessons for Ch04–09/11 are "monolith" pages that a paused
   refactoring intends to replace — the replacement files exist but are unwired and (for Ch05–11) are
   mechanical splits missing the editorial standard's mandatory blocks; (b) known quiz-quality issues
   (answer-length bias) documented in `docs/PROJECT_PLAN.md`; (c) book-pinned tool versions are old
   (mitigated by in-lesson version callouts).
9. **Biggest technical concerns:** dual-generation content files make edits easy to land in the wrong
   file; `lessonStats.ts` globs all 79 `.astro` files (orphans included) into the build; the filename
   pattern `^Ch(\d{2})(?:_(\d+))?(...)\.astro$` is a load-bearing contract; scratch-file pollution risks
   accidental commits; a single contributor's git history is only 2 commits (2026-08-28) while the working
   tree carries ~3 weeks of uncommitted changes.
10. **What should another AI investigate next?** The Task-48 migration plan (`docs/PROJECT_PLAN.md`,
    `docs/CHAPTER_SPLIT_MAP.md`) before touching any `Ch*.astro` file; then the wiring contract between
    `chapters.ts` / `lessons.ts` / file names / `progress.ts SPLIT_MAP` (all four must change together per
    split).

## 2. Product Purpose

- **Problem solved:** the source book is English, assumes some programming background, and its companion
  code is unannotated. This project converts it into a free, offline, Vietnamese step-by-step course with
  interactive quizzes, progress tracking, and "critical-reading" commentary (where the 2024 book vs. the
  actual sample code vs. the current Android ecosystem disagree).
- **Intended learner (verified from `docs/COURSE_CONTENT_STANDARD.md` §1):** a Vietnamese-speaking absolute
  beginner who knows basic computer use and general logic concepts (variables, if/else) but no Kotlin, no
  Android, no English technical vocabulary. The course is strictly linear; each lesson may only rely on
  concepts taught in earlier lessons ("Golden rule": anything not yet taught = the learner doesn't know it).
- **Primary user journey:** homepage → "Bắt đầu học" → lesson pages in order → quiz at the end of each
  lesson → "Đánh dấu đã học" → prev/next cards → dashboard progress updates; "Tiếp tục học" resumes at the
  first un-learned part (client logic in `web/src/pages/index.astro` script).
- **Intended end result:** the learner understands the book's concepts, can read the book's real sample
  projects (`aaf-materials/`), and is warned about outdated material. The site deliberately does **not**
  try to be a generic Compose tutorial (root `CLAUDE.md`, instruction A).

## 3. Target Learner

Same as §2 (that section is the verified definition). Additional verified constraints from
`docs/COURSE_CONTENT_STANDARD.md`: no assumption of Kotlin syntax knowledge (`by` delegates, scope
functions, null-safety etc. must be explained at first use); English API names kept but glossed in
Vietnamese at first mention; reading-time target 12–22 minutes/lesson; 2–3 new major concepts per lesson.

## 4. Current Product State

- **The site works and builds.** `npx astro build` → exit 0, **23 pages** (1 home + 22 chapter pages);
  `npx astro check` → 0 errors, 0 warnings, 64 hints (run during this audit, 2026-09-03).
- **22 routable lessons, all with real content + quiz** (no placeholders remain reachable):
  Ch01→4 sub-chapters, Ch02→3, Ch03→4, Ch04–Ch09 monoliths, Ch10→4 sub-chapters, Ch11 monolith.
- **A paused refactor is half-applied.** Project phase "7 / Task 48" splits long monolith chapters into
  sub-chapters. Wired so far: Ch01, Ch02, Ch03, Ch10. On disk but **unwired**: split files for Ch04 (3+1
  stale variant, 1 quiz), Ch05–09 (3/4/4/4/4 lessons), Ch11 (5 lessons). `docs/PROJECT_PLAN.md` line ~151
  says Task 48 is "TẠM DỪNG" after Ch01–03 — but file mtimes show Ch04–09/Ch11 splits were created
  2026-08-31 → 2026-09-01, i.e. **the plan file lags the working tree again** (a divergence the plan itself
  flags as a recurring failure mode; see §49).
- **Two generations of content coexist** (see §40). Live monoliths: Ch04GradleBasics, Ch05JetpackCompose,
  Ch06AdvancedJetpackCompose, Ch07AdvancedArchitecture, Ch08Networking, Ch09DataStore, Ch11AdvancedStorage
  (+ their ChNNQuiz.astro). Orphaned monoliths: Ch01/Ch02/Ch03 monolith pairs. Unwired splits: 27 lesson
  files + Ch04_1Quiz.astro.
- Git: branch `main`, 2 commits (latest `4a9f218` 2026-08-28); `git status` shows ~236 changed/untracked
  paths — effectively the whole Task-44→48 effort is uncommitted.

## 5. Repository Overview

| Path | What it is | Notes |
|---|---|---|
| `Android_Fundamentals_by_Tutorials_v1.0.0.epub` | Source book (34 MB, EPUB 3) | gitignored; copyright |
| `content/book/` | 23 Markdown files extracted from the EPUB (`scripts/extract_epub.py`) | gitignored; ch01–ch11 = 41,918 words; the rest is front/back matter |
| `aaf-materials/` | Kodeco's official companion Android projects (nested git repo, remote `kodecocodes/aaf-materials`, branch `editions/1.0`) | gitignored from outer repo; 11 chapter folders, `projects/{starter,final,challenge}`; license forbids pedagogical use (see §16/§47) |
| `web/` | The Astro website (the actual product) | see §8 |
| `docs/` | Project management + editorial docs: `PROJECT_PLAN.md` (progress source of truth), `SOURCE_MAP.md` (book/repo audit), `LEARNING_MAP.md` (chapter→concept→code map), `CHAPTER_SPLIT_MAP.md` (split contract), `COURSE_CONTENT_STANDARD.md` (editorial standard), `superpowers/plans/` (1 archived task plan) | uncommitted except none — CHAPTER_SPLIT_MAP + COURSE_CONTENT_STANDARD are untracked |
| `scripts/extract_epub.py` | 304-line EPUB→Markdown extractor, Python stdlib only (`zipfile` + `xml.etree.ElementTree`) | verified per `docs/PROJECT_PLAN.md` Task 2/3 |
| `CLAUDE.md` (root) | Agent-facing project brief: identity, source-of-truth docs, working rules, depth standards | modified, uncommitted |
| `README.md` | Non-technical run instructions (Node install, `npm install`, `npm run dev`) | says "11 chapter"; site now has 22 pages (see §49) |
| `package-lock.json` (root) | Present at repo root (no root `package.json` with scripts) | artifact of environment, not used by docs |
| `.claude/skills/` | Several cloned agent-skill repos (e.g. `curriculum-designer`, `learning-design-pillars`, `learning-design-review`) — each with its own `.git` | untracked; tooling, not product |
| `.wc3_3.txt`, `scripts/.out-wc.txt` | scratch outputs | untracked |

**Framework determination (verified, not assumed):** Astro 7 (`web/package.json` dependency `astro: ^7.2.7`), static output,
no adapter, no `astro.config.*` file anywhere in `web/` (pure defaults; `getStaticPaths` drives routing). TypeScript strict via
`web/tsconfig.json` (`extends: astro/tsconfigs/strict`). Package manager: npm (lockfile v3), Node `>=22.12.0` engine constraint.

## 6. Technology Stack

| Concern | Technology | Evidence |
|---|---|---|
| Framework | Astro 7.2.7 (static, `.astro` single-file components) | `web/package.json` |
| Language | TypeScript (strict) + vanilla JS in `<script>` tags | `web/tsconfig.json`; all client scripts are TS-flavored JS |
| UI libraries | none | `web/package.json` has no other runtime deps |
| Styling | hand-written CSS, 8 files imported by `web/src/styles/global.css` (tokens/base/shell/dashboard/lesson/quiz/icons) | `web/src/styles/`, `BaseLayout.astro` line 4 |
| Syntax highlighting | Astro built-in `<Code>` (`astro:components`) → Shiki, `pre.astro-code` output | lessons import `{ Code } from "astro:components"`; `CodeEnhance.astro` targets `pre.astro-code` |
| Routing | file-based + `getStaticPaths` from `ALL_CHAPTERS` | `web/src/pages/chapters/[slug].astro` lines 9–14 |
| State | localStorage + in-page vanilla JS | `web/src/lib/progress.ts` |
| Build-time data derivation | `import.meta.glob(..., { query: "?raw", eager: true })` over lesson files | `web/src/data/lessonStats.ts` lines 15–19 |
| Backend / DB / auth / analytics | **none** | no server routes, no env usage (`import.meta.env` appears nowhere in `web/src`) |
| Tests | none | no test files, no test script in `web/package.json` |
| Deployment | none configured (local-only by design) | no platform config files; README/plan forbid public hosting (copyright) |

Windows-specific note **VERIFIED**: `web/package.json` pins three Windows native-binding packages
(`@astrojs/compiler-binding-win32-x64-msvc`, `@rolldown/binding-win32-x64-msvc`, `lightningcss-win32-x64-msvc`)
as regular dependencies — a documented workaround for an npm bug on this machine (`docs/PROJECT_PLAN.md` Task 5).

## 7. Dependency Overview

Runtime: `astro ^7.2.7` + the 3 Windows bindings above. Dev: `@astrojs/check ^0.9.10`, `typescript 6.0.3`
(pinned — `@astrojs/check@0.9.10` doesn't support TypeScript 7, per plan Task 10). No markdown parser, no
React/Vue/Svelte integration, no icon library (all icons are inline SVG), no font packages, no search library
(self-built index), no state library. **VERIFIED** against `web/package.json`.

## 8. Repository Structure (web/)

```text
web/
├─ package.json / package-lock.json / tsconfig.json   # no astro.config (defaults)
├─ public/                     # favicon.svg, favicon.ico only
├─ dist/                       # build output (gitignored), currently 22 chapter routes + home
├─ scripts/                    # 289 scratch audit/refactor scripts (_a*.py, _t48_*, *.mjs) — NOT product code
├─ .*.txt / *.css / *.log ...  # ~116 dot-prefixed scratch files in web root — NOT product code
├─ CLAUDE.md / AGENTS.md / README.md  # starter boilerplate + local run guide (README is the real one at repo root)
└─ src/
   ├─ layouts/BaseLayout.astro        # 457 lines: <head>, theme pre-paint, topbar, sidebar rail, search, progress
   ├─ pages/
   │  ├─ index.astro                  # 258 lines: dashboard/hero/progress/curriculum cards + resume logic
   │  └─ chapters/[slug].astro        # 320 lines: the lesson page template (only dynamic route)
   ├─ components/
   │  ├─ ProgressToggle.astro         # "mark as learned" button
   │  ├─ CodeEnhance.astro            # progressive enhancement: wraps code blocks with copy bar
   │  ├─ HelloWorld.astro             # 4-line leftover demo component, imported nowhere
   │  └─ lessons/                     # 79 .astro files, 56,002 lines total (see §20/§40)
   ├─ data/
   │  ├─ chapters.ts                  # syllabus: ChapterInfo/SECTIONS/ALL_CHAPTERS + grouping helpers
   │  ├─ lessons.ts                   # registry: slug → { Lesson, Quiz } (Partial<Record>)
   │  └─ lessonStats.ts               # build-time derived stats (headings/words/minutes/quiz counts) + COURSE_TOTALS
   ├─ lib/progress.ts                 # localStorage read/write/toggle + one-time slug migration
   └─ styles/                         # 8 CSS files (~3,864 lines)
```

## 9. Application Entry Points

- **Dev:** `npm run dev` (astro dev) in `web/`; **build:** `npm run build`; **preview:** `npm run preview`.
  No test/lint/format/typecheck scripts exist beyond `astro check` being run manually. **VERIFIED**
  (`web/package.json` scripts).
- **HTML entry:** `web/src/layouts/BaseLayout.astro` is the sole layout. Bootstrap sequence:
  1. Inline head script (before paint) reads `localStorage["hoc-android-tv:theme"]` / `prefers-color-scheme`
     and sets `<html data-theme="dark">` to avoid a flash (BaseLayout lines 63–74).
  2. Static markup renders: topbar (menu button, brand, search input + results listbox, total-progress bar,
     theme toggle) and the sidebar rail (3 modules as `<details>`, chapter links with check icons), built
     from `SECTIONS` + `groupChapters()`; the active chapter's module is rendered `open`.
  3. A build-time search index is embedded as `<script type="application/json" id="search-index">`
     (BaseLayout lines 227–232; index built from chapter titles/summaries + every lesson `<h2>`, via
     `lessonStats`).
  4. The page's TS script wires: theme toggle, progress painting (`getDoneSlugs()` → check marks, header
     bar, per-module counters), mobile drawer (open/close/Escape/focus return), scroll-into-view for the
     active link, and the search UI (diacritic-folding `fold()`, prefix-match scoring, ≤12 hits,
     ↑/↓/Enter, Ctrl/Cmd+K focus) (BaseLayout lines 236–455).
- **Lesson page bootstrap** (`[slug].astro`): static shell renders (breadcrumb, chips, stats, overview
  grid, `<Lesson /><Quiz />` from the registry, prev/ProgressToggle/next, TOC aside); its script syncs the
  "Đã hoàn thành" chip with the progress button via the `progress-changed` event and runs an
  `IntersectionObserver` to highlight the current TOC entry (lines 280–319).
- **Chain "app load → lesson displayed":** npm/Astro serves a prebuilt static page; `getStaticPaths`
  produced one HTML file per `ALL_CHAPTERS` entry; the registry chose the `{Lesson, Quiz}` components that
  were inlined at build time; client JS only enhances (theme, progress, search, TOC, copy buttons).

## 10. Routing Architecture

**VERIFIED.** Exactly 3 URL shapes exist:

| URL | Source | Behavior |
|---|---|---|
| `/` | `web/src/pages/index.astro` | dashboard/home |
| `/chapters/<slug>/` | `web/src/pages/chapters/[slug].astro` + `getStaticPaths` over `ALL_CHAPTERS` | 22 static pages; slugs must match `chapters.ts` exactly |
| anything else | — | no custom 404 page; Astro default 404 (fake route `/chapters/ch99-fake/` verified → 404 in past task verifies) |

No redirects, no trailing-slash config (Astro default `ignore`), no i18n routing (site is Vietnamese-only,
`<html lang="vi">`), no pagination, no API routes, no middleware.

## 11. Screen / Page Map

| Route | Page file | Purpose | Data source | Key children |
|---|---|---|---|---|
| `/` | `index.astro` | hero + course stats, progress dashboard (total %, done/left, resume card), curriculum cards grouped by 3 modules | `SECTIONS`, `COURSE_TOTALS`, `getStats()`, localStorage | `.card` per chapter; script paints progress + "Tiếp tục học" |
| `/chapters/<slug>/` | `chapters/[slug].astro` | the lesson: header chips/stats, overview (prereqs + sources), lesson body, quiz, prev/next + progress toggle, TOC rail | `ALL_CHAPTERS`, `LESSONS`, `getStats()`, localStorage | `Lesson`, `Quiz`, `ProgressToggle`, `CodeEnhance` |
| (overlay elements, every page) | `BaseLayout.astro` | topbar search, sidebar rail, theme, total progress | `SECTIONS`, `groupChapters`, embedded JSON index | — |

There are deliberately no other screens (no about, no login, no search page — search is a dropdown).

## 12. Component Architecture

| Component | Responsibility | Props/state | Notes |
|---|---|---|---|
| `BaseLayout.astro` | global chrome: head/meta/theme, topbar, sidebar, search, global progress | Props: `title`. No reactive state; DOM + localStorage | also builds `searchIndex` at build time from `getStats(...).headings` |
| `pages/chapters/[slug].astro` | lesson page composition; decides Lesson vs placeholder | props: `chapter: ChapterInfo` | placeholder branch still exists but unreachable today (all 22 slugs registered) |
| `ProgressToggle.astro` | mark-as-learned button | prop `slug`; DOM class `done`, `aria-pressed` | dispatches `progress-changed` CustomEvent; header/rail/chip listen |
| `CodeEnhance.astro` | wraps each `pre.astro-code` in a `.codeblock` with language label + copy button (clipboard API with `execCommand` fallback for `file://`) | none | runs on every lesson/quiz page; rationale comment cites 330+ `<Code>` call sites |
| `HelloWorld.astro` | Astro starter demo | none | **dead code**, imported nowhere |
| `lessons/ChNN[_sub]Name.astro` | lesson body: frontmatter holds Kotlin/XML snippets as template-literal consts; markup holds Vietnamese prose, `.callout` boxes, `<Code code={...} lang="kotlin" />` blocks | — | filename is a load-bearing contract (see §14/§19) |
| `lessons/ChNN[_sub]Quiz.astro` | quiz: `<form id="quiz-form">` of `<fieldset data-answer="x">` radio groups + hidden `.explain` paragraphs + optional `.exercise` blocks and `<details>` answers; shared 20-line scoring script | — | same script duplicated in every quiz file (copy-paste, not a shared component) |

Cross-cutting convention **VERIFIED**: lessons use `<h2 id="...">` sections; split lessons (per standard)
end with exactly one `<h2 id="cam-bay">Cạm bẫy & tài liệu lỗi thời</h2>` and one `<h2 id="nguon">Nguồn tham
khảo</h2>`; monolith lessons instead carry inline `<p class="src">Nguồn: ...</p>` after each code block.

## 13. State Management

Categorized (**VERIFIED** unless noted):

- **Persisted state (localStorage):** `hoc-android-tv:progress` (string[] of slugs),
  `hoc-android-tv:progress-migrated` (number), `hoc-android-tv:theme` ("dark"|"light"). That's all.
- **URL state:** none (no query params, no hash routing; TOC anchors are navigation only).
- **Server state:** none (static site).
- **Global client state:** none in memory; every consumer re-reads localStorage and re-paints on the
  `progress-changed` CustomEvent (home, layout, toggle, status chip each have their own listener).
- **Local/DOM state:** quiz form (radio selections, post-submit classes `correct`/`incorrect`, revealed
  `.explain`), search panel (hits, cursor), drawer (`body.rail-open`), TOC highlight (IntersectionObserver),
  copy-button flash.
- **Derived state (build time):** `lessonStats.ts` — headings, section count, code-block count, quiz
  question count, word count, minutes (200 wpm + 0.5 min/code block, rounded up to a multiple of 5),
  plus `COURSE_TOTALS`. These power cards, hero stats, TOC, and search index.
- **State transitions worth knowing:** `toggleDone(slug)` pushes/removes slug then writes the whole array;
  `migrateProgress()` runs lazily inside every `getDoneSlugs()` and expands old monolith slugs via
  `SPLIT_MAP` when `SCHEMA_VERSION` increases (progress.ts lines 57–77). Quiz state is lost on reload
  (documented as future work in plan §"Hướng mở rộng" #3).

## 14. Data Flow

```text
content/book/*.md (extracted EPUB)      aaf-materials/ (Android projects)
        │  read by the author-agent when writing lessons      │
        ▼                                                     ▼
web/src/components/lessons/Ch*.astro  (prose + template-literal code + citations)
        │  imported by
web/src/data/lessons.ts  (LESSONS: slug → { Lesson, Quiz })
        │  keyed by slug from
web/src/data/chapters.ts (SECTIONS → ALL_CHAPTERS; chapterFileKey()/chapterLabel()/groupChapters())
        │                                      │
        ▼                                      ▼
pages/chapters/[slug].astro (getStaticPaths + render)   data/lessonStats.ts (import.meta.glob ?raw
        │                                                over ALL lessons/*.astro → regex counts,
        ▼                                                headings, minutes, COURSE_TOTALS)
rendered HTML: lesson + quiz + TOC + stats + search-index JSON
        │  at runtime (vanilla JS)
lib/progress.ts ←→ localStorage ←→ ProgressToggle / BaseLayout rail / index dashboard
```

Content is **hard-coded in TypeScript/Astro components** (not MDX, not content collections, not JSON, not a
CMS). There are no parsers/adapters at runtime; the only "transformation" is the regex-based stat extraction
and the slug-migration map. **VERIFIED**.

## 15. Persistence

- `localStorage["hoc-android-tv:progress"]`: JSON array of completed slugs. Survives refresh and browser
  restart on the same browser profile; does **not** sync across devices/browsers; clearing site data wipes
  it. Corruption/privacy-blocked localStorage is swallowed by try/catch (page still renders, progress
  behaves as empty) — progress.ts lines 40–50, 74–76.
- Migration: `SCHEMA_VERSION = 4`; `SPLIT_MAP` maps 4 retired monolith slugs → their sub-slug lists
  (ch01→4, ch02→3, ch03→4, ch10→4). When a new split lands, the map gains an entry and the version bumps;
  learners' old checkmarks expand to all sub-chapters. **This contract must be honored for ch04–09/ch11
  splits** (not yet needed since those splits are unwired).
- Quiz results: **not persisted anywhere** (verified: no quiz-related key in any script).
- Theme: `hoc-android-tv:theme`, with OS-preference fallback.

## 16. Backend / APIs

**There is no backend.** No server endpoints, no server actions, no external API calls from the site, no
Supabase/Firebase/etc., no database clients. The only network-touching content is *educational*: Ch08
teaches Retrofit against spoonacular.com and shows the sample's placeholder API key
(`<Replace with API Key>`), with an explicit warning never to commit a real key. No environment variables
exist or are read (`import.meta.env` absent from `web/src`). **VERIFIED**.

## 17. Authentication

**None.** No login, no session, no protected routes. Progress is anonymous and local by explicit product
decision (homepage: "lưu ngay trên máy bạn, không cần đăng nhập"). **VERIFIED**.

## 18. Course Content Architecture

Three layers, all verified:

1. **Reference sources (read-only):** `content/book/ch*.md` (11 chapters, 41,918 words + 12 front/back
   matter files, extracted verbatim-ish from the EPUB) and `aaf-materials/` (11 chapters of Android Studio
   projects; two app lines: `com.kodeco.chat` for Ch05–07, `com.kodeco.recipefinder` for Ch08–11; AGP
   8.2.0 / Kotlin 1.9.10 pinned throughout; manual DI via `Application` + `CompositionLocalProvider`; only
   boilerplate tests). Both are gitignored. Cited inside lessons by path + line numbers (e.g. lesson
   frontmatter const `AAF = "aaf-materials/10-room-db/projects/final/.../recipefinder"`).
2. **Editorial contracts:** `docs/COURSE_CONTENT_STANDARD.md` (learner assumptions, mandatory lesson
   blocks: goals callout, mental model, code walkthrough, `#cam-bay`, `#nguon`, quiz standard 19 questions
   + 4 exercises incl. one interactive ordering widget) and `docs/CHAPTER_SPLIT_MAP.md` (naming contract:
   slug `ch<NN>-<sub>-<desc>`, file `Ch<NN>_<sub>Name.astro`, quiz suffix exactly `Quiz`, continuous
   section numbering across sub-chapters, SPLIT_MAP + SCHEMA_VERSION bump per split).
3. **Rendered content:** the 79 `.astro` lesson-family files. Live set = 22 lessons + 22 quizzes wired via
   `lessons.ts`. Orphan set = see §40.

Metadata duplication note: chapter display metadata exists only in `chapters.ts`; lesson-internal stats are
deliberately *derived* (lessonStats) rather than duplicated — a good architectural property worth
preserving during any rewrite.

## 19. Course Data Model

From `web/src/data/chapters.ts` (**VERIFIED**, types inline):

```ts
ChapterInfo {
  number: number        // major chapter number (10 for 10.1–10.4)
  subNumber?: number    // present when the major chapter has been split
  slug: string          // unique routable id, e.g. "ch10-2-entity-dao-database"
  title: string         // display title of this (sub)chapter
  parentTitle?: string  // major-chapter title when split
  summaryVi: string     // one-line Vietnamese summary
  aafFolder: string     // matching aaf-materials/ folder (shared by sub-chapters)
  hasProject: boolean   // chapter 1 = false (no real Android project)
}
SectionInfo { title: string /* "Section I: ..." */; chapters: ChapterInfo[] }
```

Helpers: `chapterFileKey()` → `"09"` or `"10_2"` (maps chapter → filename stem used by lessonStats);
`chapterLabel()` → `"10.2"` or `"9"`; `groupChapters()` → 1-level tree for the sidebar.

Registry (`lessons.ts`): `LESSONS: Partial<Record<string, { Lesson: AstroComponentFactory; Quiz:
AstroComponentFactory }>>` — `Partial` is intentional: unregistered slugs render the placeholder branch.

Stats model (`lessonStats.ts`): `LessonStats { headings: {id,text}[]; sections; codeBlocks;
quizQuestions; exercises; words; minutes }` keyed by slug; `COURSE_TOTALS` aggregates it.

Completion rules: a (sub)chapter is "done" iff its slug is in the localStorage array; there is no quiz-
gated completion. Ordering is array order in `SECTIONS` (prev/next derive from `ALL_CHAPTERS` index).

## 20. Full Curriculum Tree

Live tree (22 routable parts, matching `SECTIONS` order; quiz = live MCQ count verified by grep of
`data-answer=`):

```text
Section I — Introduction to Android Development
├─ 1  Welcome to Android & Kotlin (parentTitle; aaf 01-…, hasProject=false)
│   ├─ 1.1 ch01-1-android-va-kotlin          "Android là gì, chọn Kotlin, và security sandbox"   (quiz 9)
│   ├─ 1.2 ch01-2-app-component              "Bốn app component và cách chúng gọi nhau"          (quiz 10)
│   ├─ 1.3 ch01-3-manifest-resources         "App Manifest và App Resources"                     (quiz 11)
│   └─ 1.4 ch01-4-gradle-va-ban-do           "Gradle, bốn con số, và bản đồ khoá học"            (quiz 10)
├─ 2  Getting Started With Android Studio
│   ├─ 2.1 ch02-1-cai-dat-va-tao-project     cài Studio, tạo project                             (quiz 9)
│   ├─ 2.2 ch02-2-may-ao-may-that-doc-project AVD, máy thật, đọc project vừa sinh                (quiz 12)
│   └─ 2.3 ch02-3-chay-app-va-cap-nhat       Run, Live Edit, cập nhật công cụ                    (quiz 9)
├─ 3  Android Fundamentals
│   ├─ 3.1 ch03-1-activity-va-giao-dien      Activity/onCreate, dựng app chat                    (quiz 11)
│   ├─ 3.2 ch03-2-string-resource-va-debug   strings.xml, lớp R, lỗi biên dịch, breakpoint       (quiz 15)
│   ├─ 3.3 ch03-3-manifest-intent-permission Manifest/Intent/permission vs uses-permission       (quiz 11)
│   └─ 3.4 ch03-4-theme-va-doi-chieu         2 hệ theme, chuỗi việc khi bấm Send, đối chiếu      (quiz 10)
└─ 4  ch04-gradle-basics-a-look-behind-the-curtain (monolith, 15 mục)                            (quiz 19)
     Gradle, build type, Version Catalog, signing, secrets

Section II — Building a Robust Android App
├─ 5  ch05-jetpack-compose (monolith, 14 mục)        Composable, Layout Group, Modifier, Preview (quiz 10)
├─ 6  ch06-advanced-jetpack-compose (monolith, 20 mục) state/recomposition, hoisting, ViewModel, MVI (quiz 19)
├─ 7  ch07-advanced-architecture (monolith, 29 mục)  Repository pattern, Ditto SDK P2P sync       (quiz 19)
└─ 8  ch08-networking (monolith, 23 mục)             coroutine/Flow, Retrofit, Moshi, paging      (quiz 19)

Section III — Data Management
├─ 9  ch09-data-store (monolith, 18 mục)             SharedPreferences wrapper (Prefs), CompositionLocal (quiz 19)
├─ 10 Room Database
│   ├─ 10.1 ch10-1-vi-sao-can-database       SQLite vs DataStore, kiến trúc 5 lớp, Room+KSP      (quiz 7)
│   ├─ 10.2 ch10-2-entity-dao-database       @Entity/@Dao/@Database, compile-time SQL            (quiz 16)
│   ├─ 10.3 ch10-3-repository-viewmodel      Repository, 3 họ model, ViewModel, IO flow          (quiz 10)
│   └─ 10.4 ch10-4-giao-dien-va-cam-bay      bookmark UI, swipe xoá, cạm bẫy                     (quiz 8)
└─ 11 ch11-advanced-storage (monolith, 21 mục)      file storage map, SAF, Keystore, SecurePrefs, SQLCipher, backup (quiz 19)
```

Total live quiz questions: **282**. Planned end state per `docs/CHAPTER_SPLIT_MAP.md`: **42 lesson pages +
42 quizzes** (all 11 chapters split). Lesson body sizes (prose words, measured by the project itself during
Phase 5/7; approximate): Ch01 split ≈15.4k, Ch02 ≈22.2k, Ch03 ≈39k, Ch04 ≈9.5k, Ch05 ≈9.4k, Ch06 ≈10.4k,
Ch07 ≈13.6k, Ch08 ≈13.5k, Ch09 ≈9.2k, Ch10 (split) ≈14.6k as monolith pre-split, Ch11 ≈12.1k.

## 21. Module-by-Module Analysis

- **Module 1 (Section I, Ch01–04):** concepts/tools onboarding. No Android code line is *required* until
  Ch03; Ch01 has no real companion project (`hasProject: false`, verified `.keep`-only folders). Progression
  is "what Android is → install → first app → build system". Fully split into 14 pages; quizzes 9–15
  questions. Source: `content/book/ch01–04`, template projects in `aaf-materials/02–04`.
- **Module 2 (Section II, Ch05–08):** the "Kodeco Chat" app line (Ch05–07) then the switch to "Recipe
  Finder" (Ch08). Verified app-line facts (SOURCE_MAP §2): Ch05 = pure Compose UI + FakeData; Ch06 adds
  ViewModel/StateFlow/MVI + multi-room; Ch07 adds Repository pattern + Ditto SDK (local-first P2P
  sync, `live.ditto:ditto:4.5.0`) replacing a backend; Ch08 = coroutines/Flow + Retrofit/Moshi + Coil +
  navigation. Still monolith pages (longest: Ch07 with 29 sections).
- **Module 3 (Section III, Ch09–11):** persistence ladder for Recipe Finder: Ch09 SharedPreferences
  wrapper (`Prefs`, `LocalPrefsProvider`), Ch10 Room (entities/DAOs/database + repository + UI wiring +
  critical re-read), Ch11 storage locations/SAF/Keystore/EncryptedSharedPreferences/SQLCipher + backup trap
  + course-wide recap (Ch11_5-style content lives in the monolith today).

## 22. Lesson-by-Lesson Inventory

Compact table for all **live** lessons (#, lesson, core concepts, practice, source file). Practice column:
Q = MCQ quiz, E = exercises/challenges inside the quiz page.

| # | Lesson (slug key) | Core concepts | Practice | Source file (web/src/components/lessons/) |
|---|---|---|---|---|
| 1.1 | android-va-kotlin | Android stack scale, why Kotlin, security sandbox (2-way) | Q9+E | Ch01_1AndroidVaKotlin.astro |
| 1.2 | app-component | Activity/Service/ContentProvider/BroadcastReceiver, Intent, entry points | Q10+E | Ch01_2AppComponent.astro |
| 1.3 | manifest-resources | Manifest roles, resources, 3-tier string references | Q11+E | Ch01_3ManifestResources.astro |
| 1.4 | gradle-va-ban-do | Gradle build pipeline, 4 build files, version numbers, course map | Q10+E | Ch01_4GradleVaBanDo.astro |
| 2.1 | cai-dat-va-tao-project | Install Studio, project wizard fields & consequences | Q9+E | Ch02_1CaiDatVaTaoProject.astro |
| 2.2 | may-ao-may-that-doc-project | AVD, USB debugging, anatomy of a generated project | Q12+E | Ch02_2MayAoMayThatDocProject.astro |
| 2.3 | chay-app-va-cap-nhat | Run, Live Edit, IDE/SDK updates, 2023-pinned-book deltas | Q9+E | Ch02_3ChayAppVaCapNhat.astro |
| 3.1 | activity-va-giao-dien | Activity, onCreate lifecycle, replacing MainActivity for a chat app | Q11+E | Ch03_1ActivityVaGiaoDien.astro |
| 3.2 | string-resource-va-debug | strings.xml, R class, compile errors, breakpoints/Logcat | Q15+E | Ch03_2StringResourceVaDebug.astro |
| 3.3 | manifest-intent-permission | manifest/activity-tag, intent-filter, permission vs uses-permission, Service | Q11+E | Ch03_3ManifestIntentPermission.astro |
| 3.4 | theme-va-doi-chieu | 2 theme systems, unused theme fn, Send-button chain, 8 critical code readings | Q10+E | Ch03_4ThemeVaDoiChieu.astro |
| 4 | ch04-gradle-basics… | Gradle files map, android block, buildTypes, dependencies, Version Catalog, signing, secrets | Q19+E4 | Ch04GradleBasics.astro + Ch04Quiz.astro |
| 5 | ch05-jetpack-compose | @Composable, splitting composables, Column/Row/Box, Modifier chaining, LazyColumn, @Preview, theme/font | Q10+E | Ch05JetpackCompose.astro + Ch05Quiz.astro |
| 6 | ch06-advanced-jetpack-compose | state, recomposition, remember, hoisting, UDF/MVI, ViewModel, StateFlow, JumpToBottom | Q19+E4 | Ch06AdvancedJetpackCompose.astro + Ch06Quiz.astro |
| 7 | ch07-advanced-architecture | Repository interface/impl/singleton, Ditto init/permissions/keys.properties, live queries, write path, dead-code reading | Q19+E4 | Ch07AdvancedArchitecture.astro + Ch07Quiz.astro |
| 8 | ch08-networking | threads/coroutines/suspend, Flow collect, Retrofit interface, Moshi codegen, API key, paging, critical reading | Q19+E4 | Ch08Networking.astro + Ch08Quiz.astro |
| 9 | ch09-data-store | storage options, SharedPreferences, Prefs class, CompositionLocal, viewModelFactory, comma-bug reading, tab persistence | Q19+E4 | Ch09DataStore.astro + Ch09Quiz.astro |
| 10.1 | vi-sao-can-database | SQLite, DataStore vs DB boundary, 5-layer architecture, Room+KSP setup | Q7+E | Ch10_1RoomLaGi.astro + Ch10_1Quiz.astro |
| 10.2 | entity-dao-database | @Entity/@Dao/@Database, compile-time SQL checks, singleton + @Volatile | Q16+E3 | Ch10_2EntityDaoDatabase.astro + Ch10_2Quiz.astro |
| 10.3 | repository-viewmodel | Repository, 3 model families (Db/Ui/Network), ViewModel + IO flow | Q10+E | Ch10_3RepositoryViewModel.astro + Ch10_3Quiz.astro |
| 10.4 | giao-dien-va-cam-bay | bookmark UI, swipe-delete, two data sources, outdated-knowledge list | Q8+E | Ch10_4GiaoDienVaCamBay.astro + Ch10_4Quiz.astro |
| 11 | ch11-advanced-storage | filesDir/cache/external, SAF, Keystore, SecurePrefs, SQLCipher wiring, backup trap, course recap | Q19+E4 | Ch11AdvancedStorage.astro + Ch11Quiz.astro |

Unwired split files on disk (not reachable; see §40 for implications): `Ch04_1GradleVaCacFileCauHinh` (+ its
`Ch04_1Quiz`), `Ch04_2AndroidBlockVaDependencies`, `Ch04_3VersionCatalogVaBuildRelease` (current variant),
`Ch04_3VersionCatalogSigningSecrets` (stale variant), `Ch05_1–3`, `Ch06_1–4`, `Ch07_1–4`, `Ch08_1–4`,
`Ch09_1–4`, `Ch11_1–5`. The planned 42-page tree with per-file section budgets is fully specified in
`docs/CHAPTER_SPLIT_MAP.md`.

## 23. Concept Coverage Map

Grouped coverage (introduced → practiced → revisited), from lesson headings + quiz contents:

- **Android platform basics:** app components (1.2 intro; 1.3 manifest; 3.3 practiced; revisited 3.4),
  manifest/resources (1.3 → 3.2/3.3), Activity/lifecycle (3.1 → 3.4), debugging (3.2).
- **Build system:** Gradle files (1.4 primer → 4 deep), buildTypes/signing/secrets (4), Version Catalog (4).
- **Compose fundamentals:** composable functions (5), layout groups/Modifier/LazyColumn/Preview (5),
  theme/font (5); state/recomposition/hoisting/UDF (6).
- **Architecture:** ViewModel/StateFlow/MVI (6 → applied 7.3, 8, 10.3), Repository pattern (7 → 10.3),
  manual DI via CompositionLocal (9.3, cross-cutting), P2P sync via Ditto (7 only, never revisited).
- **Concurrency & networking:** coroutines/suspend/Dispatchers (8), Flow/StateFlow collect (6→8),
  Retrofit/Moshi/codegen/paging (8).
- **Persistence:** SharedPreferences (9), Room/Entity/DAO/Database/Repository (10), storage locations/SAF/
  Keystore/encryption (SQLCipher, EncryptedSharedPreferences)/backup (11).
- **Critical-reading / version-staleness:** recurring special sections ("Cạm bẫy & tài liệu lỗi thời",
  "Ghi chú phiên bản", "starter vs final", dead-code hunts) — 3.4, 4, 6.4, 7.4, 8.4, 9.4, 10.4, 11.4–11.5.
- **Gaps (taught nowhere):** Kotlin language primer (book assumes it; flagged in plan §"Hướng mở rộng" #5),
  testing Android apps, navigation-compose (used in Ch08 code but never taught), image loading (Coil used,
  not taught), accessibility in Android apps, adaptive layouts, WorkManager/services in depth (Service only
  surveyed in 1.2/3.3).

## 24. Curriculum Dependency Graph

Inferred teaching dependencies (all satisfied by the live order):

```text
Android platform map (1.x) → Studio (2.x) → Activity/UI basics (3.x) → Gradle (4)
Gradle (4) → Compose UI (5) → State/UDF (6) → ViewModel (6.2) → Repository (7.2)
Coroutines (8.1) → Retrofit/Flow (8.2–8.3) → persistence choice (9) → Room (10) → encryption (11)
```

**POSSIBLE ISSUE ( mild):** ViewModel (6.2) is taught before coroutines/Flow (8.1), yet `StateFlow` and
`viewModelScope` appear in Ch06 code — the standard handles this via forward-reference notes; Ch08 then
formalizes it. Also Compose `remember { mutableStateOf }` appears already in Ch03's starter app before the
Ch06 state lesson (the Ch03 lesson acknowledges the code preview; sequencing is book-faithful).

## 25. Learning Progression Analysis

- Verified progression design: strictly linear, `prev/next` derived from array order; each lesson's overview
  box names the previous lesson as prerequisite; `[slug].astro` "Trước khi vào chương" panel.
- Difficulty jumps: none unexplained found in live lessons — the book's own two-app structure (chat →
  recipe finder) creates one hard switch at Ch08 (new package, new domain) which the lessons explain
  ("mạch app mới").
- Internal-quality signals from the project's own measurements (`docs/PROJECT_PLAN.md`): all live lessons
  exceed the 12–22 min guideline (monolith Ch07 = 29 sections, ~13.6k words) — this is the explicit
  motivation for the split program.
- Known quiz-quality signals (documented by the project, not yet fixed): correct-answer-is-shortest bias
  (Ch03_4: 10/10; Ch03_3: 8/11; Ch03_1: 5/11) and for older Ch01 quizzes correct-answer-is-longest
  (Ch01_1: 7/9, Ch01_2: 9/10); Ch03_1Quiz never got an independent factcheck pass.

## 26. Code Example System

- **Storage:** inline in each lesson file's frontmatter as template-literal strings (`const recipeDaoCode =
  \`…\``), rendered via `<Code code={...} lang="kotlin" />` (Shiki). Some quizzes embed small snippets the
  same way.
- **Provenance discipline (verified in file comments + docs):** snippets quote real files from
  `aaf-materials/` with file path + line ranges in a source note; deliberate deviations (trimmed lines,
  translated comments) must be declared. Audits (plan Tasks 21–29) verified citations file-by-file and
  fixed ~20 citation/content errors.
- **Executable? No.** Snippets are illustrative excerpts of the companion projects; the learner is directed
  to open the real project. `aaf-materials/` itself is untouched (reference repo; rule: never edit it).
- **Consistency:** Kotlin style follows the book's projects (AGP 8.2.0-era); lessons flag where current
  tooling differs (version callouts). XML/TOML/Gradle snippets appear in Ch01–04.
- **Known risks:** monolith vs split duplication means a code correction must be applied in two places until
  the migration finishes; long snippets inside template literals were the source of past escaping bugs
  (plan Task 10: `${apiKey}` handling, backticks) — the pattern is fragile under automated rewrites.

## 27. Exercises

- Format: inside each quiz page — "bài tập" blocks (`.exercise`), sometimes challenge blocks (`.chal` in
  lesson body per stats regex), plus `<details>` self-check answers. One interactive ordering widget per
  full quiz (standard; confirmed in split quizzes' frontmatter comments).
- Validation: none automated for exercises (self-verified by instructions, e.g. "build and compare the
  compiler error"); quizzes are auto-scored. Exercises frequently direct the learner into the real
  `aaf-materials/` project (e.g. break a SQL query and observe the Room build error — Ch10_2 exercise).
- Balance: split chapters ≈ 19 questions + 4 exercises per major chapter; explanation-vs-practice is
  heavily explanation-weighted by design (depth-first book adaptation).

## 28. Quizzes

- **Placement:** a `ChNN[_sub]Quiz.astro` section directly after the lesson body on the same page.
- **Model:** `<fieldset data-answer="b">` per question; radio name `qN`; hidden `.explain` per question;
  optional score element `#quiz-score`. Scoring script (duplicated per file): on submit, reveal all
  explanations, mark correct/incorrect classes, print "Kết quả: X/N câu đúng".
- **Question counts (live, verified by grep):** see §20 tree; total **282**. Split-map targets 42 quizzes.
- **Tests:** recall + code-reading (e.g. "what does this DAO query return", "build-time or run-time
  error?"), some ordering widgets; no auto-graded coding.
- **Structural weaknesses (documented/observed, not rewritten):** answers are readable in page source
  (`data-answer` attribute) — acceptable for local self-study; answer-length bias (§25); quiz state not
  persisted; scoring script copy-pasted 22× instead of shared; per-plan note, one quiz (Ch03_1) lacks an
  independent factcheck pass.

## 29. Learner Progress Tracking

- What counts as completion: clicking "Đánh dấu đã học chương này" (ProgressToggle) — the only completion
  signal; no quiz-gating.
- When saved: immediately on click (`toggleDone` → `localStorage.setItem`).
- Percentage: `done/total` over **rendered** `.card` elements (home) or `nav a[data-slug]` (rail) — the code
  deliberately counts DOM nodes, not raw localStorage, to ignore stale slugs (index.astro lines 186–190).
- Hero vs dashboard counts: hero/labels count **11 major chapters**; cards/progress count **22 parts** —
  intentional and documented in comments (index.astro line 18–20, [slug].astro lines 24–26).
- Refresh/device survival: survives refresh; per-browser only; no auth tie-in.
- Course-update resilience: the SPLIT_MAP/SCHEMA_VERSION migration (§15) — genuinely thoughtful; the
  corresponding entries for ch04–09/ch11 splits are **not yet added** (correctly, since those splits are
  unwired; adding them without wiring would corrupt progress).

## 30. Design System

- 8 hand-written CSS files (~3.9k lines): `tokens.css` (custom properties), `base.css`, `shell.css`
  (topbar/rail/drawer), `dashboard.css` (home), `lesson.css` (~1,560 lines: lesson layout, callouts, code
  blocks), `quiz.css`, `icons.css`, `global.css` (imports). **VERIFIED** by `wc -l`.
- No Tailwind, no CSS-in-JS, no component library. Reusable patterns: `.chip`, `.callout` (+ `.goals`,
  `.note`, `.hint`), `.codeblock`, `.card`, `.lesson-stats`, `.overview-grid`, `.nav-card`.
- Theme: light+dark via `data-theme="dark"` + CSS custom properties; `color-scheme: light dark` meta;
  pre-paint script prevents flash.
- Typography: system font stack (no webfont packages); Vietnamese diacritics render natively.

## 31. Responsive Behavior

- Desktop-first lesson layout: `.lesson-layout` grid with content + right TOC rail; sidebar rail fixed on
  wide screens.
- Mobile: hamburger (`#menu-toggle`) opens the rail as a drawer with overlay; Escape closes and restores
  focus; tapping a link closes the drawer (BaseLayout script). Cards/stats wrap. The project's Phase-6 UI
  pass claims verification at 375/768/1440 widths (plan, Task 46). Code blocks scroll horizontally; copy
  buttons aid mobile reading. No device-specific JS beyond the drawer.

## 32. Accessibility Implementation

Evidence-visible practices (**VERIFIED** in markup/scripts): skip-link to `#main`; `lang="vi"`;
`aria-label` on icon buttons; `aria-expanded`/`aria-pressed`; search combobox semantics (`role="combobox"`,
`aria-autocomplete`, `aria-controls`, `role="listbox"/"option"`, `aria-activedescendant`, keyboard ↑↓/Enter/
Escape); `aria-current="page"` on the active sidebar link; `aria-hidden` on decorative SVGs; visible focus
management on drawer close; semantic `<nav>/<main>/<article>/<fieldset>/<legend>`. Contrast is handled by
token-based theming (not individually audited here). No ARIA violations spotted in sampled markup.

## 33. Build System

| Command | Script | Notes |
|---|---|---|
| `npm run dev` | `astro dev` | local dev, port 4321 (auto-increments) |
| `npm run build` | `astro build` | static build; verified exit 0, 23 pages, ~7s |
| `npm run preview` | `astro preview` | serve dist |
| `npx astro check` | — | TS/astro diagnostics; verified 0 errors / 0 warnings / 64 hints (pre-existing) |
| tests / lint / format / typecheck scripts | — | **do not exist** |

Config files: `web/tsconfig.json` (strict, excludes dist); **no `astro.config.*`** (all defaults; Shiki
default theme; no markdown config needed since content isn't Markdown-rendered). Node engine `>=22.12.0`
(plan notes actual v22.23.2 via nvm-windows, with a second system Node also on PATH — a known env quirk).

## 34. Deployment

**None / intentionally local-only.** No hosting config, no adapter, no CI. Root `.gitignore` excludes the
EPUB, `content/book/`, and `aaf-materials/` — i.e., a public deploy would both lack sources and violate
licenses (plan: "Không nên làm nếu không có lý do rõ: đăng website lên internet (vướng bản quyền)"). Status:
**VERIFIED (absence)**.

## 35. Environment Configuration

No environment variables are read anywhere in `web/src` (no `import.meta.env`, no `process.env`). Required:
Node ≥ 22.12 + npm. Optional: none. Secrets: none in the site; the book's sample API key placeholder lives
inside lesson content only. **VERIFIED**.

## 36. Testing

**No tests of any kind exist** for the web app (no unit, no E2E, no content tests; no test runner). The
project's own "testing" has been manual smoke-test checklists recorded in `docs/PROJECT_PLAN.md` (route
200s, string presence, regression checks) plus `astro check`/`astro build`. The companion Android projects
contain only Android Studio boilerplate tests. Content correctness was addressed by the citation-audit
tasks (21–29) rather than automated checks. `Unknown / Not Verified`: whether any hidden test tooling
exists in `web/scripts/` scratch files (they are one-off audit scripts, not a suite).

## 37. Error Handling

- Unknown route → Astro default 404 (no custom page).
- Unregistered slug → placeholder branch "Nội dung chi tiết cho chương này đang được biên soạn" (defensive;
  currently unreachable).
- localStorage failures → try/catch everywhere, degrade to "no progress" / default theme.
- Clipboard API blocked (e.g. `file://`) → fallback to hidden-textarea `execCommand`, then no-op.
- Quiz form: null-safe element access throughout; missing answer = counted incorrect.
- Search: empty results message; panel closes on outside click/Escape.
- Build-time: `lessonStats` regexes tolerate missing files (buckets simply empty → zero stats); the stats
  pipeline itself has no error surface.
- No global error boundary/monitoring (static site; nothing to monitor).

## 38. Technical Debt

| Issue | Evidence | Severity |
|---|---|---|
| Dual-generation lesson corpus: 7 live monoliths + 27 unwired split files describe the same chapters; edits can land in the wrong generation | §40; file listing; 56,002 lines | **High** |
| 6 orphaned monolith files (Ch01/02/03 pairs) still globbed by lessonStats and shipped into the build bundle as raw strings | `lessonStats.ts` glob; plan flags it as "CÒN TỒN — cần user quyết (xoá file phải hỏi trước)" | **High** (waste + confusion; deletion explicitly gated on user approval) |
| ~116 dot-scratch files in `web/` root + 289 files in `web/scripts/` + `grep.exe.stackdump`, `content-baseline.txt` (keeper per plan) | ls counts; plan "File scratch chưa được .gitignore che" | **High** (repo hygiene; risk of committing) |
| Quiz scoring script duplicated in 22 quiz files; copy-paste drift risk | identical `<script>` blocks | Medium |
| No `astro.config`, no lint/format, no CI, no tests | package.json, repo tree | Medium |
| 64 pre-existing `astro check` hints | check output | Low |
| Filename contract (`Ch(\d{2})(_N)?Name.astro`) silently drives stats grouping & TOC — a misnamed file (quiz without exact `Quiz` suffix) becomes a "lesson" | lessonStats regex + split-map rule table | Medium (documented, but unenforced) |
| README says "11 chapter" while site has 22 parts; `web/AGENTS.md`, `web/CLAUDE.md` are Astro starter boilerplate | files | Low |
| `HelloWorld.astro` dead component | 4-line file, no imports | Low |
| Windows-pinned native bindings inside `dependencies` | package.json | Low (intentional workaround, but non-portable) |
| Git: entire post-08-28 effort uncommitted (~236 paths); only 2 commits | git status/log | **High** (data-loss risk) |

## 39. Vibe-Coding Artifacts

This repo is explicitly AI-co-built (root CLAUDE.md; plan language). Evidence-backed artifacts of that
workflow, beyond §38: 289 one-off scripts in `web/scripts/` named `_a*.py`, `_t48_*.py`, `measure123.py`,
`revscan.py`, etc.; ~116 `web/.*.txt` dumps (`.rev31_book.txt`, `.styledump.css`, `.uibaseline-*`,
`.ch03crit/`…); two competing `Ch04_3*` lesson variants from iterative rewrites; frontmatter comments that
narrate agent workflow ("cả 2 agent phân cho nó đều chết (1 lỗi 429, 1 stall)") inside
`docs/PROJECT_PLAN.md`; repeated self-corrections of the plan file itself (the plan documents three
separate incidents of plan-vs-disk drift); `.claude/skills/` containing three cloned skill repos with their
own `.git` dirs. None of these affect runtime; all inflate the working tree.

## 40. Dead / Duplicate / Legacy Code

**VERIFIED inventory:**

1. **Orphaned monoliths (superseded by wired split chapters):** `Ch01WelcomeToAndroidKotlin.astro`,
   `Ch01Quiz.astro`, `Ch02GettingStartedAndroidStudio.astro`, `Ch02Quiz.astro`,
   `Ch03AndroidFundamentals.astro`, `Ch03Quiz.astro`. Not imported by `lessons.ts`; still counted by
   lessonStats under bucket keys "01"/"02"/"03" that no chapter slug uses. Deletion is pending user
   approval per project rule (plan: "xoá file phải hỏi trước").
2. **Unwired next-generation splits (written, not registered):** `Ch04_1GradleVaCacFileCauHinh.astro` +
   `Ch04_1Quiz.astro`, `Ch04_2AndroidBlockVaDependencies.astro`,
   `Ch04_3VersionCatalogVaBuildRelease.astro` (newer, 09-01, standard-compliant with `#cam-bay`/`#nguon`),
   `Ch05_1–3`, `Ch06_1–4`, `Ch07_1–4`, `Ch08_1–4`, `Ch09_1–4`, `Ch11_1–5` (all 08-31; **mechanical
   splits** of the monoliths — heading ids match the monoliths exactly, and they **lack** the standard's
   `#cam-bay`/`#nguon` blocks and have **no quizzes**). These look like a first-pass bulk split that was
   superseded by the "rewrite-then-wire" approach proven on Ch04.
3. **Stale duplicate:** `Ch04_3VersionCatalogSigningSecrets.astro` (08-31) vs
   `Ch04_3VersionCatalogVaBuildRelease.astro` (09-01) — two different lessons claiming the same 4.3 slot;
   the same `Ch04_3` bucket receives whichever matches last in glob order (actually both get concatenated
   into stats counting for bucket "04_3", inflating its numbers).
4. **Deleted-but-uncommitted:** `Ch10RoomDatabase.astro`, `Ch10Quiz.astro` (git status `D`) — correct per
   Task 47 (split supersedes monolith).
5. **Dead demo component:** `HelloWorld.astro`.
6. **Registry absence is the single switch** that makes 2–4 invisible: wiring `lessons.ts` + `chapters.ts`
   (+ SPLIT_MAP entries) is all that separates the unwired corpus from going live.

## 41. TODO / FIXME Inventory

No engineering TODO/FIXME/HACK markers exist in product code. All grep hits are **educational content**:
Kotlin `TODO("Not yet implemented")` snippets and `// TODO` comments quoted from the book's projects
(Ch05_2 teaches `TODO()` semantics as a topic; Ch09_2 shows the starter's TODO stubs; Ch01_3 discusses a
backup-rules XML `TODO`). Scratch scripts were not exhaustively scanned (non-product). **VERIFIED**.

## 42. Content Consistency Issues

- **Voice standard vs older content:** the standard bans "sách nói…" phrasing outside the `#nguon` block;
  wired split chapters measure 0 hits, but live monoliths Ch04–09/Ch11 still contain 40–97 "sách"-voice
  hits each (measured by the project, plan table 2026-08-31) and keep per-code-block `<p class="src">`
  notes instead of a single `#nguon` block. Monoliths are therefore *pre-standard* artifacts.
- **Terminology:** "Chương" vs "chapter" — 2 known mixed-language spots in the orphaned Ch01 monolith
  (lines ~1449–1466, plan item); wired splits use "Chương N.M" consistently.
- **Citation style differs by generation:** monoliths annotate every code block (`p.src`); splits centralize
  into `#nguon`. Both conventions coexist on the live site today (split Ch01–03/10 vs monolith Ch04–09/11).
- **Quiz intro copy** varies (question counts, explanation prompts) but structurally consistent.
- Section numbering across sub-chapters is continuous per the split contract (verified in Ch10 headings).

## 43. Curriculum Consistency Issues

- The **42-page target tree** (`CHAPTER_SPLIT_MAP.md`) vs **22-page live tree** — course temporarily
  has uneven granularity (Ch03 = 4 pages of ~10k words each vs Ch07 = 1 page of ~13.6k words).
- Sub-chapter quizzes for Ch04 (2.2/2.3-style) don't exist yet even on disk (only Ch04_1Quiz) — if wiring
  happened today, 4.2/4.3 would have no quiz.
- `docs/PROJECT_PLAN.md` under-reports disk state (says paused after Ch01–03; disk has Ch04–09/Ch11
  splits). The plan acknowledges this class of drift but the specific rows are stale as of 2026-09-01.

## 44. Potential Sequencing Problems

- Ch06 uses `StateFlow`/`viewModelScope` before Ch08's coroutine/Flow lesson (mitigated by forward-reference
  notes; book-faithful order).
- Ch03's starter code uses `remember { mutableStateOf }` (Compose state) ~3 chapters before state is
  taught; the lesson frames it as "read this, explanation comes in Ch05/06".
- Ditto SDK (Ch07) is a one-off third-party deep-dive mid-course; never revisited; heavier than typical
  beginner material (inherited from the book).
- No verified case of concept B being required before its prerequisite A is *unavailable* — the standard's
  prereq discipline is enforced in wired split chapters.

## 45. Potential Content Gaps

- Kotlin syntax primer (flagged by project as idea #5).
- Navigation-Compose, Coil, paging UI — used in companion code, not taught.
- Android testing, app release flow beyond signing basics (Ch4 covers signing; publishing not covered —
  matches book scope).
- Images/figures from the book are not extracted (`scripts/extract_epub.py` inserts only relative links;
  plan tracks this as a known gap).
- An aggregated "book vs current Android" reference page (project idea #4).

## 46. Topics Requiring External Freshness Verification

The project already did targeted verification (plan Tasks 22–29, `SOURCE_MAP` §3) — items below are the
consolidated list; "last verified" dates are the project's, not re-verified in this audit:

- Kotlin 1.9.10 → current 2.4.x (verified 2026-08); `composeOptions.kotlinCompilerExtensionVersion` removal
  with Kotlin 2.0 (verified in Ch05 audit).
- AGP 8.2.0 → 9.2/9.3 (verified 2026-08-26/27).
- Room 2.5.2 → 2.8.4 / androidx.room3 3.0.x stable (verified 2026-08-27 in Ch10 audit).
- androidx.security-crypto deprecated (1.1.0 stable final 2025-07-30) (verified 2026-08-27, Ch11 audit).
- `net.zetetic:android-database-sqlcipher` → `net.zetetic:sqlcipher-android` (verified 2026-08-27).
- Retrofit 2.9.0 → 3.0.0; Moshi 1.15.x; Timber 5.0.1 (verified 2026-08-27, Ch08 audit).
- LiveData "replaced by StateFlow" nuance (LiveData not deprecated) (verified 2026-08-27).
- Ditto SDK 4.5.0 currency — **UNKNOWN / stale check needed** (no verification recorded in docs).
- Android Studio UI flows (Ch02) — book pins 2023 UI; lesson flags it; periodic re-check needed.

## 47. Technical Risks

1. **Uncommitted work:** ~3 weeks of product changes exist only in the working tree (2 commits total).
   Disk failure = total loss. (Mitigation is trivial: commit; deletion of scratch files needs user approval
   per project rules, committing does not.)
2. **Half-finished migration:** wiring mistakes during Task-48 resumption are the most likely future bug
   source (four files must change in lockstep: lessons.ts, chapters.ts, progress.ts SPLIT_MAP+version,
   plus per-file naming).
3. **Bundle/stats pollution** from orphan files (build-time raw inlining of all 79 lesson files, including
   orphans, into lessonStats' glob).
4. **Single-machine portability:** Windows-pinned native bindings; Node version quirk (two Node installs).
5. **No tests/CI:** regressions rely on manual smoke lists in the plan.

## 48. Educational Risks

1. Quiz answer-pattern bias makes some quizzes guessable (documented; unfixed).
2. Monolith lessons exceed the course's own cognitive-load guidelines until splits land.
3. Unwired Ch05–11 splits omit mandatory pedagogy blocks; if someone "finishes" Task 48 by merely wiring
   them, quality would regress against the standard.
4. Learner progress is device-local; a browser data wipe loses it (accepted; quiz scores are lost even on
   reload).
5. Content correctness depends on citation discipline; one wired quiz (Ch03_1) is known-unfactchecked.

## 49. Documentation vs Implementation

| Doc claim | Reality | Status |
|---|---|---|
| `README.md`: "Trang chủ liệt kê 11 chapter" | Home lists 11 chapter groups but 22 part cards; hero counts 11, progress counts 22 | Stale wording (low stakes, counts intentional in code) |
| `docs/PROJECT_PLAN.md` (2026-08-31): Task 48 paused after Ch01–03; "Còn lại Ch04–Ch09 + Ch11" | Split lesson files for Ch04–09 + Ch11 exist on disk (08-31/09-01), Ch04 nearly complete with 1 quiz; nothing wired | **Stale — disk is ahead of plan** |
| `docs/CHAPTER_SPLIT_MAP.md`: "Đã tách: Ch01, 02, 03, 10 = 15 trang; 22 route thật" | Same stale row as plan (files for 27 more pages exist) | Stale |
| Root `CLAUDE.md`: source-of-truth ordering, depth rules, no-confirm workflow | Consistent with observed file structure; its "22 route thật" claim matches wired reality | Accurate (as of its last edit) |
| `web/CLAUDE.md` / `web/AGENTS.md` | Generic Astro starter notes, explicitly *not* project description (root CLAUDE.md says so) | Accurate-but-boilerplate |
| `docs/SOURCE_MAP.md` book/EPUB/license facts | Consistent with `content/book/` + `aaf-materials/` layout | Accurate |
| Monolith frontmatter comments ("viết lại ở Task 35/37") | Match plan phase-5 history | Accurate |

## 50. Files Another AI Should Read First

| Priority | File | Why |
|---|---|---|
| 1 | `docs/PROJECT_PLAN.md` | current phase, task state, all locked decisions (incl. #7 copyright), known issues |
| 2 | `web/src/data/chapters.ts` | syllabus model + grouping/filename helpers; the shape of every route |
| 3 | `web/src/data/lessons.ts` | registry: which components actually render; the wiring point for Task 48 |
| 4 | `docs/CHAPTER_SPLIT_MAP.md` | naming/wiring contract for all 42 target pages; per-file section budgets |
| 5 | `docs/COURSE_CONTENT_STANDARD.md` | editorial law: learner assumptions, mandatory blocks, voice rules |
| 6 | `web/src/lib/progress.ts` | localStorage schema + SPLIT_MAP/SCHEMA_VERSION migration mechanics |
| 7 | `web/src/data/lessonStats.ts` | build-time derived stats; the filename regex contract; COURSE_TOTALS |
| 8 | `web/src/pages/chapters/[slug].astro` | lesson page composition, placeholder fallback, TOC/status scripts |
| 9 | `web/src/layouts/BaseLayout.astro` | global chrome, search index generation, drawer/theme/progress wiring |
| 10 | `web/src/pages/index.astro` | dashboard, DOM-based progress counting, resume logic |
| 11 | `web/src/components/lessons/Ch10_2EntityDaoDatabase.astro` | gold-standard split lesson (structure, citations, callouts) |
| 12 | `web/src/components/lessons/Ch04_3VersionCatalogVaBuildRelease.astro` | newest-generation split (standard-compliant) vs its stale sibling — understand before wiring Ch04 |
| 13 | `CLAUDE.md` (root) | agent workflow rules the owner enforces (no-confirm, self-review, vault update) |
| 14 | `docs/SOURCE_MAP.md` | book metadata, app-line architecture, license conflict details |
| 15 | `web/src/components/CodeEnhance.astro` + `ProgressToggle.astro` | the two shared client behaviors; event contract `progress-changed` |

## 51. Known Unknowns

- Whether Task 48 should resume, and whether the unwired Ch05–11 mechanical splits should be completed to
  standard or discarded in favor of rewrite-then-wire (the Ch04 approach). **User decision.**
- Whether deleting the 6 orphaned monoliths + stale Ch04_3 variant + ~450 scratch files is approved
  (project rule requires asking first). **User decision.**
- Intended fate of the site: strictly personal-local forever, or eventual (license-safe) publication.
- Whether quiz-score persistence and the aggregated "book vs now" page (project ideas #3/#4) will be built.
- Exact learner profile beyond the documented assumptions (age, prior exposure) — **UNKNOWN**.
- No data on real learner behavior/analytics (none collected by design).

## 52. Key Conclusions

- This is a well-documented, deliberately-scoped, single-maintainer static learning site: Astro + vanilla
  JS, content as Astro components, registry-driven routing, localStorage progress with a real migration
  mechanism, and unusually disciplined editorial/docs practices.
- The single most important fact for any future work: **the repo is mid-migration with two coexisting
  content generations.** 22 wired pages (builds clean) + 28 unwired next-gen files + 7 orphaned old-gen
  files. Any edit to a Ch04–09/Ch11 lesson must first decide which generation it targets.
- The second most important fact: **the working tree is uncommitted** (2 commits, ~236 dirty paths) and
  full of scratch artifacts — commit hygiene is the cheapest high-value fix (respecting the project's
  ask-before-delete rule for file removal).
- Curriculum-wise, the course is book-faithful, linear, and depth-first; known weaknesses are quiz
  guessability, over-long monolith chapters (being fixed by the split program), tool-version staleness
  (mitigated by in-lesson callouts), and a few known-unfactchecked quiz items.
- There is no backend, no auth, no env, no tests, no deployment — all by explicit design, not oversight;
  the license constraints (book text + `aaf-materials` pedagogical clause) are the binding reason the site
  must stay local, and any future AI must not "helpfully" publish it.
