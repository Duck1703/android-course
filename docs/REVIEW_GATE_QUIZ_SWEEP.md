# REVIEW_GATE_QUIZ_SWEEP

**Long Phase 5 — Whole-course Quiz Sweep (IMP-060 refresh + IMP-061 editorial sweep + IMP-062 orphan decommission + gate)**
**Ngày:** 2026-09-09 · **Kho ảnh hưởng:** `web/src/components/lessons/*Quiz.astro` (data-only trừ Ch07) · **Báo cáo trạng thái:** `docs/QUIZ_MIGRATION_STATUS.md`

## Scope / commits

| Commit | Nội dung |
|---|---|
| `68b8078` | docs(quiz): refresh whole-course quiz inventory (IMP-060) — 40 LIVE / 0 ORPHAN, 31 PASS / 9 FAIL baseline |
| `ed69603` | fix(quiz): repair semantic miskeys (A5/A7) + display/rank rebalance (A5, C1, C2, C4) + stale refs (A2, A9) |
| `5b01b6a` | fix(quiz): rebalance C3/C5 display+rank profiles, fix C5 a11y ref wording (wave 3) |
| `9ca0d65` | fix(quiz): rebalance R1/R2/R4 length-rank profiles (data-only trims) |
| `2e15731` | fix(quiz): S-family adversarial repairs — S1 q3 miskey, S2/S3/S5 explanation letter mismatches; Ch07 migrate to harness + 19→12q + rebalance; W2/D2 minors |
| *(gate commit — điền khi close)* | chore: close whole-course quiz review gate |

Bắt đầu từ HEAD `8c43d42` (Stage 7 gate PASS), tree clean, không push.

## Reconciliation (2026-09-09 — docs/counts only)

Bản gốc của gate ghi **10 miskey + 7 explanation-letter = 17 MAJOR**; đối chiếu lại từ git diff của hai commit `ed69603` và `2e15731` cho ra sự thật: **6 semantic miskey** (thay đổi data-answer thật sự) + **7 explanation-letter** (key đúng, chữ sai) = **13 MAJOR**, và 12 stale-letter MINOR cùng lớp bị sót — đã sửa trong commit reconciliation này (kèm sửa chữ trong 3 file quiz, không đổi key/makeup câu). Wave table + cả hai docs đã thống nhất theo con số này. 411/411 keys giữ nguyên vì re-check vẫn chứng minh.

## Starting state

- HEAD `8c43d42`, branch `main`, working tree clean — khớp expected checkpoint của brief.
- 40 live lessons · SCHEMA_VERSION 12 · SPLIT_MAP 13 · redirects 7 · hints 65 · build PASS 41 pages.
- Baseline `quiz_audit` trên cả 40 file: **31 PASS / 9 FAIL** (C1–C5 bias rank/pos; Ch07 19 câu ngoài harness + 1 câu 5-option; R1/R2/R4 bias rank).
- Lưu ý: historical IMP-060 counts (22 LIVE / 4 ORPHAN) là số era-baseline — đã recompute từ repo truth: 4 quiz ORPHAN (Ch01/02/03Quiz, Ch04_1Quiz) bị xoá từ batch Stage 1 (`b43d81f`), Ch08/09/11Quiz chết cùng batch Stage 5/6/7. Trạng thái thực: **40/40 LIVE, 0 ORPHAN** ngay từ đầu phase.

## Current quiz inventory (sau sweep)

