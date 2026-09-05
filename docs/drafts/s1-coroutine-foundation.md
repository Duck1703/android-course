# S1 — Coroutines: đủ để không sợ

> **TRẠNG THÁI: DRAFT NỘI BỘ CHO BÀI HỌC TƯƠNG LAI.** File này KHÔNG phải trang site.
> Khi dựng bài chính thức (task IMP-045 trong `docs/COURSE_REDESIGN_IMPLEMENTATION_PLAN.md`),
> nội dung học là phần "Bài học" phía dưới. Bốn mục cuối file — "Editorial migration notes",
> "Editorial open questions", "Final readability-test inventory", "Sources for future Nguồn block" —
> là **nội dung biên tập nội bộ, KHÔNG đưa cho người học** và không được để lọt vào trang bài học.
>
> **Vị trí trong khoá:** Giai đoạn 3 (State & kiến trúc), bài **1/5** — ngay sau C5 (a11y cơ bản),
> **trước** S2 (state trong Compose), S3, S4 (ViewModel & StateFlow) và S5 (kiến trúc). Phân loại
> **Lõi**. Thời lượng tham khảo ~20 phút.
>
> **Đánh số mục:** S1 là bài **đầu tiên** của Giai đoạn 3 và là bài NEW (không tách từ chương nào),
> nên draft dùng "Phần 1…13" như F1/F2. Khi dựng trang: `Phần k` → `mục k` (bắt đầu từ 1), và batch
> tách Ch06 → S2–S4 (IMP-037) tiếp nối từ **mục 14**. Quyết định này ghi lại ở "Editorial migration
> notes / F. Bàn giao đánh số mục".
>
> **Phạm vi:** đây là **mô hình tư duy tối thiểu**, không phải bài coroutine đầy đủ. Mục tiêu duy
> nhất: sau bài này, code `viewModelScope.launch { }` / `StateFlow<UiState>` ở S4 và các bài sau
> **không còn là phép thuật**. Chiều sâu coroutine/Flow (structured concurrency, cancellation,
> `async`/`await`, toàn bộ họ toán tử Flow, cold vs hot, `SharedFlow`, `SupervisorJob`, test
> coroutine) thuộc **W1 — Coroutines & Flow đầy đủ**. Danh sách loại trừ đầy đủ ở
> "Editorial migration notes / C. Giữ cho W1".
>
> **Ngân sách nhấn mạnh:** bài có đúng **năm điều cốt lõi** (xem "Tóm tắt"); mọi chi tiết khác được
> cố tình hạ xuống mức *nhận biết* hoặc chuyển vào mục nội bộ. **4 callout** (mô hình coroutine ·
> `suspend` không chọn thread · scope là chủ sở hữu · quy tắc main-safety) và **6 checkpoint** —
> đúng hạn mức ≤4 callout của template. Mọi điểm chính xác khác (dispatcher chọn theo bản chất việc,
> giới hạn của phép ví Flow, so sánh Flow ↔ StateFlow) viết thành **văn xuôi/bảng**, không thành
> callout, để bốn hộp trên không bị loãng.

---

# Bài học

## Mục tiêu — sau bài này bạn sẽ

- Giải thích được **coroutine là gì** ở mức người mới, và nói được vì sao **coroutine không phải
  thread** — kèm điều gì xảy ra với thread khi một coroutine "chờ".
- Đọc được từ khoá `suspend` và nói đúng nó **cho phép điều gì** — cũng như hai điều nó **không**
  làm: không tự chọn thread, không tự nghĩa là "chậm".
- Chỉ ra được **ai làm chủ** một coroutine khi đọc `viewModelScope.launch { }`,
  `rememberCoroutineScope()` hay `LaunchedEffect(key) { }`, và vì sao câu hỏi "ai làm chủ" quan
  trọng hơn câu hỏi "chạy ở thread nào".
- Chọn được đúng dispatcher cho ba loại việc (giao diện · việc chặn thread · tính toán nặng), và
  giải thích được `withContext(...)` làm gì mà không phóng đại.
- Đọc được `Flow<T>`, `collect { }` và `StateFlow<UiState>`, nói được **StateFlow thêm ý gì** so với
  một Flow thường.
- Nhìn một đoạn code ViewModel 12–15 dòng và **chú thích được mọi khái niệm coroutine/Flow** trong
  đó, dù chưa học ViewModel.

**Tại sao điều này quan trọng khi làm Android.** Từ bài sau trở đi, code của khoá bắt đầu xuất hiện
`viewModelScope.launch`, `suspend`, `StateFlow`, `withContext`, `collect` — và chúng xuất hiện
*liên tục* cho tới hết khoá. Nếu năm chữ đó chưa có nghĩa, bạn sẽ gõ theo mà không hiểu, rồi mắc
đúng một trong bốn lỗi kinh điển: bọc `withContext(Dispatchers.IO)` khắp nơi cho chắc, tưởng
`suspend` là "chạy nền", để công việc chạy tiếp sau khi màn hình đã đóng, hoặc dùng `Thread.sleep`
trong coroutine. Bài này không dạy bạn *viết* coroutine giỏi — nó dạy bạn **đọc** đúng, để phần
kiến trúc phía sau học được.

**Cần biết trước:**

- **Nền tảng Kotlin F1** — hàm, tham số, expression body, lambda + `it`, **lambda đuôi**, kiểu hàm
  `() -> Unit`, `?.`/`?:`. Bài này dùng lại liên tục, không dạy lại.
- **Nền tảng Kotlin F2** — `data class`, đọc generic `Hộp<Loại-bên-trong>` (`List<Message>`), ý tưởng
  **sealed state** (`UiState` với Loading/Success/Error). Phần Flow/StateFlow trả nợ đúng hai thứ này.
- **C4 (Preview & vòng đời composable)** — bạn đã gặp `LaunchedEffect(key) { }` một lần ở đó, với
  lời hẹn "khối đó là một *coroutine*, và coroutine sẽ học riêng ở giai đoạn State & kiến trúc".
  Bài này chính là lời hẹn đó.

**Chưa cần biết:** ViewModel là gì (bài **S4**), repository là gì (bài **S5**), Retrofit/Room (giai
đoạn Mạng và Dữ liệu cục bộ). Ở đây chúng chỉ xuất hiện dưới dạng *tên*, luôn kèm nhãn "sẽ học ở
bài nào".

---

## Phần 1 — Vấn đề: chờ mà không được đứng máy

### Vấn đề trước cú pháp

Người dùng bấm nút **"Tải dữ liệu"**. App phải đi lấy dữ liệu từ đâu đó: một server trên internet,
một file trên đĩa, một database, hay chỉ là một khoảng đếm ngược. Mọi thứ vừa kể có một đặc điểm
chung: **mất thời gian, và thời gian đó không do bạn quyết định.**

Trong khi đó, app Android có một *chỗ chạy đặc biệt* — **main thread** (còn gọi là UI thread). Chỉ
chỗ này được phép vẽ giao diện và nhận cú chạm, và nó làm việc theo vòng lặp: nhận sự kiện → xử lý →
vẽ lại → nhận sự kiện tiếp. Để cảm giác mượt, vòng lặp đó phải xong khoảng **16 milisecond một lần**
(~60 khung hình/giây).

Bây giờ ghép hai điều lại. Nếu bạn đặt việc chờ 2 giây vào giữa vòng lặp đó, thì trong 2 giây ấy
**không khung hình nào được vẽ, không cú chạm nào được xử lý** — người dùng thấy app "treo". Vấn đề
không phải "việc này nặng"; vấn đề là **chỗ chạy duy nhất dành cho giao diện đang bị chiếm để nằm
chờ.**

Từ đây có hai từ cần phân biệt cho thật rõ, vì cả bài dựa vào nó:

| Kiểu chờ | Chuyện gì xảy ra với thread |
|---|---|
| **Chặn** (blocking) | Thread *bị chiếm* trong lúc chờ. Nó không làm được việc gì khác, kể cả khi việc nó đang chờ chẳng cần CPU (chờ mạng trả lời chẳng hạn). |
| **Tạm dừng** (suspending) | Công việc *tự dừng lại ở một điểm cho phép*, **trả thread lại** cho bên điều phối, rồi được tiếp tục sau. Trong lúc đó thread rảnh để chạy việc khác. |

Chú ý sự khác biệt nằm ở đâu: **cả hai đều "chờ"** — nhưng "chặn" giữ chặt chỗ chạy, còn "tạm dừng"
nhả chỗ chạy ra. Toàn bộ giá trị của coroutine nằm ở cột thứ hai.

> **Mô hình trực quan — coroutine là gì**
>
> **Một coroutine là một công việc có thể tạm dừng ở những điểm cho phép, rồi tiếp tục sau, mà
> không cần một thread ngồi chờ suốt thời gian đó.**
>
> Đọc lại câu trên chậm hơn, vì mỗi mệnh đề đều có việc: *"một công việc"* (không phải một chỗ chạy,
> không phải một thread) · *"tạm dừng ở những điểm cho phép"* (không phải dừng bất kỳ chỗ nào — chỉ
> tại các điểm mà code có đánh dấu) · *"không cần một thread ngồi chờ"* (đây là điều bạn *được*, và
> là lý do coroutine tồn tại).

Cách so sánh gần đời thường, dùng đúng một lần rồi bỏ: bạn gọi điện đặt hàng, tổng đài nói "chờ máy
nhé". Kiểu **chặn** là bạn áp tai vào điện thoại, không làm gì khác cho tới khi có người nói. Kiểu
**tạm dừng** là bạn để lại số, đặt điện thoại xuống, đi làm việc khác, và khi tổng đài gọi lại thì
bạn tiếp tục *đúng chỗ đang dở*. Điểm hình ảnh này diễn tả đúng: **việc chờ vẫn còn đó, nhưng bạn
không bị đứng yên vì nó.**

---

## Phần 2 — Thread và coroutine không phải một thứ

Đây là chỗ nhiều người mới hiểu lệch ngay từ ngày đầu, và lệch ở đây thì mọi thứ sau đó lệch theo.
Nói thật gọn:

