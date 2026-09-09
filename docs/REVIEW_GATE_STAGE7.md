# REVIEW_GATE_STAGE7

**Batch:** Stage 7 / Real-world — Ch11 monolith → X1 / X2 (registry §7 entry 8)
**Baseline:** `071fbdc` (Stage 6 gate PASS) · **Close:** commit `chore: close stage7 content review gate` (bản báo cáo này) · **Branch:** `main`, working tree clean, **not pushed**

---

## Scope / commits

Session bắt đầu từ recovery (các session trước termination liên tục); mọi công việc hoàn thành đều commit theo checkpoint để session kế tiếp resume được từ Git.

| Commit | Nội dung |
|---|---|
| `08b1172` | content(realworld): X1 `Ch11FilesSafVaBackup.astro` (mục 1–8.5) + X2 `Ch11KeystoreSqlcipherVaMaHoa.astro` (mục 9–21) — tách monolith theo mốc X1/X2 START/END |
| `02356ed` | content(quiz): X1 quiz 10 câu + X2 quiz 12 câu (4 option, 100% giải thích, harness chung), 3 chiều chống bias tự kiểm |
| `99ac2ae` | chore(data): AP3 Ch11 pointer → hai slug tường minh + 15-điểm map trỏ "bài X1/X2" đúng mục |
| `fade8bb` | content(quiz): rebalance length-rank (X1 1/4/1/4, X2 2/3/3/4) sau khi audit đo theo cách quiz_audit thật (strip tags + collapse whitespace) |
| `d50bb14` | feat(realworld): wiring nguyên tử — lessons.ts/chapters.ts/lessonStats FILE_KEY_PIN, SCHEMA_VERSION 12, SPLIT_MAP 13, redirect ch11→X1, xoá Ch11AdvancedStorage + Ch11Quiz |
| `ece547d` | chore(data): QUIZ_MIGRATION_STATUS (Ch11Quiz → retired Stage 7 + 2 quiz harness mới) |
| `c0c84f6` | fix(realworld): freshness repairs — quyền SAF "tới khi thiết bị khởi động lại" (không phải "chết theo process"), persisted-grant 512/128, SQLCipher 4.19.0 note + làm dịu nhân quả 16KB |
| `6f9d868` | fix(realworld): adversarial minors — phục hồi bảng threat-model 5 hàng vào X1 mục 1, chi tiết journey-callout vào X2 mục 11, AP3 KeyInfo mốc "API ≤ 28" → "≤ 30" |

ĐÃ DỪNG đúng ranh giới: **không** đụng Ch07 (O1–O6), appendix (AP1–AP3 nội dung khác), homepage, quiz các stage trước (ngoài ghi nhận retirement Ch11Quiz trong docs), không push, không bắt đầu phase sau Stage 7.

## Starting / recovery state

Session 1 verify baseline: HEAD `071fbdc`, tree clean, 39 live lessons, realworld stage 0 live (monolith một route), SCHEMA_VERSION 11, SPLIT_MAP 12, redirects 6, hints 65, build PASS 40 pages — khớp expected checkpoint của brief. Session tiếp theo recovery lại đúng từ Git (X1 untracked, X2 chưa tồn tại) — checkpoint commit đã giữ mọi thứ.

## Final curriculum

### X1 — "Files, SAF & Backup: chọn chỗ lưu, nhờ người dùng chỉ"
- **slug:** `ch11-files-saf-va-backup` (registry §3, đúng từng ký tự) · **component:** `Ch11FilesSafVaBackup.astro` · **quiz:** `Ch11FilesSafVaBackupQuiz.astro`
- **nội dung:** mục 1–8.5 — khung ba câu hỏi độc lập (vị trí ≠ mã hoá ≠ backup) + bảng threat-model 5 tình huống (root/backup/mất máy/debug/lỗi lập trình) và nuance "mã hoá bảo vệ data at rest, không bảo vệ app đang chạy"; bản đồ chỗ lưu; `filesDir`/`cacheDir` + `use { }` + main-thread + cache quota; Device Explorer; hợp đồng cache; external storage (app-specific vs chung; `getExternalStoragePublicDirectory()` = HISTORICAL); SAF (Uri ≠ đường dẫn, ACTION_CREATE_DOCUMENT, Activity Result API, OpenDocumentTree, `takePersistableUriPermission` + giới hạn 512/128, quyền sống "tới khi thiết bị khởi động lại" theo docs, ContentResolver streams); Database Explorer (bàn đạp bài sau); backup (Auto Backup mặc định ≤ 25 MB, cache loại trừ cứng, hai thế hệ rule: `dataExtractionRules` 12+ / `fullBackupContent` 11−, trạng thái rule thật của project = rỗng rule).
- **KHÔNG dạy** (contract comment frontmatter): mã hoá/Keystore/SQLCipher/ESP (X2 mục 9–21) · bẫy backup+key lifecycle (X2 mục 15) · Room integration (R1–R4) · DataStore cơ chế (D1).

