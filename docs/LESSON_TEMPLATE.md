# LESSON TEMPLATE — Kit dựng bài học chuẩn (IMP-015)

> **TRẠNG THÁI VÀ THẨM QUYỀN — đọc trước khi dùng.**
>
> - **Vai trò của file này:** mẫu thi hành (presentation/pedagogical structure) cho mọi batch
>   dựng/split bài học từ đây về sau. Bản sao để dựng bài: `web/src/components/lessons/_TEMPLATE.astro`.
> - **Nội dung học là thầm quyền của:** bài học đã chấp nhận + spec v2 (`docs/COURSE_REDESIGN_SPEC_432cbf8_v2.md`)
>   — file này **không** quyết định syllabus, không sở hữu/không chuyển nhượng learning job nào.
> - **Định danh (lessonId/slug/stageId):** chỉ theo `docs/TARGET_REGISTRY_v5.md`.
> - **Chất lượng biên tập:** chuẩn gốc là `docs/COURSE_CONTENT_STANDARD.md`. File này không thay thế
>   chuẩn đó — nó neo chuẩn đó vào cấu trúc HTML/Astro cụ thể.

---

## 0. CHÍNH SÁCH CHẤT LƯỢNG ĐẶT LÊN TRÊN (bắt buộc)

> **“Không cắt vì dài. Chỉ cắt khi nội dung thừa, sai scope, trùng lặp,
> hoặc nên thuộc một learning job khác.”**

- `minutes` trong registry là **ước lượng planning, chỉ mang tính thông tin** — không phải hạn mức,
  không phải PASS/FAIL, không phải lý do cắt nội dung.
- Tách bài chỉ hợp lệ vì: learning job khác nhau · thứ tự tiên quyết · quá tải nhận thức do khái niệm
  không liên quan cùng xuất hiện · nội dung trùng lặp/sai scope. **Thời lượng không nằm trong danh sách này.**
- ⚠️ Tài liệu lỗi thời cần sync sau: wording "30-min hard cap" cũ trong spec v2 (§3/§12/§17/§21/§25)
  đã bị chính sách quality-first ở trên thay thế. Đã ghi trong docs-sync backlog
  (`TARGET_REGISTRY_v5.md` §12). Đừng viết lại cap đó vào bài học mới.

---

## 1. ANATOMY — mạch bài chuẩn

Mỗi khối ghi rõ REQUIRED / CONDITIONAL / OPTIONAL. Không nhồi đủ mọi khối — chọn theo nội dung thật;
nhưng **thứ tự khi có** thì giữ nguyên (chuẩn rút từ Ch10.2/R3/R4/Ch09/Ch11 đã chấp nhận).

| # | Khối | Bắt buộc? | Ghi chú |
|---|---|---|---|
| 1 | Mở đầu + định vị (lesson/stage, bài đang học gì trong route) | REQUIRED | với bài split-ready: khối này thuộc **từng đơn vị** |
| 2 | Mục tiêu — "Sau bài này bạn sẽ…" | REQUIRED | động từ đo được; ≥1 mục tiêu = ≥1 câu quiz |
| 3 | Vì sao quan trọng + bối cảnh project | REQUIRED | 2–3 câu, nối việc thật người học sẽ gặp |
| 4 | Cần biết trước (recall tiên quyết) | REQUIRED | nêu khái niệm/lesson đã học; nếu forward-ref thì dùng khuôn §4 |
| 5 | Mental model | REQUIRED cho khái niệm mới phi trực giác | 1 analogy mỗi khái niệm mới |
| 6 | Khối khái niệm chính (1–3 khái niệm lớn) | REQUIRED | "vì sao" trước "làm thế nào" với khái niệm phản trực giác |
| 7 | Code thật trong project mẫu | CONDITIONAL | chỉ khi bài có code thật; thấy contract §10 |
| 8 | Checkpoint "Kiểm tra nhanh" | RECOMMENDED — bắt buộc với bài dày (>~1.200 từ) | §9 |
| 9 | `#cam-bay` — Cạm bẫy & tài liệu lỗi thời | REQUIRED — đúng 1 | §7 |
| 10 | Trace đầu–cuối / nối lại mạch (end-to-end) | CONDITIONAL | khi bài nằm trong chuỗi dùng-lại (vd S4→S5, R2→R3) |
| 11 | Tóm tắt | REQUIRED | số dòng gạch ngắn, đúng mục tiêu đầu bài |
| 12 | `#nguon` — Nguồn tham khảo | REQUIRED — đúng 1 | §8 |
| 13 | Quiz | KHÔNG nằm trong file lesson | component Quiz riêng, ghép qua `lessons.ts` (§14) |

