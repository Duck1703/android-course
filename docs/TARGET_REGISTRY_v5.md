# TARGET REGISTRY v5

**Status:** execution source of truth for lesson identity mapping (IMP-012).
**Design contract:** `docs/COURSE_REDESIGN_SPEC_432cbf8_v2.md` · **Plan:** `docs/COURSE_REDESIGN_IMPLEMENTATION_PLAN.md` (§4b identity policy, §12.1–12.5 migration design) · **Locked:** 2026-09-06 @ `482561c`.
**Nature:** this file locks identifiers for all 48 target units. It does NOT make them live — no route, component, quiz, redirect, or migration code is created by this document. Later integration tasks (IMP-020…) must treat the `slug` values below as public identities once wired.

---

## 1. Identity policy (non-negotiable)

Three separate identifiers, per plan §4b:

| Trường | Vai trò | Ổn định? |
|---|---|---|
| `lessonId` | logical curriculum ID (A6, S4, N2…) used in spec/registry/discussion/QA — **never** a URL by itself | stable while spec structure stands |
| `slug` | public URL route (`/chapters/<slug>/`) — what bookmarks and learner progress attach to | **maximally stable**; preserved when content identity survives |
| `stageId` | one of the exact 10 values implemented in `chapters.ts` (IMP-010): `foundation / android / compose / state / navigation / network / data / realworld / optional / appendix` | stable per spec §5 |

Rules locked here:

1. A `lessonId` is never auto-converted into a URL (`A1` ⇒ slug `a1` is forbidden).
2. Existing URLs are assets — preserved whenever content identity survives (§5 below).
3. New slugs are chosen only for genuinely new units or true split children.
4. A slug, once assigned to a lesson identity, is never reused for a different identity.
5. No new slug duplicates a dead old slug for a different lesson.

---

## 2. Quality / time policy (quality-first)

The `minutes` column is an **informational planning estimate** taken from spec §6. It is **NOT a hard editorial cap**. Content is not trimmed merely to hit this number. Current owner rule:

> **“Không cắt vì dài. Chỉ cắt khi nội dung thừa, sai scope, trùng lặp, hoặc nên thuộc một learning job khác.”**

Planning totals (recorded for document compatibility only, never used as PASS/FAIL):

- core planning total: **1005 min** (~16 h 45 m)
- optional planning total: **255 min** (~4 h 15 m)
- appendix: no minutes (reference sections)

**Docs-sync backlog:** ~~the spec's old "30-min hard cap" wording (§3 principle 4, §12 hard parameters, §17, §21, §25) is stale against this owner rule and must be synchronized later.~~ **DONE 2026-09-11 (final QA docs sync):** spec §3 principle 4 / §12 hard parameters / §17 lesson-body row / §21 note / §25 rows now carry the quality-first owner rule ("không cắt vì dài — giờ học chỉ là ước lượng planning"); historical cap wording retained in-file as history.

---

## 3. Registry — all 48 units

Conventions: `component` = file inside `web/src/components/lessons/`; `quiz` = future quiz component filename (`—` = no quiz); `source` states where the **accepted content** lives today. Status words: LIVE = live final; SPLIT = split-ready unit inside a live monolith (boundary markers verified); DRAFT = accepted draft in `docs/drafts/`; PLANNED = spec/plan-owned future work.