### X2 — "Mã hoá: Keystore, SQLCipher & các API lịch sử"
- **slug:** `ch11-keystore-sqlcipher-va-ma-hoa` · **component:** `Ch11KeystoreSqlcipherVaMaHoa.astro` · **quiz:** `Ch11KeystoreSqlcipherVaMaHoaQuiz.astro`
- **nội dung:** mục 9–21 — Keystore (bài toán con gà-trứng, Keystore = container cho KHOÁ, non-exportable, `load(null)`; 9.1 ba mức software/TEE/SE-StrongBox, hardware-backed KHÔNG mặc định, runtime check `getSecurityLevel()` API 31+ / hàm cũ ≤ 30, StrongBox tuỳ thiết bị + `StrongBoxUnavailableException`; 9.2 KeyChain ≠ Keystore, 4 method còn dùng); thêm security library (diff starter↔final, 5 version bump); `SecurePrefs` = đọc code lịch sử (envelope encryption hai lớp key, SIV deterministic vs GCM values, "đừng đặt bí mật vào tên key"); đổi `Prefs`→`SecurePrefs` (bước lùi kiến trúc được gọi đúng tên, code chết null-check + thay đổi hành vi, 6 chỗ sửa + **7 chỗ gọi `RecipeViewModel(prefs, repository)` đã grep kiểm đếm** — sửa sai số "8 file preview" của monolith); SQLCipher (seam 1 dòng `openHelperFactory`, dependency inversion qua `SupportSQLiteOpenHelper`, giới hạn ≠ phân quyền; 13.1 ba điểm yếu `getPassCode` + bản đề nghị SecureRandom; 13.3 hai thay đổi âm thầm database); nối dây `RecipeApp.onCreate` (14.1 thuế main thread); **bẫy backup + key lifecycle (mục 15)** — nơi hai bài chạm nhau, javadoc ESP WARNING nguyên văn, exclude rules cả hai kênh, nguyên tắc "backup policy và key lifecycle thiết kế cùng nhau"; ghi chú phiên bản (16.1 security-crypto 1.1.0 deprecated toàn bộ, 16.2 SQLCipher artifact EOL + `System.loadLibrary` bắt buộc + 4.19.0 note, 16.3 Room 3 bỏ `openHelperFactory`); **bảng 15 chỗ lệch đầy đủ (mục 17)** với hàng 1–4 trỏ về "bài Files, SAF & Backup"; lỗi thường gặp (mục 18); Key Points 18 bullet phân [X1]/[X2]/[X1+X2] (mục 19); 4 thử thách `class="chal"` (mục 20); nhìn lại lộ trình (mục 21).

Monolith `Ch11AdvancedStorage.astro` + `Ch11Quiz.astro`: **ĐÃ XOÁ** (route chết đúng registry §6 row 8). Số mục liên tục 1–21 trên hai bài, khớp mốc X1 START/END (1–8.5) và X2 START/END (9–21).

## Ch11 ownership audit (content loss = 0)

Đối chiếu từng khối monolith (`git show 071fbdc:...`) với đích:

