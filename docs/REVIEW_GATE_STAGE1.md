# REVIEW_GATE_STAGE1

**Gate:** closes the Stage-1/Foundation batch — Foundation F1/F2 + Android A1–A14 live (26 lessons), all 16 Stage-1 quizzes migrated to the shared harness, atomic runtime activation (schema bump + 2 SPLIT_MAP entries + 1 redirect), Stage-1 cleanup — before Stage 2 / Compose (IMP-035) begins.
**Verified:** 2026-09-07 @ commit `6f8ec78`. Evidence is mechanical (source parse, `dist/` inspection, migration simulation, independent sub-agent reviews), not narrative.

**Verdict: GATE PASS — 0 BLOCKER / 0 MAJOR at close.**

## Scope — commits covered (9)

| Commit | Nội dung |
|---|---|
| `e828142` | A6/A7 + A10/A11 content splits, neighbor cross-refs, A4 roadmap foundation wording, voice/prereq fixes — no activation |
| `8c66f1e` | F1/F2 lessons from accepted drafts (no legacy credit) |
| `a9f16af` | 16 quizzes on shared harness; A6/A7 + A10/A11 quiz knowledge split by ownership; A14 19→10 (release depth → AP1) |
| `8c90729` | ATOMIC activation: lessons.ts 26 entries, schema 5→6, SPLIT_MAP +2 (ch02-2 keep-source, ch03-2 replace), ch03-2 redirect, lessonStats split-key resolution, migration matrix A–N |
| `b43d81f` | Cleanup: 11 superseded Stage-1 files (−7,625 lines) + 1 dead const |
| `e500ab9` | Stats fix: explicit SHARED_FILE_PIN replaces double-alphabetical pairing (A7↔A6 swap found by review) |
| `ef773fb` | Quiz rank fix: Ch01_4 length-rank 50%→40% (Q4 distractor d gains a second real misconception) |
| `2d6ba64` | Content-audit fixes: F1 Q2 premise `listOf`→`mutableListOf`, A4 explain typo, A10 cam-bẫy nuance back-port |
| `801ce89` | A12 voice (2× "giáo trình gốc" leaks), A4 roadmap + "Mở rộng" row |
| `6f8ec78` | Adversarial BLOCKER fix: ch01 monolith legacy chain (dead slug in SPLIT_MAP), schema 6→7 |

## Registry conformance (registry §3 = authority)

All 16 units verified line-by-line against TARGET_REGISTRY_v5 §3 in `lessons.ts` + `chapters.ts` — slug, component file, quiz file, stageId, insert labels (2.2a/2.2b/3.2a/3.2b):

| Unit | Slug | Component / Quiz | Stage |
|---|---|---|---|
| F1 | `kotlin-variables-null-collections-lambda` | KotlinVariablesNullCollectionsLambda(+Quiz) | foundation |
| F2 | `kotlin-data-class-delegation-sealed` | KotlinDataClassDelegationSealed(+Quiz) | foundation |
| A1–A4 | ch01-1…ch01-4 | Ch01_1…Ch01_4(+Quiz) | android |
| A5 | `ch02-1-cai-dat-va-tao-project` | Ch02_1(+Quiz) | android |
| A6 | `ch02-2-may-ao-may-that-doc-project` (URL kept) | Ch02_2(+Quiz) | android |
| A7 | `ch02-doc-project-mau` (new) | Ch02DocProjectMau(+Quiz) | android |
| A8 | `ch02-3-chay-app-va-cap-nhat` | Ch02_3(+Quiz) | android |
| A9 | `ch03-1-activity-va-giao-dien` | Ch03_1(+Quiz) | android |
| A10 | `ch03-string-resource-va-lop-r` (new) | Ch03StringResourceVaLopR(+Quiz) | android |
| A11 | `ch03-doc-loi-bien-dich-va-debug` (new) | Ch03DocLoiBienDichVaDebug(+Quiz) | android |
| A12/A13 | ch03-3 / ch03-4 | Ch03_3 / Ch03_4(+Quiz) | android |
| A14 | `ch04-gradle-basics-a-look-behind-the-curtain` | Ch04GradleBasics(+Quiz) | android |