| lessonId | slug | stageId | component | quiz | kind | min | source |
|---|---|---|---|---|---|---|---|
| F1 | `kotlin-variables-null-collections-lambda` | foundation | KotlinVariablesNullCollectionsLambda.astro | KotlinVariablesNullCollectionsLambdaQuiz.astro | core | 25 | DRAFT: docs/drafts/f1-kotlin-foundation.md |
| F2 | `kotlin-data-class-delegation-sealed` | foundation | KotlinDataClassDelegationSealed.astro | KotlinDataClassDelegationSealedQuiz.astro | core | 25 | DRAFT: docs/drafts/f2-kotlin-foundation.md |
| A1 | `ch01-1-android-va-kotlin` | android | Ch01_1AndroidVaKotlin.astro | Ch01_1Quiz.astro | core | 20 | LIVE |
| A2 | `ch01-2-app-component` | android | Ch01_2AppComponent.astro | Ch01_2Quiz.astro | core | 15 | LIVE |
| A3 | `ch01-3-manifest-resources` | android | Ch01_3ManifestResources.astro | Ch01_3Quiz.astro | core | 25 | LIVE |
| A4 | `ch01-4-gradle-va-ban-do` | android | Ch01_4GradleVaBanDo.astro | Ch01_4Quiz.astro | core | 25 | LIVE |
| A5 | `ch02-1-cai-dat-va-tao-project` | android | Ch02_1CaiDatVaTaoProject.astro | Ch02_1Quiz.astro | core | 30 | LIVE |
| A6 | `ch02-2-may-ao-may-that-doc-project` | android | Ch02_2MayAoMayThatDocProject.astro | Ch02_2Quiz.astro | core | 25 | SPLIT: Ch02_2MayAoMayThatDocProject.astro [đơn vị 1 = mục 5–6 + tóm tắt/cạm bẫy 1–3] |
| A7 | `ch02-doc-project-mau` | android | Ch02DocProjectMau.astro | Ch02DocProjectMauQuiz.astro | core | 25 | SPLIT: Ch02_2MayAoMayThatDocProject.astro [đơn vị 2 = mục 7 + tóm tắt/cạm bẫy 4–6] |
| A8 | `ch02-3-chay-app-va-cap-nhat` | android | Ch02_3ChayAppVaCapNhat.astro | Ch02_3Quiz.astro | core | 25 | LIVE |
| A9 | `ch03-1-activity-va-giao-dien` | android | Ch03_1ActivityVaGiaoDien.astro | Ch03_1Quiz.astro | core | 30 | LIVE |
| A10 | `ch03-string-resource-va-lop-r` | android | Ch03StringResourceVaLopR.astro | Ch03StringResourceVaLopRQuiz.astro | core | 25 | SPLIT: Ch03_2StringResourceVaDebug.astro [đơn vị 1 = mục 8–11] |
| A11 | `ch03-doc-loi-bien-dich-va-debug` | android | Ch03DocLoiBienDichVaDebug.astro | Ch03DocLoiBienDichVaDebugQuiz.astro | core | 30 | SPLIT: Ch03_2StringResourceVaDebug.astro [đơn vị 2 = mục 12–15] |
| A12 | `ch03-3-manifest-intent-permission` | android | Ch03_3ManifestIntentPermission.astro | Ch03_3Quiz.astro | core | 25 | LIVE |
| A13 | `ch03-4-theme-va-doi-chieu` | android | Ch03_4ThemeVaDoiChieu.astro | Ch03_4Quiz.astro | core | 25 | LIVE |
| A14 | `ch04-gradle-basics-a-look-behind-the-curtain` | android | Ch04GradleBasics.astro | Ch04Quiz.astro | core | 25 | LIVE (REDUCE 1:1; release depth → AP1 draft) |
| C1 | `ch05-composable-va-layout` | compose | Ch05ComposableVaLayout.astro | Ch05ComposableVaLayoutQuiz.astro | core | 25 | SPLIT: Ch05JetpackCompose.astro [C1 START/END, mục 1–3] |
| C2 | `ch05-modifier-va-danh-sach` | compose | Ch05ModifierVaDanhSach.astro | Ch05ModifierVaDanhSachQuiz.astro | core | 25 | SPLIT: Ch05JetpackCompose.astro [C2 START/END] |
| C3 | `ch05-material-3-va-theming` | compose | Ch05Material3VaTheming.astro | Ch05Material3VaThemingQuiz.astro | core | 25 | SPLIT: Ch05JetpackCompose.astro [C3 START/END] (+ Compose-theme side of Ch03_4) |
| C4 | `ch05-preview-va-vong-doi` | compose | Ch05PreviewVaVongDoi.astro | Ch05PreviewVaVongDoiQuiz.astro | core | 25 | SPLIT: Ch05JetpackCompose.astro [C4 START/END, mục 18 LaunchedEffect intro] |
| C5 | `ch05-tiep-can-moi-nguoi-dung` | compose | Ch05TiepCanMoiNguoiDung.astro | Ch05TiepCanMoiNguoiDungQuiz.astro | core | 20 | DRAFT: docs/drafts/c5-compose-accessibility.md (mục 19–28, nối mục 18 của C4) |
| S1 | `coroutines-20-phut-khong-so` | state | Coroutines20PhutKhongSo.astro | Coroutines20PhutKhongSoQuiz.astro | core | 20 | DRAFT: docs/drafts/s1-coroutine-foundation.md |
| S2 | `ch06-state-va-recomposition` | state | Ch06StateVaRecomposition.astro | Ch06StateVaRecompositionQuiz.astro | core | 25 | SPLIT: Ch06AdvancedJetpackCompose.astro [S2 START/END, mục 1–4] |
| S3 | `ch06-state-hoisting-va-udf` | state | Ch06StateHoistingVaUdf.astro | Ch06StateHoistingVaUdfQuiz.astro | core | 25 | SPLIT: Ch06AdvancedJetpackCompose.astro [S3 START/END, mục 5–8] |
| S4 | `ch06-viewmodel-va-ui-state` | state | Ch06ViewModelVaUiState.astro | Ch06ViewModelVaUiStateQuiz.astro | core | 30 | SPLIT: Ch06AdvancedJetpackCompose.astro [S4 START/END, mục 9–19; dạy `collectAsStateWithLifecycle` + `stateIn`] |
| S5 | `kien-truc-ui-data-repository` | state | KienTrucUiDataRepository.astro | KienTrucUiDataRepositoryQuiz.astro | core | 25 | DRAFT: docs/drafts/s5-app-architecture-repository.md |
| N1 | `navigation-destination-nav-host` | navigation | NavigationDestinationNavHost.astro | NavigationDestinationNavHostQuiz.astro | core | 25 | DRAFT: docs/drafts/n1-navigation-foundation.md |
| N2 | `navigation-back-stack-type-safe` | navigation | NavigationBackStackTypeSafe.astro | NavigationBackStackTypeSafeQuiz.astro | core | 25 | DRAFT: docs/drafts/n2-navigation-backstack-typesafe.md |
| W1 | `ch08-coroutines-va-flow` | network | Ch08CoroutinesVaFlow.astro | Ch08CoroutinesVaFlowQuiz.astro | core | 30 | SPLIT: Ch08Networking.astro [W1 START/END, mục 1–7] |
| W2 | `ch08-retrofit-moshi-json` | network | Ch08RetrofitMoshiJson.astro | Ch08RetrofitMoshiJsonQuiz.astro | core | 30 | SPLIT: Ch08Networking.astro [W2 START/END, mục 8–15; Coil gloss] |
| W3 | `ch08-trang-thai-mang-api-key` | network | Ch08TrangThaiMangApiKey.astro | Ch08TrangThaiMangApiKeyQuiz.astro | core | 25 | SPLIT: Ch08Networking.astro [W3 START/END, mục 16–23; keys.properties] |
| D1 | `ch09-data-store-va-sharedpreferences` | data | Ch09DataStoreVaSharedPreferences.astro | Ch09DataStoreVaSharedPreferencesQuiz.astro | core | 30 | SPLIT: Ch09DataStore.astro [D1 START/END, mục 1–10] |
| D2 | `ch09-prefs-composition-local-va-wiring` | data | Ch09PrefsCompositionLocalVaWiring.astro | Ch09PrefsCompositionLocalVaWiringQuiz.astro | core | 30 | SPLIT: Ch09DataStore.astro [D2 START/END, mục 11–21; Hilt seam note] |
| R1 | `ch10-room-la-gi-va-sqlite` | data | Ch10RoomLaGiVaSqlite.astro | Ch10RoomLaGiVaSqliteQuiz.astro | core | 25 | LIVE (content final @ Ch10_1RoomLaGi.astro; slug đổi tại integration — old slug chết, redirect §6) |
| R2 | `ch10-2-entity-dao-database` | data | Ch10_2EntityDaoDatabase.astro | Ch10_2Quiz.astro | core | 30 | LIVE |
| R3 | `ch10-3-repository-viewmodel` | data | Ch10_3RepositoryViewModel.astro | Ch10_3Quiz.astro | core | 25 | LIVE |
| R4 | `ch10-4-giao-dien-va-cam-bay` | data | Ch10_4GiaoDienVaCamBay.astro | Ch10_4Quiz.astro | core | 25 | LIVE |
| X1 | `ch11-files-saf-va-backup` | realworld | Ch11FilesSafVaBackup.astro | Ch11FilesSafVaBackupQuiz.astro | core | 30 | SPLIT: Ch11AdvancedStorage.astro [X1 START/END, mục 1–8.5] |
| X2 | `ch11-keystore-sqlcipher-va-ma-hoa` | realworld | Ch11KeystoreSqlcipherVaMaHoa.astro | Ch11KeystoreSqlcipherVaMaHoaQuiz.astro | core | 30 | SPLIT: Ch11AdvancedStorage.astro [X2 START/END, mục 9–21; ESP = HISTORICAL-REF] |
| O1 | `ditto-offline-first-case-study` | optional | DittoOfflineFirstCaseStudy.astro | DittoOfflineFirstCaseStudyQuiz.astro | optional | 30 | PLANNED (REDUCE of live Ch07AdvancedArchitecture.astro material; spec §6 O1; IMP-050) |
| O2 | `testing-viewmodel-va-compose-ui` | optional | TestingViewModelVaComposeUi.astro | TestingViewModelVaComposeUiQuiz.astro | optional | 45 | PLANNED: spec §6 O2 (IMP-051) |
| O3 | `adaptive-ui-tablet-foldable` | optional | AdaptiveUiTabletFoldable.astro | AdaptiveUiTabletFoldableQuiz.astro | optional | 30 | PLANNED: spec §6 O3 (IMP-052) |
| O4 | `workmanager-cong-viec-nen` | optional | WorkManagerCongViecNen.astro | WorkManagerCongViecNenQuiz.astro | optional | 30 | PLANNED: spec §6 O4 (IMP-053) |
| O5 | `room-migration-dau-tien` | optional | RoomMigrationDauTien.astro | RoomMigrationDauTienQuiz.astro | optional | 30 | PLANNED: spec §6 O5 (IMP-054) |
| O6 | `capstone-app-ghi-chu` | optional | CapstoneAppGhiChu.astro | CapstoneAppGhiChuQuiz.astro | optional | 90 | PLANNED: spec §6 O6 (IMP-055) |
| AP1 | `gradle-nang-cao-signing-keystore` | appendix | GradleNangCaoSigningKeystore.astro | — | appendix | — | DRAFT: docs/drafts/ap1-gradle-release.md (reference page, no quiz) |
| AP2 | `ditto-sdk-api` | appendix | DittoSdkApi.astro | — | appendix | — | PLANNED: Ditto API deep-dive from Ch07 depth (IMP-050 creates draft) |
| AP3 | `bang-tra-cuu-nhanh` | appendix | BangTraCuuNhanh.astro | — | appendix | — | DRAFT: docs/drafts/ap3-version-drift.md (drift tables Ch06/08/09/11; grows per batch) |

