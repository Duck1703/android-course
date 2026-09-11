# CLAUDE.md

File này cung cấp bối cảnh cho Claude Code khi làm việc trong repo này. Đọc file này **đầu tiên** trong mọi session mới.

> **Trạng thái dự án (2026-09-11): REDESIGN COMPLETE — dự án đã đóng gate.** Đọc `docs/PROJECT_PLAN.md`
> mục "TRẠNG THÁI CUỐI CÙNG" trước (48 unit, 39 lõi + 6 mở rộng + 3 phụ lục; final QA =
> `docs/QA_FINAL_REPORT.md`). Khoá học KHÔNG còn "11 chương" — mọi số chương sách chỉ là metadata nội bộ.

## Project Identity

- **Là gì:** website tĩnh (Astro) dạy Android/Kotlin/Jetpack Compose **bằng tiếng Việt cho người mới**, chạy local-first, dựng từ sách Kodeco + `aaf-materials/`. Chi tiết ở mục "Dự án này là gì" bên dưới.
- **Source of truth:** `docs/PROJECT_PLAN.md` (tiến độ) · `web/src/data/chapters.ts` (syllabus) · `web/src/data/lessons.ts` (registry slug → component) · `web/src/components/lessons/*.astro` (nội dung khoá học thật). `web/CLAUDE.md` chỉ là ghi chú starter của Astro, **không** phải mô tả dự án.
- **Knowledge base dài hạn:** vault claude-obsidian tại `/mnt/d/Obsidian/MyKnowledgeVault` — bắt đầu từ trang `Android Course Web - Project Overview`. Cần kiến thức nền về dự án (quy ước, hợp đồng đặt tên, kiến trúc) thì **truy vấn claude-obsidian** thay vì đọc lại toàn repo.
- **Nhưng:** trước khi sửa code, luôn đọc source hiện tại trong repo — vault là ảnh chụp tại thời điểm ingest, có thể đã lệch.

## Dự án này là gì

Xây một **website học Android bằng tiếng Việt cho người mới bắt đầu** (Kotlin, Android, Jetpack Compose), dựa trên 2 nguồn chính:

1. `Android_Fundamentals_by_Tutorials_v1.0.0.epub` — sách "Android Fundamentals by Tutorials" (Kodeco).
2. `aaf-materials/` — project Android mẫu đi kèm sách (11 chapter, mỗi chapter có project `starter`/`final`).

Website **không được** trở thành tutorial Android chung chung tách rời sách/project. Tài liệu chính thức (developer.android.com, kotlinlang.org) chỉ là **nguồn phụ** để kiểm tra API hiện tại / phát hiện kiến thức cũ / bổ sung giải thích.

Người dùng dự án (chủ nhân repo) là **non-tech / vibe coding** — luôn cần giải thích đơn giản, không giả định họ hiểu thuật ngữ kỹ thuật.

## Đọc tiếp theo (theo thứ tự)