No bare-lessonId URLs invented. `ALL_CHAPTERS` slugs == `LESSONS` slugs == lessonStats membership == live dist routes == **26** (script-verified, exact list equality).

## Live lesson count + stage counts

- 26 live lessons = 22 baseline + A7 (+1) + A10/A11 net (+1) + F1/F2 (+2). ✓
- Stage counts (from `chapters.ts` stageId parse): foundation 2 · android 14 · compose 1 · state 1 · optional 1 · network 1 · data 5 · realworld 1 — total 26. navigation/appendix 0. ✓
- `dist/chapters/` = 28 dirs = **26 live** + 2 redirect artifacts. Homepage not redesigned; "Nền tảng" section present with F1/F2 + "Giai đoạn 1 — Android cơ bản"; Ch07 remains under "Mở rộng". ✓

## Progress migration

- `SCHEMA_VERSION = 7` (`progress.ts:58`): 6 (Stage-1 batch) + 1 (adversarial-fix repair — see Deviations).
- Active SPLIT_MAP = **8 entries** (see Deviations): 5 pre-existing historical (ch01/ch02/ch03/ch10 monoliths + ch10-1→R1) + ch02-2 keep-source `old→[old, A7]` + ch03-2 replace `old→[A10, A11]` + 1 cleanup entry `ch01-4-gradle-ban-do→[A4]` (adversarial fix).
- ch02-2 has **NO redirect** (astro.config.mjs has exactly 2 entries, neither is ch02-2; its dist page is a real lesson, not meta-refresh). ch03-2 redirect → `/chapters/ch03-string-resource-va-lop-r/` = registry §6 row 1. ✓
- F1/F2/S5 in no SPLIT_MAP value array; never fabricated (simulations F1/F2/S5 PASS). ✓

### Migration test matrix (temporary script, removed before commit) — 19/19 PASS

Ran against the verbatim `SPLIT_MAP` + fixed-point algorithm extracted from `progress.ts`:

1. v5 `ch02-2` → `[A6, A7]` (fan-out-keep-source, union semantics) ✓
2. v5 `ch03-2` → `[A10, A11]`, old slug gone ✓
3. Ch02 monolith (v4) → 2.1 + A6 + A7 + 2.3 ✓
4. Ch03 monolith (v4) → 3.1 + A10 + A11 + 3.3 + 3.4 ✓
5. Ch10 monolith (v4) → R1–R4 ✓
6. Combined 4 monoliths → 17 current descendants, all live slugs ✓
7. Duplicates → deduped ✓
8. Re-run idempotent; v7 storage untouched ✓
9. Corrupt localStorage → no throw, rewritten `[]` ✓
10. F1 absent unless explicitly completed ✓
11. F2 absent unless explicitly completed ✓
12. S5 absent ✓
13. Keep-source stable across repeated re-runs ✓
14. **A-fix (new):** v6-era storage containing dead `ch01-4-gradle-ban-do` → purged, replaced by A4, version bumped to 7 ✓
15. **B (new):** Ch01 monolith → A1–A4 with the correct A4 slug ✓
16. **SA (new):** SPLIT_MAP self-audit — every value slug is live or an old source key ✓
17. Mixed unrelated + keep-source + replace state → correct union ✓

## Quiz gate (16/16)

Mechanical parse audit (temporary script, removed): every quiz has 8–12 questions, exactly 4 options a–d, exactly 1 correct per `data-answer`, 100% `.explain` coverage, shared `initQuiz` harness (preserved order-exercise graders coexist in Ch01_2/Ch03_3/Ch03_4/A7 per design). Position + length-rank balance ≤40% share everywhere. Dist quiz counts match source per slug (16/16).

