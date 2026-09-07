# REVIEW_GATE_STAGE2

**Batch:** Stage 2 / Compose — IMP-033 (Ch05 → C1–C4) + IMP-044 (C5 accessibility core-lite)
**Baseline:** `4157e7a` (Stage 1 gate PASS) · **Close:** this commit · **Branch:** `main`, working tree clean, **not pushed**

---

## Scope / commits

| Commit | Nội dung |
|---|---|
| `d7c2f0a` | content(compose): split ch05 into c1-c4 + add c5 accessibility (10 file: 5 lesson + 5 quiz) |
| `5c9c5b3` | feat(compose): wire stage2 routes and migration — ATOMIC (chapters/lessons/progress/redirect/lessonStats) |
| `74a6e39` | fix(content): editorial review fixes (C5 checkpoints, block order, voice) |
| `1a7cdfc` | fix(content): technical-review fixes (8 minor) |
| `e85391b` | chore(compose): retire superseded ch05 files |
| `daca93f` | fix(content+progress): adversarial minors (T2/T3 restore, #nguon provenance, §G comment) |
| `82c2e90` | content(quiz): rebalance ch05 c1-c5 answer-length ranks |

ĐÃ DỪNG đúng ranh giới: **không** bắt đầu S1, Ch06/S2–S4, S5, N1/N2, W*, Stage 3+. IMP-035 (Stage 3) không chạm tới.

---

## Final curriculum

| ID | Slug | Component | Quiz | Mục | Quiz câu |
|---|---|---|---|---|---|
| C1 | `ch05-composable-va-layout` | Ch05ComposableVaLayout.astro | Ch05ComposableVaLayoutQuiz.astro | 1–3 | 10 |
| C2 | `ch05-modifier-va-danh-sach` | Ch05ModifierVaDanhSach.astro | Ch05ModifierVaDanhSachQuiz.astro | 4–9 | 11 |
| C3 | `ch05-material-3-va-theming` | Ch05Material3VaTheming.astro | Ch05Material3VaThemingQuiz.astro | 10–14 | 10 |
| C4 | `ch05-preview-va-vong-doi` | Ch05PreviewVaVongDoi.astro | Ch05PreviewVaVongDoiQuiz.astro | 15–18 | 12 |
| C5 | `ch05-tiep-can-moi-nguoi-dung` | Ch05TiepCanMoiNguoiDung.astro | Ch05TiepCanMoiNguoiDungQuiz.astro | 19–28 | 12 |

Slug/component/quiz tên lấy đúng từng ký tự từ `docs/TARGET_REGISTRY_v5.md` §3 (không suy từ lessonId). Đánh số mục liên tục 1–28 xuyên 5 bài (contract Ch10/Ch02/Ch03).

## Ch05 ownership audit

Monolith `Ch05JetpackCompose.astro` (2982 dòng, đã xoá — khôi phục được từ Git @ `4157e7a`) tách theo đúng ranh giới `<!-- Cx START/END -->` do chính monolith ghi:

- **C1** = mục 1–3 + cạm bẫy (a)(b) + #nguon Đơn vị 1; **C2** = mục 4–9 + (c)(d)(e); **C3** = mục 10–14 + (f)(g)(h) + khối "Tài liệu lỗi thời" (bảng Kotlin 1.9.10/AGP 8.2.0/BOM 2023.10.01) + bullet "Phiên bản và Gradle" + bullet kiểm-chứng-chuỗi; **C4** = mục 15–18 + (i)(j)(k) + bullet kiểm chứng `LaunchedEffect` = 0 kết quả.
- **Preservation audit (agent độc lập, PRESERVATION_PASS):** 42/42 const code byte-identical, đúng 1 bài sở hữu mỗi const, mọi const được dùng trong body; 18/18 mục + 44/44 khối code; 11/11 cạm bẫy, không mất không nhân đôi; provenance số dòng giữ nguyên (80/56/68/133/174/78/104/37/75/114; giáo trình 941); dải dòng "Giáo trình gốc" phân đủ cho 4 bài; phần bổ sung (Cx)-tag chia đúng đơn vị.
- **Ch05Quiz (10 câu)** phân bổ lại theo ownership — viết mới theo bài, không sao chép nguyên câu (43 câu mới C1–C4).
- Mất-mót ghi nhận (đã sửa hết): dải 928–938 Key Points + mệnh đề attribution "Cạm bẫy + Kiểm tra nhanh là phần khoá học tự dựng" đã bổ sung vào C1/C2 (`daca93f`); forward-ref 5.5 thêm vào C2/C4 là phần additive thuộc kế hoạch liên kết chéo của draft C5.

## C4/S1 boundary

C4 dạy đúng 1 mô hình thời điểm 4 mệnh đề của `LaunchedEffect` (vào composition · không chạy lại vì vẽ lại · có thể chạy lại nếu rời rồi vào lại · khởi động lại nếu key đổi) + bác bỏ myth "chạy một lần mãi mãi". Coroutine/suspend/scope/dispatcher chỉ được *gọi tên* trong callout defer tường minh → "giai đoạn State & kiến trúc". Không dạy: structured concurrency, supervisor, Job, huỷ chi tiết, Flow, kiến trúc coroutine (grep độc lập xác nhận 0). Ranh giới giữ nguyên như monolith ghi.

## C5 accessibility scope

Bài NEW theo đúng 5 chủ đề lõi (contentDescription chữ/null · vùng chạm 48dp vs 24dp · sp/dp + cỡ chữ 200% (Android 14+) · vai trò màu/tương phản + "đừng để màu là kênh duy nhất" · semantics beginner + `mergeDescendants` + thứ tự ưu tiên component). Nâng cao hạ đúng mức nhận biết: SemanticsPropertyKey/stateDescription/clearAndSetSemantics **vắng mặt**; Scanner/UI Check chỉ "biết là tồn tại"; ngưỡng 4.5:1/3:1 ghi "mức tham khảo, không cần học thuộc". Đọc code thật mục 28 (5 block code, bảng tổng kết) gắn nhãn trung thực "đang xây dở". #nguon khai thật: giáo trình chỉ chứa code, không dạy a11y.

## Quizzes

- 5 quiz live, đúng cặp file registry; harness chung `initQuiz` (IMP-001) cho cả 5; mỗi câu 4 đáp án / 1 đúng / giải thích 100% (đúng + vì sao distractor sai, trừ khi hiển nhiên).
- Đáp án đúng–supported-by-lesson: reviewer kỹ thuật đối chiếu từng claim với bài học (PRESERVATION/TECH PASS; 55/55 fieldset data-answer đúng về mặt kỹ thuật).
- **Position distribution** (a/b/c/d): C1 2/3/2/3 · C2 1/5/2/3 · C3 2/5/2/1 · C4 4/2/4/2 · C5 4/2/3/3 — max share 30/45/50/33/33%.
- **Answer-length ranks sau rebalance** (`82c2e90`; rank tính trên plain-text, 1 = ngắn nhất…4 = dài nhất):
  - C1 {1:1, 2:4, 3:5, 4:0} · C2 {1:2, 2:2, 3:5, 4:2} · C3 {1:0, 2:1, 3:6, 4:3} · C4 {1:0, 2:2, 3:7, 4:3} · C5 {1:0, 2:4, 3:6, 4:2}
  - "Chọn luôn dài nhất" trước rebalance: 93% (51/55 — adversarial MAJOR) → sau: **0/18/30/17/8%**. "Chọn luôn ngắn nhất": ≤20%/quiz. Không còn dominant cue duy nhất; rank 2/3 là đa số và phân bổ khác nhau giữa các bài. Ngôn ngữ không bóp méo để đạt số: chỉ dồn chi tiết trùng lặp từ đáp án đúng sang giải thích của chính nó + kéo dài distractor bằng hiểu-lầm-sai-của-người-mới.

## Progress

- `SCHEMA_VERSION` 7 → **8** (đúng 1 lần, trong commit migration nguyên tử). Lịch sử 6/7/8 ghi đủ ở §G.
- `SPLIT_MAP` 8 → **9** entry: thêm `ch05-jetpack-compose → [C1, C2, C3, C4]` (replace). 8 entry cũ nguyên vẹn (ch01/ch02/ch03/ch10 monolith, ch10-1, ch01-4-repair, ch02-2 keep-source, ch03-2).
- **Migration matrix 19/19 PASS** (script tạm, đã xoá sau khi chạy; 15 case đề nghị + 4 case con của case 6): old-Ch05→C1–C4; C5 không fabricated; union/dedupe/idempotent; chuỗi cũ ch01/ch02/ch03/ch10 còn chạy; repair slug A4; keep-source ch02-2; ch03-2; ch10-1→R1; F1/F2/S5 không fabricated; corrupt storage; SPLIT_MAP self-audit (mọi target live hoặc hợp-le- chuỗi, keep-source giữ source, không self-map).
- **C5 không có legacy credit** — không nằm trong mapping nào; test 2/12 khẳng định.

## Redirect

- Thêm đúng 1: `chapters/ch05-jetpack-compose` → `/chapters/ch05-composable-va-layout/` (registry §6 row 2, verified không gõ từ trí nhớ). Tổng active = **3** (ch10-1, ch03-2, ch05). Dist artifact meta-refresh verified (curl preview 200 + `url=` đúng). Không redirect cho C5. 2 redirect cũ không đổi.

## Registry / stats

- Live lessons **30** = 26 cũ + 3 net (Ch05 1→4) + C5. Stage counts: foundation 2 · android 14 · **compose 5** · state 1 · network 1 · data 5 · realworld 1 · optional 1 = 30 (ch07 vẫn Mở rộng; navigation/appendix 0).
- Slug-set equality: registry(30) == ALL_CHAPTERS == LESSONS == 30 dist lesson dirs (33 dist dirs − 3 redirect artifacts) — verified bằng script.
- **Stats pairing** (Stage-1 bug-class): `lessonStats` mở rộng — FILE_KEY_PIN +5 slug Ch05 (file mới không mang số đơn vị); bucket loop ghim theo tên file qua `pinByFile`; resolution key-đơn chọn file khớp CHÍNH XÁC tên PascalCase của slug khi file ngủ đông trùng tiền tố (fail-loud nếu không khớp). Dist verify từng bài: C1 5 mục/10 câu, C2 8/11, C3 7/10, C4 6/12, C5 14/12 — TOC khớp đúng h2 của chính bài đó, không swap chéo (adversarial v10 xác nhận độc lập).

## Cleanup

Xoá **chỉ** file Ch05-owned, toàn bộ khôi phục được từ Git: monolith `Ch05JetpackCompose.astro`, `Ch05Quiz.astro`, 3 draft ngủ đông `Ch05_1ComposableFunction`/`Ch05_2LayoutModifierList`/`Ch05_3DungUiTinNhan` (pre-spec-v2, chưa từng route). Không import/glob còn trỏ tới (build xanh). File Ch06+ không đụng.

## Voice / prerequisites

- Voice scan (loại code/Nguồn/comments): 0 "sách/chapter/tác giả/giáo trình" ngoài #nguon (editorial reviewer + adversarial reviewer độc lập cùng kết luận; "sách" còn lại là "danh sách").
- Prereq: F1/F2 giả định đúng mức; `remember`/`mutableStateOf`/`toMutableStateList` recognition-only + defer tường minh; CompositionLocal 1 câu ghi nhận → D2; `@PreviewParameter` nhận biết; C5 zero-state; `LocalContext.current` gloss thêm sau review. 0 used-before-taught mới không gloss.

## UX / a11y

- Browser unavailable → dist + `astro preview` + DOM/static checks (giới hạn ghi nhận ở đây). Verified: sidebar "Giai đoạn 2 — Jetpack Compose" hiện nhóm 5 bài; prev/next chain ch04→C1→C2→C3→C4→C5→ch06 khớp từng cặp; redirect hoạt động qua preview server; quiz-form + harness bundle (`quiz.*.js` chứa initQuiz/quiz-retry/quiz-score/data-answer) nhúng đúng 5 trang; homepage liệt kê 5 slug mới, không còn slug cũ.
- A11y lesson-level (adversarial v14): h2→h3 không nhảy cấp; 16/16 bảng có thead; 0 `<img>`; 0 "bấm vào đây"; heading anchors hợp lệ.

## Verification

- `npm run build`: **PASS** — 31 trang (30 live + homepage) + 3 redirect artifacts; inspect dist trực tiếp, không tin headline.
- `npx astro check`: **0 errors / 0 warnings / 66 hints** (baseline 65 + 1: warning `Ch11_5` 'Code' unused — file ngủ đông có sẵn từ trước batch, không do Stage 2 sinh; matrix tạm thời sinh +1 đã xoá cùng script).
- Hints không tăng từ bất kỳ file Stage-2 nào (verify bằng nhóm hint theo file).

## Adversarial review

Agent độc lập cố FAIL batch theo 14 hướng; kết quả **0 BLOCKER, 2 MAJOR, 6 MINOR** — cả hai MAJOR đã sửa:

1. ~~MAJOR: answer-length cue 93%~~ → sửa `82c2e90` (bảng số liệu ở mục Quizzes; verify độc lập bởi main agent + verify-script của agent).
2. ~~MAJOR: C5 Tự kiểm tra 2/3 answer-only dù 74a6e39 báo đã sửa~~ → gốc rễ: câu hỏi bị mất trong pass reorder; đã khôi phục từ draft và commit `daca93f` (verify pickaxe: chuỗi câu hỏi giờ có trong tree).
3. Minors 3–8 (Key Points range, attribution clause, C5 trap re-letter (l)(m)(n), stale quiz header comments, §G stale "7") — tất cả đã sửa trong `daca93f`/`82c2e90`. Minors 5 (forward-ref 5.5 additive) giữ nguyên — đúng kế hoạch liên kết chéo draft C5.

## Deviations

- `SCHEMA_VERSION = 8`, `SPLIT_MAP = 9`, `redirects = 3` — đúng mục tiêu, không cần repair ngoài kế hoạch.
- astro check hints 66 ≠ 65 baseline: +1 là warning pre-existing của `Ch11_5NhinLaiCaKhoaHoc.astro` (draft ngủ đông, tồn tại trước batch — verify bằng `git show 4157e7a` không chạy được vì astro check hiện nhìn thấy file này qua glob scripts; không phải regression của Stage 2).
- IMP-035 (task Stage-2 cũ trong plan) được thay bằng cặp IMP-033 + IMP-044 theo đúng chỉ định của brief ("Stage 2 = IMP-033 + C5/IMP-044").

## Gate verdict

**GATE PASS** — toàn bộ PASS requirement của brief đáp ứng: C1–C5 live · Ch05 retired · không mất nội dung có giá trị · C4 không gièm job của S1 · C5 core-lite đúng phạm vi · 5 quiz PASS (harness chung, 4 option, 100% giải thích, cân rank/vị trí) · live = 30 · compose = 5 · schema 8 · map 9 · redirect 3 · C5/F1/F2/S5 no-fabricate · chuỗi cũ còn chạy · stats pair đúng · build PASS · astro check 0/0 · adversarial 0 BLOCKER / 0 MAJOR · working tree clean · **chưa push**.

Sẵn sàng cho owner review trước Stage 3 / State & Architecture.
