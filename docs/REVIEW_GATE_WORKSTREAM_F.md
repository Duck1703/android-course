# REVIEW_GATE_WORKSTREAM_F

**Workstream F — Optional + Appendix (IMP-050…059): Ch07 REDUCE → O1 + AP2 harvest, O2–O6, AP1–AP3, treatment "Mở rộng", migration + quizzes + freshness + adversarial gate**
**Ngày:** 2026-09-09 · **Baseline:** `690e268` (quiz-sweep gate PASS) · **Close:** commit `chore: close optional/appendix review gate` (bản báo cáo này) · **Branch:** `main`, working tree clean, **not pushed**

---

## Scope / commits

Session recovery từ Git đúng expected checkpoint (HEAD `690e268`, tree clean, 40 routes, schema 12, SPLIT_MAP 13, redirects 7, hints 65).

| Commit | Nội dung |
|---|---|
| `fbb3f24` | content(optional): reduce ch07 into o1 — ledger + case-study lesson + 10q quiz; retire monolith (lessons.ts/chapters.ts/lessonStats FILE_KEY_PIN, SCHEMA_VERSION 13, SPLIT_MAP #14, redirect ch07→o1, xoá Ch07AdvancedArchitecture + Ch07Quiz) |
| *(giữa B)* | content(optional): add o2 testing + o3 adaptive-ui lessons with 10q quizzes each |
| *(giữa C+D)* | content(optional): add o4 workmanager, o5 room-migration, o6 capstone with 10q quizzes each |
| `37ccaaf` | content(appendix): add ap1-ap3 reference pages + wire o2-o6/ap1-ap3 registry identities ([slug].astro Lesson-only render, Quiz optional trong LessonEntry) |
| `8811525` | feat(ui): IMP-059 optional/appendix treatment — dashed Mở rộng group, badges, core-only progress |
| `69807b4` | fix(optional): freshness + adversarial repairs — 3 MAJOR + 13 minor |
| *(gate commit)* | chore: close optional/appendix review gate |

ĐÃ DỪNG đúng ranh giới: **không** bắt đầu Workstream G/H/I, không Model B-lite, không đụng SPLIT_MAP legacy-seed audit, không redesign sidebar numbering, không push.

## Starting state

HEAD `690e268` · 40 live routes (39 core + legacy Ch07) · 40 quiz harness · SCHEMA_VERSION 12 · SPLIT_MAP 13 · redirects 7 · hints 65 · build PASS 41 pages — khớp brief.

## Final target inventory

| Measure | Count | Verify |
|---|---|---|
| Core | **39** (F1–F2 + A1–A14 + C1–C5 + S1–S5 + N1/N2 + W1–W3 + D1/D2 + R1–R4 + X1/X2) | lessons.ts/chapters.ts |
| Optional | **6** (O1–O6) | stageId=optional |
| Appendix | **3** (AP1–AP3, reference zero-quiz) | stageId=appendix |
| Tổng learner-facing lessons | **45** | ALL_CHAPTERS = 48 units |
| Routes dist | **48 live + 8 redirect = 56 dirs** | ls dist/chapters |
| Quiz | **45 LIVE** (39 core + 6 optional; AP×3 không quiz) | quiz_audit 45/45 PASS |

## O1 — Case study: Ditto & offline-first (concepts)

- slug `ditto-offline-first-case-study` · component `DittoOfflineFirstCaseStudy.astro` · quiz `DittoOfflineFirstCaseStudyQuiz.astro` (10 câu) · stageId `optional` · number=0 label "O1".
- Nội dung: offline-first mental model (mỗi máy một quyển sổ), eventual consistency, cloud = peer tuỳ chọn; ba vai trò tầng dữ liệu (local source / remote source / synchronization); subscription = đường ống vs live query = cái chuông; repository giữ nguyên vị trí S5 (xác định và kiểm soát đường vào nguồn đáng tin — nguồn là DB cục bộ); schemaless vs schema (Constants.kt ↔ Room @Entity); bốn chỗ pattern bị thoả hiệp (biến toàn cục thay DI, getter side-effect, tài nguyên đăng ký phải giữ tham chiếu, hợp đồng rò rỉ kiểu SDK); đường dây end-to-end; khi nào offline-first / khi nào phức tạp thừa; 3 thử thách mở rộng.
- **KHÔNG** dạy Ditto API (mọi cú pháp → AP2), **KHÔNG** dạy lại repository tổng quát (S5 là tiên quyết).

## Ch07 ownership ledger

`docs/drafts/ch07-ownership-ledger.md` — 33 khối monolith, mỗi khối đúng một đích (O1 / AP2 / AP3 / REMOVE-with-reason), kèm bảng A/B/C/D nội bộ của O1 và bảng kiểm kê 12 câu Ch07Quiz cũ (4 ý giữ → viết lại; 8 ý cắt có lý do: S5/S4/W1/C2 phạm trù hoặc AP2 depth). Đã đối chiếu ngược bởi adversarial reviewer: nội dung không mất âm thầm; 5 dòng ledger (5/17/19/22/27) được cập nhật lại theo đích thực tế sau khi dựng (GlobalScope/shadowing/dead-code liệt kê sống trong bảng AP3; mục ISO-8601 REMOVE-with-reason có lý do).

## AP2 harvest

`DittoSdkApi.astro` — đăng ký App ID/Playground Token (+ cảnh báo không phân quyền); khởi tạo 4.x (từng dòng) ↔ 5.x (DittoConfig/DittoFactory + **`ditto.sync.start()`** + auth.login suspend/expirationHandler sau repair); bảng đối chiếu 4.x→5.x (toạ độ `com.ditto:ditto-kotlin`, identity, permission helper `refreshPermissions()`, minSdk 24/compileSdk 36/JDK 17, DefaultDittoForegroundService + 3 permission); query builder legacy (findAll/observeLocal/exec/upsert/_id) → DQL + bảng chuyển đổi + 3 cái bẫy; secondary constructor từ DittoDocument; DateExtensions phân tích overload resolution (String.toInstant bị bỏ từ kotlinx-datetime **0.7.0**); troubleshooting 12 hàng; drift nền tảng (AGP built-in Kotlin 8.4 thử nghiệm/9 bắt buộc, Kotlin 2.x compose plugin).

## O2 Testing

45' readiness-oriented: hai tầng test (JVM vs instrumented), quy tắc nghiệp vụ đáng test, FakeNotesRepository (cùng interface, RAM, không logic — seam tái dùng O6), MainDispatcherRule (TestWatcher + setMain/resetMain), runTest, khuôn Arrange/Act/Assert, assert qua hợp đồng công khai, một test UI (createComposeRule/onNodeWithTag/onNodeWithText/assertIsDisplayed), testTag khi cần (dạy tại mục 5.1 — provenance C5 đã sửa đúng: C5 dạy semantics, không testTag), what-NOT-to-test (5 mục), cạm bẫy (Robolectric không cần, mock framework không mặc định, flaky timing).

## O3 Adaptive UI

Window size class Compact<600 / Medium 600–839 / Expanded≥840 (+ ghi chú Large/Extra-large hiện hành); calculateWindowSizeClass tính một lần ở Activity (+ ghi chú currentWindowAdaptiveInfo của material3-adaptive là cách mới hơn trong docs); nhánh `when` → list/detail (weight tỷ trọng, empty-state design); state ownership (selectedNoteId qua ViewModel/rememberSaveable — sống qua đổi bố cục); điều hướng type-safe N2; material3-adaptive nhận diện; ba chỗ co-giãn (widthIn max 600dp, weight vs dp, posture bản lề — WindowInfoTracker.getOrCreate); a11y (FontScale, tay một, 48dp).

## O4 WorkManager

Deferred guaranteed work (3 chữ); bốn điều WorkManager KHÔNG làm (bảng phản-bật 4 myth); CoroutineWorker + success/retry/failure (retry cho lỗi tạm thời); constraints; enqueueUniqueWork + ExistingWorkPolicy REPLACE/KEEP; backoff EXPONENTIAL/LINEAR; định kỳ tối thiểu 15 phút (hạn mức hệ thống); quan sát qua getWorkInfosForUniqueWorkFlow; Worker gọi repository (S5). Freshness ghi frontmatter work-runtime 2.11.x.

## O5 Room migration

MỞ RỘNG R2 (không dạy lại Entity/DAO/Database): version đối chiếu, Migration(1,2) + ALTER TABLE ADD COLUMN NOT NULL DEFAULT, bump version, addMigrations; Room validate schema sau migration; fallbackToDestructiveMigration = nút xoá dữ liệu (kèm ghi chú deprecation overload Room 2.6+ `dropAllTables`); MigrationTestHelper test (createDatabase v1 → runMigrationsAndValidate → assert); exportSchema; auto-migration (@AutoMigration/@RenameColumn) mức nhận diện; Room 2.x (2.8.x) vs Room 3 (room3-*, SQLiteDriver) trỏ AP3.

## O6 Capstone

90' guided project, 10 bước × checkpoint (bảng: Bước / Làm gì / Chạm bài nào / Kết quả kiểm chứng); phạm vi chốt trước (2 màn hình, 1 bảng notes, offline thuần — phản-bật scope creep); NoteEntity/NoteDao/NotesRepository đầy đủ; NotesViewModel một UiState (tìm kiếm = filter trên state); NoteDetailViewModel **định nghĩa đầy đủ** (load khi noteId≠null qua `repository.note(id)`, save upsert) sau adversarial repair; nav type-safe + viewModel factory seam (tham chiếu D2); DataStore theme; Bước 10 fake-repo/test tuỳ chọn (O2). Followable: mọi bước có kết quả kiểm chứng và trỏ đúng bài đã dạy.

## AP1

Từ draft `docs/drafts/ap1-gradle-release.md`: debug-vs-release mental model, signing 3 mệnh đề, signingConfigs trước buildTypes, keys.properties pattern đầy đủ + bản vá "thiếu file vẫn sync qua", 5 bẫy bảo mật đã kiểm trên code mẫu (git-tracked keys.properties, `rootProject.file` vs `file`, gradle.properties, bẫy applicationIdSuffix vỡ instrumented test), APK vs AAB, targetSdk ≥ 36 (31/08/2026) — AGREE với Play Console Help, R8/minify/rules, **phân biệt keystore-ký-app ≠ Android Keystore runtime (X2)**, checklist phát hành. Zero-quiz.

## AP3

Chuẩn hoá từ draft `ap3-version-drift.md`: mục Ch06/08/09/11 giữ giá trị (bảng drift + bản đồ lệch) + **mục Ch07 MỚI** — bảng 15 điểm với cột phân loại (VALID / VALID ALTERNATIVE / REDUNDANT / BUG-RISK / HISTORICAL); Lệnh thường gặp (8 hàng); Glossary (18 thuật ngữ, mỗi mục trỏ bài dạy). Số liệu cập nhật theo freshness: coroutines **1.11.0 (05/2026)**, sqlcipher-android 4.18.0 + ghi chú 4.19.0 (Maven 09/09/2026), Room 2.8.5 note. Single-source rule: bài lõi giữ ngữ cảnh, bảng dài về đây; không mass-delete core.

## Optional quizzes

| Quiz | Câu | Keys (pos a/b/c/d) | Max key share | Display 1/2/3/4 | Length-rank 1/2/3/4 | Explanations |
|---|---|---|---|---|---|---|
| O1 | 10 | 2/3/3/2 | 30% | 2/3/3/2 | 2/3/2/3 | 100% |
| O2 | 10 | 2/3/3/2 | 30% | 2/3/3/2 | 1/4/4/1 | 100% |
| O3 | 10 | 2/3/3/2 | 30% | 2/3/3/2 | 3/2/4/1 | 100% |
| O4 | 10 | 2/3/3/2 | 30% | 2/3/3/2 | 4/3/3/0 | 100% |
| O5 | 10 | 3/3/2/2 | 30% | 3/3/2/2 | 3/3/4/0 | 100% |
| O6 | 10 | 3/2/3/2 | 30% | 3/2/3/2 | 4/1/4/1 | 100% |

- Harness: 6/6 gọi `initQuiz` từ `../../scripts/quiz.ts` + đủ contract (#quiz-score role=status aria-live, #quiz-retry).
- Semantic-key audit: thủ công từng câu trong lúc dựng + `quiz_letters.mjs` = **NO letter-mismatch flags** (6/6); adversarial reviewer kiểm lại độc lập = 60/60 keys đúng ngữ nghĩa.
- `quiz_audit.mjs` toàn bộ **45/45 PASS** (gồm 39 quiz cũ — không regression).
- Ch07 quiz cũ 12 câu: KHÔNG tái sử dụng mù — kiểm từng câu theo ledger (4 ý viết lại thành O1 q1/q2(+q4)/q7, 8 ý ngoài phạm vi O1).

## Reference zero-quiz behavior

- Registry cột quiz = "—" cho AP1–AP3 → lessons.ts entry **Lesson-only** (`Quiz?` tuỳ chọn trong LessonEntry).
- `[slug].astro`: `Lesson ? (<> <Lesson /> {Quiz && <Quiz />} </>) : placeholder` — AP pages render sạch, **không fake empty quiz UI** (dist: 0 fieldset, 0 quiz-score trên cả 3 trang AP).
- Stats: `quizQuestions = 0` cho AP — hành vi hợp lệ được lessonStats chấp nhận từ trước (nhánh "không có quiz = hợp lệ").
- Runtime: AP1/AP2/AP3 trả 200, chip "Phụ lục — tham khảo", sidebar nhóm "Phụ lục" riêng.

## Migration

- SCHEMA_VERSION **12 → 13** (bump đúng 1, comment v13 ghi rõ case B REDUCE + no-fabricate O2–O6/AP1–AP3).
- SPLIT_MAP **13 → 14**: entry mới `"ch07-advanced-architecture": ["ditto-offline-first-case-study"]` — replace (old chết), đúng registry §7 entry 5.
- Regression matrix **22/22 PASS** (script tạm `_wf_migration_matrix.mjs`, thuật toán `migrateProgress` trích verbatim; ĐÃ XOÁ sau khi chạy): ch07→O1 · ch07+O1 dedupe · idempotent · ch11→X1/X2 · ch09→D1/D2 · ch08→W1/W2/W3 · ch06→S2/S3/S4 · ch05→C1–C4 · ch10 monolith→R1–R4 · ch10-1→R1 · keep-source ch02-2 · ch03-2 → A10/A11 · A4 typo · combined history incl. Ch07 · empty storage · unknown-passthrough · no-fabricate NEW core · no-fabricate O2–O6 · no-fabricate AP1–AP3 · targets resolve (intermediates chain) · full-core+O1 stable · SPLIT_MAP keep-source self-audit.
- No-fabricate: O2–O6, AP1–AP3 KHÔNG có entry mapping nào; test 18/19 chứng minh old Ch07 chỉ sinh O1.

## Redirect

- **7 → 8**: `"chapters/ch07-advanced-architecture": "/chapters/ditto-offline-first-case-study/"` — đúng cột redirectTarget registry §6 row 4.
- Dist: meta-refresh tại `/chapters/ch07-advanced-architecture/index.html` trỏ đúng O1 (verify dist + preview HTTP); cả 8 redirect serve đúng target qua `astro preview` (ch05→C1, ch06→S2, ch08→W1, ch09→D1, ch10-1→R1, ch11→X1, ch03-2→A10, ch07→O1); A6 keep-source 200.
- Tổng dist: **48 live + 8 redirect = 56** chapter dirs.

## Registry / stats / file pairing

- ALL_CHAPTERS = LESSONS = **48** (39 + 6 + 3); stages: foundation 2 · android 14 · compose 5 · state 5 · navigation 2 · network 3 · data 6 · realworld 2 · optional 6 · appendix 3 ✓.
- lessonStats `FILE_KEY_PIN` thêm 9 dòng (O1 + O2–O6 + AP1–AP3 — file không theo quy ước ChNN, key = slug-bỏ-gạch như F/S1/S5/N). 4 file ngủ đông Ch07_1..4 giữ nguyên (IMP-064), thắng key 07_1..07_4 — key không thuộc registry → tự bị loại; **build fail-loud `resolveLiveFileNames()` chạy xanh = chứng minh không file ngủ đông nào thắng bucket**.
- Stats pairing verify trên dist: O1 → 10 câu; O2–O6 → 10 câu mỗi bài; AP×3 → 0 câu (không cross-swap).

## Optional/appendix UX treatment (IMP-059)

- Sidebar: nhóm `stage.kind !== "core"` → class `module-optional` (viết **nét đứt**, nền nhạt); thu mặc định, **tự mở khi route active** (verify: mở đúng 1 khi ở O1, 0 khi ở home); badge `Mở rộng` (6) / `Tham khảo` (3) sau số thứ tự; module-num hiển thị "M"/"P" cho order 9/10.
- Lesson header: chip `Mở rộng — không bắt buộc` / `Phụ lục — tham khảo` đứng trước chip module.
- CSS mới thuần additive trong `shell.css` + `lesson.css` (dùng token sẵn có).
- Sidebar numbering (badge 5.1, 10.2...) **không đổi** — Workstream H sở hữu.

## Core progress isolation

- Header topbar + homepage hero % + pcard: **đếm CORE ONLY (39)** qua `data-track="core|optional|appendix"` trên mọi link sidebar/card homepage; label tĩnh cũng render 39 ("0/39 phần", "tổng số phần 39").
- Module bars vẫn đếm đúng nhóm riêng (optional group có bar riêng = 6 phần).
- ProgressToggle/progress.ts không đổi hành vi (optional bài vẫn đánh dấu được, chỉ không tính vào % lõi). Model B-lite (IMP-070) KHÔNG pre-implement — ghi chú trong code trỏ Workstream G.

## Voice / prerequisites

- Sweep "sách nói / tác giả / chapter này" trên 9 file mới: 0 hit trong phần render (1 hit duy nhất là comment frontmatter AP1 trích tên chuẩn — không render; dist = 0).
- Giọng "giáo trình gốc" chuẩn hoá ở AP2/AP3 (sau repair: "sách" → "giáo trình" trong bảng/nội dung reference).
- Prerequisites: O lessons giả định core (S5/S4/S1/W1/C2/C3/N1/N2/D1/R2/R3/A14); O6 không đòi O2 (Bước 10 là tuỳ chọn, có cảnh báo rõ); O1 trỏ S5 đúng doctrine (sau repair #4).

## Freshness review (independent reviewer, official sources, 09/09/2026)

| Family | Kết quả |
|---|---|
| O1/AP2 Ditto | 5.1.0/5.0.0, toạ độ, query-builder deprecation 4.12, refreshPermissions, minSdk/JDK, foreground service — AGREE. **1 MAJOR đã sửa**: v5 snippet dùng `startSync()` → sửa thành `ditto.sync.start()` + login suspend/expirationHandler (5.x migration guide) |
| O2 Testing | createComposeRule/onNode*/assertIsDisplayed, MainDispatcherRule+runTest, ui-test-junit4 androidTest — AGREE toàn bộ |
| O3 Adaptive | ngưỡng 600/840 AGREE; MINOR đã ghi: docs hiện hành có 5 bậc (Large/Extra-large) + `currentWindowAdaptiveInfo()` — đã thêm ghi chú cả hai |
| O4 WorkManager | CoroutineWorker, 15-min quota, 3 kết quả, backoff, unique policy, Flow observation, work-testing — AGREE; frontmatter 2.11.x cập nhật |
| O5 Room | Migration/validate/TestHelper/auto-migration — AGREE; MINOR đã ghi: 2.8.5 trên Maven + deprecation overload `dropAllTables` |
| AP1 Gradle | targetSdk ≥36 (31/08/2026) + existing ≥35 — AGREE chính xác với Play Console Help; Play App Signing, R8 facts — AGREE |
| AP3 tables | datastore 1.2.1, Retrofit 3.0.0/2.12.0, Moshi 1.15.2, Coil 3.6.x, security-crypto 1.1.0 — AGREE; MINOR sửa: coroutines 1.11.0 (05/2026), sqlcipher 4.19.0 note |

**FRESHNESS VERDICT sau repair: 0 BLOCKER / 0 MAJOR / (8 MINOR — đã sửa hoặc ghi chú tại chỗ 7, AGP imprecision sửa 1).**

## Final adversarial (independent reviewer, 19 axis)

**WORKSTREAM_F_ADVERSARIAL_RESULT trước repair: 0 BLOCKER / 2 MAJOR / 11 MINOR.**

| # | Mức | Phát hiện | Repair (commit `69807b4`) |
|---|---|---|---|
| 1 | MAJOR | O1 + quiz nói "repository là nguồn đáng tin" — mâu thuẫn S5 mục 6 (repository *xác định/kiểm soát* đường vào, không *là* nguồn) | Sửa 3 chỗ (§3, Tóm tắt, quiz q5) theo doctrine S5 |
| 2 | MAJOR | O6 Bước 6/7 không followable: NoteDetailViewModel chưa định nghĩa, navSnippet dùng biến chưa khai báo | Định nghĩa NoteDetailViewModel đầy đủ + nav dùng viewModel factory seam + hàm `note(id)` theo quy ước S5 |
| 3 | MINOR | AP2 trỏ ".asReversed() mà O1 nhắc" (O1 không nhắc) | Sửa thành mô tả trung tính trỏ C2 |
| 4 | MINOR | O2 provenance "testTag theo C5" sai (C5 dạy semantics) | Sửa provenance |
| 5 | MINOR | O4 quiz "Four myth" tiếng Anh | "Bốn myth" |
| 6 | MINOR | O3 dùng string-route NavHost cũ + `rememberWindowInfoTracker()` không tồn tại | Type-safe route N2 + `WindowInfoTracker.getOrCreate(context)` |
| 7 | MINOR | Ledger 3 dòng đích lệch thực tế | Cập nhật rows 17/22/27 theo đích AP3 thực |
| 8 | MINOR | Ledger row 5 hứa 1 câu manifest-merger trong O1 không có | Ghi rõ quyết định chốt khi dựng |
| 9 | MINOR | `toIso8601String` critique không được harvest | REMOVE-with-reason có lý do trong ledger row 19 |
| 10 | MINOR | AP2 thiếu UTC/sort-key rationale | Row 19 REMOVE-with-reason + sort/ORDER BY giữ ở AP2 mục 4 |
| 11 | MINOR | AP3 voice "sách" chưa chuẩn hoá | "giáo trình" |
| 12 | MINOR | O1 cross-ref "mục 5.1–5.4" không điều hướng được | Thêm h3 id 5.1–5.4 |
| 13 | MINOR | (freshness minors — xem bảng Freshness) | Đã sửa/ghi chú |

**WORKSTREAM_F_ADVERSARIAL_PASS: 0 BLOCKER / 0 MAJOR sau repair (13 MINOR đã xử lý — sửa trực tiếp hoặc ghi nhận có lý do).**

## Runtime

- `astro preview :4321`: O1–O6 + AP1–AP3 = **200** (9/9); home 200; A6 keep-source 200.
- Redirect ch07 → meta-refresh đúng O1; 8/8 redirects serve đúng target.
- Quiz runtime contract trên dist (6 trang): 10 fieldset + 10 explain + #quiz-score + #quiz-retry mỗi trang; harness bundle `_astro/quiz.*.js` chứa logic chấm + tự-init (DOM-ready). Reference AP×3: 0 fieldset, không empty-quiz UI.
- Sidebar: nhóm optional/appendix collapsed trên home, tự mở trên route active; badge/Mở rộng/Tham khảo hiện đúng 6/3; mobile drawer/active-state dùng markup không đổi (same <details>/<a> contract).
- Không stale href `/chapters/ch07-advanced-architecture/` trong dist live pages (chỉ trang redirect).

## Build / Astro

- `npm run build`: **PASS — 49 pages** (48 routes + home), 56 chapter dirs gồm redirects.
- `npx astro check`: **0 errors / 0 warnings / 67 hints** — baseline 65 → +2 (Frontmatter comment khối dài O6/AP2, không phải regression logic; không có hint mới ngoài hai file mới). Đã đối chiếu: hint profile tăng do 2 file mới và nội dung dài — hợp lý, có giải thích.
- `node scripts/quiz_audit.mjs` (45 quiz): **45/45 PASS**.

## Cleanup decisions

- Monolith `Ch07AdvancedArchitecture.astro` + `Ch07Quiz.astro`: **ĐÃ XOÁ** (route chết đúng registry §6 row 4; nội dung được port theo ledger).
- 4 file ngủ đông Ch07_1..4: **GIỮ** (IMP-064 sở hữu cleanup; đã chứng minh không nhiễm stats).
- Draft `ap1-gradle-release.md` / `ap3-version-drift.md`: GIỮ (nguyên liệu đã dựng thành trang; draft giữ vai trò nguồn — chính sách giữ draft như Stage 1–7).
- Ledger `ch07-ownership-ledger.md`: GIỮ vĩnh viễn (bằng chứng no-loss).
- Script migration regression tạm: đã xoá (không vào git).

## Deviations

1. **Số quiz O-family = 10 (không 8–12 tuỳ ý):** đúng chuẩn 8–12, chọn 10 cho đồng đều 6 bài.
2. **Hints 65 → 67 (+2):** do 2 file lesson mới dài; astro check 0 errors/0 warnings — không phải regression.
3. **O1 số mục dùng h3 5.1–5.4** sau adversarial repair để cross-ref điều hướng được (ban đầu chỉ bold paragraphs).
4. **Registry "11 chương" trên rail giảm còn 11 từ 12:** số chương đếm theo `number` distinct — Ch07 (number 7) retired và O1–O6/AP dùng number 0 → tổng chương sách hiển thị giảm 12→11. Đây là hệ quả đúng của việc retire Ch07 khỏi số chương sách (O1 không thuộc chương sách nào). Không phải bug đếm.
5. **AP2 v5 snippet sau freshness repair** dạy `ditto.sync.start()` (5.x) — khác bảng đối chiếu trong cùng trang ghi "startSync" ở cột 4.x (đúng: 4.x gọi startSync, 5.x gọi sync.start) — cố ý để hai cột khác nhau.

## Findings

- **Blockers:** 0
- **Major:** 0 (3 phát hiện — 1 freshness AP2, 2 adversarial — đã sửa hết @ `69807b4`)
- **Minor:** 19 phát hiện (13 adversarial + 8 freshness trừ trùng) — đã sửa 15 tại chỗ, 4 ghi nhận có lý do trong ledger/docs (toIso8601 REMOVE-with-reason, O3 five-classes ghi chú, Room 2.8.5 note, sqlcipher 4.19 note).

## Gate verdict

**GATE PASS** — mọi PASS-requirements của brief §43 đạt: content O1–O6 + AP1–AP3 final; Ch07 accounted 0-loss; O1 concepts-only; AP2 owns Ditto depth; O2–O5 technically current; O6 followable; quiz 6×10 = 60 câu đúng chuẩn (4 option, 1 key, 100% explanations, harness, semantic key, value/display/rank ≤40%); AP zero-quiz đúng; routes 39+6+3 = 48, không legacy Ch07; migration schema 13 / map 14 / redirect 8, no-fabricate giữ nguyên; UX "Mở rộng" rõ, core primary, progress core-only; WORKSTREAM_F_ADVERSARIAL_PASS (0B/0M); build/check/audit xanh; tree clean, not pushed.