- **Thread** là **chỗ chạy** — một tài nguyên do hệ điều hành/runtime cấp. Có thread thì code mới
  chạy được.
- **Coroutine** là **công việc** — một thứ được xếp cho chạy *nhờ* thread.

Một thread có thể lần lượt chạy từng mảnh của **rất nhiều** coroutine. Và một coroutine có thể tạm
dừng ở thread này rồi tiếp tục ở thread khác — nó **không bị gắn cứng** vào một thread nào.

| Câu hỏi | Thread | Coroutine |
|---|---|---|
| Nó là gì? | Chỗ chạy do hệ thống cấp | Công việc được xếp để chạy nhờ thread |
| Khi phải "chờ" thì sao? | Thread bị chiếm — không làm được việc khác | Tạm dừng, **nhả thread ra**, rồi tiếp tục sau |
| Có gắn cứng chỗ chạy không? | Nó *chính là* chỗ chạy | Không — dừng ở thread này, tiếp ở thread khác được |
| Bao nhiêu thì gọi là nhiều? | Vài nghìn đã là nhiều (mỗi thread cần vài MB bộ nhớ riêng) | Hàng chục nghìn vẫn bình thường |

Hàng cuối là hệ quả trực tiếp của hàng trên: một coroutine đang tạm dừng gần như chỉ là *một mẩu dữ
liệu ghi lại "tôi đang dở ở đâu"*, nó không giữ chỗ chạy nào; còn một thread đang chờ vẫn là một
thread đầy đủ với vùng nhớ riêng của nó.

> **Tự kiểm tra 1.** App tạo 10.000 coroutine, cả 10.000 đều đang chờ mạng trả lời. Câu nào đúng?
>
> 1. App đang giữ 10.000 thread. 2. Số thread thực tế nhỏ hơn rất nhiều số coroutine.
> 3. Mỗi coroutine phải chạy trọn vẹn trên đúng một thread từ đầu đến cuối.
> 4. Một thread có thể lần lượt chạy nhiều coroutine khác nhau.
>
> *(Đáp án: 2 và 4. Dòng 1 lẫn coroutine với thread — coroutine đang tạm dừng không giữ thread. Dòng
> 3 sai: coroutine có thể dừng ở thread này và tiếp tục ở thread khác.)*

Cách gọi cần tránh, ngay từ bây giờ: **đừng đọc "coroutine" thành "thread nhẹ"** hay "mini-thread".
Cách gọi đó nghe tiện nhưng dẫn tới đúng câu hỏi sai — "vậy coroutine của tôi chạy trên thread nào,
và nó có phải là thread nền không?" Câu hỏi đúng, như bạn sẽ thấy ở Phần 6 và Phần 7, là **"ai làm
chủ công việc này"** và **"việc này được xếp chạy ở đâu"** — hai câu hỏi tách biệt, và cả hai đều
*không* trả lời được bằng từ "coroutine".

Cơ chế bên dưới việc xếp lịch (scheduler làm gì, một coroutine được lưu và khôi phục ra sao) **không
thuộc bài này** — bạn không cần nó để đọc code đúng.

---

## Phần 3 — `suspend`: được phép tạm dừng

### Vấn đề trước cú pháp

Nếu một công việc có thể tạm dừng giữa đường, thì phải có cách **đánh dấu** chỗ nào được phép dừng —
nếu không, không ai biết đoạn code nào cần chuẩn bị cho việc "dừng rồi tiếp". Kotlin đánh dấu bằng
đúng một từ khoá đặt trước `fun`:

```kotlin
suspend fun loadProfile(): Profile
```

Đây là *chữ ký* hàm (phần thân bỏ đi vì chưa cần). Đọc đúng nghĩa của từ khoá: **"hàm này *được phép*
tạm dừng ở các điểm tạm dừng bên trong nó, rồi tiếp tục sau."** Hết. Đó là toàn bộ ý nghĩa của nó.

> **Ghi chú quan trọng — `suspend` KHÔNG có nghĩa "chạy ở thread nền"**
>
> Đây là điểm chính xác quan trọng nhất của cả bài, nên nói thẳng cả hai chiều:
>
> - `suspend` **không** tự chuyển hàm sang thread khác. Một hàm `suspend` chạy trong **ngữ cảnh của
>   coroutine đã gọi nó** — trừ khi bên trong nó (hoặc một thư viện nó dùng) chủ động đổi chỗ chạy.
> - `suspend` **không** có nghĩa "hàm này chậm". Một hàm `suspend` có thể trả về ngay lập tức. Từ
>   khoá này nói về *khả năng tạm dừng*, không nói về thời gian.
>
> Cách nhớ theo *trách nhiệm* — đây là cách nhìn bạn sẽ dùng lại suốt khoá:
> **`suspend` nghĩa là "người gọi quyết định việc này chạy ở đâu"**; nếu chính hàm đó muốn tự quyết
> định chỗ chạy, nó phải nói ra bằng `withContext(...)` (Phần 8).

### Ví dụ nhỏ nhất: `delay`

```kotlin
suspend fun waitThenGreet() {
    delay(1000)
    println("Xin chào")
}
```

`delay(1000)` chờ 1000 milisecond (1 giây). Nó là hàm `suspend`, và nó làm **đúng** việc mà Phần 1
gọi là "tạm dừng": coroutine dừng lại tại dòng đó, **nhả thread ra**, và một giây sau nó được tiếp
tục ở dòng `println`.

Đối chiếu với hàm chờ kiểu cũ của Java, `Thread.sleep(1000)`:

| Câu hỏi | `delay(1000)` | `Thread.sleep(1000)` |
|---|---|---|
| Ai dừng lại? | **Coroutine** dừng | **Thread** bị chặn |
| Thread trong lúc đó | Rảnh — chạy được việc khác | Bị chiếm, không làm gì cả |
| Gọi ở đâu được? | Trong coroutine / hàm `suspend` | Ở đâu cũng gọi được — kể cả chỗ không nên |

Vì cả hai đều "làm cho code dừng 1 giây", rất dễ tưởng chúng thay thế được cho nhau. Chúng không.
Đặt `Thread.sleep` vào trong một coroutine đang chạy trên main thread là **chặn đúng cái thread vẽ
giao diện** — bạn vừa tạo ra hiện tượng treo mà cả bài này đang tìm cách tránh.

> **Tự kiểm tra 2.** `suspend fun loadImage()` — câu nào đúng?
>
> 1. Hàm này chắc chắn chạy ở thread nền. 2. Hàm này được phép tạm dừng rồi tiếp tục.
> 3. Hàm này chắc chắn chậm. 4. Nếu không có gì đổi chỗ chạy, hàm này chạy trong ngữ cảnh của
> coroutine đã gọi nó.
>
> *(Đáp án: 2 và 4. Dòng 1 là hiểu lầm phổ biến nhất về `suspend`; dòng 3 nhầm "được phép dừng" với
> "mất nhiều thời gian".)*

---

## Phần 4 — Gọi một hàm `suspend` từ đâu

Quy tắc ngôn ngữ rất gọn: **một hàm `suspend` chỉ gọi được từ một chỗ đã có khả năng tạm dừng.** Trên
thực tế có đúng hai chỗ như vậy:

1. **Từ một hàm `suspend` khác.**
2. **Từ thân một coroutine** — khối `{ }` bạn đưa cho một hàm khởi động coroutine cũng là một khối
   "được phép tạm dừng".

```kotlin
suspend fun loadScreen() {
    val profile = loadProfile()   // gọi được: đang ở trong một hàm suspend
}

fun onButtonClick() {
    loadProfile()   // KHÔNG compile: đây là hàm thường, không có khả năng tạm dừng
}
```

Hệ quả thực dụng: `suspend` **lan lên trên** theo chuỗi lời gọi. A gọi B mà B là `suspend` thì A cũng
phải `suspend`… cứ thế cho tới khi có ai đó **mở một coroutine** để chặn chuỗi lại. Người chặn chuỗi
đó là hàm khởi động coroutine — và trong khoá này bạn chỉ cần biết **một** hàm như vậy: `launch`.

---

## Phần 5 — `launch`: khởi động một coroutine

```kotlin
scope.launch {
    loadProfile()
    showProfile()
}
```

Đọc: **`launch` khởi động một coroutine mới trong `scope`, và chạy khối `{ }` như công việc của
coroutine đó.** Khối đó là *lambda đuôi* (F1) — tham số cuối của `launch` là một khối code, nên nó
được mời ra ngoài cặp ngoặc tròn.

Vì khối đó là thân của một coroutine, hai lời gọi bên trong **chạy lần lượt**: `loadProfile()` có thể
tạm dừng, và chỉ khi nó xong thì `showProfile()` mới chạy. Đây là điều làm code bất đồng bộ đọc
được như code tuần tự: bạn viết theo thứ tự, và nó chạy theo thứ tự.

Ba câu hỏi cần đặt mỗi lần thấy `launch` — và cả bài còn lại là để trả lời chúng:

1. **Việc gì được khởi động?** → khối `{ }`.
2. **Ai làm chủ việc đó?** → `scope` (Phần 6).
3. **Việc đó chạy ở đâu?** → dispatcher (Phần 7).

`launch` trả về một `Job` — một "tay cầm" của công việc vừa khởi động. Ở bài này chỉ cần **nhận
diện** cái tên đó khi gặp; các việc làm được với nó (đợi, huỷ, ghép cha–con) thuộc **W1**.

Cũng thuộc W1, cố tình không nhắc ở đây: `async`/`await` và `Deferred` (cách lấy *kết quả* từ nhiều
việc chạy song song). Bạn chưa cần chúng để đọc code của các bài tiếp theo.

---

## Phần 6 — Scope: ai làm chủ công việc này?

### Vấn đề trước cú pháp

Người dùng mở màn hình chi tiết một tin nhắn, app bắt đầu tải dữ liệu. Người dùng bấm Back sau nửa
giây. Câu hỏi: **việc tải đó còn nên chạy nữa không?**