| Khối monolith | Đích |
|---|---|
| Mục 1 (vi-sao + threat-model table + data-at-rest nuance) | X1 mục 1 (bảng 5 hàng + nuance — khôi phục sau adversarial `6f9d868`) |
| Mục 2–8.5 (file map → backup rules) | X1 (rewrite giọng trung tính, giữ mọi claim có nguồn) |
| Mục 9–16.3 (Keystore → Room 3) | X2 nguyên khối (verbatim + cải tiến) |
| Mục 17 bảng 15 chỗ lệch | X2 giữ ĐỦ 15 hàng, hàng 1–4 trỏ X1 theo tên bài |
| Mục 18 lỗi thường gặp (10 hàng) | X2 nguyên bảng (hàng X1 trỏ đúng bài) |
| Mục 19 Key Points 18 bullet | X2 giữ trọn bộ 6×[X1] + 10×[X2] + 2×[X1+X2] |
| Mục 20 thử thách (4 `chal`) | X2 nguyên 4 khối |
| Mục 21 nhìn lại | X2 |
| Cạm bẫy nửa X1 (3 warn) / nửa X2 (3 warn) | X1 / X2 (sandbox≠encryption nâng lên X1) |
| Journey-callout "diff nhỏ nhất" + "35 dòng" | X2 mục 11 (khôi phục sau adversarial) |
| #nguon hai nửa | X1 / X2 theo nửa sở hữu |

## Registry identities & wiring

- `ALL_CHAPTERS` == `LESSONS` == lessonStats == live dist lesson routes == **40** (39 − 1 monolith + 2 X). Không duplicate, không placeholder.
- Hai entry chapters.ts: `number: 11`, `subNumber: 1/2`, `parentTitle: "Advanced Storage"`, `stageId: "realworld"`, `aafFolder: "11-advanced-storage"`, `hasProject: true`. Sidebar tự sinh "Giai đoạn 7 — Real-world" đúng thứ tự **X1 → X2** (dist: prev của X1 = 10.4, X1↔X2 nối prev/next, homepage chỉ còn 2 href ch11 sống).
- **FILE_KEY_PIN:** `"ch11-files-saf-va-backup": "11_1"`, `"ch11-keystore-sqlcipher-va-ma-hoa": "11_2"` — cần ghim vì 5 file ngủ đông Ch11_1..5 (IMP-064 giữ) trùng tiền tố key 11_1..11_5 (bug-class Stage 1/3/5/6). `pascalOf(slug)` khớp tên file thật cho cả hai slug (Files/Keystore/Sqlcipher đều hoa đúng chỗ) → **KHÔNG cần** FILE_NAME_CASE/FILE_NAME_PIN mới (đã verify block FILE_NAME_CASE không có entry ch11).
- **Stats pairing verify trên dist:** X1 → **10 câu hỏi** fieldset histogram a3/b2/c3/d2; X2 → **12 câu hỏi** a3/b3/c3/d3 — khớp đúng quiz của từng bài, không cross-swap. Build fail-loud `resolveLiveFileNames()` chạy xanh (41 pages) = chứng minh thực nghiệm không file ngủ đông thắng bucket nào.

## Progress migration

- schema before 11 → after **12** (bump đúng 1 — dead-source split, đúng contract §G).
- map before 12 → after **13**; entry mới: `"ch11-advanced-storage": [X1, X2]` — replace (old chết), fan-out hợp lệ vì cả hai bài kế nhiệm trực tiếp; comment ghi rõ KHÔNG có bài NEW trong batch.
- migration regression: **21/21 PASS** (script tạm mở rộng từ matrix Stage 6, thuật toán `migrateProgress` trích verbatim): ch11 → đúng cặp X · dedupe · idempotent v12 · stale flag "11" upgrade "12" · ch09/ch08/ch06/ch05/ch10 chains · ch10-1→R1 · keep-source ch02-2 · ch03-2 · A4 typo · combined 9-monolith history · corrupt storage · unknown-passthrough · no-fabricate (F1/F2/C5/S1/S5/N1/N2 không xuất hiện) · SPLIT_MAP self-audit. Script tạm **đã xoá** (file git-ignored, chưa từng vào git).

## Redirect

- before 6 → after **7**: thêm `"chapters/ch11-advanced-storage": "/chapters/ch11-files-saf-va-backup/"` — đúng cột redirectTarget registry §6 row 8. Dist artifact: meta-refresh tại `/chapters/ch11-advanced-storage/index.html` trỏ đúng X1; **astro preview :4399** — cả 7 redirect serve đúng target, X1/X2/Ch10.4/home = 200.
- Tổng dist: **40 live + 7 redirect = 47** chapter dirs.

## Quizzes

