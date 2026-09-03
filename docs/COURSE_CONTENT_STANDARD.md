# COURSE CONTENT STANDARD v1

*Chuẩn biên tập & sư phạm cho khoá "Học Android bằng tiếng Việt cho người mới" — dùng làm khuôn khi review, tách, viết lại, hoặc tạo mới bài học (áp dụng ngay cho Ch04–09 và Ch11).*

> **This document is the authoritative content standard for reviewing, splitting, rewriting, or creating lessons in this course. When another planning document conflicts with this standard on educational content, follow this standard unless explicitly instructed otherwise.**

---

## 1. TARGET LEARNER — Người học mục tiêu

**Được phép giả định người học CÓ:**
- Biết dùng máy tính cơ bản, cài phần mềm, tạo/lưu file.
- Đã đọc các chương TRƯỚC trong khoá này (khoá là tuyến tính — mỗi bài đứng trên bài trước).
- Chút logic lập trình chung (biến, if/else, vòng lặp là gì) ở mức khái niệm — KHÔNG cần biết Kotlin.

**KHÔNG được giả định người học biết:**
- Cú pháp Kotlin đặc thù (`by` delegate, scope functions, lambda đuôi, `when`, null-safety, `data class`, `object`/`companion`) — phải giải thích lần đầu dùng.
- Bất kỳ khái niệm Compose / Coroutine / Flow nào chưa được dạy trong khoá.
- Kinh nghiệm Android trước đó, thuật ngữ Gradle/build, hay đã đọc cuốn sách nguồn.
- Tiếng Anh kỹ thuật — giữ tên API tiếng Anh nhưng chú giải tiếng Việt lần đầu: `State (trạng thái)`.

**Quy tắc vàng:** nếu một khái niệm chưa xuất hiện trong khoá ở bài trước, người học **không biết nó**. Không có ngoại lệ "cái này ai cũng biết".

---

## 2. LESSON PURPOSE — Mục đích mỗi bài

Mỗi bài **bắt buộc** mở đầu bằng khối trả lời 3 câu:

- **Sau bài này bạn hiểu gì?** — 3–5 gạch đầu dòng, bắt đầu bằng động từ đo được ("giải thích được…", "tự viết được…", "chỉ ra được…"). Không viết "tìm hiểu về…".
- **Tại sao điều này quan trọng khi làm Android?** — 1–2 câu nối với việc thật người học sẽ gặp.
- **Cần biết trước gì?** — liệt kê rõ chương/khái niệm tiên quyết, kèm link "Chương X". Nếu bài dùng khái niệm chưa dạy → phải liệt kê ở đây kèm ghi chú forward-reference (xem mục 9).

---

## 3. KNOWLEDGE PROGRESSION — Trình tự kiến thức

**Bắt buộc:**
1. **Tiên quyết trước phụ thuộc.** Không dùng khái niệm X để dạy Y nếu X chưa được dạy hoặc chưa được giới thiệu tối thiểu (primer) trong cùng/ trước bài.
2. **"Tại sao" trước "làm thế nào"** khi khái niệm mới hoặc phản trực giác (state hoisting, UDF, tại sao cần ViewModel). Với thao tác cơ học đơn giản thì được đi thẳng vào cách làm.
3. **Không dump code chứa cú pháp chưa giải thích.** Mỗi cú pháp Kotlin/Compose/Coroutine lạ xuất hiện lần đầu → giải thích tại chỗ hoặc link tới nơi đã dạy.
4. **Forward reference không tránh được** → dùng khuôn cố định (mục 9), không im lặng bỏ qua.

**Nên:**
- Đầu chương lớn: 2–3 câu "recap" nối với chương trước.
- Một khái niệm mới lớn nên có mental model trước khi có code.

---

## 4. LESSON STRUCTURE — Cấu trúc bài chuẩn

Flow ưu tiên (rút từ các bài đã tách tốt: Ch01/02/03/10). **Không ép đủ mọi mục** — chọn theo nội dung thật, nhưng giữ đúng thứ tự khi có:

