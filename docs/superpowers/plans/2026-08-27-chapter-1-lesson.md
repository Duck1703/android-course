# Chapter 1 Lesson Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn thành Task 11 bằng một lesson tiếng Việt, 3 câu quiz và 1 bài tập đọc Manifest cho Chapter 1, dựa đúng nội dung EPUB và không bịa project/code Kotlin.

**Architecture:** Tạo riêng một Astro component cho nội dung lesson và một Astro component cho quiz, rồi đăng ký cặp component theo slug trong registry hiện có. Route động giữ nguyên; đồng thời sửa hai mô tả đang khiến người học hiểu sai rằng Chapter 1 dạy Kotlin Playground.

**Tech Stack:** Astro 7.2.x, TypeScript 6.0.3, component `Code` của Astro, vanilla JavaScript.

## Global Constraints

- Chỉ thực hiện Task 11; không hoàn thiện Chapter 2/8 và không cleanup artifact.
- Nguồn nội dung chính là `content/book/ch01-welcome-to-android-kotlin.md`.
- Chapter 1 không có project Android thật; `aaf-materials/01-welcome-to-android-and-kotlin/` chỉ chứa `.keep`.
- Đoạn code duy nhất là XML Manifest minh hoạ ở dòng 55–76, không phải Kotlin và không phải file buildable hoàn chỉnh.
- Không sửa EPUB hoặc `aaf-materials/`.
- Không thêm dependency, framework phía client, auth, database hoặc deployment.
- Root project không có Git; không tạo repository và không commit.

## File Structure

- Create: `web/src/components/lessons/Ch01WelcomeToAndroidKotlin.astro` — giải thích 5 nhóm khái niệm và hiển thị XML Manifest.
- Create: `web/src/components/lessons/Ch01Quiz.astro` — 3 câu quiz, chấm điểm phía client và 1 bài tập đọc Manifest.
- Modify: `web/src/data/lessons.ts` — đăng ký cặp lesson/quiz cho slug Chapter 1.
- Modify: `web/src/pages/chapters/[slug].astro` — bỏ mô tả sai “học Kotlin nền tảng” trong source hint.
- Modify: `docs/LEARNING_MAP.md` — sửa mapping sai về Kotlin Playground theo EPUB đã xác minh.
- Modify: `docs/PROJECT_PLAN.md` — ghi trạng thái và bằng chứng hoàn thành Task 11.

---

### Task 1: Tạo lesson và quiz Chapter 1

**Files:**
- Create: `web/src/components/lessons/Ch01WelcomeToAndroidKotlin.astro`
- Create: `web/src/components/lessons/Ch01Quiz.astro`

**Interfaces:**
- Consumes: Astro component runtime; `Code` từ `astro:components`; nội dung tại `content/book/ch01-welcome-to-android-kotlin.md:19-104`.
- Produces: Hai default Astro component không nhận props, tương thích kiểu `AstroComponentFactory` của registry.

- [ ] **Step 1: Chạy smoke assertion đỏ trên website hiện tại**

Khởi động đúng hướng dẫn `web/CLAUDE.md`, rồi kiểm tra route Chapter 1 vẫn là placeholder và chưa có quiz:

```bash
npm --prefix /d/book-course-vibe/web run astro -- dev --background
python - <<'PY'
from urllib.request import urlopen
html = urlopen("http://localhost:4323/chapters/ch01-welcome-to-android-kotlin/").read().decode("utf-8")
assert "Quiz nhanh" in html
assert "Nội dung bài học chi tiết cho chapter này đang được biên soạn" not in html
PY
```

Expected: FAIL ở assertion `Quiz nhanh`, xác nhận kiểm tra bắt đúng chức năng còn thiếu. Nếu Astro chọn port khác, lấy URL thật từ `npm --prefix /d/book-course-vibe/web run astro -- dev status` và dùng URL đó.

- [ ] **Step 2: Viết lesson tối thiểu từ nguồn thật**

Trong frontmatter của `Ch01WelcomeToAndroidKotlin.astro`, import `Code` và khai báo đúng trích đoạn XML:

```astro
---
import { Code } from "astro:components";

const manifestCode = `<?xml version="1.0" encoding="utf-8"?>
<manifest ... >
  <!-- // 1 -->
  <application ... >
    <!-- // 2 -->
    <activity
      android:name=".MainActivity"
      android:exported="true"
      android:label="@string/app_name"
      android:theme="@style/SplashTheme">
      <!-- // 3 -->
      <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
      </intent-filter>
    </activity>
    ...
  </application>
</manifest>`;
---
```

Body có đúng 5 phần:

1. Android và vai trò Kotlin — nguồn dòng 19–27; không dạy cú pháp Kotlin.
2. Security sandbox và 4 app component — nguồn dòng 29–49.
3. Manifest và launcher Activity — code nguồn dòng 55–76, giải thích nguồn dòng 78–86; render bằng `<Code code={manifestCode} lang="xml" theme="github-dark" />`.
4. App resources — nguồn dòng 88–94.
5. Gradle ghép code/resources/component thành app — nguồn dòng 96–104.

Mỗi phần có citation file + line range. Callout đầu bài nói rõ chapter không có project Android thật và đoạn XML có `...` là trích đoạn minh hoạ, không phải file hoàn chỉnh.

- [ ] **Step 3: Viết quiz và bài tập**

Tạo 3 `fieldset` với `data-answer`:

```text
q1: Activity cung cấp giao diện người dùng — đáp án b
q2: Manifest khai báo component/capability/permission/hardware — đáp án c
q3: Gradle tự động hoá build và tạo bản phát hành — đáp án a
```

Dùng pattern vanilla JS hiện có và khai báo type DOM chính xác:

