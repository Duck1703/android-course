# REVIEW_GATE_PILOT

**Gate:** closes the Ch10 pilot (IMP-020 route/progress migration + IMP-021 quiz pilot) before batch migration of the remaining 8 dead-slug / split units begins.
**Verified:** 2026-09-07 @ commit `66377fb` (IMP-021) on top of `c157f77` (IMP-020 redirect fix). Evidence below is mechanical (parsed from source, `dist/`, and browser/runtime probes), not narrative. Verdict: **GATE PASS — 0 BLOCKER, 0 MAJOR.**

## Scope

| Commit | Nội dung |
|---|---|
| `713084d` | IMP-020: R1 route migration (`ch10-room-la-gi-va-sqlite`), progress schema v5, SPLIT_MAP + redirect wiring |
| `c157f77` | IMP-020 fix: redirect key scoped under `chapters/` (correct `/chapters/` path) |
| `66377fb` | IMP-021: rebalance 4 Room quiz files (this gate's second half) |

## Route migration

- Old R1: `ch10-1-vi-sao-can-database` → retired. New R1: `ch10-room-la-gi-va-sqlite`.
- R2/R3/R4 URLs unchanged: `ch10-2-entity-dao-database`, `ch10-3-repository-viewmodel`, `ch10-4-giao-dien-va-cam-bay`.
- Live lesson routes: **22** in `lessons.ts` (grep count `":` = 22) == `ALL_CHAPTERS` 22 == `dist/chapters/` 22 lesson dirs (+ 1 redirect dir = 23 pages built).

## Progress migration

- `SCHEMA_VERSION = 5` (`web/src/lib/progress.ts:52`).
- Active `SPLIT_MAP` = 5 entries: ch01/ch02/ch03 monolith splits, `ch10-room-database` → [old R1, R2, R3, R4], and `"ch10-1-vi-sao-can-database": ["ch10-room-la-gi-va-sqlite"]` (progress.ts:92).
- Simulations run against the verbatim migration code (fixed-point loop, progress.ts:129–147), all PASS:
  - **A** v4 old-R1 done → new R1 done.
  - **B** historical monolith done → all four R1–R4 (multi-pass chain: monolith → old R1 → new R1 in one run).
  - **C** mixed legacy + current → deduped (Set), no duplicates.
  - **D** re-run with MIGRATION_KEY ≥ 5 → early return, storage untouched (idempotent).
  - **E** corrupt storage (`"{not json"`, `null`, non-array) → `[]`, no crash, no version inversion.
  - **F** unknown slugs (incl. S5) pass through byte-identical — migration only rewrites keys present in SPLIT_MAP; S5 credit **never fabricated**.
  - **G** keep-source fan-out (`old → [old, child]`) remains supported (union + dedup + fixed-point termination).

## Redirect

- Source: `/chapters/ch10-1-vi-sao-can-database/` → target `/chapters/ch10-room-la-gi-va-sqlite/` (`web/astro.config.mjs:22–25`; exactly 1 entry, correctly namespaced under `chapters/` — the root-level path does NOT exist in dist).
- Artifact `dist/chapters/ch10-1-vi-sao-can-database/index.html` (quoted verbatim):
  ```
  <!doctype html><title>Redirecting to: /chapters/ch10-room-la-gi-va-sqlite/</title><meta http-equiv="refresh" content="0;url=/chapters/ch10-room-la-gi-va-sqlite/"><meta name="robots" content="noindex"><link rel="canonical" href="/chapters/ch10-room-la-gi-va-sqlite/"><body>	<a href="…">Redirecting from … to …</a></body>
  ```
- Static semantics: **meta-refresh HTML page, not HTTP 301/302** (static output). noindex + canonical present. Browser probe followed it to the live R1 page — no redirect loop.

## Quiz pilot (per file)

Measured by a temporary parse-based audit script (removed before commit) + adversarial re-read of every question:

| Quiz | Câu | Vị trí a/b/c/d | Rank độ dài (1=ngắn…4=dài) | Max rank share | Harness |
|---|---|---|---|---|---|
| R1 `Ch10_1Quiz.astro` | 8 (was 7, 3-option) | 2/2/2/2 | 0/2/3/3 | 37.5% | shared ✓ (mới) |
| R2 `Ch10_2Quiz.astro` | 12 (was 16) | 3/3/3/3 | 1/4/4/3 | 33% | shared ✓ (đã có từ IMP-001) |
| R3 `Ch10_3Quiz.astro` | 10 | 3/2/3/2 | 2/2/3/3 | 30% | shared ✓ (mới; bài sắp thứ tự giữ grader riêng ngoài form) |
| R4 `Ch10_4Quiz.astro` | 8 | 2/2/2/2 | 1/1/3/3 | 37.5% | shared ✓ (mới) |

- Exactly 4 options/question (a–d), exactly 1 correct (verified per-question by independent text reading), unique radio names, one `p.explain` per fieldset, 100% explanation coverage addressing each plausible distractor's misconception.
- R1: old Q3/Q4/Q5 (S5 "5 lớp" doctrine) fully replaced — zero `5 lớp`/`giao tiếp một chiều` strings remain in questions or explanations; new set tests the actual R1 job (Room on top of SQLite, DataStore-vs-DB by question shape, ksp/implementation, parcelize, entity/DAO/RoomDatabase recognition).
- R2: 16→12 cut (redundant recall + one điểm-lệch-framed question kept deliberately); mandatory themes all covered: suspend ≠ auto-IO (Q8), compile-time validation scope (Q9), bound params vs interpolation (Q5), schema ≠ app version (Q10), @Delete/@Update PK identity (Q6), singleton semantics (Q11–Q12).
- R3: Q6 reworded to the lesson's actual framing (suspend doesn't pick a thread; one layer decides — here the ViewModel; repository deliberately doesn't wrap; not a Room requirement); Q8/Q9 replaced with ViewModel-role and repo-not-automatically-SSOT questions.
- R4: 8 questions kept, expanded 3→4 options with real-misconception 4th distractors; Q8 explanation now routes migration content to **bài mở rộng O5** (not "Chương 11" — matches lesson mục 23).
- Correctness verdict: adversarial review (AGENT 10) found **0 BLOCKER / 0 MAJOR**; all 38 answer keys independently confirmed lesson-supported; known MINOR polish (length-cue >1.5× in 6 questions) documented, within the ≤40% rank gate.

## UX / accessibility

Browser (in-app Chromium) probes against `npx serve dist`, all verified mechanically:
- **INITIAL:** score hidden/empty, retry hidden, all explains hidden, no stale feedback.
- **SUBMIT (R1):** 1-correct/1-wrong sample → score `Kết quả: 1/8 câu đúng.` unhidden with `role="status" aria-live="polite"`, `scrollIntoView`, fieldsets tinted `.correct`/`.incorrect`, all 8 explains revealed, retry becomes visible.
- **RETRY (R1 + R2 full 12/12 cycle):** native confirm gate; on accept — radios cleared, explains re-hidden, classes removed, score cleared+hidden, retry re-hidden. (Confirm-cancel path leaves state intact.)
- **R3:** MCQ graded by harness (`1/10`) while the ordering exercise graded independently by its retained inline grader (6/6 correct → "Chính xác cả 6 bước…", `#order-result` role=status aria-live). Outside the form by design; retry intentionally doesn't reset it.
- **Keyboard:** first radio focusable and identifiable (`document.activeElement` = q1 input); radios in fieldset/legend natively keyboard-operable; `:focus-within` outlines; no tabindex traps.
- **Not color-only:** correct/incorrect differ by border, background tint AND icon shape (check-circle vs warn), plus textual score.
- **Ch05 proof quiz regression:** untouched (byte-identical to HEAD), harness still grades it (0/10 on a wrong pick, retry present).
- Screenshot review of graded R1 state: layout/tint/icons render correctly, no overflow.

## Registry / stats

- Slug equality: `ALL_CHAPTERS` (22) == `LESSONS` (22) == stats membership (registry-driven, fail-loud) == 22 live dist routes. R1 stats belong to `ch10-room-la-gi-va-sqlite`; old R1 not a member (no longer in `lessons.ts`/`chapters.ts`).
- Redirect artifact is a page, not a lesson — not counted in membership (23 dirs = 22 lessons + 1 redirect).
- Quiz question counts (8/12/10/8) feed `lessonStats` automatically via the `fieldset[data-answer]` count (IMP-016 mechanism) — verified in source (lessonStats.ts:284).
- `TARGET_REGISTRY_v5.md`, `REVIEW_GATE_REGISTRY.md` byte-identical since the registry gate (empty diff `5e8b11a..HEAD`).

## Verification

- `npm run build`: **0 errors**, 23 pages built.
- `npx astro check`: **0 errors, 0 warnings, 65 hints** — exactly the pre-pilot baseline; no new hints.
- Dist: 23 dirs under `/chapters/`; per-page `data-answer` counts 8/12/10/8; zero `5 lớp` doctrine strings in any Ch10 page; no root-level dead-slug dir.
- Git scope: only the four `Ch10_*Quiz.astro` files changed in IMP-021 (`560+/497-`); `lessons.ts`, `chapters.ts`, `progress.ts`, `astro.config.mjs`, lesson prose, homepage/sidebar, shared harness `quiz.ts` + `quiz.css` all untouched; working tree clean after commit.
- Temp artifacts (audit script) removed before commit.

## Findings

- **Blockers:** none.
- **Major:** none. (One MAJOR found mid-flight — R4 Q8 explanation routed migration to Chương 11 — fixed to O5 before commit; one BLOCKER found — R2 Q6 tested 10.3's @Update mechanism with a non-compiling premise — rekeyed to d, premise fixed to `image = null`, forward pointer to 10.3 mục 13.3 added; both re-verified.)
- **Minor (documented, no learner-correctness impact):** length-cue conspicuousness in 6 questions (within gate); R2 Q11 inherits the lesson's standard @Volatile framing; R3 Q2 "12 hàm" is correct vs a stale "13 hàm" in lesson text (lesson-owned fix, out of pilot scope).

## Gate verdict

**GATE PASS.** Route, progress, redirect, quiz, UX/a11y, registry/stats, and build gates all green; 0 BLOCKER / 0 MAJOR at close. Tagged `gate/pilot`.
