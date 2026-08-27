# CLAUDE.md

File này cung cấp bối cảnh cho Claude Code khi làm việc trong repo này. Đọc file này **đầu tiên** trong mọi session mới.

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

## Nguyên tắc bất di bất dịch

- **Một task nhỏ → làm → test → báo cáo → cập nhật `docs/PROJECT_PLAN.md` → DỪNG.** Không tự động làm task tiếp theo, kể cả khi rõ ràng nên làm.
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
| `bắt đầu task tiếp theo` / `tiếp tục` | (1) Đọc `docs/PROJECT_PLAN.md`; (2) nếu nghi ngờ memory lệch với thực tế, kiểm tra project thật rồi báo lệch trước khi làm; (3) xác định đúng 1 task nhỏ tiếp theo trong roadmap; (4) thực hiện **đúng task đó, không hơn**; (5) test/verify; (6) báo cáo theo mẫu bên dưới; (7) cập nhật `docs/PROJECT_PLAN.md` (trạng thái task, quyết định mới nếu có, blocker nếu có); (8) DỪNG. |

Nếu `docs/PROJECT_PLAN.md` và trạng thái code thực tế không khớp: kiểm tra project thật → báo rõ sự không khớp cho user → ưu tiên trạng thái đã xác minh từ project → sửa lại memory cho đúng. Không tự tiện chọn cái nào "trông đẹp hơn".

## Mẫu báo cáo sau mỗi task

```
## ✅ Task [số] hoàn thành — [tên]
### Đã làm
### File đã thay đổi
### Kết quả
### Đã kiểm tra   (chỉ ghi kiểm tra đã thực sự chạy: build/test/lint/manual check)
### Giải thích kỹ thuật   (tối đa 3 khái niệm mới, giải thích như cho người mới)
### Có vấn đề gì không?   (Không có vấn đề đáng chú ý. / hoặc mô tả mức độ: nhẹ / cần chú ý / blocker)
### Task tiếp theo

Bạn có thể trả lời: `OK` (làm tiếp) · `SỬA` (chỉnh task vừa rồi) · `GIẢI THÍCH` (giải thích kỹ hơn) · `DỪNG`
```

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