Câu trả lời gần như luôn là "không" — nhưng ai *biết* điều đó? Bản thân coroutine không biết màn hình
đã đóng. Phải có ai đó đứng ra nói "công việc này thuộc về tôi, và khi tôi biến mất thì nó cũng nên
biến mất". Chỗ đứng ra đó gọi là **scope**.

> **Ghi chú quan trọng — scope là chủ sở hữu, không phải chỗ chạy**
>
> **Một scope là ranh giới sở hữu/vòng đời của các coroutine được khởi động trong nó.** Nó trả lời
> đúng một câu hỏi:
>
> > *"Khi người chủ này không còn nữa, công việc kia còn nên tồn tại không?"*
>
> Đừng lẫn scope với dispatcher. **Scope = ai làm chủ (khi nào dừng)**; **dispatcher = chạy ở đâu**
> (Phần 7). Một scope *có mang theo* một dispatcher mặc định, nhưng đó là hai câu hỏi khác nhau và
> lẫn chúng là nguồn của rất nhiều nhầm lẫn.

Vì `launch` là một hàm *của* scope (`scope.launch { }`), bạn **không thể** khởi động một coroutine mà
không trả lời câu hỏi "ai làm chủ". Đây là thiết kế có chủ ý của Kotlin, không phải thủ tục rườm rà.

### Ba scope bạn sẽ gặp trong khoá này

**`viewModelScope`** — bạn sẽ gặp nhiều nhất, từ bài S4 trở đi.

```kotlin
viewModelScope.launch {
    // công việc thuộc về ViewModel này
}
```

Coroutine khởi động ở đây **thuộc vòng đời của ViewModel**: khi ViewModel bị dọn đi, mọi coroutine
trong scope đó **tự động bị huỷ**. Bạn không phải viết một dòng dọn dẹp nào. (ViewModel là gì và vì
sao nó tồn tại: bài **S4**. Ở đây chỉ cần biết nó là một người chủ có vòng đời dài hơn một lần vẽ
màn hình.)

Một điểm chính xác nhỏ, để chặn trước một hiểu lầm rất phổ biến: **`viewModelScope` không có nghĩa là
"thread nền"**. Trên Android, coroutine khởi động trong `viewModelScope` mặc định bắt đầu chạy trên
**main thread**. Nghe ngược, nhưng không hề mâu thuẫn: chạy *bắt đầu* trên main thread là chuyện tốt
(bạn cập nhật state giao diện ở đó được), và nếu bên trong có hàm `suspend` nào tạm dừng để chờ, thì
main thread **được nhả ra** trong lúc chờ chứ không bị chặn. Cái làm treo giao diện không phải chữ
`launch`, mà là **một việc chặn thread hoặc tính toán nặng đặt sai chỗ** (Phần 7–9).

**`rememberCoroutineScope()`** — mức nhận diện.

Bạn sẽ thấy nó trong code Compose khi một *sự kiện* (bấm nút, cuộn danh sách) cần khởi động việc gì
đó. Nó trả về một scope **gắn với vị trí đó trong composition**, và scope này bị huỷ khi vị trí đó rời
composition. Nhận ra được là đủ; cách dùng thật thuộc các bài Compose/state phía sau.

**`LaunchedEffect(key) { }`** — bạn đã gặp ở **C4**.

Ở C4, bạn học đúng bốn điều về *thời điểm* nó chạy, và bốn điều đó **vẫn nguyên**. Điều C4 chưa nói
được là: khối `{ }` đó là **thân một coroutine**, và **Compose là người chủ** — Compose khởi động
coroutine khi effect vào composition, huỷ khi rời composition, huỷ-rồi-khởi-động-lại khi key đổi.
Phần 13 quay lại đúng đoạn code này.

### Vì sao không nên có "việc không chủ"

Kotlin *có* cách khởi động coroutine không gắn với vòng đời nào (`GlobalScope`), và bạn sẽ thấy nó
trong các câu trả lời trên mạng. Điều cần nhớ ở bài này chỉ một câu: **việc gì cũng nên có một người
chủ có nghĩa.** Một coroutine không chủ sẽ chạy tiếp sau khi màn hình đóng, tiếp tục ghi vào state
không còn ai đọc, và không ai huỷ nó hộ bạn. Trong khoá này bạn luôn có sẵn một người chủ đúng
(`viewModelScope`, scope của Compose) — hãy dùng nó.

> **Tự kiểm tra 3.** `viewModelScope.launch { loadMessages() }` — ai quyết định khi nào công việc này
> dừng, và trên cơ sở nào?
>
> *(Đáp án: `viewModelScope` — tức là ViewModel đang sở hữu nó. Khi ViewModel bị dọn đi, coroutine
> trong scope đó bị huỷ tự động. Câu hỏi "chạy ở thread nào" là một câu khác, do dispatcher trả lời.)*

---

## Phần 7 — Dispatcher: việc này được xếp chạy ở đâu?

Nếu scope trả lời *"ai làm chủ"*, thì **dispatcher** trả lời *"việc này được xếp chạy trên thread /
nhóm thread nào"*.

Bạn không tự tạo thread và tự quản lý chúng. Bạn nói "việc này thuộc loại nào", và dispatcher lo phần
còn lại. Ở mức nhận diện, có ba cái tên cần biết:

| Dispatcher | Dành cho loại việc | Ví dụ |
|---|---|---|
| `Dispatchers.Main` | Việc của **giao diện** | Cập nhật state mà giao diện đang đọc, đọc/ghi UI |
| `Dispatchers.IO` | Việc **chặn thread để chờ** vào/ra | Đọc-ghi file bằng API chặn, gọi một SDK cũ kiểu chặn |
| `Dispatchers.Default` | Việc **tính toán tốn CPU** | Sắp xếp danh sách rất lớn, xử lý ảnh, parse khối dữ liệu khổng lồ |

Sự phân biệt `IO` ↔ `Default` không phải chuyện thẩm mỹ. `Default` được thiết kế cho việc *tính* —
số thread của nó ít, đủ để các core làm việc thật. Nếu bạn đặt việc *nằm chờ* vào đó, thread bị chiếm
trong lúc không làm gì cả, và các việc tính toán thật phải xếp hàng sau. `IO` ngược lại được phép mở
nhiều thread hơn, vì nó biết phần lớn thời gian các thread đó chỉ đang chờ.

**Đừng chọn dispatcher theo *cái tên* của việc — hãy chọn theo *bản chất* của việc.** Cụ thể: "gọi
mạng" không tự động nghĩa là `withContext(Dispatchers.IO)`. Câu hỏi đúng là *"đoạn code này có thật sự
chặn thread hay không?"* Rất nhiều thư viện hiện đại cung cấp hàm `suspend` đã tự lo phần chuyển chỗ
chạy bên trong — ví dụ Retrofit khi bạn khai `suspend fun` sẽ tự đưa việc gửi request sang nhóm thread
riêng của nó (bạn sẽ học ở bài **W2**). Với những hàm như vậy, bọc thêm `Dispatchers.IO` không giúp gì
và chỉ làm code khó đọc hơn. Tương tự, đừng đọc `suspend` thành "tự động IO" — hai chuyện đó không
liên quan (Phần 3).

Cơ chế bên dưới (dispatcher cài đặt thế nào, `CoroutineContext` gồm những gì, dấu `+` khi ghép
context, `SupervisorJob`) **không thuộc bài này** — chúng thuộc **W1**.

> **Tự kiểm tra 4.** Chọn dispatcher cho ba việc: (a) sắp xếp một danh sách 200.000 phần tử; (b) đọc
> một file bằng một hàm chặn thread; (c) gán giá trị mới cho state mà giao diện đang đọc.
>
> *(Đáp án: (a) `Default` — tính toán tốn CPU. (b) `IO` — việc chặn thread để chờ vào/ra. (c) `Main`
> — việc của giao diện.)*

---

## Phần 8 — `withContext`: đổi chỗ chạy, vẫn một mạch công việc

### Vấn đề trước cú pháp

Bạn có một việc **thật sự chặn thread**: đọc một file bằng một hàm kiểu cũ, không phải hàm `suspend`.
Bạn không muốn nó chặn main thread. Nhưng bạn cũng không muốn tách nó ra thành một công việc riêng
rồi mất dấu kết quả — bạn *cần* giá trị đọc được, ngay tại chỗ đang viết.

```kotlin
suspend fun readLegacyFile(): String =
    withContext(Dispatchers.IO) {
        blockingFileRead()
    }
```

Ở đây `blockingFileRead()` là một hàm **chặn thread** (một API cũ, không phải `suspend`) — chính vì
vậy ví dụ này mới cần `withContext`.

Đọc đúng ba điều:

1. **Coroutine của bạn vẫn là một mạch liên tục.** `withContext` không "mở một việc khác rồi bỏ rơi
   việc cũ": nó **tạm chuyển chỗ chạy** cho khối `{ }`, và công việc của bạn tiếp tục từ đó.
2. **Khối `{ }` được xếp chạy bằng dispatcher bạn truyền vào** — ở đây là `IO`.
3. **Khi khối xong, việc chạy tiếp trở về ngữ cảnh của người gọi.** Nếu người gọi đang ở main thread
   thì dòng sau `withContext` lại ở main thread. Bạn không phải tự "quay về".

Thêm một chi tiết đọc code, vì nó xuất hiện ngay ở ví dụ trên: `withContext(...)` **trả về giá trị**
— cụ thể là giá trị của dòng cuối trong khối `{ }`, đúng cơ chế bạn đã dùng với `map`/`filter` ở F1.
Nhờ vậy `readLegacyFile` viết được bằng expression body (`=`) và trả thẳng `String` ra ngoài.

Và đây là chỗ trả nợ Phần 3, bằng đúng một cặp câu:

- `suspend` (một mình) = **"người gọi quyết định việc này chạy ở đâu"**.
- `suspend` + `withContext(...)` bên trong = **"tôi tự bảo đảm phần này chạy ở đúng chỗ nó cần"**.