1. **Mục tiêu + Tại sao + Cần biết trước** (mục 2 — bắt buộc).
2. **Mental model / bức tranh lớn** — hình dung dễ nhớ trước khi vào chi tiết.
3. **Khái niệm cốt lõi** — định nghĩa + tại sao tồn tại.
4. **Ví dụ nhỏ tối giản** — minh hoạ khái niệm ở mức nhỏ nhất chạy được.
5. **Code thật trong project mẫu** — chỉ ra file → class/function/composable → vai trò → khái niệm được áp vào đâu.
6. **`<h2 id="cam-bay">` Cạm bẫy & tài liệu lỗi thời** — bắt buộc (đặc sản của khoá).
7. **Recap / Key takeaways** — bảng hoặc bullet ngắn.
8. **`<h2 id="nguon">` Nguồn tham khảo** — bắt buộc, duy nhất 1 khối (mục 6).
9. **Quiz** — theo chuẩn mục 10.

Ràng buộc kỹ thuật (theo naming contract của khoá): mỗi file lesson có đúng 1 `<h2 id="cam-bay">` và đúng 1 `<h2 id="nguon">`; đánh số mục **liên tục** xuyên các bài con của cùng một chương lớn; mọi cross-ref viết "Chương N".

---

## 5. LESSON SIZE — Kích thước bài

**Đây là GUIDELINE ĐỊNH HƯỚNG, KHÔNG phải hạn mức cứng:**
- Thời gian đọc: **12–22 phút/bài** (≈ 1.500–3.500 từ).
- Số khái niệm lớn mới: khoảng **2–3 / bài**.
- Mỗi code block phải có phần giải thích đi kèm.

> **Không bao giờ "độn" nội dung cho đủ số từ.** Một bài ngắn mà đủ và rõ thì tốt hơn một bài dài lê thê. Số từ/phút chỉ để cảnh báo, không phải mục tiêu.

**Tín hiệu TÁCH bài (mạnh hơn số từ) — chạm bất kỳ cái nào thì cân nhắc tách:**
- Đọc quá **25 phút**.
- Trên **3 khái niệm lớn** độc lập.
- **Chuyển chủ đề lớn** (vd: "State" và "Networking" trong cùng trang).
- **Quá tải nhận thức** (người mới phải giữ quá nhiều thứ trong đầu cùng lúc).
- Bài **tự nhiên cần một bài kiểm tra (quiz) riêng** để phủ hết nội dung.

*(7 chương nguyên khối hiện ~40–70 phút → vượt tín hiệu tách, cần tách theo bản đồ trong `docs/CHAPTER_SPLIT_MAP.md`.)*

---

## 6. WRITING VOICE — Giọng văn độc lập

Khoá phải đọc như **một khoá học tiếng Việt độc lập**, không phải ghi chú đọc sách.

**Bắt buộc — LOẠI BỎ:**
- ❌ "sách nói…", "theo sách…", "sách định nghĩa…"
- ❌ "chapter X…", "trong chương X của sách…"
- ❌ "tác giả…", "tác giả để lại…", "tác giả nhấn mạnh…"
- ❌ Bình luận về dòng/đoạn của nguồn ("dòng 42 trong sách…", bảng "sách nói vs code thật" đặt giữa bài).
- ❌ Giọng ngôi thứ nhất kiểu biên tập: "phiên bản tôi đề nghị", "phân tích của tôi", "tôi viết lại".

**Cách thay:**
- "sách" → **"giáo trình gốc"** (chỉ trong khối Nguồn), hoặc bỏ hẳn, viết trực tiếp khái niệm.
- "tác giả để lại code X" → "code mẫu để lại X" / "trong project mẫu, X…".
- Bảng đối chiếu lý thuyết-vs-code: giữ được **nếu** diễn đạt trung tính ("Lý thuyết mô tả… — code thật làm…") và có cột "nên theo cái nào". Không dùng từ "sách".

**Preserve — attribution hợp lệ chỉ ở 1 chỗ:**
- Dồn mọi trích dẫn nguồn vào khối cuối `<h2 id="nguon">Nguồn tham khảo`: tên giáo trình gốc (Kodeco) + chương, đường dẫn `aaf-materials/…` + số dòng. Đây là chỗ **duy nhất** được nêu nguồn.

---

## 7. TECHNICAL EXPLANATION — Cách dạy code