| Quiz | Câu | Keys | Max key share | Display-pos | Length-rank (audit) |
|---|---|---|---|---|---|
| X1 | 10 | c a b c a d b a d c | 3/10 = 30% | 3/3/2/2 (max 30%) | 1/4/2/3 → max 40% |
| X2 | 12 | b c a d b c a d c b a d | 3/12 = 25% | 3/3/3/3 (max 25%) | 2/3/3/4 → max 33% |

- `node scripts/quiz_audit.mjs`: **2/2 PASS** · 4 options/1 correct · explanations 100% · shared harness `initQuiz` + `#quiz-retry`.
- **Semantic-key audit:** 22/22 key trỏ đúng đáp án đúng NGỮ NGHĨA (reviewer độc lập đối chiếu nguồn đã verify, gồm cả toán 70/89 bit, hành vi kênh backup, trap restore).
- **Ba chiều chống bias** (bài học Stage 5: quiz_audit chỉ đọc value — label order xáo trộn thủ công khi soạn): value a/b/c/d + vị trí HIỂN THỊ + rank độ dài, đều ≤ 40% (X1 rank-4 đúng biên 40%, trong ngưỡng).
- **Security myth check trên quiz:** không đáp án đúng nào hàm ý sandbox=mã hoá, ESP=current default, SharedPreferences deprecated, SQLCipher tự quản key, ciphertext backup = decrypt được (mỗi myth bị phản biểu trong giải thích).
- Monolith Ch11Quiz retirement ghi vào `docs/QUIZ_MIGRATION_STATUS.md` (row **retired (Stage 7)** + 2 hàng harness mới; widget sắp-thứ-tự và 4 bài tập interactive của monolith không có đích chuyển thẳng — đúng pattern split-quiz đã duyệt Ch06/Ch08/Ch09, tri thức cốt sống ở X2 mục 12–15 và 4 `chal`).

## Cross-references & docs

- **AP3** (`docs/drafts/ap3-version-drift.md` §Ch11): "Bài lõi trỏ về đây" → hai slug tường minh X1/X2; bảng 15-điểm map dùng nhất quán "bài X1/X2" đúng mục (row 8 → X2 mục 12, row 12 → X1 mục 8.5 + X2 mục 15); mốc KeyInfo đồng bộ "API ≤ 30" (adversarial minor đã sửa `6f9d868`).
- X1 ↔ X2: mọi trỏ chéo theo TÊN BÀI + số mục ("bài Files, SAF & Backup — mục 8.5" / "bài sau, mục 15") đều tồn tại thật; zero `href="#"` gãy.
- Prerequisites: X1 = Chương 1/9/10, S1, A12, C4 (+ khái niệm file mới dạy từ đầu); X2 = Chương 9/10/10.4, S1, A14, X1 mục 1 + 8.5 — tất cả đều là unit live thật (A12 = ch03-3, C4 = ch05-preview, A14 = ch04).

## Voice / provenance

- Voice: giọng trung tính "giáo trình dạy… — hiện nay…", attribution chỉ trong `#nguon`/`p.src`; 0 TODO/placeholder ngoài 2 TODO trích nguyên văn `securePrefsSkeletonCode` (code project, được phép) và "TODO" mô tả file XML thật của project trong X1.
- Provenance: đúng 1 `#cam-bay` + 1 `#nguon` mỗi bài (2/2 verify). Nguồn trích project mẫu ghim file+dòng (SecurePrefs.kt 41–74, RecipeDatabase.kt 40–84, RecipeApp.kt 48–69, MainScreen.kt 56/67–68, MainActivity.kt 55/67/82, RecipeViewModel.kt 40/75–76, 7 call sites nêu đường dẫn cụ thể, toml 24–25/86/89, build.gradle.kts 90–91, SpoonacularService.kt:47) — đã kiểm bằng grep/Read phiên 2026-09-09. Đúng 1 `<section class="lesson">`, 1 `</section>`, mọi bảng/div/p cân.

## Build / Astro

- `npm run build`: **PASS** — 41 pages (40 lesson + homepage), 7 redirect artifacts.
- `npx astro check`: **0 errors · 0 warnings · 65 hints** (= baseline 65, không hint mới).

## Runtime sanity