Cách viết chuẩn hiện nay cho một hàm cần đổi chỗ chạy là cách thứ hai: **hàm `suspend` dùng
`withContext`**, chứ không phải hàm `suspend` tự khởi động thêm một coroutine mới. Trộn hai cách —
vừa khai `suspend` vừa `launch` bên trong — là hai cách nghĩ đánh nhau: người gọi tưởng mình đang chờ
được kết quả, trong khi hàm đã trả về ngay sau khi phóng việc đi. Bạn sẽ gặp đúng lỗi này trong code
mẫu của khoá ở giai đoạn sau, và nó sẽ được chỉ ra tại đó.

Cách `withContext` kế thừa và ghi đè những thành phần nào của ngữ cảnh coroutine: **W1**.

---

## Phần 9 — Main-safety: một quy tắc quyết định

Bạn đã có đủ mảnh để có một quy tắc dùng được ngay, thay vì cảm giác "cứ IO cho chắc".

> **Quy tắc — trước khi chuyển việc sang `IO`/`Default`, hỏi đúng hai câu**
>
> 1. **Việc này có thật sự chặn thread, hoặc có thật sự tính toán nặng không?**
>    Nếu *không* → không cần chuyển gì cả.
> 2. **Thư viện tôi đang gọi đã tự lo phần đó chưa?**
>    Nếu hàm của nó là `suspend` và tài liệu nói nó gọi được từ main thread → **đừng bọc thêm `IO`**.
>
> Và mặt còn lại của quy tắc, dành cho code *bạn* viết: nếu lớp của bạn làm một việc chặn thread bên
> trong một hàm `suspend`, thì **chính lớp đó** có trách nhiệm chuyển việc đi bằng `withContext`, để
> người gọi không phải biết và không phải nhớ. Một hàm `suspend` nên **gọi được an toàn từ main
> thread**.

Vì sao phải nói ra thành quy tắc? Vì `withContext(Dispatchers.IO)` là đoạn code bị sao chép nhiều
nhất trong lịch sử Android — dán khắp nơi, kể cả quanh những hàm đã main-safe, chỉ vì nhìn "có vẻ
chậm". Nó không làm app sai, nhưng nó làm hai việc tệ: che mất chỗ **thật sự** cần chú ý, và tạo thói
quen chọn dispatcher theo cảm giác thay vì theo bản chất công việc.

> **Tự kiểm tra 5.** Vì sao `delay(1000)` chờ được mà không "chặn" như `Thread.sleep(1000)`?
>
> *(Đáp án: `delay` tạm dừng **coroutine** và nhả thread ra — thread rảnh để chạy việc khác trong 1
> giây đó. `Thread.sleep` chặn **thread**: thread bị chiếm và không làm gì cả. Cùng là "chờ 1 giây",
> khác nhau ở chỗ ai bị giữ lại.)*

---

## Phần 10 — Flow: dữ liệu đến theo thời gian

### Vấn đề trước cú pháp

Một biến thường giữ **một giá trị tại một thời điểm**:

```kotlin
val username: String = "duc"
```

Hàm `suspend` cũng vậy — nó chạy, có thể tạm dừng, rồi trả về **đúng một** giá trị và kết thúc. Nhưng
rất nhiều dữ liệu trong app không có hình dạng đó. Tin nhắn mới đến *dần dần*. Danh sách đã lưu của
người dùng *đổi* mỗi lần họ lưu thêm một mục. Trạng thái màn hình *chuyển* từ đang tải sang có dữ liệu.

Với những thứ như vậy, câu hỏi không phải "giá trị là gì" mà là **"giá trị nào, vào lúc nào"**. Kotlin
có một kiểu riêng cho hình dạng đó:

```kotlin
Flow<Message>
```

Đọc bằng đúng kỹ năng generic của F2 — *Hộp&lt;Loại-bên-trong&gt;*: "một Flow mà các giá trị chảy qua
nó là `Message`".

Mô hình tư duy: **Flow = một dòng giá trị đến lần lượt theo thời gian.** Hình ảnh "băng chuyền chuyển
từng giá trị tới cho bạn" dùng được — nhưng phải kèm ba giới hạn, nếu không nó sẽ dạy bạn điều sai:

- **Flow không phải một danh sách.** Bạn không "lấy phần tử thứ 3" của một Flow. Bạn *nhận* giá trị
  khi nó đến.
- **Băng chuyền không nói gì về việc *khi nào nó bắt đầu chạy*.** Nhiều Flow chỉ bắt đầu làm việc khi
  có người đứng nhận. Câu chuyện đầy đủ về chuyện này thuộc **W1**.
- **Băng chuyền cũng không nói gì về việc có bao nhiêu người nhận** và họ có nhận cùng thứ hay không.
  Cũng là **W1**.

Tương phản một câu để nhớ: **hàm `suspend` = một giá trị rồi xong; `Flow` = nhiều giá trị theo thời
gian.**

### `collect` — đứng nhận dòng giá trị đó

```kotlin
messages.collect { message ->
    println(message)
}
```

`collect` nhận một lambda (F1) và **gọi lambda đó cho mỗi giá trị** mà Flow phát ra. Ở đây `message`
là tên bạn đặt cho giá trị vừa đến.

Một điều quan trọng nối lại Phần 4: **`collect` là một hàm `suspend`** — nên nó chỉ chạy được trong
một coroutine. Đó là lý do trong code thật bạn luôn thấy `collect` nằm bên trong `launch { }` hoặc
`LaunchedEffect { }`, không bao giờ đứng trơ trong một hàm thường.

Kèm một hệ quả nhỏ nhưng gây bug thật, nói gọn ở mức nhận biết: với một dòng trạng thái (Phần 11),
`collect` **chờ mãi** — nó không "chạy xong". Nghĩa là dòng code viết *sau* `collect` trong **cùng
một** coroutine sẽ không bao giờ chạy tới. Cần lắng nghe hai dòng thì mở hai coroutine, đừng nối
tiếp hai `collect`. Cơ chế đầy đủ: **W1**.

**Cố tình không dạy ở đây:** toàn bộ họ toán tử của Flow (`map`, `filter` trên Flow, `combine`,
`flatMapLatest`, `debounce`, `catch`, `retry`…), và cả phân biệt cold/hot. Ở bài này bạn chỉ cần
*đọc* được một Flow và một `collect`. Họ toán tử là nội dung **W1**.

---

## Phần 11 — StateFlow: trạng thái hiện tại + các cập nhật sau đó

### Vấn đề trước cú pháp

Một Flow thường mô tả *dữ liệu đến theo thời gian*. Nhưng giao diện cần thêm một thứ nữa: **giá trị
hiện tại, ngay lúc này**. Một màn hình vừa được vẽ ra phải biết hiển thị gì *bây giờ*, không thể đứng
chờ giá trị tiếp theo mới có gì để vẽ.

Đó chính là khoảng trống mà `StateFlow` lấp:

```kotlin
StateFlow<UiState>
```

So sánh gọn đúng một dòng mỗi bên:

- `Flow` = **các giá trị theo thời gian**.
- `StateFlow` = **trạng thái hiện tại + các cập nhật theo thời gian**.

Ba điều `StateFlow` thêm vào, ở mức bạn cần:

1. **Luôn có một giá trị hiện tại.** Không có chuyện "chưa có gì cả" — vì vậy khi tạo ra một
   `StateFlow` bắt buộc phải cho nó một giá trị khởi đầu.
2. **Ai vừa bắt đầu lắng nghe cũng nhận ngay giá trị hiện tại**, không phải chờ lần cập nhật kế tiếp.
3. **Cập nhật được gộp lại (conflation).** Gán lại đúng giá trị đang có thì không có thông báo nào
   được phát đi — hợp lý, vì "trạng thái không đổi" thì không có gì để cập nhật.

Và đúng một điều `StateFlow` **không** làm, vì đây là câu folklore hay gặp nhất: **`StateFlow` không
tự "biết vòng đời" của màn hình.** Nó không tự dừng khi màn hình bị ẩn. Việc lắng nghe *theo vòng đời*
là một công cụ **riêng**, và đó là nội dung của bài **S4**.

### Chỗ này trả nợ F2

Nhìn lại `StateFlow<UiState>` và điểm danh: `UiState` chính là **sealed state** bạn đã học ở F2 — một
họ trạng thái khép kín (đang tải · có dữ liệu · lỗi), mỗi biến thể mang đúng dữ liệu của nó. Cặp
`StateFlow<UiState>` vì thế đọc được trọn nghĩa: *"một dòng trạng thái, luôn có đúng một trạng thái
hiện tại, và trạng thái đó là một trong các biến thể đã khai báo."*

Hai kỹ năng F2 (đọc generic, mô hình sealed state) gặp nhau đúng ở đây — đó là toàn bộ lý do F2 dạy
chúng.

**Cố tình không dạy ở đây:** `MutableStateFlow` và cặp private/public của nó, `update { }`, `stateIn`,
`SharingStarted`, `SharedFlow`, replay, và cơ chế bên trong. Riêng `stateIn` bạn sẽ nghe tên ở S4 —
đó là **công cụ để biến một Flow thường thành StateFlow**, và **S4** là nơi học nó.

> **Tự kiểm tra 6.** `StateFlow` thêm ý gì so với một `Flow` thường?
>
> *(Đáp án: có **trạng thái hiện tại** — luôn tồn tại một giá trị đọc được ngay, và người mới lắng
> nghe nhận được nó lập tức. Một `Flow` thường chỉ mô tả "giá trị sẽ đến", không hứa có giá trị nào
> sẵn.)*

---

## Phần 12 — Đọc trước một ViewModel (chưa học ViewModel)

Đây là chỗ trả công cho toàn bộ bài. Đoạn dưới đây là **lược đồ để đọc, không phải file compile
được** — hai dòng ghi chú là phần bài **S4** dạy.

```kotlin
class ChatViewModel : ViewModel() {

    // "trạng thái hiện tại + các cập nhật sau đó" — cách dựng: bài S4
    val uiState: StateFlow<UiState>

    fun refresh() {
        viewModelScope.launch {
            val messages = loadMessages()   // một hàm suspend
            // gán trạng thái mới — cách làm: bài S4
        }
    }
}
```