**Bắt buộc:**
- **Không dump code không giải thích.** Sau mỗi block quan trọng: giải thích các dòng cốt lõi (không cần từng dòng, nhưng đủ để hiểu chuyện gì xảy ra).
- **Phân biệt rõ 3 tầng** mỗi khi trộn lẫn:
  - *Android/framework* (Activity, lifecycle, Manifest, Compose runtime…),
  - *Cú pháp Kotlin* (`by`, lambda, `when`…),
  - *SDK bên thứ ba* (Retrofit, Room, Ditto…) — phải nói rõ "đây là thư viện ngoài, không phải Android chuẩn".
- **Định vị code thật:** file → class/function/composable → vai trò → khái niệm áp vào đâu. Không hiển thị code mồ côi.
- **API cũ:** đánh dấu gọn ("API này đã lỗi thời từ …, nay dùng …") — **1–2 câu**, không biến bài thành trang đính chính.

**Trích dẫn nguồn / code thật — dùng đúng mục đích:**
- Giữ tham chiếu code thật + trích dẫn file/dòng hữu ích, nhưng **KHÔNG biến bài thành bình luận từng dòng lên nguồn**.
- Trích dẫn chủ yếu để: (1) **định vị** phần cài đặt thật; (2) **hậu thuẫn một khẳng định kỹ thuật**; (3) cho người học **xem toàn bộ code hoàn chỉnh** nếu muốn.
- **Bản thân bài học phải giải thích khái niệm một cách độc lập** — người học hiểu được mà không cần mở file nguồn ra đọc song song.

**Nên:** callout phân biệt "kiến thức bền" (nguyên lý) vs "cú pháp SDK có thể đổi".

---

## 8. KOTLIN FOR BEGINNERS — Cú pháp Kotlin chưa học

**Quy tắc "chú giải tại điểm dùng đầu tiên":**
- Cú pháp Kotlin lạ xuất hiện lần đầu → hộp giải thích ngắn ngay tại chỗ (2–4 câu + 1 ví dụ tối giản), rồi quay lại mạch chính.
- Ví dụ: lần đầu gặp `by remember { … }` → giải thích `by` (uỷ quyền thuộc tính) ở mức "nó cho phép biến lấy giá trị từ chỗ khác", không lạc đề thành bài Kotlin đầy đủ.
- Cùng một cú pháp, lần sau chỉ cần link về nơi đã giải thích, không lặp lại.
- Cú pháp lặp nhiều lần trong khoá (lambda đuôi, `when`, null-safety) → cân nhắc gom vào một **primer "Kotlin vừa đủ"** đặt sớm, các bài sau link về.

---

## 9. COMPOSE / COROUTINES FORWARD REFERENCES — Khuôn tham chiếu tới trước

Khi buộc phải dùng khái niệm dạy ở chương sau (Compose ở Ch03 trước Ch05; Coroutines/Flow ở Ch06–07 trước Ch08), áp dụng nguyên tắc:

> **Khi một khái niệm của chương sau buộc phải xuất hiện sớm, hãy giải thích mental model tối thiểu đủ để hiểu VAI TRÒ của nó. Người học chưa cần toàn bộ cơ chế. Nói rõ bài/chương nào sau này sẽ dạy nó đầy đủ.**
>
> **Người học KHÔNG bao giờ bị yêu cầu gõ code mà không hiểu chút gì về việc những phần quan trọng đang làm gì.** Cấm câu kiểu "cứ copy/làm theo, đừng bận tâm".

Khuôn cụ thể:
1. **Mental model tối thiểu tại chỗ:** giải thích *vai trò* của đoạn code (nó để làm gì, phần quan trọng nào đang xảy ra) — vừa đủ để không mù mờ, chưa cần cơ chế đầy đủ.
2. **Callout chuẩn hoá:**
   > 🔭 *Phần này dùng [khái niệm] — bạn sẽ học đầy đủ ở **Chương X**. Ở đây chỉ cần hiểu vai trò của nó: [1–2 câu bản chất]. Khi tới Chương X bạn sẽ hiểu vì sao nó hoạt động.*
3. **Liệt kê ở "Cần biết trước"** (mục 2) là forward reference, không phải tiên quyết.
4. **Không** giải thích trùng lặp toàn bộ — nơi dạy chính vẫn là chương sau.