---

## 4. Count audit

| Measure | Count |
|---|---|
| Total units | **48** |
| Core (F/A/C/S/N/W/D/R/X) | **39** = 2 + 14 + 5 + 5 + 2 + 3 + 6 + 2 |
| Optional (O1–O6) | **6** |
| Appendix (AP1–AP3) | **3** (not counted as core or optional) |

**Stage counts:** foundation 2 · android 14 · compose 5 · state 5 · navigation 2 · network 3 · data 6 (D1–D2 + R1–R4) · realworld 2 · optional 6 · appendix 3 → **48** ✓

---

## 5. Current URL preservation audit (22 current slugs, verified from `lessons.ts` @ `482561c`)

**Preserved old URLs = 14** (13 untouched 1:1 + `ch02-2` survives as A6):

| old slug → lessonId | Note |
|---|---|
| ch01-1-android-va-kotlin → A1 | 1:1 |
| ch01-2-app-component → A2 | 1:1 |
| ch01-3-manifest-resources → A3 | 1:1 |
| ch01-4-gradle-va-ban-do → A4 | 1:1 |
| ch02-1-cai-dat-va-tao-project → A5 | 1:1 |
| ch02-2-may-ao-may-that-doc-project → A6 | survives; A7 added beside it (SPLIT_MAP #1) — **no redirect** |
| ch02-3-chay-app-va-cap-nhat → A8 | 1:1 |
| ch03-1-activity-va-giao-dien → A9 | 1:1 |
| ch03-3-manifest-intent-permission → A12 | 1:1 |
| ch03-4-theme-va-doi-chieu → A13 | 1:1 |
| ch04-gradle-basics-a-look-behind-the-curtain → A14 | 1:1 REDUCE, credit trọn |
| ch10-2-entity-dao-database → R2 | 1:1 |
| ch10-3-repository-viewmodel → R3 | 1:1 |
| ch10-4-giao-dien-va-cam-bay → R4 | 1:1 |

**Dead old URLs = 8** (die at integration; each gets exactly one redirect, §6): ch03-2-string-resource-va-debug · ch05-jetpack-compose · ch06-advanced-jetpack-compose · ch07-advanced-architecture · ch08-networking · ch09-data-store · ch10-1-vi-sao-can-database · ch11-advanced-storage.

**Contradiction resolution (14 vs 15):** recomputed from the actual 22 current slugs: 22 − 8 dead = **14 preserved**. The plan's own detailed mapping (§12.1: ch02-2 survives; ch03-2 dies) supports 14, and plan correction log #18 already flagged "15/22" as an arithmetic defect. **TARGET_REGISTRY_v5 locks 14/22 + 8 as the truth.** Any remaining "15/22" prose elsewhere is a documentation defect — flagged for docs sync (§12), not edited in this task.

---

## 6. Redirect draft (8 rows — one `redirectTarget` per dead old slug; IMP-014 implements)

| # | Dead old slug | → redirectTarget (final slug) | lessonId | Batch creates |
|---|---|---|---|---|
| 1 | ch03-2-string-resource-va-debug | `ch03-string-resource-va-lop-r` | A10 | Stage 1c |
| 2 | ch05-jetpack-compose | `ch05-composable-va-layout` | C1 | Stage 2 |
| 3 | ch06-advanced-jetpack-compose | `ch06-state-va-recomposition` | S2 | Stage 3 |
| 4 | ch07-advanced-architecture | `ditto-offline-first-case-study` | O1 | optional batch |
| 5 | ch08-networking | `ch08-coroutines-va-flow` | W1 | Stage 5 |
| 6 | ch09-data-store | `ch09-data-store-va-sharedpreferences` | D1 | Stage 6-D |
| 7 | ch10-1-vi-sao-can-database | `ch10-room-la-gi-va-sqlite` | R1 | pilot |
| 8 | ch11-advanced-storage | `ch11-files-saf-va-backup` | X1 | Stage 7 |

`ch02-2` has **no redirect** (source URL stays alive as A6). Splits redirect to the first logical successor; the remaining children are reached via sidebar/TOC.

---

## 7. SPLIT_MAP draft (9 old-slug entries; machine-facing values = final slugs; IMP-013 implements)

| # | Old slug (source) | → New slugs (lessonIds) | Mode |
|---|---|---|---|
| 1 | ch02-2-may-ao-may-that-doc-project | keep `ch02-2-may-ao-may-that-doc-project` (A6) + add `ch02-doc-project-mau` (A7) | **fan-out-keep-source** |
| 2 | ch03-2-string-resource-va-debug | `ch03-string-resource-va-lop-r` (A10), `ch03-doc-loi-bien-dich-va-debug` (A11) | replace |
| 3 | ch05-jetpack-compose | `ch05-composable-va-layout` (C1), `ch05-modifier-va-danh-sach` (C2), `ch05-material-3-va-theming` (C3), `ch05-preview-va-vong-doi` (C4) | replace |
| 4 | ch06-advanced-jetpack-compose | `ch06-state-va-recomposition` (S2), `ch06-state-hoisting-va-udf` (S3), `ch06-viewmodel-va-ui-state` (S4) | replace |
| 5 | ch07-advanced-architecture | `ditto-offline-first-case-study` (O1) | replace (REDUCE) |
| 6 | ch08-networking | `ch08-coroutines-va-flow` (W1), `ch08-retrofit-moshi-json` (W2), `ch08-trang-thai-mang-api-key` (W3) | replace |
| 7 | ch09-data-store | `ch09-data-store-va-sharedpreferences` (D1), `ch09-prefs-composition-local-va-wiring` (D2) | replace |
| 8 | ch10-1-vi-sao-can-database | `ch10-room-la-gi-va-sqlite` (R1) | replace (REDUCE) |
| 9 | ch11-advanced-storage | `ch11-files-saf-va-backup` (X1), `ch11-keystore-sqlcipher-va-ma-hoa` (X2) | replace |

The 14 preserved URLs (§5) carry **no** SPLIT_MAP entry. Entry #1 must use the union/keep-source semantics of plan §12.3 — never a plain replace (the source slug is a live lesson).

---

## 8. Legacy-credit policy (no-fabricate; IMP-013/later own the code)

- `ch10-1` old completion → **R1 ONLY**. S5 is new material extracted from doctrine — **no** legacy completion, ever.
- `ch07` old completion → **O1** (direct REDUCE successor).
- `ch02-2` old completion → fans out to **A6 + A7** per fan-out-keep-source (A6 keeps its credit; A7 is added).
- Split-monolith completions follow exactly the SPLIT_MAP entries above.
- **Never auto-done (no old slug corresponds to them):** F1, F2, C5, S1, S5, N1, N2 — and likewise O2–O6, AP1–AP3. No migration path may fabricate credit for these units.

---

## 9. File-name convention

- **Slugs:** lowercase kebab-case, ASCII-safe (Vietnamese diacritics folded: `â→a`, `đ→d`…), descriptive of the learning job, chapter-prefixed (`chNN-…`) when the unit inherits book-chapter content; topic-only for units without a book chapter (F, S5, N, O, AP). No bare lesson IDs, no version trivia, no reuse of dead slugs.
- **Components:** kebab→PascalCase + `.astro` (each hyphenated segment capitalized). Documented exception: segments that are exact API/brand identifiers keep canonical casing (`SharedPreferences`, `WorkManager`) so `ch09-data-store-va-sharedpreferences` → `Ch09DataStoreVaSharedPreferences.astro`.
- **Quiz:** `<ComponentBase>Quiz.astro` for every lesson unit; appendix units have no quiz (`—`).
- Existing preserved components keep their **current exact filenames** (e.g. `Ch02_2MayAoMayThatDocProject.astro`, `Ch10_2EntityDaoDatabase.astro`) — never renamed for cosmetics.

**Collision scan (web/src/components/lessons/, 79 files on disk):** all 34 new component names and 34 new quiz names are distinct from every existing file, including the dormant split drafts (`Ch05_1…`, `Ch06_1…`, `Ch07_1…`, `Ch08_1…`, `Ch09_1…`, `Ch11_1…5`, `Ch04_1…3`) and the orphan quiz/shell files (`Ch01Quiz`, `Ch02Quiz`, `Ch03Quiz`, `Ch04_1Quiz`, `Ch01WelcomeToAndroidKotlin`, `Ch02GettingStartedAndroidStudio`, `Ch03AndroidFundamentals`). Dormant files are raw reference material only — none is adopted as a canonical file; each new canonical file is written fresh (porting content per batch) and the dormant/orphan files are decommissioned by their owning batch (IMP-064).

---

## 10. Integration notes (informational — not registry fields)

- **LIVE independent (14):** A1–A5, A8, A9, A12–A14, R1(content), R2, R3, R4.
- **Split-ready, one live route (18 units / 7 routes):** A6+A7 (ch02-2), A10+A11 (ch03-2), C1–C4 (ch05), S2–S4 (ch06), W1–W3 (ch08), D1–D2 (ch09), X1–X2 (ch11).
- **Draft-ready (7):** F1, F2, C5, S1, S5, N1, N2.
- **Future planned (9):** O1 (material exists in live Ch07), O2–O6, AP2, (AP1/AP3 drafts exist but pages not built).
- Prerequisite wiring order for new-core: F1→F2→(Stage 1)→C5→S1→S2–S4→S5→N1→N2, then W/D/X batches (plan §4.2 dependencies).

---

## 11. Stage-ID rule

`F1/F2 → foundation · A* → android · C* → compose · S* → state · N* → navigation · W* → network · D*/R* → data · X* → realworld · O* → optional · AP* → appendix` — no exceptions. Ch07's future O1 is **optional**, not core, regardless of the old route being live today.

---

## 12. Documentation-sync backlog (do NOT edit here; sync later)

> **Trạng thái 2026-09-11 (final QA docs sync):** mục 1 ĐÃ sync (spec §3/§12/§17/§21/§25 — xem ghi chú ở §2). Mục 3 ĐÃ sync (PROJECT_PLAN.md cập nhật trạng thái redesign COMPLETE). Mục 4: CHAPTER_SPLIT_MAP.md được đánh dấu superseded bởi registry này. Mục 5 giữ nguyên như ghi nhận historical (nội dung đã được final content review chấp nhận). Mục 2 đã xử lý từ trước (arithmetic 14/22 + 8 dead chốt ở §5).

1. ~~Spec v2 "30-min hard cap" wording (§3/§12/§17/§21/§25) — stale vs quality-first owner rule (§2 above).~~ DONE 2026-09-11.
2. ~~"15/22 URLs preserved" arithmetic anywhere it survives — superseded by the locked **14/22 + 8 dead** (§5).~~ (arithmetic chốt, không còn bản ghi sống)
3. ~~`docs/PROJECT_PLAN.md` — frozen at 2026-08-31 Task-48 state; unaware of the redesign batches already landed.~~ DONE 2026-09-11 (plan đã ghi REDESIGN COMPLETE + trỏ gate reports).
4. ~~`docs/CHAPTER_SPLIT_MAP.md` — pre-spec-v2 naming contract; superseded by this registry once integration starts.~~ DONE 2026-09-11 (banner superseded added).
5. `web/src/data/chapters.ts` ch10-1 summaryVi still says "kiến trúc 5 lớp" — S5's two-region doctrine is the accepted owner. *(historical note — content gate accepted; no change)*

---

*End of registry. Identity lock only — nothing wired.*