Một gloss cú pháp duy nhất, vì nó xuất hiện lần đầu ở dạng này: `class ChatViewModel : ViewModel()` —
dấu `:` ở đây nghĩa là *"class này **là một** ViewModel"*, cùng khuôn hình `class MainActivity :
ComponentActivity()` bạn đã gặp ở Chương 3. ViewModel *là gì* và vì sao cần nó: bài **S4**.

Câu hỏi duy nhất của phần này: **bài S1 đã giải thích được những gì trong đoạn trên?**

| Mảnh code | S1 đã giải thích được |
|---|---|
| `StateFlow<UiState>` | Một dòng **trạng thái**: luôn có trạng thái hiện tại, cộng các cập nhật sau đó. `UiState` là sealed state của F2. |
| `viewModelScope` | **Người chủ** của công việc: coroutine trong đó bị huỷ tự động khi ViewModel bị dọn đi. |
| `.launch { }` | **Khởi động một coroutine** trong scope đó; khối `{ }` là công việc của nó (lambda đuôi — F1). |
| `loadMessages()` là `suspend` | Lời gọi này **được phép tạm dừng** để chờ, và trong lúc chờ nó **không chặn** thread. |
| Không thấy `withContext` ở đâu | Đúng — và đó *không* phải thiếu sót. Chỉ cần `withContext` khi có việc thật sự chặn thread hoặc tính toán nặng (Phần 9). |

Còn lại — ViewModel là gì, `uiState` được dựng ra sao, ai lắng nghe nó, cập nhật state thế nào — là
việc của **S4**. Nhưng bạn không còn phải đọc đoạn code trên như đọc phép thuật, và đó chính là mục
tiêu của bài này.

---

## Phần 13 — Quay lại `LaunchedEffect` từ C4

Ở **C4** bạn đã gặp đoạn này:

```kotlin
LaunchedEffect(messageId) {
    loadMessage(messageId)
}
```

Lúc đó, điều duy nhất cần biết là *thời điểm*: khối việc chạy khi effect vào composition · không chạy
lại vì những lần vẽ lại thông thường · có thể chạy lại nếu rời rồi vào lại composition · bị huỷ và
khởi động lại nếu **key** đổi. Bốn điều đó **vẫn đúng nguyên** — bài này không sửa gì.

Điều bài này **thêm** vào là phần cơ chế mà C4 cố tình để dành:

- Khối `{ }` đó là **thân một coroutine**.
- **Compose là người chủ** của coroutine đó — nó khởi động, và nó huỷ (khi rời composition, hoặc khi
  key đổi). Đây chính là ý "scope" của Phần 6, chỉ khác người chủ.
- Vì là thân coroutine, bên trong **gọi được hàm `suspend`** — chính vì vậy `loadMessage(messageId)`
  đặt được ở đó mà không cần thêm gì.
- Và vì Compose huỷ nó khi key đổi, chuyển sang tin nhắn khác thì việc tải tin cũ **được dừng lại**,
  không chạy tiếp vô ích.

Ba người chủ, cùng một ý tưởng — đây là bảng đáng nhớ nhất của bài:

| Bạn viết | Người chủ | Việc bị huỷ khi |
|---|---|---|
| `viewModelScope.launch { }` | ViewModel | ViewModel bị dọn đi |
| `LaunchedEffect(key) { }` | Compose | Effect rời composition, hoặc key đổi |
| `rememberCoroutineScope()` *(nhận diện)* | Vị trí đó trong composition | Vị trí đó rời composition |

Nội dung đầy đủ về các effect của Compose (`DisposableEffect`, `SideEffect`, và `LaunchedEffect` ở mức
sâu) **không** thuộc bài này — chúng có nơi dạy riêng ở giai đoạn sau. Ở đây chỉ là củng cố.

---

## Cạm bẫy

**1. Đọc `suspend` thành "chạy ở thread nền".** Đây là hiểu lầm số một, và nó sinh ra mọi hiểu lầm
còn lại. `suspend` chỉ nói *"hàm này được phép tạm dừng rồi tiếp tục"*. Nó không chuyển thread, không
tạo thread, không hứa gì về tốc độ. Muốn đổi chỗ chạy thì phải viết ra — bằng `withContext(...)`.

**2. Đọc "coroutine" thành "thread".** Thread là *chỗ chạy*; coroutine là *công việc chạy nhờ thread*.
Một thread chạy được nhiều coroutine; một coroutine dừng ở thread này rồi tiếp ở thread khác được.
Hệ quả của việc lẫn hai thứ: bạn sẽ đi tìm câu trả lời "coroutine của tôi là thread nào" thay vì hai
câu hỏi đúng — *ai làm chủ nó* và *nó được xếp chạy ở đâu*.

**3. Bọc `withContext(Dispatchers.IO)` quanh mọi lời gọi trông có vẻ chậm.** "Trông chậm" không phải
tiêu chí. Tiêu chí là: *việc này có thật sự chặn thread / tính toán nặng không*, và *thư viện đã tự lo
chưa*. Bọc thêm `IO` quanh một hàm `suspend` đã main-safe không giúp gì, mà còn che mất những chỗ
thật sự cần nhìn.

**4. Dùng `Thread.sleep` trong coroutine như thể nó là `delay`.** `delay` tạm dừng **coroutine** và
nhả thread; `Thread.sleep` chặn **thread**. Trong một coroutine đang ở main thread, `Thread.sleep`
chặn đúng thread vẽ giao diện. Hai hàm cùng "chờ 1 giây" nhưng khác nhau ở chỗ căn bản nhất.

**5. Khởi động việc mà không nghĩ ai làm chủ.** Một coroutine không có người chủ có nghĩa sẽ chạy
tiếp sau khi màn hình đã đóng, ghi vào state không còn ai đọc, và không ai huỷ nó hộ bạn. Trước khi
viết `launch`, luôn trả lời được: *"khi ai biến mất thì việc này nên biến mất?"*

**6. Tin rằng `StateFlow` tự "biết vòng đời".** Nó không. `StateFlow` cho bạn *trạng thái hiện tại +
cập nhật*; việc **lắng nghe theo vòng đời** của màn hình là một công cụ riêng, học ở bài **S4**. Câu
"StateFlow là Flow có sẵn lifecycle awareness" là cách nói gọn gây nhầm — đừng mang nó theo.

---

## Tóm tắt

Năm điều cần giữ lại — nếu chỉ nhớ được năm dòng, hãy là năm dòng này:

1. **Coroutine là công việc có thể tạm dừng rồi tiếp tục — nó không phải thread.** Khi nó tạm dừng,
   thread được nhả ra để chạy việc khác.
2. **`suspend` cho *phép* tạm dừng; nó không chọn thread.** Không có `withContext`, hàm `suspend`
   chạy trong ngữ cảnh của người gọi.
3. **Mỗi coroutine thuộc về một scope — một người chủ có vòng đời.** `viewModelScope` (ViewModel làm
   chủ), `LaunchedEffect` (Compose làm chủ). Người chủ biến mất thì việc bị huỷ.
4. **Dispatcher quyết định việc được xếp chạy ở đâu — chỉ đổi khi cần.** `Main` cho giao diện, `IO`
   cho việc chặn thread, `Default` cho tính toán nặng. Chọn theo *bản chất công việc*, không theo tên
   việc.
5. **`Flow` = giá trị theo thời gian; `StateFlow` = trạng thái hiện tại + cập nhật.** `collect` là
   hàm `suspend`, nên nó luôn nằm trong một coroutine.

Ba dòng phụ, dùng khi đọc code:

6. `withContext(...)` **đổi chỗ chạy cho một khối rồi trả kết quả về đúng nơi gọi** — công việc của
   bạn vẫn là một mạch liên tục, không bị bỏ rơi.
7. Hàm `suspend` nên **gọi được an toàn từ main thread**; lớp nào làm việc chặn thì lớp đó tự chuyển
   việc đi, không đẩy trách nhiệm cho người gọi.
8. `delay` nhả thread, `Thread.sleep` chặn thread — luôn chọn `delay` trong coroutine.

---

## Luyện tập — chú thích một đoạn code

Đoạn dưới đây là **lược đồ để đọc**, không phải file compile được. Nhiệm vụ: chỉ ra **mọi** khái niệm
coroutine/Flow trong đó và nói bạn biết gì về từng cái. Bạn **không** cần biết ViewModel, repository
hay bất cứ thứ gì của các bài sau. Lời giải nằm ngay dưới.

```kotlin
class ProfileViewModel : ViewModel() {

    val uiState: StateFlow<UiState>                 // ①

    fun load(userId: Int) {
        viewModelScope.launch {                     // ②
            val profile = loadProfile(userId)       // ③ hàm suspend
            val theme = readThemeFromDisk()         // ④ hàm suspend
            // ⑤ gán trạng thái mới — cách làm: bài S4
        }
    }
}

suspend fun readThemeFromDisk(): String =           // ⑥
    withContext(Dispatchers.IO) {                   // ⑦
        blockingReadFile("theme.txt")               // ⑧ hàm chặn thread
    }
```

<details>
<summary>Xem lời giải</summary>

- **①** `StateFlow<UiState>` — một dòng **trạng thái**: luôn có một trạng thái hiện tại, cộng các cập
  nhật sau đó. `UiState` là **sealed state** của F2; dấu ngoặc nhọn là generic recognition của F2.
  Cách *dựng* giá trị này là việc của S4.
- **②** `viewModelScope.launch { }` — khởi động **một coroutine**; **người chủ** là ViewModel, nên
  công việc bị huỷ tự động khi ViewModel bị dọn đi. Khối `{ }` là **lambda đuôi** (F1). Coroutine này
  bắt đầu chạy trên main thread — và đó không phải vấn đề, xem ⑦.
- **③ ④** Hai lời gọi `suspend`, **chạy lần lượt**: mỗi lời gọi có thể tạm dừng để chờ, và trong lúc
  chờ **thread được nhả ra**. Vì cả hai nằm trong cùng một coroutine, ④ chỉ chạy khi ③ đã xong.