Ưu tiên dài hạn: nơi nào forward reference lặp lại (coroutines cho Ch06/07) → cân nhắc chèn primer chung trước chương đầu tiên cần nó.

---

## 10. QUIZ STANDARD — Chuẩn quiz

**Cấu trúc:**
- Mỗi bài (hoặc bài con) có **1 quiz riêng**, **8–12 câu** trắc nghiệm 4 phương án.
- Mỗi câu có **giải thích cho đáp án đúng VÀ vì sao các distractor sai** (đặc sản cần giữ).

**Phân bố loại câu hỏi (bám mục tiêu bài — mục 2):**
- ~30% **nhớ/hiểu** (khái niệm là gì, để làm gì),
- ~40% **hiểu sâu/áp dụng** (chọn cách đúng cho tình huống),
- ~20–30% **debug/đọc code** (tìm bug, đoán output, chỉ ra dòng sai) — tận dụng planted-bug đang làm tốt.

**Chống lệch độ dài đáp án (Bắt buộc — lỗi nặng hiện tại):**
- Đáp án đúng **KHÔNG được** luôn là phương án dài nhất hay ngắn nhất.
- Trong 1 quiz, vị trí và độ dài đáp án đúng phải phân tán; các phương án nên **xấp xỉ độ dài nhau**.
- Kiểm nhanh: nếu chọn "luôn phương án dài nhất" (hoặc ngắn nhất) mà đúng > 40% số câu → phải cân lại.

**Distractor:** phải "sai một cách hợp lý" (phản ánh hiểu nhầm thật của người mới), không phải phương án ngớ ngẩn loại được ngay.

**Alignment:** mỗi mục tiêu ở đầu bài phải có ≥1 câu quiz kiểm tra; không hỏi thứ chưa dạy trong bài.

---

## 11. VERSION DRIFT — Xử lý code cũ vs API hiện tại

**Bắt buộc:**
- Trình bày version drift **gọn, dạng thông tin**, không dạng "đính chính sách":
  - Bảng nhỏ "**2023 (code mẫu) → hôm nay**" khi có nhiều điểm lệch.
  - Với điểm lẻ: 1 câu "code mẫu dùng X (từ …); bản hiện tại dùng Y".
- **Ghim mốc thời gian** của code mẫu một lần ở đầu, không lặp "hồi đó/bây giờ" khắp bài.
- Nêu **API hiện hành là cái nào** và **người học nên dùng cái nào** (cột "nên theo").
- Không để phần version drift chiếm spotlight — nó là ghi chú bên lề, không phải nội dung chính.

**Cần verify trước khi viết lại** (không tự ý thay stack): Ditto v5/DQL, kotlinx-datetime 0.4→0.8, Retrofit 3, Moshi/KSP, Spoonacular free-tier, AS Ladybug, plugin Compose Kotlin 2.0, đường thay `EncryptedSharedPreferences`.

---

## 12. PRESERVE — Điểm mạnh KHÔNG được phá khi viết lại

1. **Mục "Cạm bẫy & tài liệu lỗi thời"** — dạy kỹ năng đọc phê phán, phát hiện code chết.
2. **Bảng version drift có cột "nên theo cái nào".**
3. **Code thật từ `aaf-materials/` kèm trích dẫn dòng chính xác.**
4. **Quiz chất lượng cao:** planted-bug, giải thích cả distractor, câu hỏi debug/áp dụng.
5. **Quiz theo từng bài con** (không dồn 1 quiz khổng lồ).
6. **Mental model dễ hình dung** (sandbox = toà chung cư…).
7. **Đánh số mục liên tục** xuyên các bài con.
8. **Mục tiêu học tập đo được** ở đầu bài.
9. **Bài tập thực hành có kiểm chứng** (Device Explorer, ordering widget có grader) + cảnh báo thao tác phá huỷ (`pm clear`).
10. **Giọng độc lập, trung tính của Ch01/02/03/10** — đây là chuẩn cần nhân rộng.

---

## MANDATORY RULES — Quy tắc bắt buộc