- astro preview :4399: home/X1/X2/Ch10.4 = 200; 7 redirect meta-refresh đúng target (ch11-advanced-storage → X1 verify bằng HTTP).
- Static dist: title đúng "Chương 11.1"/"Chương 11.2", TOC/heading chuẩn (X1 `ba-cau-hoi`…, X2 `keystore`…`bang-lech`), quiz form + 10/12 `.explain` hiện diện; homepage chỉ còn href ch11 = X1/X2. (Browser thật không dùng — brief cho phép dist/HTTP thay thế.)

## Freshness adversarial review

**Reviewer scope:** 1 reviewer độc lập (background agent), tự fetch nguồn chính thức: developer.android.com Auto Backup / SAF-docs / Keystore / KeyChain reference / API-diff-31 / androidx security-crypto releases + javadoc source / AOSP `KeyInfo.java` + `KeyChain.java` / Maven Central + Zetetic blog + migration guide + sqlcipher-android GitHub + AAR giải nén / Google Maven metadata Room. Ngày review: 2026-09-09.

**Verdicts: 4 AGREE · 3 MINOR · 0 MAJOR · 0 BLOCKER (OVERALL MINOR).**

| # | Claim area | Verdict |
|---|---|---|
| 1 | X1 autobackup (mặc định, 25 MB, cache hard-exclude, hai thế hệ rule, exclude>include, per-channel) | **AGREE** — xác minh nguyên văn |
| 2 | X1 storage/SAF (API 29, no-permission model, ContentResolver) | **MINOR** → đã sửa `c0c84f6`: quyền SAF mặc định sống "tới khi thiết bị khởi động lại" (không phải "chết theo process"); persisted-grant hiện tại 512 (A11+), 128 bản cũ |
| 3 | X2 Keystore (container/non-exportable/never-in-app-process, hardware-backed không mặc định, API 31 mốc, StrongBox, KeyChain 4 method + @WorkerThread + IllegalStateException) | **AGREE** — xác minh cả trên AOSP source |
| 4 | X2 security-crypto (1.1.0 30/07/2025, all-APIs deprecated, "no subsequent releases", MasterKeys 10/06/2020, ESP javadoc WARNING nguyên văn, DataStore ≠ encryption, SharedPreferences không @Deprecated) | **AGREE** — nguyên văn |
| 5 | X2 SQLCipher (EOL 31/08/2023, 4.5.4 cuối, artifact/package/SupportOpenHelperFactory/loadLibrary, Room 2+3) | **MINOR** → đã sửa `c0c84f6`: ghi chú 4.19.0 (08/09/2026); làm dịu nhân quả 16KB (Zetetic nêu lý do là tương thích SplitInstallHelper) |
| 6 | X2 Room (2.8.4 19/11/2025; room3 3.0.2 26/08/2026 theo Maven metadata; Room 3 bỏ SupportSQLite/Cursor/openHelperFactory; 2.7.0 setDriver+KMP; 2.8.0 wrapper) | **AGREE** |
| 7 | Quiz semantic keys (22 câu) | **AGREE** |

**Repairs freshness (commit `c0c84f6`):** X1 mục 7.4 + tóm tắt + cạm bẫy 2 + quiz Q4; X2 mục 16.2 + snippet comment + #nguon. Quiz ranks rebalanced sau khi option dài ra (X1 1/4/2/3) — value/display distribution giữ nguyên.

**Final count sau repairs: 0 BLOCKER · 0 MAJOR · 0 MINOR chưa xử lý.**

## Final adversarial review

**Reviewer scope:** 1 reviewer độc lập khác, tấn công 13 mặt lỗi trên FILE THẬT tại HEAD `c0c84f6` (không tin gate report; monolith soi từ `git show 071fbdc:...`; tự chạy build + astro check verify). Ngày review: 2026-09-09.

**Findings: 10/13 PASS · 0 BLOCKER · 0 MAJOR · 3 MINOR:**

1. **MINOR (content-loss):** bảng threat-model 5 hàng của monolith mục 1 + nuance "data at rest, không bảo vệ app đang chạy" chưa có đích → đã phục hồi vào X1 mục 1 (`6f9d868`).
2. **MINOR (AP3):** §2 KeyInfo còn "API ≤ 28" trong khi X2 đã sửa thành 31+/30− → đã đồng bộ (`6f9d868`).
3. **MINOR (content-loss):** chi tiết journey-callout ("diff nhỏ nhất toàn bộ giáo trình", "35 dòng code") bị rơi → đã phục hồi vào X2 mục 11 (`6f9d868`).