- **⑤** Không thuộc S1 — đây là chỗ S4 dạy.
- **⑥** Hàm `suspend` có expression body (F1). Bản thân từ khoá `suspend` **không** nói hàm này chạy ở
  đâu…
- **⑦** …chỗ chạy được nói ra ở đây: `withContext(Dispatchers.IO)` chuyển **khối `{ }`** sang dispatcher
  `IO`, và khi khối xong thì việc chạy tiếp **trở về ngữ cảnh của người gọi** (ở ② là main thread). Đây
  là ví dụ cụ thể cho toàn bộ mô hình của bài: ② *bắt đầu* trên main thread, nhưng phần thật sự chặn
  thread đã được đưa sang `IO`, nên giao diện không bị treo.
- **⑧** Lý do `withContext` tồn tại ở ví dụ này: `blockingReadFile` **chặn thread** — nó không phải hàm
  `suspend`. Nếu ⑧ đã là một hàm `suspend` main-safe của thư viện, thì ⑦ là lớp dư (Cạm bẫy 3).

**Tự chấm:** bạn nói được ① ② ③ ⑦ ⑧ mà không phải tra lại → bài này đã xong việc của nó. Câu duy nhất
được phép trả lời "chưa học" là ⑤.

</details>

---

## Editorial migration notes

> **Nội dung biên tập nội bộ — KHÔNG đưa vào bài học cho người học.**
>
> Task này **chỉ tạo draft**; không sửa Ch06, Ch08, Ch10 (theo phạm vi IMP-045). Bảng dưới ghi
> **quyền sở hữu nội dung** để batch Ch08 → W1–W3 (IMP-040) không dựng lại thứ S1 đã dạy, và để batch
> Ch06 → S2–S4 (IMP-037) biết chỗ nào chỉ cần trỏ về S1.
>
> Nguồn được soi (không sửa): `web/src/components/lessons/Ch08Networking.astro` (LIVE),
> `Ch10_3RepositoryViewModel.astro` (LIVE), `Ch06AdvancedJetpackCompose.astro` (LIVE),
> `Ch05JetpackCompose.astro` (LIVE, bản đã chỉnh), `Ch08_1CoroutineVaFlow.astro` (ngủ đông).

### A. MOVE/PORT → S1 dạy (nơi dạy chính chuyển về S1)

| Vật liệu hiện có | Nơi ở | S1 dùng thế nào |
|---|---|---|
| Main thread + vòng lặp 16 ms / 60 fps; "đặt việc 2 giây vào giữa vòng lặp thì app treo" | Ch08 mục 3 (dòng 449–455) | Phần 1 — dựng thành *vấn đề* mở bài, bỏ ngữ cảnh Recipe Finder |
| "Dispatcher = thứ quyết định đoạn code này chạy trên thread nào; bạn không tự tạo thread" | Ch08 mục 3 (dòng 472–475) | Phần 7 — giữ nguyên ý, thành định nghĩa chính |
| Bảng 3 dispatcher Main / IO / Default + loại việc | Ch08 mục 3 (dòng 462–471) | Phần 7 — port ở mức nhận diện |
| Vì sao IO ≠ Default (đặt việc *chờ* vào Default thì chiếm chỗ việc *tính*) | Ch08 mục 3 (dòng 488–493) | Phần 7 — giữ **lý do**, bỏ các con số (số core, 64 thread) |
| "Hàng nghìn coroutine không sao, khác thread" + thread tốn ~1 MB stack | Ch08 mục 4 (dòng 496–506) | Phần 2 — thành hàng cuối của bảng thread↔coroutine; **bỏ chữ "mini-thread"** (xem D) |
| Quy tắc gọi hàm `suspend` (trong hàm `suspend` khác **hoặc** trong coroutine) | Ch08 mục 4.1 (dòng 512–515) | Phần 4 — giữ nguyên, thêm ví dụ "không compile" |
| "`suspend` lan truyền lên trên theo chuỗi tới khi có ai mở coroutine" | Ch08 mục 4.1 (dòng 516–519) | Phần 4 — port gọn |
| **"`suspend` không có nghĩa chạy ở background; chạy thread nào là do dispatcher"** | Ch08 mục 4.1 (dòng 521–526) | Phần 3 — **điểm chính xác trung tâm của S1**, nâng từ `hint` lên callout |
| `viewModelScope` huỷ tự động khi ViewModel bị dọn + mặc định bắt đầu ở main thread | Ch08 mục 4.2 (dòng 543–551) | Phần 6 — giữ **hai kết luận**, bỏ phần đọc source (xem B) |
| "Thoạt nghe ngược": `launch` trên main thread mà không treo, vì lời gọi `suspend` nhả thread | Ch08 mục 4.2 (dòng 552–559) | Phần 6 — port thành đoạn chặn hiểu lầm "viewModelScope = nền" |
| Cơ chế "tạm dừng = lưu chỗ đang dở, trả thread lại, sau đó được đánh thức và tiếp tục" | Ch08 mục 16 (dòng 1320–1346, bước 2–5) | Phần 1 + Phần 3 — port **cơ chế**, bỏ phần Retrofit/OkHttp/Moshi (xem B) |
| **"Đừng suy rộng: 'không cần withContext' chỉ đúng với thư viện đã hỗ trợ `suspend`"** | Ch08 mục 16 (dòng 1352–1358) | Phần 9 — thành **quy tắc quyết định main-safety**, nâng thành callout |
| "Đừng chọn dispatcher theo tên việc": `Default` cho lời gọi mạng là thói quen sai | Ch08 mục 19.1 (dòng 1639–1648) | Phần 7 — giữ **quy tắc**, bỏ phần phê phán code mẫu (xem B) |
| **`suspend` = "người gọi quyết định chạy ở đâu"; `launch` = "tôi tự quyết định"** | Ch10.3 mục 13.3 (dòng 481–489) | Phần 3 + Phần 8 — **precision phải bảo toàn**, dùng làm cách nhớ chính |
| "Chuẩn hiện nay: hàm `suspend` chỉ dùng `withContext(...)`, để người gọi quyết định vòng đời coroutine" | Ch10.3 Cạm bẫy (dòng 619–622) | Phần 8 — port nguyên ý |
| `withContext(Dispatchers.IO)` = "chạy phần này trên IO, đảm bảo không ở main thread" | Ch10.3 mục 13.1 (dòng 406–408) | Phần 8 — port, nhưng ví dụ đổi sang **một hàm chặn thread thật** (xem "Editorial open questions" 1) |
| StateFlow là "dòng chảy giá trị mà nơi khác đăng ký lắng nghe; `.value` đổi thì người lắng nghe nhận giá trị mới" | Ch10.3 mục 13.1 (dòng 417–425) | Phần 10–11 — mô hình trực quan cho Flow/StateFlow |
| Bảng đối chiếu `suspend` (một giá trị) ↔ `Flow` (nhiều giá trị theo thời gian) | Ch06 mục 11.1 (dòng 1281–1300) | Phần 10 — port **hai hàng đầu**; hàng StateFlow bị sửa (xem D) |
| Ba điểm cụ thể của StateFlow: luôn có giá trị hiện tại · chỉ giữ một giá trị (conflation) · chia sẻ được | Ch06 mục 11.1 khối "Bổ sung" | Phần 11 — port hai điểm đầu; điểm "chia sẻ được" hạ xuống W1 |
| "`collect` là hàm `suspend` nên bắt buộc nằm trong coroutine" | Ch08 mục 5.2 (dòng 705–709) | Phần 10 — port nguyên |
| "`collect` không bao giờ chạy xong ⇒ code sau `collect` trong cùng `launch` không chạy" | Ch08 mục 5.2 (dòng 717–724) | Phần 10 — port ở mức **nhận biết, 2 câu**; cơ chế đầy đủ để W1 |
| `LaunchedEffect` khởi động coroutine khi vào composition, tự huỷ khi bị gỡ | Ch08 mục 5.2 (dòng 710–715) | Phần 13 — **dùng bản chính xác hơn của C4**, không dùng bản Ch08 (xem D) |
| Bốn điều chính xác về thời điểm `LaunchedEffect` chạy + phản-folklore "`Unit` chạy đúng một lần mãi mãi" | Ch05 mục 18 (dòng 2602–2621) | Phần 13 — **trỏ về, không lặp lại**; S1 chỉ thêm phần "khối đó là coroutine, Compose làm chủ" |

### B. Giữ cho W1 (hoặc bài khác) — S1 cố tình KHÔNG dạy

