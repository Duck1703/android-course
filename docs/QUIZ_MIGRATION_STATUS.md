# QUIZ_MIGRATION_STATUS — tiến độ chuyển quiz sang harness chung (IMP-001)

**Harness:** `web/src/scripts/quiz.ts` · **Tham chiếu hành vi:** prototype `learning-experience-v1` @ `3ae75d1` (chỉ đối chiếu hành vi, không merge code) · **Trạng thái cập nhật:** 2026-09-05 (IMP-001)

## Cách một quiz tham gia harness

Trong `<script>` của file `*Quiz.astro` (hoặc component cha nhúng nó), thay toàn bộ script chấm bài inline bằng đúng một dòng gọi init:

```astro
<script>
	import { initQuiz } from "../../scripts/quiz.ts";

	initQuiz();
</script>
```

Yêu cầu markup (giữ nguyên contract `quiz.css` đã chốt):

- `form#quiz-form` bọc các `fieldset[data-answer]`, mỗi fieldset có `legend`, các `<label><input type="radio" name="qN" value="x" /></label>` và `<p class="explain" hidden>`.
- `<p id="quiz-score" role="status" aria-live="polite" hidden></p>` trong form.
- Tuỳ chọn nhưng khuyến nghị: `<button type="button" id="quiz-retry" hidden>Làm lại</button>` ngay sau nút submit. Thiếu nút này harness vẫn chấm bình thường (retry tự tắt) — đây là cơ chế để quiz cũ không phải sửa gì vẫn tiếp tục chạy.

## Hành vi harness sở hữu (mọi quiz đã chuyển đều được)

1. Nhãn **"Câu x/N"** chèn vào đầu mỗi `legend` (`span.q-num`, `aria-hidden`).
2. **Submit/chấm:** so `:checked` với `data-answer`, tô `fieldset.correct/.incorrect`, hiện `.explain`.
3. **Kết quả:** `Kết quả: x/N câu đúng.` vào `#quiz-score` (`role="status"` + `aria-live="polite"`), `scrollIntoView` vào khung nhìn.
4. **Retry ẩn → hiện → ẩn:** `#quiz-retry` ẩn trước submit đầu; hiện sau submit; khi bấm có `window.confirm`; xác nhận thì bỏ chọn radio, ẩn lại `.explain`, bỏ `.correct/.incorrect`, xoá + ẩn điểm, và **ẩn lại nút** cho tới lần nộp kế tiếp. Không reload trang.

## Nhánh dữ liệu live Astro (lưu ý kỹ thuật)

Các component quiz LIVE được Astro nhúng qua tham chiếu tĩnh trong `lessons.ts`, nên quiz đã chuyển gọi thẳng `initQuiz()` từ `web/src/scripts/quiz.ts`. Module harness cũng xuất side-effect tự-init (`import "../../scripts/quiz.ts";` không gán tên) để các quiz render ngoài nhánh này dùng khi muốn — hai cách dẫn đến cùng một module, `initQuiz` tự chặn gắn đôi qua `data-quiz-bound`.

## Trạng thái từng quiz (27 file)

Quy ước: **harness** = đã gọi `initQuiz` + có nút retry; **legacy** = script inline cũ, chưa đụng tới — sẽ chuyển theo batch nội dung (WS C/D của kế hoạch tổng thể: đúng batch nào đụng bài đó thì quiz của bài đó chuyển). Quiz ORPHAN (không có route tham chiếu trong `lessons.ts`) không chuyển, chờ batch cleanup (IMP-064).

| Quiz | Trạng thái | Ghi chú |
|---|---|---|
| `Ch10_2Quiz.astro` | **harness** | IMP-001 — quiz chứng minh 1 (bài tách, 16 câu) |
| `Ch05Quiz.astro` | **harness** | IMP-001 — quiz chứng minh 2 (monolith, 10 câu); thêm `role="status"`/`aria-live` + retry theo chuẩn §13 |
| `Ch01_1Quiz.astro` | legacy | — |
| `Ch01_2Quiz.astro` | legacy | — |
| `Ch01_3Quiz.astro` | legacy | — |
| `Ch01_4Quiz.astro` | legacy | — |
| `Ch02_1Quiz.astro` | legacy | — |
| `Ch02_2Quiz.astro` | legacy | — |
| `Ch02_3Quiz.astro` | legacy | — |
| `Ch03_1Quiz.astro` | legacy | — |
| `Ch03_2Quiz.astro` | legacy | — |
| `Ch03_3Quiz.astro` | legacy | — |
| `Ch03_4Quiz.astro` | legacy | — |
| `Ch04Quiz.astro` | legacy | — |
| `Ch04_1Quiz.astro` | legacy | — |
| `Ch06Quiz.astro` | legacy | — |
| `Ch07Quiz.astro` | legacy | — |
| `Ch08Quiz.astro` | **retired (Stage 5)** | monolith tách W1–W3: quiz chết cùng batch, thay bằng 3 quiz harness (Ch08CoroutinesVaFlowQuiz · Ch08RetrofitMoshiJsonQuiz · Ch08TrangThaiMangApiKeyQuiz) |
| `Ch09Quiz.astro` | **retired (Stage 6)** | monolith tách D1–D2: quiz chết cùng batch, thay bằng 2 quiz harness (Ch09DataStoreVaSharedPreferencesQuiz · Ch09PrefsCompositionLocalVaWiringQuiz) |
| `Ch10_1Quiz.astro` | legacy | — |
| `Ch10_3Quiz.astro` | legacy | — |
| `Ch10_4Quiz.astro` | legacy | — |
| `Ch11Quiz.astro` | **retired (Stage 7)** | monolith tách X1–X2: quiz chết cùng batch, thay bằng 2 quiz harness (Ch11FilesSafVaBackupQuiz 10 câu · Ch11KeystoreSqlcipherVaMaHoaQuiz 12 câu) |
| `Ch11FilesSafVaBackupQuiz.astro` | **harness** | Stage 7 — X1, 10 câu (files/SAF/backup) |
| `Ch11KeystoreSqlcipherVaMaHoaQuiz.astro` | **harness** | Stage 7 — X2, 12 câu (Keystore/SQLCipher/bẫy backup) |
| `Ch01Quiz.astro` | ORPHAN | không có trong `lessons.ts` — không chuyển, chờ IMP-064 |
| `Ch02Quiz.astro` | ORPHAN | không có trong `lessons.ts` — không chuyển, chờ IMP-064 |
| `Ch03Quiz.astro` | ORPHAN | không có trong `lessons.ts` — không chuyển, chờ IMP-064 |

Số liệu tổng: 4/28 ở harness · 19 legacy LIVE · 5 retired/ORPHAN (Ch08Quiz/Ch09Quiz/Ch11Quiz retired; Ch01/Ch02/Ch03Quiz orphan). Sau IMP-001, các quiz legacy tiếp tục chạy script inline riêng — hành vi submit/chấm/giải thích không đổi; chỉ thiếu "Câu x/N", scroll điểm và retry cho tới khi batch của chúng chuyển.