| Quiz | q | pos a/b/c/d | rank share max |
|---|---|---|---|
| F1 | 12 | 3/3/3/3 | 25% |
| F2 | 12 | 3/3/3/3 | 33% |
| A1 | 9 | 3/3/3/0 | 33% |
| A2 | 10 | 3/4/3/0 | 40% |
| A3 | 11 | 3/4/4/0 | 36% |
| A4 | 10 | 3/3/4/0 | 40% |
| A5 | 9 | 3/3/3/0 | 33% |
| A6 | 10 | 3/3/2/2 | 30% |
| A7 | 11 | 3/3/2/3 | 36% |
| A8 | 9 | 3/3/3/0 | 33% |
| A9 | 11 | 4/3/3/1 | 36% |
| A10 | 9 | 3/3/2/1 | 33% |
| A11 | 10 | 3/2/3/2 | 40% |
| A12 | 11 | 4/3/3/1 | 36% |
| A13 | 10 | 4/3/3/0 | 40% |
| A14 | 10 | 3/3/2/2 | 40% |

Content-support review (independent agent, 8 highest-risk quizzes vs their lessons): 0 BLOCKER / 0 MAJOR after fixes; all answer keys lesson-supported; distractors are real beginner misconceptions; A14 scope clean — no signing/keystore/keys.properties/APK-AAB depth questions (deferred to AP1). A6/A7 and A10/A11 quiz knowledge divided strictly by learning-job ownership.

## Split ownership audit (independent agent; old monoliths @ `59619e3`)

- **A6/A7:** every old section, goal bullet, tóm tắt, cạm bẫy (1–3 → A6; 4–6 → A7 renumbered), exercise, and Nguồn item traced to a destination (16 "Phần bổ sung" items split item-by-item). No silent loss. Registry boundary honored: A6 = mục 5–6; A7 = mục 7. Old quiz 12q → A6 10q + A7 11q + 3 new.
- **A10/A11:** same treatment (18 bổ sung items accounted). Registry boundary: A10 = mục 8–11, A11 = mục 12–15. Old quiz 15q → A10 9q + A11 10q.
- **A4 roadmap:** now lists Nền tảng + Giai đoạn 1–7 + **Mở rộng** (row added by `801ce89`) + best-practice note; zero "11 chương" phrasing; Gradle teaching untouched (single table-cell diff since `59619e3`).
- **A14 boundary:** release/signing/keystore/keys.properties/minify-depth all deferred ("chủ đề của phần phụ lục về phát hành") — zero deep release teaching in A14; AP1 draft (`docs/drafts/ap1-gradle-release.md`, 319 lines) holds the material with a provenance table for every moved block.

## Voice / prerequisite audit (independent agent, F1→A14)