**Learning job (bắt buộc khi authoring):** trước khi viết, điền một câu —
*"Sau bài này, người học có thể …"* — và cả bài chỉ phục vụ đúng job đó. Một bài = một job mạch lạc.

**Checklist sở hữu nội dung (trả lời trước khi viết từng khối):**

- [ ] Concept này có được sở hữu ở bài này không (theo `TARGET_REGISTRY_v5` + phân công batch)?
- [ ] Đã được dạy ở bài trước chưa?
- [ ] Nếu chưa: dạy ở đây, JIT-gloss, hay defer? (xem §4)
- [ ] Khối này có thuộc bài khác không? (trùng lặp = cắt, bất kể dài ngắn)

---

## 2. VOICE — giọng độc lập tiếng Việt

Thân bài **cấm** mọi dạng tự sự nguồn:

- ❌ "sách nói…", "theo sách…", "giáo trình viết…"
- ❌ "chapter này…", "trong chương này của sách…"
- ❌ "tác giả để lại…", "tác giả nhấn mạnh…"
- ❌ "qua audit/chúng ta thấy ở file nguồn…", kể chuyện số dòng của tài liệu nguồn trong thân bài
- ❌ ngôi biên tập "phiên bản tôi đề nghị", "phân tích của tôi"

Thay bằng: phát biểu khái niệm trực tiếp; code của project gọi là "project mẫu/code thật";
attribution chỉ tồn tại trong `#nguon`. Tên API giữ tiếng Anh, giải thích tiếng Việt lần đầu dùng:
`State (trạng thái)`.

**Beginner safety:** chỉ giả định những gì lesson trước trong lộ trình đích đã dạy. Cấm
"cái này quá đơn giản", "chắc bạn đã biết". Concept mới: **GIẢI THÍCH VÌ SAO tồn tại trước khi đưa
cú pháp.** Không biến bài thành tra cứu Kotlin — phần Kotlin nền thuộc F1/F2; ở bài khác chỉ gloss.

---

## 3. CALLOUT FAMILIES — dùng đúng class hiện có

CSS hiện tại (`web/src/styles/lesson.css`) đã định nghĩa các family sau — **không đặt tên class mới**:

| Class | Dùng cho | Ghi chú |
|---|---|---|
| `.callout` (không suffix) / `.callout.journey` | định vị/hành trình, mở bài | màu info mặc định |
| `.callout.goals` | Mục tiêu đầu bài | |
| `.callout.mental` | Mental model / analogy | |
| `.callout.note` | ghi chú, lưu ý, checkpoint | |
| `.callout.diff` | khác biệt giáo trình ↔ code thật / đối chiếu | wording "khác biệt", không "cảnh báo" |
| (chưa có `.warn`/`.outdated` riêng) | cảnh báo/phiên bản | dùng `.diff` hoặc `.note` + `<strong>` tiền tố; family "outdated" sẽ có ở port UI-foundation, không tự chế class |

Quy tắc chống "tường hổPhách": **tối đa 2 khối cảnh báo/diff liền kề**; cạm bẫy ưa chuộng
⚠-trong-text với 1 khối mạnh mỗi mối nguy. ≤4 callout mỗi bài là mức tốt.