| Vật liệu | Nơi ở | Đích |
|---|---|---|
| Đọc source `viewModelScope` (getter, `JOB_KEY`, `CloseableCoroutineScope`, `Dispatchers.Main.immediate`) | Ch08 mục 4.2 (dòng 528–542) | **W1** — S1 chỉ giữ hai kết luận, không đọc source |
| `SupervisorJob`, lỗi con không kéo cha, ví dụ "app chết một nửa" | Ch08 mục 4.3 (dòng 561–575) | **W1** |
| `CoroutineContext` là tập thành phần; toán tử `+`; ghi đè dispatcher của scope cha | Ch08 mục 4.3 (dòng 576–582) | **W1** |
| Chữ ký `launch(context, start, block): Job`; `EmptyCoroutineContext`; `CoroutineStart` | Ch08 mục 4.4 (dòng 584–599) | **W1** — S1 chỉ nhận diện tên `Job` |
| `launch` vs `launch(Dispatchers.Default)` trong cùng ViewModel | Ch08 mục 4.4 (dòng 601–605) | **W1** + **W2** (đối chiếu code mẫu) |
| Con số dispatcher: `Default` = số core (tối thiểu 2), `IO` mặc định tới 64 thread | Ch08 mục 3 (dòng 488–493) | **W1** |
| Phê phán cách dùng chữ "a default dispatcher" của giáo trình gốc | Ch08 mục 3 (dòng 480–487) | **W1** — errata thuộc nơi dạy Ch08, không thuộc bài nền tảng |
| Thêm `kotlinx-coroutines-android` + mẹo version catalog dấu gạch → dấu chấm | Ch08 mục 4.5 (dòng 607–625) | **W1/W2** (đã có nền Gradle ở A14) |
| Bối cảnh `LiveData` + drift "Flows replace LiveData" | Ch08 mục 5 (dòng 628–633, 674–682) | **W1** |
| Cặp `private MutableStateFlow` + `asStateFlow()`; vì sao tách private/public | Ch08 mục 5 (dòng 634–655) | **S4** (nơi dạy chính) · nhắc lại ở **W1** |
| `SharedFlow` cho sự kiện một lần; StateFlow ↔ SharedFlow chọn cái nào | Ch08 mục 5 (dòng 656–664) | **W1** |
| Sáu flow của `RecipeViewModel` + vai trò từng flow | Ch08 mục 5 (dòng 665–673) | **W2** |
| `collectAsState()` và cơ chế gắn với recomposition | Ch08 mục 5.1 (dòng 684–697) | **S4** (dạy `collectAsStateWithLifecycle`) |
| Đọc `RecipeList.kt` thật: hai cách gặp nhau, state cục bộ trùng tên, `LaunchedEffect(Unit)`, hai `scope.launch` song song | Ch08 mục 5.3 (dòng 726–777) | **W1/W2** |
| Chuỗi 6 bước *cụ thể của Retrofit* (OkHttp thread pool, Moshi parse, `resume` về Main) | Ch08 mục 16 (dòng 1320–1351) | **W2** — S1 chỉ lấy cơ chế chung |
| Bảng Before/after: callback ↔ `suspend` (6 điểm, `enqueue`, `try/catch` một chỗ) | Ch08 mục 16.1 (dòng 1360–1392) | **W1** — giá trị cao nhưng sẽ cạnh tranh với 5 điều cốt lõi của S1 |
| Drift #6/#7 trên code mẫu (`suspend` + `launch` dư; `Default` cho lời gọi mạng) ở mức phê phán từng hàm | Ch08 mục 19.1 (dòng 1615–1648) | **W1/W2** — S1 chỉ lấy quy tắc, không lấy phần đối chiếu |
| Khuôn bốn bước của hàm ViewModel (IO → repository → convert → state) | Ch10.3 mục 13.1 (dòng 402–416) | **S5 / R3** — S1 chỉ lấy bước "chuyển sang IO" |
| `async`/`await`, `Deferred`, channels, backpressure, `callbackFlow`, toán tử Flow, cold vs hot, cancellation, `CoroutineExceptionHandler`, `supervisorScope`, `lifecycleScope` chi tiết, test coroutine, mutex | *(chưa có trong khoá)* | **W1** — danh sách loại trừ cứng của S1 |

### C. Trùng lặp — không dùng làm nguồn thứ hai

- `Ch08_1CoroutineVaFlow.astro` (file ngủ đông, chưa route): đã diff — phần thân **trùng khớp từng
  dòng** với `Ch08Networking.astro` mục 3–5 (dòng 443–777), chỉ thêm thẻ đóng `</section>`. File
  **không có** `<h2 id="cam-bay">` lẫn `<h2 id="nguon">`. ⇒ Không có vật liệu riêng; coi là bản cắt cũ,
  xử lý ở batch dọn dẹp của IMP-040, **không** dùng như nguồn độc lập.
- Giải thích lambda đuôi của `launch` (Ch08 mục 4.4, dòng 594–600): trùng F1 — S1 chỉ trỏ "(F1)".

### D. Stale / folklore — cố tình loại khỏi S1

| Vật liệu | Nơi ở | Vì sao loại |
|---|---|---|
| **"coroutine như những mini-thread"** | Ch08 mục 4 (dòng 498) | Sinh ra đúng hiểu lầm S1 phải chặn (Cạm bẫy 2). S1 dùng "công việc có thể tạm dừng", và nói thẳng *đừng* đọc coroutine thành "thread nhẹ". |
| **"`StateFlow` là `Flow` mở rộng, có thêm lifecycle awareness sẵn bên trong"** | Ch06 mục 11.1, bảng ở dòng ~1288–1297 | **Không chính xác**: `StateFlow` không tự biết vòng đời; lắng nghe theo vòng đời là công cụ riêng (S4). Chính Ch06 tự sửa ngay bên dưới bằng khối "Bổ sung" — S1 dạy bản đúng và thêm Cạm bẫy 6. **Cờ cho IMP-037**: khi tách Ch06 → S2–S4, sửa hàng bảng này. |
| Giọng thuật lại nguồn: "Sách mô tả…", "Sách nói…", "Sách chỉ ra…", đánh số "Điểm lệch #N", các dòng `<p class="src">Nguồn: BOOK (Coroutines, dòng 33)` giữa thân bài | Ch08 mục 3–5 (rải rác) | Vi phạm COURSE_CONTENT_STANDARD §6. S1 viết giọng độc lập; attribution dồn vào một khối Nguồn duy nhất khi dựng trang. |
| Ngữ cảnh app Recipe Finder / tab Groceries / hàm TODO rỗng | Ch08 mục 2 (dòng 420–441) | Thuộc W-stage, không thuộc bài nền tảng coroutine. |
| Bản `LaunchedEffect` của Ch08 ("khởi động khi Composable hiện lên lần đầu") | Ch08 mục 5.2 (dòng 710–715) | Kém chính xác hơn bản C4 (composition vs "lần đầu"). S1 dùng bản C4 và **trỏ về C4**, không lặp lại. |

### E. Ứng viên đơn giản hoá khi S1 live (không xoá nội dung, không đụng trong task này)

1. **Ch08 mục 3–5 → W1**: sau khi S1 live, W1 mở bằng một câu trỏ về S1 ("bốn mô hình đã học ở S1") rồi
   đi thẳng vào chiều sâu — bỏ phần dựng lại mental model thread/dispatcher/suspend từ đầu.
2. **Ch08 mục 4.1 hint** (dòng 521–526): rút về 1 câu trỏ S1, giữ nguyên phần còn lại của mục.
3. **Ch08 mục 16 notice** (dòng 1352–1358): giữ, nhưng thêm "quy tắc này đã học ở S1" — W2 chỉ áp dụng
   vào ca Retrofit cụ thể.
4. **Ch10.3 mục 13.1 bước 1** (dòng 406–408): thêm nửa câu "(`withContext` đã học ở S1)"; **giữ nguyên**
   khuôn bốn bước và mọi giải thích Room-specific.
5. **Ch10.3 mục 13.3 notice** (dòng 481–489) và **Cạm bẫy** (dòng 619–622): giữ nguyên — đây là nơi
   *đối chiếu code thật*, S1 chỉ dạy nguyên tắc.
6. **Ch05 mục 18 khối note** (dòng 2629–2641): sau khi S1 live, đổi "sẽ được học riêng ở giai đoạn State
   & kiến trúc" → trỏ đúng tên bài **S1**. Đây là chỉnh *văn bản đích của forward-ref*, không đụng nội
   dung C4.
7. **Ch06 mục 11.1**: ngoài việc sửa hàng bảng ở D, phần "Bổ sung" ba điểm có thể rút gọn còn một câu
   trỏ S1 khi S2–S4 được dựng.

### F. Bàn giao đánh số mục

- S1 là bài **đầu** Giai đoạn 3 ⇒ khi dựng trang, `Phần 1…13` của draft này thành **mục 1…13**.
- Batch IMP-037 (Ch06 → S2–S4) tiếp nối từ **mục 14**; S5 (IMP-046) nối tiếp sau S4.
- Khác với C5 (nối số của Ch05 vì cùng nguồn chương), S1 **không** nối số của Ch06: S1 là bài NEW đứng
  *trước* các bài tách ra từ Ch06, nên nó mở dãy số của giai đoạn.
- Bài dựng ra phải có đúng một `<h2 id="cam-bay">` và đúng một `<h2 id="nguon">` (mục "Cạm bẫy" và
  khối Nguồn ở trên đã sẵn nội dung).

### Ghim cho "Cần biết trước" của các bài sau

Từ S2 trở đi, mọi bài dùng coroutine/Flow nên liệt kê tiên quyết **S1** thay vì gloss lại:
S2/S3 (nếu có `LaunchedEffect`) · **S4** (`viewModelScope`, `StateFlow`, `collect`, lifecycle-aware
collection, `stateIn`) · **S5** (hàm `suspend` ở tầng dữ liệu) · **N1/N2** · **W1** (chiều sâu) ·
**W2/W3** · **D1/D2** · **R2/R3/R4** · **X1/X2**.

---

## Editorial open questions

> **Nội dung biên tập nội bộ.** Ba điểm đã *cố ý* không khẳng định trong bài học vì chưa verify được
> từ nguồn chính thức. Không cái nào ảnh hưởng tới nội dung S1 hiện tại.

1. **`withContext(Dispatchers.IO)` quanh DAO `suspend` của Room có phải lớp dư?** Ch10.3 (dòng 106–160,
   406–408) bọc mọi lời gọi repository trong `withContext(Dispatchers.IO)`, trong khi các hàm DAO đều
   là `suspend`. Tài liệu Room chính thức chỉ nói **"Room doesn't support database access on the main
   thread"** và **"Room requires the `suspend` keyword to make your one-shot DAO queries
   asynchronous"** — *không* nói rõ Room tự điều phối query sang thread nền, nên **chưa kết luận được**
   `withContext` ở đó là dư. Vì vậy ví dụ `withContext` của S1 dùng một hàm **chặn thread thật**
   (`blockingFileRead`) chứ không dùng ví dụ Room. Cần verify ở batch **R3/W1** (nguồn cần đọc:
   `RoomDatabase.Builder.setQueryCoroutineContext` / `setQueryExecutor`).