- Source-commentary voice: 0 learner-facing leaks after fixing the 2 A12 "giáo trình gốc" occurrences (`801ce89`; line 627's hit sits inside `#nguon` — legitimate). A1's "giáo trình" hits are generic trap-warnings about external textbooks (learner-directed, cleared). All course-navigation references (Chương 2.1, bài trước, 2.2a/2.2b, 3.2a/3.2b) are correct and resolve (spot-checked A7's "Chương 4, mục 6" → A14 mục 6 BOM).
- Used-before-taught: F1/F2 teach all constructs they use (F1 §7's `let`/`ifEmpty` explicitly marked "chưa học"); F2 uses only F1-taught + glossed; `when` deferred with pointer then glossed at first use (A7, A13); no `companion`/`enum`/coroutines/extension syntax anywhere in A-chain code. Remaining known MINOR: A3 renders a `@Composable`/`@Preview` snippet unglossed (mitigated by A2's global deferral + A7's full gloss; not a Kotlin construct).
- F1/F2 carry no legacy-credit language.

## Cleanup audit (independent forensic agent)

`b43d81f` deletions all proven safe: not imported, not registry-canonical, content destinations verified by distinctive-topic tracing (e.g. Ch03 monolith's breakpoint material → A11; Ch04_3 catalog → A14 mục 7; signing → AP1), recoverable from git. No Ch05+ file touched (36 future-stage files intact). No Stage-1 straggler found (25 non-imported .astro = `_TEMPLATE` + 24 future-stage split children). Known LOW notes: two niche Ch04_3 reference tables (starter↔final diff, "đọc cấu hình project lạ") not carried 1:1 — recoverable from git; stale mentions of deleted Ch04 files remain in `PROJECT_MASTER_CONTEXT.md`/`CHAPTER_SPLIT_MAP.md` — sanctioned by TARGET_REGISTRY §12 docs-sync backlog.

## Build / check

- `npm run build`: **0 errors — 27 pages** (26 lessons + homepage + 2 redirect artifacts render as 28 chapter dirs incl. redirects).
- `npx astro check`: **0 errors, 0 warnings, 65 hints** — exactly the pre-task baseline; no new hints.
- Stats/TOC pairing verified in dist after `e500ab9`: ch02-2 page shows máy ảo/máy thật TOC + 10 questions; ch02-doc-project-mau shows đọc-project TOC + 11; same for A10 (9) / A11 (10). No swap.
- Cross-link sweep: zero learner-facing hrefs to retired slugs; all 26 pages interlinked; the set of all `/chapters/…` hrefs in dist == live slug set.

## Adversarial review (independent agent — 10 attack surfaces)

Final verdict pre-fix: **1 BLOCKER / 0 MAJOR / 1 MINOR**, surfaces 1, 4–10 PASS. The BLOCKER (fix `6f8ec78`):

- **BLOCKER — ch01 monolith legacy chain.** SPLIT_MAP entry `ch01-welcome-to-android-kotlin` listed child `ch01-4-gradle-ban-do` — a slug that never existed (live A4 = `ch01-4-gradle-va-ban-do`; typo inherited from the pre-pilot demo snapshot, shipped through the pilot gate because the test matrix was written from the map rather than the registry). Consequence: v4-era learners who completed the Ch01 monolith got A1–A3 restored but never A4. Fixed in three parts: correct child slug + cleanup entry `ch01-4-gradle-ban-do→[A4]` (machines that already migrated at v5/v6 hold the dead slug in `done` and need an explicit mapping to convert it) + schema bump 6→7 (map content changed; without the bump, already-migrated machines never re-run). Re-verified: matrix 19/19 PASS incl. the v6-storage purge scenario.
- MINOR noted: the pilot-era simulation asserted the typo'd slug as expected output (test-from-map defect). The gate matrix here asserts from the registry/live-slug set (self-audit SA) instead.

## Deviations from the batch brief (documented, accepted)

1. **SPLIT_MAP = 8 active entries, not 7.** The brief's "current 5 + 2 = 7" did not anticipate the adversarial-fix cleanup entry `ch01-4-gradle-ban-do→[A4]`, which exists solely to repair machines already migrated with the typo'd map. Registry §7's 9-entry draft remains the source of truth for planned mappings; the cleanup entry is a repair artifact, not a new identity mapping. SCHEMA_VERSION is therefore 7, not 6.
2. **Quiz counts diverge from minutes-table heuristics where ownership required it** (A7=11, A3/A9/A12=11): within the 8–12 contract; minutes informational per the owner quality rule.
3. Docs-sync backlog (stale Ch04 file names in `PROJECT_MASTER_CONTEXT.md` / `CHAPTER_SPLIT_MAP.md`) intentionally not edited — TARGET_REGISTRY §12 reserves registry/docs sync for a later batch.

## Findings at close

- **Blockers:** none.
- **Major:** none. (Three found and fixed mid-flight: stats shared-key pairing swap `e500ab9`; A12 voice leaks + A4 roadmap "Mở rộng" `801ce89`; migration chain dead slug `6f8ec78`.)
- **Minor (documented, no gate impact):** A3 unglossed Composable snippet (deferral-mitigated); two LOW content-destination notes in cleanup (git-recoverable); F2 Q5/Q6 distractor-padding polish; A7 Bài tập 1 arguably misfiled to A7's project-reading job (traceable, quiz-level only); scratch `.txt` files in `web/` untracked+ignored (hygiene).

## Gate verdict

**GATE PASS.** Registry/identities, 26-lesson membership, splits, quizzes, migration chains, redirect policy, cleanup, voice/prereq, build, and adversarial review all green at `6f8ec78`; 0 BLOCKER / 0 MAJOR. Next: owner review before Stage 2 / Compose (IMP-035, requires F1+F2 live — satisfied).