- Mở bài bằng **Mục tiêu + Tại sao + Cần biết trước**.
- Không dùng khái niệm chưa dạy mà không có mental model tối thiểu + callout forward-reference chuẩn (mục 9).
- Bỏ hết "sách/chapter/tác giả/tôi"; nguồn chỉ nằm trong khối "Nguồn tham khảo".
- Đọc quá ~25 phút / trên 3 khái niệm lớn / chuyển chủ đề lớn → tách bài (không lấy số từ làm hạn mức cứng).
- Mọi code block có giải thích; phân biệt **Android vs Kotlin vs SDK bên thứ ba**.
- Bài tự giải thích khái niệm độc lập; trích dẫn nguồn chỉ để định vị / hậu thuẫn / cho xem code đầy đủ.
- Quiz 8–12 câu, giải thích cả distractor, **cân độ dài đáp án**, bám mục tiêu bài.
- Giữ mục "Cạm bẫy" + "Nguồn tham khảo" + số mục liên tục + cross-ref "Chương N".

## RECOMMENDED RULES — Quy tắc nên theo

- Mental model trước code cho khái niệm mới.
- Recap đầu chương lớn nối chương trước.
- Primer "Kotlin vừa đủ" / "Compose tối thiểu" / "Coroutines tối thiểu" đặt sớm, các bài link về.
- Callout phân biệt "kiến thức bền" vs "cú pháp SDK dễ đổi".

## ANTI-PATTERNS — Cấm

- Code dump không giải thích.
- Bảo người mới "cứ copy/làm theo, đừng bận tâm" (vi phạm mục 9).
- Giọng bình luận/đính chính sách; bảng "sách nói vs code thật" đặt giữa bài; bình luận từng dòng lên nguồn.
- Độn nội dung cho đủ số từ.
- Bài 40–70 phút một mạch, > 3 khái niệm lớn.
- Đáp án đúng luôn dài nhất / ngắn nhất.
- Dùng SDK bên thứ ba (Ditto…) như thể là Android chuẩn.
- Biến bài thành trang errata version drift.
- Lặp lại toàn bộ giải thích một khái niệm ở nhiều bài thay vì link.

---

## LESSON QUALITY CHECKLIST — Tự review trước khi coi 1 bài là xong

**Sư phạm**
- [ ] Có Mục tiêu đo được + Tại sao + Cần biết trước ở đầu?
- [ ] Mọi khái niệm dùng trong bài đã được dạy trước, hoặc có mental model tối thiểu + callout forward-reference?
- [ ] "Tại sao" đứng trước "làm thế nào" ở các khái niệm mới/phản trực giác?
- [ ] Khoảng ≤ 3 khái niệm lớn; không quá tải nhận thức?

**Giọng văn / độc lập**
- [ ] 0 lần "sách/chapter/tác giả/tôi đề nghị" ngoài khối Nguồn?
- [ ] Attribution chỉ nằm trong 1 khối "Nguồn tham khảo"?
- [ ] Bài tự giải thích được mà không cần mở file nguồn đọc song song?

**Kỹ thuật**
- [ ] Mọi code block có giải thích dòng cốt lõi?
- [ ] Đã phân biệt Android / Kotlin / SDK bên thứ ba?
- [ ] Cú pháp Kotlin lạ có chú giải tại điểm dùng đầu tiên?
- [ ] Code thật được định vị (file → class → vai trò)?
- [ ] Version drift gọn, có "nên dùng cái nào", không thành errata?

**Đánh giá**
- [ ] Quiz 8–12 câu, phủ hết mục tiêu bài?
- [ ] Có giải thích đáp án đúng **và** vì sao distractor sai?
- [ ] Đáp án đúng KHÔNG luôn dài nhất/ngắn nhất (test đoán < 40%)?
- [ ] Có câu debug/áp dụng, không chỉ câu nhớ?

**Cấu trúc**
- [ ] Có `<h2 id="cam-bay">` và đúng 1 `<h2 id="nguon">`?
- [ ] Số mục liên tục với các bài con cùng chương?
- [ ] Cross-ref viết "Chương N"?

---

*Phiên bản: v1 — 2026-09-01. Rút ra từ audit cấp khoá học và các chương đã tách tốt (Ch01/02/03/10).*