---

## 4. PREREQUISITES / USED-BEFORE-TAUGHT

Với **mọi** concept lạ xuất hiện trong bài, author phải phân loại (bảng nội bộ — nằm trong comment,
KHÔNG render ra cho người học):

- **A — đã dạy:** dùng tự do, link về nơi dạy nếu xa.
- **B — dạy ở đây:** bài này là chủ sở hữu.
- **C — JIT gloss:** mental model tối thiểu + callout khuôn: *"...bạn sẽ học đầy đủ ở [bài/lessonId]. Ở đây chỉ cần hiểu vai trò: [1–2 câu]."*
- **D — defer:** bỏ khỏi bài; ghi vào bài sở hữu tương lai.

Learner-facing: chỉ phần "Cần biết trước" đầu bài (anatomy #4). Forward-ref phải liệt kê ở đó,
không im lặng.

---

## 5. CODE CONTRACT

- Ngôn ngữ: `<Code code={...} lang="kotlin|xml|toml|bash|json" theme="github-dark" />` — component
  `astro:components` + `CodeEnhance` tự thêm language bar + copy; **không tự viết nút copy mới**.
- Code thật từ project: khai const ở frontmatter, ghi **file path thật** (`aaf-materials/...` từ thư mục
  project của chapter) và **số dòng đã kiểm** — số dòng chỉ ghi ở `#nguon` hoặc comment frontmatter;
  **cấm bịa số dòng**. Chưa mở file thật để kiểm thì không được claim provenance.
- Metadata `data-file`/`data-lines` (header "file · dòng x–y") là attr tuỳ chọn đang được port
  (IMP-005); block cũ không có attr giữ nguyên, không bắt buộc.
- Snippet dài: chỉ giữ những dòng quan trọng, dùng `…` với chú thích rõ "lược"; nguyên văn đầy đủ
  để `#nguon` trỏ tới. Không dump code không giải thích — mọi block phi tầm thường phải có lý do tồn tại
  và phần giải thích dòng cốt lõi.
- Giả code (pseudocode) phải được dán nhãn bằng chữ: "ví dụ minh hoạ, không phải code project".
- Đối chiếu lý thuyết vs thực tế dùng bảng `class="cmp"`; bảng API tra cứu dùng `class="api"`.

**Trình tự đọc code ưu tiên (nếu phù hợp):** dự đoán (predict) → đọc code → chạy/lý giải → quan sát
(observe) → giải thích. Pedagogy compile-error (Ch03/A11) giữ nguyên khi đụng debug.

---

## 6. VERSION / DRIFT — chỉ khi có drift thật

Conditional: chỉ thêm khi API trong project thật sự lệch Android hiện tại.

- **Verify trước khi claim** deprecated/current (nguồn chính thức, ghi ngày kiểm trong `#nguon`).
- Code lịch sử của project giữ nguyên để đọc được project mẫu — gọi đúng danh nghĩa
  "code lịch sử, đọc được, không chép vào app mới".
- Nói rõ "nên theo cái nào". Dòng thời gian chi tiết → AP3 (`bang-tra-cuu-nhanh`), không nhồi vào bài.
- Không biến bài nào thành trang errata; không phải bài nào cũng có bảng drift.

---

## 7. `#cam-bay` — đúng 1 khối

`<h2 id="cam-bay">Cạm bẫy & tài liệu lỗi thời</h2>` — đặc sản của khoá. Bên trong cho phép nhiều cạm bẫy
liên quan chủ đề bài (đánh số), nhưng **không tán rạc nhiều heading "Cạm bẫy" trong một bài**. Với bài
split-ready trong 1 route: mỗi đơn vị giữ khuôn riêng của nó khi tách (mỗi route cuối cùng có đúng 1).

---

## 8. `#nguon` — đúng 1 khối, nơi duy nhất có attribution

`<h2 id="nguon">Nguồn tham khảo</h2>`, nội dung dạng `<p class="src">`. Nhóm được nhiều nguồn:

- chương sách gốc (`content/book/…`, số dòng),
- code thật (`aaf-materials/…` + đường dẫn file, số dòng đã kiểm),
- tài liệu chính thức Android/Kotlin (URL + ngày kiểm khi claim phiên bản),
- nguồn drift.

Đây là chỗ duy nhất được nêu "giáo trình/sách/tác giả". Thân bài sạch attribution.

---

## 9. CHECKPOINT — "Kiểm tra nhanh"

Khuôn hiện có trong các bài đã chấp nhận (Ch05/Ch06): một `div.callout.note` với
`<strong>Kiểm tra nhanh — …</strong>` + tình huống dự đoán + `<details><summary>Xem đáp án</summary>`
để tự kiểm. Rules:

- kiểm **hiểu/dự đoán** từ những gì vừa dạy — không đưa lý thuyết mới;
- không tính điểm, không thay quiz cuối bài;
- đặt sau một khối khái niệm trọn vẹn, không nhồi mỗi vài đoạn một checkpoint;
- bài ngắn/đơn giản có thể không cần.

---

## 10. PRACTICE VS QUIZ

Thân bài được chứa: checkpoint, bài tập dự đoán, nhiệm vụ quan sát (`class="exercise"`,
`class="chal"` cho thử thách có grader). **Quiz cuối bài là component Quiz riêng** (`<ComponentBase>Quiz.astro`),
ghép qua `lessons.ts` — KHÔNG nhúng quiz vào lesson component. Chất lượng/migration quiz
(8–12 câu, 4 options, cân rank, 100% giải thích) thuộc chuẩn quiz — không phải việc của template này.

---

## 11. ACCESSIBILITY

- Heading theo thứ tự h1→h2→h3, không nhảy cấp; mỗi bài đúng 1 `h2 id="cam-bay"` + 1 `h2 id="nguon"`.
- Link có text có nghĩa (không "bấm vào đây"); bảng có cấu trúc `<thead>/<th>` (class `api`/`cmp` sẵn).
- Code block cuộn ngang được (đã có sẵn trong CSS — không phá).
- Không dùng màu làm kênh ý nghĩa duy nhất (callout luôn có icon/tiêu đề chữ).
- Ảnh/screenshot: `alt` mô tả ý nghĩa; ảnh chụp UI app nêu luôn điều người dùng screen-reader gặp.
- Không redesign shell/layout — chỉ markup trong lesson.

---

## 12. TEMPLATE CHECKLIST — tự review trước khi coi bài là xong

- [ ] Một learning job mạch lạc ("sau bài này người học có thể…")
- [ ] Thứ tự tiên quyết hợp lệ theo lộ trình đích (`TARGET_REGISTRY_v5`)
- [ ] Không used-before-taught thiếu gloss (A/B/C/D đã phân loại)
- [ ] VÌ SAO trước CÚ PHÁP với khái niệm mới/phản trực giác
- [ ] Code thật có provenance đúng (file + dòng đã kiểm); không bịa số dòng; pseudocode được dán nhãn
- [ ] Không tự sự nguồn trong thân bài (sách/chapter/tác giả/audit)
- [ ] Đúng 1 `#cam-bay`, đúng 1 `#nguon`
- [ ] Checkpoint (nếu dùng) kiểm hiểu, không dạy mới, không thay quiz
- [ ] Claim drift/deprecated đã verify + có ngày kiểm
- [ ] Accessibility cơ bản (heading, bảng, link, code cuộn, alt)
- [ ] Không trùng lặp concept đã có chủ sở hữu
- [ ] Không cắt gì chỉ vì dài — trim chỉ vì thừa/sai scope/trùng/lệ job
