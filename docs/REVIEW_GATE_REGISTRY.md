# REVIEW_GATE_REGISTRY

**Gate:** closes the registry/data-model foundation (IMP-010 → IMP-016) before the first real route migration (Ch10 pilot).
**Verified:** 2026-09-06 @ commit `5a8e5a4` + gate fix commit (this one). Evidence below is mechanical (parsed from source/built `dist/`), not narrative.

## Commits covered
IMP-010 → IMP-016: `d81aacf` (stage metadata) · `482561c` (sidebar stages) · `3a217d9` (TARGET_REGISTRY_v5) · `4897669` (progress policy) · `7cbb14a` (redirect strategy) · `a310266` (template kit) · `5a8e5a4` (registry-driven stats) · gate fix: remove unused `STAGES` import (IMP-011 regression, hint 66→65).

## Registry
- current live: **22** lessons (23 pages built) — all preserved slugs identical to pre-redesign set
- target: **48** units (TARGET_REGISTRY_v5 = 48 rows, unique lessonId/slug/component)
- core/optional/appendix: **39 / 6 / 3** (quiz-bearing 45)
- stage counts: foundation 2 · android 14 · compose 5 · state 5 · navigation 2 · network 3 · data 6 · realworld 2 · optional 6 · appendix 3
- URL preserved/dead: **14 preserved** (13×1:1 + ch02-2 lives as A6) / **8 dead** — the plan's "15/22" prose is recorded as stale arithmetic (correction log #18 already flagged it); TARGET_REGISTRY_v5 is authoritative

## Stage/sidebar
- StageId: exact 10 values implemented; STAGES order 1–10 monotonic; all 22 chapters carry valid stageId; Ch07=`optional`, Ch11=`realworld`
- current grouping: android 12 · compose 1 · state 1 · network 1 · data 5 · realworld 1 · Mở rộng 1 — empty stages (foundation/navigation/appendix) render nothing, no placeholders
- optional behavior: Ch07 only under "Mở rộng", collapsed by default, auto-opens on its page (verified in dist), active + `aria-current` correct on all sampled pages; progress hooks (`data-slug`/`mod-done`/`data-mod`) and mobile drawer/skip-link markup unchanged
- sidebar lesson count: 22 distinct nav links (homepage course cards reuse `data-slug` by design — not duplicates)

## Progress
- schema: **SCHEMA_VERSION = 4** (unchanged); active SPLIT_MAP = 4 historical entries only (ch01/ch02/ch03/ch10 monolith splits) — no v5 rule active
- no-fabricate: F1, F2, C5, S1, S5, N1, N2, O2–O6, AP1–AP3 documented as never-auto-done; S5 explicitly excluded from ch10-1 credit (registry §8 line 1: "S5 … **no** legacy completion, ever" — verified verbatim)
- keep-source support: mechanism re-proven (dead split `old→[c1,c2]` and keep-source `old→[old,child]` both dedupe, idempotent, preserve unrelated); atomic contract (mapping + version bump + redirect + credit verify in same batch) documented in progress.ts header; authority pointer to TARGET_REGISTRY_v5 present

## Redirect
- mechanism: Astro config `redirects` ← `COURSE_REDIRECTS` in `web/astro.config.mjs` (static output = meta-refresh HTML pages, proven at IMP-014 with a since-removed probe; no HTTP 301/302 claimed)
- active redirects: **0** (map empty; no synthetic probe remains)

## Template
- files: `docs/LESSON_TEMPLATE.md` + `web/src/components/lessons/_TEMPLATE.astro`
- stats-safe: `_TEMPLATE` not matched by stats filename pattern and not in `lessons.ts` — zero stats/route effect
- quality policy: "Không cắt vì dài…" present in both files; `minutes` informational; **no** 30-min PASS/FAIL gate; used-before-taught A/B/C/D guidance, independent-Vietnamese-voice rules, provenance/`#nguon` rules all present; one canonical `#cam-bay` + one `#nguon` in the template body (other occurrences are instructional comments)

## Stats
- membership source: registry (`ALL_CHAPTERS` + `LESSONS` cross-check) — glob is raw loader only; build-time integrity validation fails loudly on missing/ambiguous live sources
- live records: 22 (registry slugs == LESSONS slugs == stats slugs == dist routes)
- orphan/dormant excluded: 36 files (4 orphan quizzes: Ch01Quiz, Ch02Quiz, Ch03Quiz, Ch04_1Quiz · 3 dormant shells · ~28 dormant split drafts · 1 template) — all zero-effect, none deleted (later batches own cleanup)
- COURSE_TOTALS: 11 chương / 261 mục / 345 code / 282 câu hỏi / 65 bài tập — unchanged vs pre-refactor baseline (proven by stash→build→compare)
- stage metadata: `stageId`/`stagePosition`/`stageTotal` computed from registry (Ch07 = optional 1/1 naturally); not rendered anywhere yet (IMP-081)
- no-quiz path: empty quiz body → 0 questions, no throw (future AP-ready)

## Stale docs deferred (recorded, not edited)
1. spec v2 "30-min hard cap" wording (§3/§12/§17/§21/§25) — superseded by quality-first owner rule
2. "15/22 URLs preserved" arithmetic anywhere it survives — locked truth is 14/22 + 8 dead
3. `PROJECT_PLAN.md` frozen at 2026-08-31 Task-48 state
4. `CHAPTER_SPLIT_MAP.md` pre-spec-v2 naming contract (superseded by TARGET_REGISTRY_v5)
5. `chapters.ts` ch10-1 summaryVi "kiến trúc 5 lớp" (S5's two-region doctrine is the accepted owner)

## Verification
- build: PASS — 23 pages, 22 lesson routes
- astro check: 0 errors, 0 warnings, **65 hints** (all pre-existing: scratch scripts, dormant drafts, template guard; the IMP-011 `STAGES` hint is fixed in this gate)
- visual sanity (dist markup): Ch01 / Ch10-2 / Ch07 / Ch11 — stage groups = 7, correct active item, Mở rộng opens only on Ch07, skip-link + drawer button present; mobile shares the same `details`/drawer markup (Escape/overlay/click-to-close handlers untouched)
- working tree: clean

## Gate verdict

**REVIEW_GATE_REGISTRY_PASS** — IMP-010…016 work together as one coherent foundation; the site is in the exact pre-pilot state (22 routes, schema v4, empty redirects, no-fabricate policy armed).