```ts
const picked = form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
```

Bài tập “Đọc nhãn Manifest” yêu cầu tìm `<application>`, `.MainActivity`, `MAIN`, `LAUNCHER` và giải thích cách Android xác định Activity khởi động. Một `<details>` cung cấp gợi ý; không yêu cầu sửa source.

- [ ] **Step 4: Chạy Astro check cục bộ**

```bash
npm --prefix /d/book-course-vibe/web run astro -- check
```

Expected: exit 0, không có error mới.

### Task 2: Tích hợp registry và sửa mô tả sai

**Files:**
- Modify: `web/src/data/lessons.ts:4-44`
- Modify: `web/src/pages/chapters/[slug].astro:29-37`
- Modify: `docs/LEARNING_MAP.md:7-12`

**Interfaces:**
- Consumes: `Ch01WelcomeToAndroidKotlin` và `Ch01Quiz` từ Task 1.
- Produces: Entry `LESSONS["ch01-welcome-to-android-kotlin"]` gồm cả `Lesson` và `Quiz`.

- [ ] **Step 1: Đăng ký component**

Thêm imports:

```ts
import Ch01WelcomeToAndroidKotlin from "../components/lessons/Ch01WelcomeToAndroidKotlin.astro";
import Ch01Quiz from "../components/lessons/Ch01Quiz.astro";
```

Thêm entry đầu registry:

```ts
"ch01-welcome-to-android-kotlin": {
  Lesson: Ch01WelcomeToAndroidKotlin,
  Quiz: Ch01Quiz,
},
```

- [ ] **Step 2: Sửa source hint trên route**

Thay mô tả sai bằng mô tả trung tính, đúng cho Chapter 1:

```astro
{!chapter.hasProject && <span class="hint"> (chapter này không có project Android thật)</span>}
```

- [ ] **Step 3: Sửa LEARNING_MAP theo nguồn đã xác minh**

Giữ `File Android: Không có project thật`, nhưng thay nhận định “học Kotlin thuần trên Kotlin Playground” bằng: Chapter 1 là phần tổng quan, code block duy nhất là trích đoạn XML Manifest tại `content/book/ch01-welcome-to-android-kotlin.md:55-76`. Thay gợi ý Kotlin cơ bản bằng bài tập đọc Manifest.

- [ ] **Step 4: Chạy lại assertion hành vi**

```bash
python - <<'PY'
from urllib.request import urlopen
html = urlopen("http://localhost:4323/chapters/ch01-welcome-to-android-kotlin/").read().decode("utf-8")
assert "Quiz nhanh" in html
assert "Nội dung bài học chi tiết cho chapter này đang được biên soạn" not in html
assert "MainActivity" in html
assert "android.intent.action.MAIN" in html
assert "android.intent.category.LAUNCHER" in html
assert "học Kotlin nền tảng" not in html
print("Chapter 1 lesson smoke: PASS")
PY
```

Expected: `Chapter 1 lesson smoke: PASS`.

### Task 3: Xác minh toàn website và cập nhật tiến độ

**Files:**
- Modify: `docs/PROJECT_PLAN.md:5-12,43-54`

**Interfaces:**
- Consumes: Website đã tích hợp ở Task 2.
- Produces: Bằng chứng kiểm tra mới và roadmap chính xác sau Task 11.

- [ ] **Step 1: Type-check toàn project**

```bash
npm --prefix /d/book-course-vibe/web run astro -- check
```

Expected: exit 0, 0 errors. Hints có sẵn phải được báo đúng, không gọi là error.

- [ ] **Step 2: Production build**

```bash
npm --prefix /d/book-course-vibe/web run build
```

Expected: exit 0 và sinh các route tĩnh, gồm Chapter 1.

- [ ] **Step 3: Smoke test 12 route chính và route giả**

Dùng dev server background đang chạy hoặc khởi động lại nếu cần. Script phải xác minh:

```python
# / và 11 chapter route đều HTTP 200
# /chapters/ch99-fake/ trả HTTP 404
# Chapter 1–11 đều chứa "Quiz nhanh" và không chứa placeholder
# Chapter 1 chứa XML markers và không có mô tả Kotlin sai
```

Expected: 12/12 route chính pass; route giả 404.

- [ ] **Step 4: Kiểm tra quiz Chapter 1 ở trình duyệt nếu công cụ browser sẵn có**

Submit một lần với đáp án `b/c/a`; xác minh hiển thị `Kết quả: 3/3 câu đúng.` và không có lỗi console. Nếu không có browser driver, báo rõ bước này chưa chạy thay vì suy đoán; Astro check + HTML smoke vẫn là kiểm tra bắt buộc.

- [ ] **Step 5: Cập nhật PROJECT_PLAN**

Ghi Task 11 `[x]`, nội dung đã làm, nguồn XML và bằng chứng kiểm tra thực tế. Đặt `Task hiện tại` là Task 11 hoàn thành; `Task tiếp theo` là Task 12 — hoàn thiện citation Chapter 2. Giữ Task 17 `[~]`. Không đánh dấu task nào khác hoàn thành.

- [ ] **Step 6: Dừng server nếu task đã tự khởi động server mới và không cần giữ lại**

```bash
npm --prefix /d/book-course-vibe/web run astro -- dev stop
```

Nếu server đã tồn tại trước task, không tự dừng server của user; chỉ báo URL/status.

- [ ] **Step 7: Báo cáo và dừng**

Dùng đúng mẫu trong `CLAUDE.md`, liệt kê đúng file thay đổi, lệnh đã thật sự chạy, rủi ro còn lại và Task 12 là task tiếp theo. Không bắt đầu Task 12.