**11 mặt còn lại PASS có bằng chứng riêng:** content-loss ledger đủ (15-row bảng-lech, mục 18/19/20 nguyên vẹn), ownership X1/X2 đúng mốc, myths 11/11 bị phản biểu tại chỗ nêu rõ, voice 0 leak, quiz keys 22/22 ngữ nghĩa + value/display/rank ≤40%, wiring đúng 4 file data + redirect, pascalOf khớp tên file thật + build fail-loud chứng minh không dormant thắng bucket, dormant Ch11_1..5 isolated (không route/registry/stats bucket), 0 dead anchor, dist 7 redirect đúng, prerequisites đúng unit live, numbering X1 1–8.5 / X2 9–21 không trùng id.

**Re-verification sau repairs:** build PASS 41 pages · astro check 0/0/65 · quiz_audit 2/2 PASS · dist X1 chứa bảng threat-model · HTTP sanity lặp lại OK.

**Verdict: STAGE7_ADVERSARIAL_PASS — 0 BLOCKER · 0 MAJOR** (3 MINOR đã sửa trong `6f9d868`).

## Findings

- **Blockers:** none.
- **Major:** none.
- **Minor (documented, đã xử lý):** (1) SAF lifetime wording — sửa `c0c84f6`; (2) persisted-grant 512/128 — sửa `c0c84f6`; (3) SQLCipher 4.19.0 + 16KB causality — sửa `c0c84f6`; (4) threat-model table — phục hồi `6f9d868`; (5) AP3 mốc 28→30 — sửa `6f9d868`; (6) journey-callout detail — phục hồi `6f9d868`; (7) monolith quiz widget + 4 bài tập interactive không có đích chuyển thẳng — note-only, đúng pattern split-quiz đã duyệt.
- X1 rank-4 chạm đúng biên 40% (không vượt) — note-only cho lần sửa quiz sau.

## Cleanup ownership

- File ngủ đông Ch11_1CacChoLuuFile / Ch11_2SafVaKeystore / Ch11_3SecurePrefsVaSqlCipher / Ch11_4NoiDayBackupPhienBan / Ch11_5NhinLaiCaKhoaHoc: **GIỮ** trên đĩa theo IMP-064; cách ly khỏi registry (0 tham chiếu lessons.ts/chapters.ts) và stats (FILE_KEY_PIN ghim file live vào 11_1/11_2; build fail-loud xanh chứng minh không bucket nào bị chiếm).
- Monolith + monolith quiz: xoá trong batch wiring (`d50bb14`) đúng mốc registry.
- Script tạm migration matrix: xoá trước final gate (chưa từng vào git — `web/scripts/` bị ignore).
- Ch07/appendix: 0 byte đổi.

## Gate verdict

**GATE PASS** (sau adversarial closure `c0c84f6` + `6f9d868`) — X1/X2 live đúng thứ tự, mục liên tục 1–21 theo mốc monolith · **40 live lessons** · **realworld stage 2** (X1, X2) · Ch11 valuable content fully accounted (ownership ledger trên, adversarial xác nhận) · security model đúng (myths 11/11 blocked) · ESP/security-crypto historical-only · SQLCipher framing đúng (at-rest, key management là việc của app, artifact EOL) · backup/key lifecycle đúng (mục 15 + hai kênh backup rule) · **2 quizzes PASS** (10+12 câu, 4 option, 1 đúng ngữ nghĩa, harness chung) · **semantic keys 22/22** · **DISPLAY positions audited** (≤30% / 25%) · rank ≤40% · **schema = 12** · **SPLIT_MAP = 13** · **redirects = 7** · migration chains trước đó 21/21 PASS · stats pairing đúng (FILE_KEY_PIN 11_1/11_2, không cross-swap) · **0 unresolved BLOCKER** · **0 unresolved MAJOR** · **STAGE7_ADVERSARIAL_PASS** · build PASS 41 pages · astro check 0/0/65 (baseline giữ nguyên) · runtime sanity qua preview/HTTP · working tree clean · **chưa push**.

Sẵn sàng cho owner review trước các phase hoàn thiện toàn khoá học.
