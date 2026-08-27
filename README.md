# Học Android bằng tiếng Việt — hướng dẫn chạy website

Đây là website học Android (Kotlin, Jetpack Compose) bằng tiếng Việt, chạy **trên máy của bạn**, không cần internet sau khi cài xong, không cần đăng nhập, không tốn phí.

File này viết cho người **không phải dân kỹ thuật**. Bạn chỉ cần gõ đúng vài dòng lệnh, không cần hiểu chúng làm gì.

---

## Phần 1 — Chạy website (làm 1 lần đầu)

### Bước 1: Cài Node.js

Node.js là phần mềm giúp máy bạn chạy được website này.

1. Mở trình duyệt, vào **https://nodejs.org**
2. Bấm tải bản có chữ **LTS** (bản ổn định).
3. Cài như cài phần mềm bình thường: bấm Next → Next → Finish.

> Máy này đang có Node **v22.14.0** và nó chạy được. Nếu bạn cài mới thì lấy bản LTS mới nhất, cũng ổn.

### Bước 2: Mở cửa sổ dòng lệnh đúng thư mục

1. Mở **File Explorer**, vào thư mục `d:\book-course-vibe\web`
2. Bấm vào ô địa chỉ ở trên (chỗ hiện đường dẫn), gõ `cmd` rồi bấm **Enter**.
3. Một cửa sổ đen (Command Prompt) mở ra, dòng đầu đã trỏ đúng vào `d:\book-course-vibe\web`.

> Quan trọng: mọi lệnh dưới đây phải chạy **trong thư mục `web`**, không phải thư mục gốc `book-course-vibe`.

### Bước 3: Tải các thư viện cần thiết (chỉ làm 1 lần)

Gõ lệnh sau rồi Enter, và **đợi**. Lần đầu có thể mất 1–5 phút tuỳ mạng:

```
npm install
```

Nếu ở cuối có vài dòng chữ vàng bắt đầu bằng `npm warn` → **bình thường, bỏ qua**. Chỉ khi có chữ `error` màu đỏ mới là có vấn đề (xem phần "Gặp lỗi" bên dưới).

### Bước 4: Bật website

```
npm run dev
```

Đợi vài giây, bạn sẽ thấy dòng chữ đại ý:

```
astro  v7.x.x ready in ... ms
┃ Local    http://localhost:4321/
```

Mở trình duyệt, vào đúng địa chỉ hiện trong dòng `Local` đó — thường là **http://localhost:4321**.

> Nếu số cuối không phải 4321 (ví dụ `4322`, `4323`): bình thường. Astro tự đổi số khi số cũ đang bị chương trình khác dùng. Cứ dùng đúng số nó hiện ra.

### Bước 5: Học

Trang chủ liệt kê **11 chapter**. Bấm vào chapter nào để mở bài học của chapter đó. Mỗi bài gồm:

- Phần giải thích tiếng Việt
- Code Kotlin **thật** lấy từ project mẫu, kèm ghi rõ file + số dòng để bạn tự mở ra đối chiếu
- Ô "Ghi chú phiên bản" (nền vàng) — cho biết chỗ nào trong sách đã cũ so với Android hiện nay
- Quiz 3–4 câu + 1 bài tập nhỏ ở cuối trang

### Bước 6: Tắt website

Quay lại cửa sổ đen, bấm **Ctrl + C**. Website tắt. Muốn học lại thì làm **Bước 2 + Bước 4** (không cần `npm install` lại).

---

## Phần 2 — Gặp lỗi thì làm gì

| Hiện tượng | Cách xử lý |
| --- | --- |
| `'npm' is not recognized` | Node.js chưa cài, hoặc cài rồi mà chưa mở lại cửa sổ đen. Đóng cửa sổ đen, mở lại theo Bước 2. |
| `Cannot find module` / `ENOENT` | Bạn đang đứng sai thư mục. Kiểm tra dòng lệnh có chữ `...\book-course-vibe\web>` ở đầu không. |
| Trình duyệt báo "không thể kết nối" | Cửa sổ đen đã tắt hoặc bạn vào sai số cổng. Xem lại dòng `Local` trong cửa sổ đen. |
| Trang chủ mở được nhưng bài học trắng trang | Xem cửa sổ đen có dòng chữ đỏ không, chụp lại rồi nhờ hỗ trợ. |
| Cài `npm install` báo lỗi đỏ | Xoá thư mục `web\node_modules` rồi chạy lại `npm install`. |

Cách "sửa cho chắc" khi mọi thứ rối: đóng hết cửa sổ đen, mở lại theo Bước 2, chạy lần lượt `npm install` rồi `npm run dev`.

---

## Phần 3 — Vài lệnh khác (không bắt buộc)

Chạy trong thư mục `web`:

| Lệnh | Dùng khi |
| --- | --- |
| `npm run dev` | Bật website để học (dùng hằng ngày) |
| `npm run build` | Tạo bản web tĩnh vào thư mục `web\dist\` — dùng nếu muốn đem web đi nơi khác |
| `npm run preview` | Xem thử bản vừa `build` |
| `npx astro check` | Kiểm tra code có lỗi không (dành cho người sửa website) |

---

## Phần 4 — Trong thư mục này có gì

```
book-course-vibe/
├── README.md          ← file bạn đang đọc
├── CLAUDE.md          ← hướng dẫn dành cho AI khi làm việc trong project này
│
├── Android_Fundamentals_by_Tutorials_v1.0.0.epub
│                      ← sách gốc (Kodeco). KHÔNG sửa.
├── aaf-materials/     ← 11 project Android mẫu đi kèm sách. KHÔNG sửa.
│
├── content/book/      ← nội dung sách đã trích ra dạng chữ, để đối chiếu nguồn
├── docs/              ← tài liệu quản lý dự án (xem bảng dưới)
├── scripts/           ← script trích xuất sách
└── web/               ← WEBSITE. Mọi lệnh ở trên chạy trong đây.
    ├── src/           ← code website
    └── dist/          ← bản web tĩnh sau khi build
```

Các file trong `docs/`:

| File | Nội dung |
| --- | --- |
| `PROJECT_PLAN.md` | **Tiến độ dự án** — đang làm task nào, đã xong gì, còn gì. Đọc file này trước nếu quay lại sau một thời gian. |
| `SOURCE_MAP.md` | Kết quả khảo sát sách + project Android mẫu |
| `LEARNING_MAP.md` | Bản đồ: chapter → khái niệm → file code tương ứng |

---

## Phần 5 — Vài điều nên biết

- **Website chạy hoàn toàn trên máy bạn.** Không gửi dữ liệu đi đâu, không lưu tiến độ học lên mạng. Quiz làm xong tải lại trang là mất kết quả — đúng như thiết kế, cho đơn giản.
- **Không tự sửa 2 chỗ này:** file `.epub` và thư mục `aaf-materials/`. Đó là nguồn gốc để đối chiếu; sửa vào là mất khả năng truy ngược "câu này trong sách ở đâu".
- **Chỉ dùng cá nhân.** Nội dung dựa trên sách đã mua và project mẫu đi kèm, nên không đăng website này lên internet công khai.
- **Muốn mở project Android mẫu để làm bài tập:** cần cài thêm **Android Studio** (https://developer.android.com/studio) — riêng việc đọc bài học trên website thì không cần.