2. **`viewModelScope` mặc định là `Dispatchers.Main.immediate`** — đúng theo source thư viện Lifecycle
   mà Ch08 mục 4.2 trích, nhưng trang hướng dẫn chính thức của Android không phát biểu con số này. S1
   vì vậy chỉ nói "mặc định bắt đầu chạy trên **main thread**" (đủ để chặn hiểu lầm "viewModelScope =
   nền") và **không** nhắc `immediate`. Chi tiết `immediate` để **W1**.
3. **Ví dụ ViewModel trong brief dùng `repository.load()`.** Draft này đổi thành `loadMessages()` /
   `loadProfile()` — vì **repository chỉ được dạy ở S5**, dùng tên đó trước S5 sẽ vi phạm gate
   "used-before-taught" (spec §8, QA #9). Ý nghĩa minh hoạ không đổi: vẫn là một lời gọi `suspend` do
   phần khác của app cung cấp.

---

## Final readability-test inventory

> **Kiểm tra nội bộ của đoạn ở mục "Luyện tập".** Yêu cầu: **0 cấu trúc Kotlin chưa dạy** ngoài F1/F2,
> và **0 khái niệm coroutine/Flow chưa giải thích trong chính S1**.

| Thành phần trong đoạn | Phân loại |
|---|---|
| `class ProfileViewModel : ViewModel()` | `class` + tham số khởi tạo: **F2**; dấu `:` = "là một": **gloss 1 câu có nhãn** ở Phần 12 (cùng khuôn `MainActivity : ComponentActivity()` của Chương 3) |
| `val uiState: StateFlow<UiState>` | `val` + kiểu tường minh: **F1**; generic `<>`: **F2**; `UiState` sealed state: **F2**; `StateFlow`: **S1 Phần 11** |
| `fun load(userId: Int)` | **F1** (hàm, tham số có kiểu) |
| `viewModelScope.launch { }` | scope + `launch`: **S1 Phần 5–6**; lambda đuôi: **F1** |
| `val profile = loadProfile(userId)` | **F1** (gọi hàm, gán `val`); tính chất `suspend`: **S1 Phần 3–4** |
| `suspend fun readThemeFromDisk(): String =` | `suspend`: **S1 Phần 3**; expression body + kiểu trả về: **F1** |
| `withContext(Dispatchers.IO) { }` | **S1 Phần 8**; giá trị của khối là giá trị dòng cuối: **gloss 1 câu** ở Phần 8, nối về `map`/`filter` của F1 |
| `blockingReadFile("theme.txt")` | Gọi hàm + tham số chuỗi: **F1**; "hàm chặn thread" được dán nhãn tại chỗ |
| `delay(1000)`, `println(...)` *(ở Phần 3)* | `delay`: **S1 Phần 3** (dán nhãn là hàm `suspend`); `println`: **F1** |
| `Thread.sleep(1000)` *(ở Phần 3)* | Dán nhãn "hàm chặn thread của Java", **chỉ để đối chiếu** — không dạy API Java |
| `messages.collect { message -> ... }` *(ở Phần 10)* | `collect`: **S1 Phần 10**; lambda có tham số đặt tên `->`: **F1** |

**Danh sách loại trừ đã xác minh** — trong toàn bộ phần "Bài học", các API sau **không được dạy và
không xuất hiện trong bất kỳ đoạn code nào**: `async`, `await`, `Deferred`, `SupervisorJob`,
`supervisorScope`, `coroutineScope { }`, `runBlocking`, `flow { }`, `emit`, các toán tử Flow
(`map`/`filter` trên Flow, `combine`, `flatMapLatest`, `debounce`, `catch`, `retry`), `MutableStateFlow`,
`asStateFlow`, `update { }`, `SharingStarted`, `SharedFlow`, `stateIn`, `callbackFlow`, `Channel`,
`collectAsState`, `collectAsStateWithLifecycle`, `repeatOnLifecycle`, `lifecycleScope`, `GlobalScope`,
`cancel()`, `isActive`, `try/catch` quanh coroutine, `CoroutineExceptionHandler`, `CoroutineContext`,
toán tử `+` ghép context, `Dispatchers.Unconfined`, `Dispatchers.Main.immediate`.

Một số tên trong danh sách trên **có xuất hiện đúng một lần dưới dạng chữ**, luôn nằm trong câu
"cố tình không dạy ở đây / thuộc W1" kèm đích cụ thể — đó là *chủ ý*: người học cần biết ranh giới của
bài, và cần biết thứ mình sẽ gặp trên mạng có nơi dạy đàng hoàng. Cụ thể: `async`/`await`/`Deferred`
(Phần 5 → W1) · `SupervisorJob`/`CoroutineContext` (Phần 7 → W1) · các toán tử Flow (Phần 10 → W1) ·
`MutableStateFlow`/`update { }`/`SharingStarted`/`SharedFlow` (Phần 11 → W1) · `stateIn` (Phần 11 →
S4) · `GlobalScope` (Phần 6, kèm lý do không dùng) · `Job` (Phần 5, mức nhận diện). Ngoài ra
`Thread.sleep` xuất hiện **chỉ để đối chiếu** với `delay` (Phần 3, Cạm bẫy 4, Tóm tắt 8), và
`Retrofit`/`Room`/`repository` chỉ xuất hiện dưới dạng **tên kèm nhãn "sẽ học ở bài nào"**, không có
code.

**Cú pháp Kotlin ngoài F1/F2 xuất hiện trong bài** — đúng **hai** chỗ, cả hai đều được gloss một câu
có nhãn: (1) dấu `:` nghĩa "là một" khi khai `class ... : ViewModel()` — Phần 12; (2) giá trị của khối
`{ }` là giá trị dòng cuối — Phần 8. Không có `when`, `is`/`as`, scope function, extension function,
`object`, destructuring nào mới.

**Verify criterion:** người học đọc đoạn ở mục "Luyện tập", chú thích được ①②③④⑥⑦⑧ bằng ngôn ngữ của
S1, và chỉ trả lời "chưa học" đúng ở ⑤ (phần S4) → **PASS**.

---

## Sources for future Nguồn block

> Tài liệu tham khảo khái niệm cho khối "Nguồn tham khảo" khi dựng trang. Chỉ liệt kê nguồn **đã đọc
> trực tiếp** khi viết draft này; không kèm số dòng cho tài liệu web, không chế provenance.

**Tài liệu chính thức Kotlin (kotlinlang.org)**

- *Coroutines basics* — định nghĩa coroutine ("a suspendable computation"), coroutine chạy trên thread
  do hệ điều hành quản lý nhưng **không bị gắn cứng** vào một thread ("can suspend on one thread and
  resume on another"), thread nhả ra khi coroutine tạm dừng, so sánh chi phí thread ↔ coroutine, quy
  tắc "chỉ gọi hàm suspend từ hàm suspend khác", `CoroutineScope` là điều kiện để khởi động coroutine,
  `launch` trả về `Job`, `delay` "suspends … and releases the thread".
- *Coroutine context and dispatchers* — `withContext` "may suspend the current coroutine and switch to
  a new context … once it finishes, execution returns to the original dispatcher"; `Dispatchers.Default`
  dùng "a shared background pool of threads".
- *API reference — `kotlinx.coroutines.flow.StateFlow`* — "StateFlow always has a value which can be
  safely read at any time via `value` property"; "Updates to the `value` are always conflated. So a slow
  collector skips fast updates, but always collects the most recently emitted value"; state flow là
  **hot** và "never completes".

**Tài liệu chính thức Android (developer.android.com)**

- *Kotlin flows on Android* — flow là "a type that can emit multiple values sequentially, as opposed to
  suspend functions that return only a single value"; ba vai producer / intermediary / consumer;
  "`collect` needs to be executed in a coroutine".
- *StateFlow and SharedFlow* — "StateFlow is a state-holder observable flow that emits the current and
  new state updates to its collectors. The current state value can also be read through its `value`
  property"; StateFlow là *hot*; "collecting from a StateFlow … does not stop collecting automatically"
  (căn cứ cho Cạm bẫy 6 và cho việc để lifecycle-aware collection lại cho S4); `stateIn` là toán tử để
  biến một flow thành StateFlow.
- *Best practices for coroutines in Android* — "Suspend functions should be main-safe, meaning they're
  safe to call from the main thread. If a class is doing long-running blocking operations in a coroutine,
  it's in charge of moving the execution off the main thread using `withContext`"; "Don't hardcode
  `Dispatchers`…" (lý do S1 chỉ dạy *quy tắc chọn*, không dạy pattern inject — inject để W1);
  `GlobalScope` = "hardcoding the `CoroutineScope` that a class uses".
- *Use Kotlin coroutines with lifecycle-aware components* — "A ViewModelScope is defined for each
  ViewModel in your app. Any coroutine launched in this scope is automatically canceled if the ViewModel
  is cleared."
- *Side-effects in Compose* — `LaunchedEffect` khởi động coroutine khi vào composition, huỷ khi rời
  composition, huỷ-và-khởi-động-lại khi key đổi; `rememberCoroutineScope` "returns a `CoroutineScope`
  bound to the point of composition where it is called" và scope đó bị huỷ khi lời gọi rời composition.

**Nội dung của chính khoá học** (nguồn ngữ cảnh/payoff, không phải nguồn khái niệm)

- **Chương 8** — phần thread/dispatcher/`suspend`/Flow và mục "Bên dưới một lời gọi `suspend`": vật
  liệu sư phạm được thu hoạch (bảng phân loại ở "Editorial migration notes").
- **Chương 10.3** — precision `suspend` ↔ `launch` và khuôn `suspend` + `withContext(Dispatchers.IO)`.
- **Chương 6** — bảng đối chiếu `suspend`/`Flow`/`StateFlow` (hàng StateFlow cần sửa — mục D).
- **C4 (trong `Ch05JetpackCompose.astro`, mục 18)** — bốn điều chính xác về `LaunchedEffect` và lời hẹn
  forward-reference mà S1 trả nợ.

Khi dựng trang, khối Nguồn phải trích thêm đường dẫn `aaf-materials/…` **chỉ nếu** bài dùng code thật
của project mẫu. Bản draft này **không** dùng code từ `aaf-materials/` — mọi đoạn code là ví dụ tối
giản do khoá dựng, nên khối Nguồn của S1 chỉ gồm tài liệu chính thức + tham chiếu chéo nội bộ khoá.