1. **`docs/PROJECT_PLAN.md`** — roadmap, **trạng thái hiện tại** (đang ở task nào, task tiếp theo), quyết định đã chốt, rủi ro/blocker. **File này phải luôn được cập nhật sau mỗi task** — đây là nguồn sự thật (source of truth) về tiến độ, không phải lịch sử chat.
2. **`docs/SOURCE_MAP.md`** — kết quả audit chi tiết: metadata/TOC của EPUB, cấu trúc & kiến trúc Android project, mapping chapter ↔ code đã xác minh. Tương đối tĩnh, chỉ sửa khi phát hiện thông tin sai hoặc audit lại.
3. **`docs/LEARNING_MAP.md`** — mapping Chapter → Concept → File Android → Composable/Class → Exercise/Quiz cho đủ 11 chapter. Đã tạo ở Task 4 (2026-08-26). Có mục cảnh báo bản quyền ở cuối — đọc trước khi viết lesson dùng code từ `aaf-materials/` (đã có Quyết định #7 trong `docs/PROJECT_PLAN.md`: được phép dùng code thật, phải ghi rõ nguồn file + dòng).

## Working instructions (user chốt 2026-08-28) — ƯU TIÊN CAO NHẤT

Mục này **ghi đè** mọi hướng dẫn cũ mâu thuẫn với nó ở phía dưới file.

### A. Độ sâu nội dung: bám sách, không tóm tắt

> **Depth should follow the source material, not an arbitrary page length.**

- **Sách là primary source / source of truth.** `aaf-materials/` là nguồn để minh hoạ, đối chiếu, giải thích cách kiến thức trong sách được áp dụng thật.
- Thứ tự ưu tiên **không được đảo**: (1) nội dung sách → (2) companion project → (3) kiến thức Compose bổ sung chỉ để làm rõ (1) và (2). Cấm biến website thành bài tutorial Compose generic có nhắc tên sách.
- Sách dành 5–10 trang cho 1 concept thì **không được** rút còn 2–3 paragraph chung chung. Không bỏ phần giải thích chỉ vì viết ngắn hơn được.
- Trước khi viết 1 lesson: đọc **toàn bộ** chapter tương ứng trong `content/book/`, liệt kê: concept chính · concept phụ · giải thích quan trọng · API/Compose component · quyết định thiết kế-architecture · caveat tác giả nhấn mạnh · code example · liên hệ companion project. Xây lesson từ bảng liệt kê đó.
- **Không copy nguyên văn sách.** Hiểu → restructure → giải thích lại → chia nhỏ → thêm mental model → nối các phần → minh hoạ bằng code project. Giữ nguyên technical meaning.
- Kiến thức bổ sung ngoài sách được phép (prerequisite, behavior framework, common mistake) nhưng phải phân biệt rõ và không làm lệch trọng tâm khỏi sách.

### B. Cấu trúc 1 lesson có chiều sâu

Không phải lesson nào cũng đủ mọi heading — chọn theo nội dung thật của sách. Nguồn heading để chọn: What you will learn · Why this matters · Core concept · How it works · Mental model · API/component explanation · Step-by-step implementation · Code walkthrough (giải thích từng phần quan trọng) · Liên hệ project trong sách · Why the project implements it this way · Common mistakes · Things to notice · Trade-offs · Compose-specific behavior · Before/after comparison · Practical example · Key takeaways.

Mỗi concept xuất hiện trong project phải: tìm file → tìm class/function/composable → nói nó nằm đâu → vai trò gì → concept trong sách được áp vào code thế nào → dẫn người học từ lý thuyết sang code thật. Không dump code không có context.

### C. Workflow: KHÔNG dừng xin confirm

- Xong 1 task → **tự review** → tự đánh dấu hoàn thành → **sang task tiếp theo ngay**. Mặc định là **được phép tiếp tục**.
- Cấm các câu: "Does this look good?", "Would you like me to continue?", "Please review before I proceed.", "Should I move to the next task?". Cấm cả bảng `OK / SỬA / GIẢI THÍCH / DỪNG` ở cuối report.
- `docs/PROJECT_PLAN.md` là công cụ quản lý công việc **của chính Claude**, không phải chuỗi approval. Phát hiện plan chưa tốt thì tự update rồi tiếp tục.
- User sẽ tự interrupt khi muốn review.

### D. Tự review (vừa implementer vừa reviewer)

Trước khi coi 1 lesson là xong, tự kiểm 3 nhóm:

- **Content:** đủ sâu so với sách? bỏ sót concept nào? có generic không? có liên hệ companion project không? có phần nào sách giải thích kỹ mà web nói qua loa?
- **Technical:** code compile hợp lý? route/navigation đúng? component reusable? có phá trang cũ? styling consistent?
- **Learning experience:** flow kiến thức hợp lý? có giải thích *tại sao* trước *cách làm*? code được giải thích chứ không chỉ hiển thị? các section nối logic?

Phát hiện vấn đề thì **tự sửa**, không đẩy sang user.

### E. Chỉ dừng hỏi user khi

Thiếu file/source quan trọng không truy cập được · 2 hướng implementation khác nhau hoàn toàn làm đổi architecture lớn · cần credential/secret/external access · hành động có thể xoá-đổi dữ liệu không hồi phục được · requirement thật sự mâu thuẫn.

Quyết định nhỏ (UI, wording, component structure, lesson structure, naming, refactoring, cách trình bày) → **tự quyết định tốt nhất và tiếp tục**. Có uncertainty nhưng không phải blocker → ghi assumption vào `docs/PROJECT_PLAN.md` rồi làm tiếp.

### F. Tiêu chuẩn cuối cùng

Website phải cho cảm giác **"interactive learning companion xây rất kỹ dựa trên chính cuốn sách và project của nó"**, không phải "website tutorial Compose tổng quát do AI viết nhanh từ title chapter". Người đã đọc sách vào phải nhận ra: concept của sách, flow sách đang dạy, project sách đang xây, các reasoning quan trọng, technical detail đáng chú ý. Người chưa đọc sách vẫn học được từng bước.

**Quality + completeness > finishing tasks quickly.**

### G. Cập nhật knowledge base — phần của Definition of Done (user chốt 2026-08-30)

Xong + verify một task rồi, **trước khi viết report cuối**, làm thêm bước này:

1. **Tự đánh giá:** task vừa xong có tạo ra *knowledge lâu dài* cho dự án không? (quy ước mới, hợp đồng đặt tên, quyết định kiến trúc, chuẩn nội dung, con số baseline dùng lại về sau — chứ **không** phải transcript, log tạm, hay thay đổi nhỏ vô giá trị dài hạn).
2. **Có** → dùng claude-obsidian cập nhật vào vault `/mnt/d/Obsidian/MyKnowledgeVault`, qua **transaction workflow chính thức** (`transaction inspect` → `apply --approved-plan-sha256`), không Write/Edit tay vào vault.
3. **Knowledge đã tồn tại** → **update note hiện có**, tuyệt đối không tạo note trùng. Điểm vào của dự án này: `Android Course Web - Project Overview` (+ 3 trang concept liên kết từ đó).
4. Vault này **dùng chung nhiều dự án** → knowledge của dự án này phải tách biệt: mọi trang đều mang tiền tố tên `Android Course Web`, và liên kết về trang overview ở trên.
5. **Không** → ghi một dòng trong report là "không có knowledge lâu dài mới", rồi đi tiếp.

Bước này **là phần của Definition of Done**, không phải việc tuỳ chọn. Task chưa cập nhật vault (khi có knowledge mới) thì chưa được đánh dấu Done.

## Nguyên tắc bất di bất dịch

- **Reference sources KHÔNG được sửa:** file `.epub` gốc và toàn bộ `aaf-materials/` (repo git riêng, remote `kodecocodes/aaf-materials`). Chỉ sửa khi một task cụ thể yêu cầu rõ và user đã hiểu lý do.
- Không cài skill/software ngoài phạm vi project, không deploy website public, không xoá số lượng lớn file, không `git reset --hard`/force-push/xoá git history mà chưa hỏi trước. Không dùng `--dangerously-skip-permissions`.
- Trong phạm vi 1 task đã được duyệt: được tự do đọc/tạo/sửa file, chạy build/test/lint/dev server, cài dependency thông thường rõ ràng-cần thiết-an toàn, không cần hỏi từng bước nhỏ.
- **Ưu tiên nguồn kiến thức:** EPUB > `aaf-materials/` > developer.android.com/kotlinlang.org > nguồn khác. Không bịa chapter, API, file path. Nếu sách và tài liệu chính thức khác nhau, **ghi rõ khác biệt**, không âm thầm sửa nội dung sách.
- **Bản quyền:** văn bản sách chỉ dùng cá nhân — không copy nguyên văn nhiều đoạn, phải diễn giải/tóm tắt, luôn ghi nguồn (chapter + file). Code trong `aaf-materials/` được phép dùng/sửa tự do trong app (đã xác nhận qua trang "Book License" của sách, xem `docs/SOURCE_MAP.md`).
- Không over-engineer, không thêm auth/cloud DB/payment/admin dashboard/AI chatbot/microservices nếu chưa thực sự cần. Ưu tiên MVP, local-first, ít dependency.

## Giao tiếp

- Luôn trả lời bằng **tiếng Việt**, câu ngắn, rõ ràng. Không dump log dài.
- Giữ nguyên tiếng Anh cho tên API/class/function/code. Thuật ngữ kỹ thuật lần đầu xuất hiện: giải thích kiểu `State (trạng thái)`, `Composable (hàm tạo giao diện trong Compose)`.
- Có 2 lựa chọn kỹ thuật thì trình bày ngắn gọn (A đơn giản hơn / B mạnh hơn) + đề xuất rõ lựa chọn nào và vì sao, thay vì bắt user tự quyết định mọi chi tiết.

## Xử lý các câu lệnh ngắn của user

Trước khi trả lời bất kỳ câu nào dưới đây, **đọc `docs/PROJECT_PLAN.md`** (và `docs/SOURCE_MAP.md` nếu cần chi tiết kỹ thuật).

| User gõ | Việc cần làm |
|---|---|
| `review plan` / `đang tới đâu rồi?` / `task hiện tại là gì?` / `task tiếp theo là gì?` / `giải thích task hiện tại` | Chỉ **đọc và trình bày** trạng thái từ `docs/PROJECT_PLAN.md` (phase, task hiện tại, đã xong gì, tiếp theo là gì, blocker). **KHÔNG code, không sửa file.** |
| `bắt đầu task tiếp theo` / `tiếp tục` | (1) Đọc `docs/PROJECT_PLAN.md`; (2) nếu nghi ngờ memory lệch với thực tế, kiểm tra project thật rồi báo lệch; (3) xác định task tiếp theo; (4) thực hiện; (5) test/verify; (6) tự review theo mục D; (7) cập nhật `docs/PROJECT_PLAN.md`; (8) **sang task tiếp theo ngay, KHÔNG dừng xin confirm** (xem mục C). |

Nếu `docs/PROJECT_PLAN.md` và trạng thái code thực tế không khớp: kiểm tra project thật → báo rõ sự không khớp cho user → ưu tiên trạng thái đã xác minh từ project → sửa lại memory cho đúng. Không tự tiện chọn cái nào "trông đẹp hơn".

## Mẫu báo cáo (chỉ dùng khi xong 1 batch công việc, KHÔNG dùng để xin confirm)

```
## ✅ Task [số] hoàn thành — [tên]
### Đã làm
### File đã thay đổi
### Kết quả
### Đã kiểm tra   (chỉ ghi kiểm tra đã thực sự chạy: build/test/lint/manual check)
### Giải thích kỹ thuật   (tối đa 3 khái niệm mới, giải thích như cho người mới)
### Có vấn đề gì không?   (Không có vấn đề đáng chú ý. / hoặc mô tả mức độ: nhẹ / cần chú ý / blocker)
### Task tiếp theo   (ghi task đang làm tiếp, KHÔNG hỏi xin phép)
```

Không thêm bảng `OK / SỬA / GIẢI THÍCH / DỪNG` — user sẽ tự interrupt nếu muốn.

Nếu task lỗi/chưa xong: báo đúng như vậy trong report, và ghi đúng trạng thái đó vào `docs/PROJECT_PLAN.md` (không đánh dấu Done cho đẹp).

## Cấu trúc thư mục

```
Android_Fundamentals_by_Tutorials_v1.0.0.epub   # reference — KHÔNG sửa
aaf-materials/                                   # reference Android project — KHÔNG sửa (git repo riêng)
docs/                                            # tài liệu quản lý + kiến thức project (mô tả ở trên)
content/book/                                    # (từ Task 2/3) Markdown trích xuất từ EPUB
web/                                              # (từ Task 5) website học tập
```

`content/book/` và `web/` chưa tồn tại tại thời điểm viết file này (2026-08-26) — sẽ xuất hiện khi roadmap tới các task tương ứng, xem `docs/PROJECT_PLAN.md`.

## Web stack đã chọn

**Astro** (Markdown/MDX + syntax highlighting sẵn, gần như không JS phía client trừ nơi cần tương tác) — lý do và trạng thái cài đặt: xem mục "Quyết định" trong `docs/PROJECT_PLAN.md`. Chưa cài đặt tại thời điểm này.

## Định nghĩa "hoàn thành" của cả dự án

Xem chi tiết đầy đủ trong `docs/PROJECT_PLAN.md`. Tóm tắt: EPUB đã index có hệ thống + Android project đã mapping + website tiếng Việt chạy local cho người mới đi từ lesson → giải thích → code thật → exercise/quiz, luôn truy ngược được nguồn (chapter/file), khác biệt sách-cũ-vs-hiện-tại được ghi rõ, có README hướng dẫn chạy cho người non-tech. Đạt dần từng task nhỏ, không cố làm hết trong 1 lần.