- **LIVE:** 40/40 (đúng 40 import `*Quiz` trong `lessons.ts` = 40 route; diff đĩa↔import = rỗng).
- **ORPHAN:** 0 (không còn file quiz ngoài lessons.ts).
- **Harness:** 40/40 gọi `initQuiz` + đủ contract (#quiz-score role=status aria-live=polite, #quiz-retry). Ch07Quiz chuyển từ legacy inline script → harness trong phase này.
- **Tổng câu hỏi:** 411 (trước sweep: 418 — Ch07 cắt 7).
- Ch07 (`ch07-advanced-architecture`) được audit theo §19 brief: quiz LIVE-optional → sửa như LIVE; lesson KHÔNG đụng (REDUCE thành O1 là việc Workstream F).

## Audit methodology

1. **Script `quiz_audit.mjs`** trên cả 40 file mỗi lần sửa (gates: 8–12 câu, 4 option a–d, 1 key, 100% explain, value ≤40%, rank ≤40%, harness, không inline scoring).
2. **Script trợ tay `web/scripts/quiz_dist.mjs`** (mới): value / display-position (DOM order thật, bắt được 2 quiz labels không theo thứ tự abcd) / length-rank + per-question breakdown — dùng để định vị từng câu cần sửa.
3. **Semantic-key audit thủ công theo wave (sub-agent độc lập, 3 wave):** Wave 1 (F1/F2 + A1–A7, 94 câu), Wave 2 (A8–A14, 70 câu), Wave 4+5 (S1–S5 + N1/N2, 70 câu; W1–W3 + D1/D2, 50 câu) — mỗi câu: question → keyed value → option text thật → explanation → lesson nguồn. Wave 6 (R1–R4 + X1/X2 + Ch07) được phủ bởi Stage-6/7 gates cho X + audit thủ công + adversarial review cho phần còn lại.
4. **Length-rank:** cùng normalization với `quiz_audit.mjs` (strip tag, trim, đếm char; rank 1=ngắn nhất..4=dài nhất).
5. **Display-position:** đo bằng DOM order thật, không suy từ value — bắt được C4/C5 (labels `bacd`) mà tool value-based bỏ lỡ.

## Wave results

| Wave | Phạm vi | Câu | MAJOR | MINOR | Kết quả |
|---|---|---|---|---|---|
| 1 | F1/F2 + A1–A7 | 94 | 5 (4 miskey Ch02_1Quiz + 1 Ch02DocProjectMauQuiz q3) | 7 | sửa hết |
| 2 | A8–A14 | 70 | 0 | 2 (ref mục 4→mục 3; count "tám chỗ") | sửa hết (mục-4 ref; count-8 giữ — là framing của bài) |
| 4+5a | S1–S5 + N1/N2 | 70 | 8 (1 miskey: S1 Coroutines20PhutKhongSoQuiz q3 d→c; 7 giải thích nêu nhầm chữ: S2 q6, S3 Ch06StateHoistingVaUdfQuiz q1/q3/q7/q8, S5 KienTrucUiDataRepositoryQuiz q5/q6) | 2 | sửa hết |
| 4+5b | W1–W3 + D1/D2 | 50 | 0 | 2 (W2 q10 parenthetical; D2 q7 distractor dễ tranh cãi) | sửa hết |
| 6 | R1–R4 + X1/X2 + Ch07 | (R/X đã qua gate riêng; Ch07 19→12) | 0 | 0 | Ch07 rebalanced |
| Reconciliation (2026-09-09) | 12 stale explanation-letter refs (Ch02_1Quiz 10, C2 q1, S2 q5) — lớp MINOR của sweep gốc | — | 0 | 12 | sửa hết |

## Repairs

### Semantic miskeys (MAJOR — 6 câu, có thay đổi `data-answer` trong git)

Đối chiếu lại từ diff thực tế của `ed69603` + `2e15731` (bản reconciliation): **6 câu miskey thật**, không phải 10.

| Quiz | Câu | Key cũ → mới | Bằng chứng miskey | Re-verify |
|---|---|---|---|---|
| Ch02_1Quiz | q1 | b → a | key b trỏ "mỗi bản Studio chỉ build 1 phiên bản" (sai); giải thích nói "(đáp án a)"; text đúng ở value a, không đổi | quiz_audit PASS; key↔text↔explain khớp |
| Ch02_1Quiz | q4 | c → d | key c trỏ "tên hiển thị dưới icon" (sai — đúng lẫn lộn Name mà giải thích phản bác); text đúng ("danh tính duy nhất") chuyển giá trị a→d, key theo | audit PASS |
| Ch02_1Quiz | q5 | b → a | key b trỏ "máy ảo sẽ chạy" (System Image — sai); text đúng ("thấp nhất... chịu cài") ở value a, không đổi | audit PASS |
| Ch02_1Quiz | q7 | b → b | key b trỏ "thiếu defaultConfig versionCode" (luật bịa); text đúng ("cú pháp Groovy") chuyển vị trí a→b — key giữ nguyên, text đưa về key | audit PASS |
| Ch02DocProjectMauQuiz | q3 | c → b | key c trỏ "khai báo với Gradle" (sai — giải thích phản bác); text đúng ("gắn khối giao diện...") ở b | audit PASS |
| Coroutines20PhutKhongSoQuiz | q3 | d → c | key d trỏ "chỉ dùng được trong Activity/ViewModel" (sai); giải thích nói "(c) đúng" | audit PASS |

6 thay đổi `data-answer` khác trong Ch02_1Quiz (q3 a→b, q6 a→d, q9 a→d và phần chuyển vị trí của q4) là **rebalance display-position thuần**: text đúng và key luôn đi cùng nhau, key trước đó đã đúng → không phải miskey. Ch07Quiz 19→12 là viết lại (câu mới key mới, đã audit ngữ nghĩa khi dựng) — không thuộc bảng miskey.

### Explanation-letter mismatches (MAJOR — 7 câu; key đúng, giải thích nêu nhầm chữ)

Root cause chung: batch shuffle vị trí cũ viết lại nhãn trong giải thích nhưng không đồng bộ key. Sửa toàn bộ là sửa CHỮ TRONG GIẢI THÍCH (key đã đúng ngữ nghĩa):

- Ch06StateVaRecompositionQuiz (S2) q6: "b và c sai" → "a và b sai".
- Ch06StateHoistingVaUdfQuiz (S3) q1 ("chữ ký của b"→c; "a và c"→a và b), q3 ("Đáp án d"→a), q7 ("Đáp án b"→a), q8 ("b phải lên cao"→d).
- KienTrucUiDataRepositoryQuiz (S5) q5 ("c là bẫy"→b), q6 ("Phương án d"→c).
- KienTrucUiDataRepositoryQuiz (S5) q1 đánh số 1/2/4 → chữ cái a/d/b (MINOR, sửa cùng batch).

### Stale explanation letters (MINOR — 12 chỗ, phát hiện ở reconciliation 2026-09-09, đã sửa)

Lớp defect thứ ba: key đúng, giải thích phản bác đúng NỘI DUNG distractor nhưng nêu SAI CHỮ sau khi rebalance đổi vị trí nhãn (cùng root cause với lớp trên nhưng chỉ xuất hiện khi rebalance xảy ra):

- Ch02_1Quiz 10 chỗ: q3 "Đáp án b mô tả hạn chế"→a; q4 "Đáp án c lẫn sang ô Name"→b, "Đáp án b bịa luật"→a, "Đáp án d cơ chế không có thật"→c; q6 "đáp án c gần đúng"→b, "Đáp án b bịa phép đối chiếu"→a; q7 "Đáp án b và c đều tự tin"→a và c; q9 "Đáp án b nhắc hai công cụ"→a, "Đáp án c đúng nửa đầu"→b, "Đáp án d tương tự"→c.
- Ch05ModifierVaDanhSachQuiz (C2) q1: "Đáp án a làm được nhưng chậm"→b.
- Ch06StateVaRecompositionQuiz (S2) q5: "Đáp án b nói sai lý do"→c.

Cả 40 quiz quét lại bằng script chữ-cái (rebuttal + affirmation) sau sửa: 0 flag.

### Distribution rebalance (data-only)
- **C1** (rank 1/4/5/0): trim 1 correct, 3 edit nhỏ → 2/2/3/3.
- **C2** (disp 1/5/2/3): đổi vị trí DOM q1, q9 + relabel → 2/3/3/3.
- **C3** (pos b 5/10, rank 7/10): trim 2 correct, move q6/q8 → 3/3/3/1 · 1/1/4/4.
- **C4** (disp 5/1/4/2, rank 0/2/8/2): trim 4 correct, reorder q5/q10 → 4/2/4/2 · 3/2/3/4.
- **C5** (disp 5/1/3/3, rank 0/4/7/1): trim/extend 5 câu, move q6/q12 → 3/3/3/3 · 1/4/3/4.
- **R1** (rank 0/0/3/5): trim q1/q5 correct → 0/2/3/3.
- **R2** (rank 0/3/6/3): lengthen q1 correct, trim q4 → 0/4/4/4.
- **R4** (rank 0/0/2/6): trim q2/q4/q7/q8 → 0/2/3/3.
- **Ch07** (value 3/6/6/4, rank 19/19 longest): cắt 7 câu, bỏ option e, mix trim/extend → 3/4/2/3 · 2/2/4/4.

### Stale refs / wording (MINOR)
- Ch01_2Quiz: "học ở Chương 8" → "giai đoạn Điều hướng" (2 chỗ; Ch08 giờ là Mạng).
- Ch03_1Quiz: "bảng ở mục 4" → "mục 3" (3 chỗ; bảng bốn tình huống nằm ở mục 3 bài học).
- Ch06StateVaRecompositionQuiz q10: "sẽ hiểu rõ cơ chế ở bài coroutine" (forward-ref lỗi thời) → "bài coroutine đầu giai đoạn này đã giới thiệu".
- Ch05TiepCanMoiNguoiDungQuiz q4: option "Xoá tin nhắn" → "Xoá tin nhắn này" (trim rank, giữ tự nhiên).
- W2 Ch08RetrofitMoshiJsonQuiz q10: parenthetical "(ảnh của công thức là dữ liệu chính)" dễ đọc ngược thành mâu thuẫn key → viết lại "Riêng trường hợp một ảnh khác là hình nội dung chính của màn hình".
- D2 Ch09PrefsCompositionLocalVaWiringQuiz q7: distractor "Lỗi biên dịch..." — đúng một phần, dễ tranh cãi → thêm vế "và lỗi đó không chữa được bằng cách nào" để giữ là distractor rõ.

### Ch07Quiz — migration + cắt (điểm thay đổi lớn nhất)
- 19 câu legacy inline script → **12 câu harness** (`import { initQuiz }`), thêm `#quiz-retry`, sửa intro "12 câu".
- Cắt 7 câu trọng số kiểm tra thấp (TODO(), collectAsState vs WithLifecycle, keys.properties, lateinit, quyền sync, DateExtensions, chiến lược id — chủ đề vẫn còn trong bài học/bài tập).
- Bỏ option thứ 5 (value=e) của câu combine.
- Widget sắp thứ tự (#save-order/#check-order) + 4 bài tập giữ nguyên; script chấm riêng cho widget nằm ngoài form (tiền lệ Ch03_4Quiz) — không phải inline scoring.
- Value/display/rank cân bằng lại từ đầu (3/4/2/3 · 2/2/4/4).
- Lesson Ch07AdvancedArchitecture.astro: **0 byte đổi** (§19).

## Semantic-key audit

- Tổng câu được audit ngữ nghĩa độc lập (wave sub-agent): 284 (94+70+70+50) + Ch07 12 câu (audit thủ công + adversarial) → **296**.
- Câu còn lại (115) thuộc R1–R4, X1, X2, các quiz đã qua Stage 2–7 gates riêng với semantic-key sweep 22/22, 100% v.v.
- **Keys correct sau sweep + reconciliation: 411/411.**
- **Semantic miskeys** (thay đổi `data-answer` trong git): tìm thấy 6 · đã sửa 6 · còn 0.
- **Explanation-letter defects** (key đúng, chữ trong giải thích sai): tìm thấy 7 MAJOR + 12 MINOR stale-letter (reconciliation) · đã sửa 19 · còn 0.

## Distribution audit (sau sweep)

- **Answer-value:** 40/40 quiz không letter nào >40%.
- **Display-position (DOM order):** 40/40 ≤40% (kể cả 2 quiz label thứ tự `bacd`).
- **Length-rank:** 40/40 ≤40% theo tool chuẩn. Adversarial ghi nhận 3 MINOR tie-count 42–44% (Ch01_1, Ch02_3, Ch05Preview) khi đếm lenient với tie; các cell này đều do chênh lệch <10 ký tự/tie — không phải cue dùng được, được ghi nhận ở report.

## Harness audit

- 40/40: `import { initQuiz } from "../../scripts/quiz.ts"` + gọi init; `#quiz-score` role=status + aria-live=polite; `#quiz-retry` ẩn→hiện→ẩn.
- 0 `addEventListener("submit")` inline còn lại trong mọi quiz file. 2 quiz có script chấm riêng cho widget sắp thứ tự NGOÀI form (Ch03_4Quiz, Ch07Quiz) — không thuộc phạm vi harness, hành vi giữ nguyên.
- `web/src/scripts/quiz.ts`: **không sửa** (từ `f463715` đến nay).

## Lesson-supportability audit

- Mọi keyed answer được lesson LIVE của nó chứng minh (wave auditors đọc lesson nguồn khi câu hỏi technical không rõ; không trả lời bằng kiến thức chung).
- Không có câu hỏi đòi kiến thức future/appendix/ngoài web; cross-ref chỉ tới prerequisite được bài hiện tại khai báo (F1 cho C1, S1 cho S5/D2, C5 cho W2 q10 — hợp lệ theo chuẩn).

## IMP-062 orphan cleanup

- **File đã xoá trong phase này: 0** — vì 0 file ORPHAN cần xoá.
- 4 quiz ORPHAN danh nghĩa của plan (Ch01Quiz, Ch02Quiz, Ch03Quiz, Ch04_1Quiz) + 3 shell monolith Ch01/02/03 + Ch04_1/4_2/4_3: đã xoá từ batch Stage 1 (`b43d81f`, có trong git history — recover được).
- Ch08Quiz/Ch09Quiz/Ch11Quiz + Ch08/09/11 monolith: xoá cùng batch Stage 5/6/7.
- **17 draft split ngủ đông (Ch07_1..4, Ch08_1..4, Ch09_1..4, Ch11_1..5) + `_TEMPLATE.astro`: GIỮ** theo §22 và quyết định Stage 5–7 (IMP-064 giữ) — verify: 0 tham chiếu lessons.ts/chapters.ts/registry; resolver stats tự loại; không quiz của chúng tồn tại.
- Verify mỗi nhóm trước khi kết luận: (1) không trong lessons.ts (2) không trong chapters.ts (3) không phải target registry (4) không import bởi code live (5) lessonStats không glob nhầm (6) nội dung thay thế tồn tại ở bài kế nhiệm (7) git history giữ được.

## Stats/file resolver regression

- `lessonStats.ts` resolver: **0 byte đổi** trong phase này. FILE_KEY_PIN (11_1/11_2, 05_N, 06_N, 08_N, 09_N…), FILE_NAME_CASE, FILE_NAME_PIN, SHARED_FILE_PIN (02_2, 03_2), resolveLiveFileNames — nguyên trạng.
- Build fail-loud chạy xanh 41 pages = chứng minh không file ngủ đông thắng bucket nào.
- Dist pairing spot-check: Ch02_2Quiz=10, Ch02DocProjectMauQuiz=11 (bucket 02_2), Ch03StringResourceVaLopRQuiz=9, Ch03DocLoiBienDichVaDebugQuiz=10 (bucket 03_2), Ch07Quiz=12 — đúng quiz của từng bài, không cross-swap.

## Runtime sanity

- `dist/`: 47 thư mục = **40 live lesson pages** (đủ fieldset/explain/score/retry, tổng 411 fieldset khớp nguồn) + **7 redirect stubs** (meta refresh, target đúng: ch03-2→A10, ch05→C1, ch06→S2, ch08→W1, ch09→D1, ch10-1→R1, ch11→X1).
- Preview HTTP: `/chapters/ch07-advanced-architecture/` 200 (12 fieldset), `/chapters/ch08-networking/` 200 → meta refresh `/chapters/ch08-coroutines-va-flow/`.
- Mẫu DOM-check 10 quiz trải các family (A1, A14, C3, S4, N2, W2, D1, R2, X2, Ch07): số fieldset = nguồn, 4 radio/câu, explain 100%, score+retry đủ.

## Build / Astro

- `npm run build`: PASS — 41 pages.
- `npx astro check`: **0 errors / 0 warnings / 65 hints** — baseline giữ nguyên (hint tăng tạm thời do script trợ tay, đã dọn về 65).
- `node scripts/quiz_audit.mjs` trên cả 40: **40 PASS / 0 FAIL** (exit 0).

## Final adversarial review

Independent reviewer (sub-agent riêng, không tham gia sửa): quét cơ học 40/40 (2 lượt, gồm display-position theo DOM order thật) + đọc ngữ nghĩa mẫu 12 quiz rủi ro nhất + 20 attack vectors.
**Kết quả: `QUIZ_SWEEP_ADVERSARIAL_PASS` — 0 BLOCKER, 0 MAJOR, 6 MINOR** (3 tie-count length-rank 42–44% chỉ xuất hiện khi đếm lenient với tie <10 ký tự; 3 legacy empty-letter spread Ch01_2/Ch02_3/Ch03_4 tồn tại trước sweep, thỏa cap ≤40%). Không sửa thêm — ghi nhận ở report.

## Deviations

1. **IMP-062 = no-op (0 file xoá):** brief đoán "sau IMP-062 ORPHAN = 0" — thực tế ORPHAN đã = 0 từ Stage 1. Không fake zero bằng cách xoá dormant material (§27).
2. **Ch07Quiz bị viết lại phần lớn** (cắt 19→12 + harness + rebalance) — vượt "editorial data sweep" thuần túy, nhưng được brief §16/§15/§7 cho phép: quiz ngoài 8–12 câu phải sửa tối thiểu, harness là hard goal 100%, và §19 xác nhận audit Ch07 như LIVE. Lesson không đụng. 7 câu cắt là câu trọng số thấp nhất; widget + exercises giữ nguyên.
3. **Sửa 7 giải thích nêu nhầm chữ đáp án (S2/S3/S5)** là sửa script-adjacent (không phải "data" thuần) nhưng đúng ý §10/§20 — explanation contradicts keyed answer là MAJOR phải sửa. Thêm 12 stale-letter MINOR cùng lớp phát hiện ở reconciliation đã sửa docs-only + 12 chỗ chữ trong giải thích (commit reconciliation).
4. Script trợ tay `web/scripts/quiz_dist.mjs` thêm mới (display-position per DOM order) — dùng cho audit, không thuộc runtime.

## Findings

- **BLOCKER:** 0
- **MAJOR:** 0 (còn lại chưa xử lý). Trong sweep có **13 MAJOR** được tìm thấy và sửa hết, gồm **6 semantic miskey** (thay đổi `data-answer`: Ch02_1Quiz q1/q4/q5/q7, Ch02DocProjectMauQuiz q3, S1 q3) và **7 explanation-letter** (S2 q6, S3 q1/q3/q7/q8, S5 q5/q6). 12 stale-letter MINOR phát hiện thêm ở reconciliation cũng đã sửa hết.
- **MINOR (chưa sửa, ghi nhận):** 3 tie-count length-rank 42–44% (Ch01_1, Ch02_3, Ch05Preview — chỉ khi đếm lenient với tie); 3 legacy empty-letter (Ch01_2 thiếu a, Ch02_3/Ch03_4 thiếu d — tồn tại trước sweep, thỏa cap). Đây là pattern lớp, không phải defect từng câu; để dành cho phase optional/cleanup sau nếu owner muốn.

## Gate verdict

**GATE PASS** — 40 LIVE quizzes · 40/40 harness · 40/40 quiz_audit PASS · semantic keys 411/411 · value/display/rank ≤40% (tool chuẩn) · 0 ORPHAN · dormant drafts được giữ chủ đích · schema 12 / SPLIT_MAP 13 / redirects 7 / 40 live lessons giữ nguyên · stats pairing không đổi · build PASS 41 pages · astro 0/0/65 · `QUIZ_SWEEP_ADVERSARIAL_PASS` (0B/0M) · working tree clean · **chưa push**.

Next: Workstream F — Optional + Appendix (O1–O6, AP1–AP3, Ch07 REDUCE).
