# F2 — Kotlin đủ để học Compose, Phần 2

> **TRẠNG THÁI: DRAFT NỘI BỘ CHO BÀI HỌC TƯƠNG LAI.** File này KHÔNG phải trang site.
> Khi dựng bài chính thức (task IMP-044 trong `docs/COURSE_REDESIGN_IMPLEMENTATION_PLAN.md`),
> nội dung học là phần "Bài học" phía dưới; ba mục cuối file ("Editorial taxonomy correction",
> "Editorial migration notes", "Final readability-test inventory", "Sources for future Nguồn block")
> là nội dung biên tập nội bộ, **không** đưa cho người học.
>
> Vị trí trong khoá: **Nền tảng, bài 2/2**, nối tiếp F1, học ngay trước giai đoạn 1.
> Bài này hoàn thiện số Kotlin tối thiểu trước Jetpack Compose. KHÔNG dạy Compose — chỉ dạy đủ để
> đọc code Compose/state mà cú pháp Kotlin không còn là rào cản.

---

# Bài học

## Mục tiêu — sau bài này bạn sẽ

- Nhận ra một khai báo `class` cơ bản: đọc được tham số khởi tạo, và vì sao `val` trong tham số biến
  thành thuộc tính đọc được của object.
- Giải thích được `data class` làm gì khác `class` thường: so sánh theo **giá trị**, `toString` đọc
  được, `copy(...)`, và tách thuộc tính (destructuring).
- Dùng được `copy(...)` đúng cách — tạo giá trị mới, không sửa bản gốc — và biết giới hạn "copy nông"
  của nó.
- Đọc được destructuring `val (a, b) = ...` và biết khi nào nó làm code khó đọc.
- Đọc được các hình dạng generic: `List<String>`, `List<Message>`, `List<T>`,
  `MutableStateFlow<UiState>` — ở mức "đọc được dấu ngoặc nhọn", không sâu hơn.
- Hiểu được `by` là cơ chế gì của Kotlin (uỷ quyền việc đọc/ghi thuộc tính), tách rõ phần Kotlin và
  phần Compose trong `var name by remember { mutableStateOf("") }`, và nhận ra cùng cơ chế đó trong
  `by preferencesDataStore(...)`.
- Hiểu được ý tưởng **sealed state**: mô hình hoá một màn hình bằng một họ trạng thái có giới hạn
  thay vì một đống boolean rời rạc.
- Nhìn một đoạn code Compose 25–35 dòng và chỉ ra **từng** cấu trúc Kotlin — không còn cấu trúc
  Kotlin nào chưa được dạy.

**Tại sao điều này quan trọng:** F1 cho bạn đọc *biểu thức*; F2 cho bạn đọc *cấu trúc dữ liệu và
thuộc tính* — đúng hai thứ Compose dựa vào để mô tả trạng thái giao diện. Gần như mọi state trong
code Android hiện đại là một trong: data class, danh sách data class, hoặc một giá trị thuộc họ
sealed. Học xong bài này, câu "đây là Kotlin hay là Compose?" luôn có câu trả lời rõ.

**Cần biết trước:** **F1** — val/var, kiểu và suy luận, hàm/tham số/giá trị trả về, expression body,
nullability `?.`/`?:`, List + map/filter, lambda + `it` + trailing lambda, kiểu hàm. Bài này dùng
chúng liên tục như công cụ, không dạy lại.

---

## Phần 1 — Class: đủ dùng, không hơn

### Vấn đề trước cú pháp

Đến giờ, mỗi biến của bạn chỉ *một* mẩu dữ liệu: một chuỗi, một số. Nhưng một tin nhắn thật cần
nhiều mẩu đi cùng nhau: nội dung, ai gửi, mấy giờ. Ba biến rời (`text`, `isMine`, `time`) là ba chỗ
phải giữ đồng bộ — truyền thiếu một cái là vỡ. Giải pháp: định nghĩa một **kiểu** gói các mẩu đó
thành một giá trị duy nhất.

```kotlin
class Message(
    val text: String,
    val isMine: Boolean
)
```

Đọc từng mảnh:

| Mảnh | Nghĩa là gì |
|---|---|
| `class` | Từ khoá định nghĩa một kiểu mới — một **khuôn**: mô tả "một Message gồm những gì". |
| `Message(...)` | Danh sách **tham số khởi tạo**: muốn tạo ra một Message thì phải cung cấp những gì. |
| `val text: String` | Tham số vừa là dữ liệu khởi tạo, vừa — vì có chữ `val` — trở thành **thuộc tính** (property) đọc được trên object tạo ra. |
| *(thân rỗng)* | Class này chỉ mô tả dữ liệu, chưa có hành vi — và điều đó hoàn toàn hợp lệ. |

Tạo ra một **object** (một bản sao cụ thể từ khuôn) bằng cách gọi tên class như gọi hàm:

```kotlin
val message = Message(
    text = "Xin chào",
    isMine = true
)

println(message.text)   // "Xin chào"
```

Hai điểm cần nói chính xác:

- `message` là một `val` — *tên* không gán lại được (F1). Còn các *thuộc tính* bên trong object thì
  do chính chúng quyết định: khai `val` trong constructor → chỉ đọc; khai `var` → có thể gán lại qua
  object. Câu hỏi "đổi được không" giờ có hai tầng: đổi *tên trỏ tới object khác* (do `val`/`var`
  của biến) và đổi *giá trị thuộc tính bên trong* (do `val`/`var` của thuộc tính).
- `Message(...)` ở ví dụ trên là **lời gọi tạo object**, không phải khai báo — cùng cú pháp gọi hàm
  mà bạn biết, giờ dùng để "đúc" một bản từ khuôn.

Chỉ cần vậy để đọc code. Những khái niệm OOP còn lại (kế thừa, visibility, constructor phụ…) **không
nằm trong bài này** — bạn chỉ cần nhận ra khuôn hình "class + tham số khởi tạo + val/var" ở mọi nơi
nó xuất hiện. Dấu `:` sau tên class (kiểu `class MainActivity : ComponentActivity()` mà bạn đã gặp
trong Chương 3) liên quan tới kế thừa — được gloss đúng lúc ở đó, không dạy ở đây.

---

## Phần 2 — `data class`: khuôn làm sẵn cho dữ liệu

### Vấn đề trước cú pháp

`Message` ở Phần 1 là *khuôn dữ liệu thuần* — không có hành vi gì. Với các khuôn như vậy, Kotlin
cung cấp một phiên bản có thêm vài tính năng làm sẵn, đúng những việc code Android làm đi đi lại lại.
Thêm một chữ `data`:

```kotlin
data class Message(
    val text: String,
    val isMine: Boolean
)
```

Vì sao Android cần đúng khuôn hình này? Nhìn quanh code bạn sắp học: **mô hình cho UI** (một tin
nhắn, một mục danh sách), **mô hình cho database** (một dòng trong bảng), **mô hình cho mạng** (một
kết quả API), **giá trị state** (tình trạng màn hình). Tất cả đều là "một giá trị gồm nhiều thuộc
tính", không có hành vi phức tạp. `data class` là công cụ chính xác cho hình đó — và vì phổ biến
đến vậy, quy ước chung: *khi một class chỉ là dữ liệu, viết `data class`.*

Ba thứ `data` làm thêm, ở mức bạn cần:

1. **So sánh theo giá trị** (Phần 3).
2. **`toString()` đọc được**: in ra `Message(text=Xin chào, isMine=true)` thay vì một mã băm vô
   nghĩa — tiết kiệm hàng giờ debug qua Logcat.
3. **`copy(...)`** và **destructuring** (Phần 4, Phần 5).

> **Tự kiểm tra 1.** Khai báo nào sau đây đúng cú pháp Kotlin để tạo object từ
> `data class Message(val text: String, val isMine: Boolean)`?
> 1. `val m = Message("Hi", true)`  2. `val m = Message(text = "Hi")`  3. `val m = data Message("Hi", true)`
> 4. `val m: Message = Message(text = "Hi", isMine = false)`
>
> *(Đáp án: 1, 2, 4 — 2 hợp lệ vì `isMine` là `val` nhưng đây là tham số khởi tạo bắt buộc… chú ý:
> dòng 2 thực ra THIẾU tham số `isMine` nên không compile. Đáp án đúng chỉ là 1 và 4. `data` chỉ dùng
> lúc *định nghĩa*, không dùng lúc *tạo object*.)*

---

## Phần 3 — So sánh theo giá trị

### Vấn đề trước cú pháp

Hai tin nhắn do hai lần tạo khác nhau nhưng *nội dung như nhau* — chúng có "bằng nhau" không? Với
class thường, Kotlin mặc định so sánh *sự nhận diện* (hai tên có trỏ tới cùng một object không).
Với dữ liệu, thứ bạn gần như luôn muốn hỏi là: *nội dung có khớp nhau không*.

```kotlin
val a = Message("Hello", true)
val b = Message("Hello", true)

a == b   // true với data class
```

`data class` tự sinh việc so sánh **thuộc tính-cờ-thuộc-tính**: `a == b` true khi mọi thuộc tính
khớp (`text` bằng `text`, `isMine` bằng `isMine`), bất kể a và b là hai object riêng biệt được tạo
hai lần. Với class thường, kết quả là `false` — vì mặc định so *nhận diện*, không so nội dung.

Đây chính là hành vi "giá trị" mà tên `data` hàm ý: object của bạn được đối xử như một *giá trị*
(hai bản chép cùng nội dung coi như bằng nhau) chứ không phải một *thực thể* (mỗi lần tạo là một
cái riêng). Trong code state của Compose, hành vi này là nền của việc "state có thay đổi không?" —
nhưng bạn chưa cần biết cơ chế đó, chỉ cần nhớ: **data class so theo nội dung.**

Một câu cảnh báo để khỏi lạc đề: ở đây ta quan tâm *giá trị dữ liệu*. Kotlin còn có toán tử so
sánh nhận diện `===` (hai tên trỏ đúng một object) — biết là tồn tại, chưa cần dùng, không học sâu
trong bài này.

---

## Phần 4 — `copy(...)`: tạo bản mới, không sửa bản cũ

### Vấn đề trước cú pháp

Thuộc tính của `Message` là `val` — chỉ đọc. Vậy khi tin nhắn *đổi trạng thái* (ví dụ: đã được đánh
dấu quan trọng), làm sao? Không sửa được, thì… tạo một bản mới với thuộc tính cần đổi:

```kotlin
val original = Message(
    text = "Hello",
    isMine = false
)

val updated = original.copy(isMine = true)
```

Đọc chính xác ba điều:

1. **`original` không bị sửa** — vẫn là `Message(text=Hello, isMine=false)`. Gọi `copy` không đụng
   vào bản cũ.
2. **`updated` là một giá trị MỚI** — `Message(text=Hello, isMine=true)`. Hai object khác nhau,
   nội dung khác nhau ở đúng chỗ bạn truyền.
3. **Tham số không truyền giữ nguyên giá trị cũ** — `copy(isMine = true)` chỉ đổi `isMine`; `text`
   được lấy từ `original`. Muốn đổi chỗ nào thì truyền tên chỗ đó (tham số đặt tên — F1), còn lại
   giữ nguyên.

Mối nối về sau, ghi một câu để nhớ: **khi một UI state thay đổi, code Android hiện đại sẽ tạo một
giá trị state mới (thường qua `copy`) thay vì sửa state cũ tại chỗ.** Vì sao và cơ chế nó hoạt động
với giao diện là nội dung phần State & kiến trúc — ở đây bạn chỉ cần nắm hình: *đổi = tạo bản mới*.

Một giới hạn cần nói cho chính xác, ngắn gọn: `copy` là **nông** (shallow). Nó tạo object mới với
các giá trị thuộc tính được *chép qua*; nếu một thuộc tính trỏ tới một object *thay đổi được* (ví dụ
một MutableList), object bên trong đó **không** được nhân bản — hai bản copy vẫn chia sẻ nó. Với
data class toàn `val` chứa String/Int/List chỉ-đọc như đa số code Android, điều này gần như không
bao giờ cắn bạn; chỉ đừng tưởng `copy` "nhân bản sâu cả cây dữ liệu".

> **Tự kiểm tra 2.** Với `val m1 = Message("Hi", true)`, sau `val m2 = m1.copy(text = "Xin chào")`:
> 1. `m1.text` là gì?  2. `m2.isMine` là gì?  3. `m1 == m2` true hay false?
>
> *(Đáp án: 1. "Hi" — bản gốc không đổi. 2. `true` — thuộc tính không truyền giữ nguyên.
> 3. false — `text` khác nhau nên nội dung khác nhau.)*

---

## Phần 5 — Destructuring: tách giá trị thành các tên

### Vấn đề trước cú pháp

Có lúc bạn chỉ cần *hai mẩu* trong một giá trị, và viết `message.text`, `message.isMine` lặp đi lặp
lại. Kotlin cho phép tách một data class thành các biến đặt tên theo thứ tự thuộc tính:

```kotlin
val message = Message("Xin chào", true)

val (text, isMine) = message
```

Sau dòng này, `text` là `"Xin chào"` và `isMine` là `true` — hai biến cục bộ riêng. **Thứ tự khớp
thứ tự thuộc tính trong khai báo class**, không khớp theo tên: vị trí đầu nhận thuộc tính đầu
(`text`), vị trí hai nhận thuộc tính hai (`isMine`). Tên bên trái do bạn đặt — đặt sai thứ tự là
nhận nhầm dữ liệu, mà trình biên dịch không thể cảnh báo vì tên là do bạn chọn.

Cảnh báo thực dụng: tiện ở giá trị 2–3 thuộc tính; từ 4–5 thuộc tính trở lên, destructuring khó đọc
và dễ lệch vị trí — khi đó dùng `val text = message.text` trực tiếp thì rõ ràng hơn. (Bên dưới,
Kotlin sinh các hàm truy vị trí `component1()`, `component2()`… — biết là cơ chế để hiểu vì sao
"theo thứ tự", không cần dùng.)

Bạn sẽ gặp destructuring chủ yếu trong vòng lặp `for ((key, value) in …)` và vài API Kotlin —
nhận diện được là đủ.

---

## Phần 6 — Generics: đọc được dấu ngoặc nhọn

### Vấn đề trước cú pháp

Ở F1 bạn đã dùng `listOf("An", "Bình")` và Kotlin tự suy ra kiểu. Giờ đọc kiểu đó ra một cách tường
minh:

```kotlin
val names: List<String> = listOf("An", "Bình", "Chi")
```

`List<String>` đọc là: **"một List mà phần tử bên trong là String"**. Dấu ngoặc nhọn là chỗ *nói
rõ loại dữ liệu bên trong hộp*. Mô hình tư duy: **`Hộp<Loại bên trong>`** — List là hộp, `String` là
loại bên trong.

Đổi loại bên trong thì đọc y hệt:

```kotlin
List<Message>   // danh sách phần tử là Message
List<Int>       // danh sách phần tử là Int
```

Chú ý hình dáng ngữ nghĩa: `List<Message>` **không** phải "một cú pháp List đặc biệt" — nó vẫn là
List, chỉ khai báo rõ phần tử là gì. Lợi ích trình biên dịch mang lại rất thật: `messages[0].text`
compile được; `numbers[0].text` báo lỗi ngay lúc biên dịch, vì `Int` không có thuộc tính `text`.

### `T` là gì?

Khi đọc tài liệu hoặc chữ ký hàm, bạn sẽ gặp:

```kotlin
List<T>
```

`T` không phải một kiểu thật — nó là **placeholder** (tham số kiểu): "kiểu cụ thể bên trong sẽ được
cung cấp ở chỗ khác". Đọc `fun reversed(): List<T>` của List<T> là: "trả về danh sách cùng loại phần
tử với danh sách gốc". Gặp `T`, đừng tìm định nghĩa của nó — hãy hỏi *ai cung cấp T*, và thường câu
trả lời nằm ngay cách dùng: `List<Message>` tức là chỗ dùng đã cung cấp `T = Message`.

### Các hình dạng Android sắp gặp

```kotlin
List<Message>              // danh sách tin nhắn — bạn sẽ viết thật ở Stage Compose
MutableStateFlow<UiState>  // "hộp state mà UI lắng nghe" — của phần State & kiến trúc
Result<Message>            // "kết quả: hoặc thành công chứa Message, hoặc lỗi" — sẽ gặp ở phần Mạng
```

Cả ba đều là cùng một kỹ năng đọc: *hộp `<` loại-bên-in `>`*. `MutableStateFlow`, `Result` là API
bạn sẽ học ý nghĩa ở từng phần tương ứng — ở đây chỉ cần đọc được hình dạng và không bị dụi mắt bởi
dấu ngoặc.

> **Tự kiểm tra 3.** Biến khai `val messages: List<Message>` — câu nào đúng?
> 1. `messages` chứa các `String`  2. `messages[0]` có kiểu `Message`  3. `messages[0].text`
> compile được (giả sử Message có thuộc tính `text`)  4. `messages` là một `Message`
>
> *(Đáp án: 2 và 3. Dòng 1 sai loại bên trong; dòng 4 nhầm hộp với nội dung.)*

---

## Phần 7 — `by`: uỷ quyền việc đọc/ghi thuộc tính

Đây là khái niệm quan trọng nhất của bài — và dễ hiểu sai nhất, nên bắt đầu từ **sự khác biệt cú
pháp** mà bạn đã thấy trong Chương 3:

```kotlin
// Cách viết thường: đọc qua .value
val count = state.value

// Cách viết uỷ quyền: đọc thẳng tên biến
val count by state
```

Trước hết: **hai dòng này KHÔNG tương đương nhau một cách máy móc** — dòng thứ hai là một cơ chế
khác, không chỉ là cách viết gọn của dòng thứ nhất. Nó là một *sự tương phản tư duy* đúng chỗ này,
chứ không phải đẳng thức.

### Vấn đề mà `by` giải quyết

Đôi khi một object khác là người *nắm quyền quyết định* việc đọc/ghi một thuộc tính diễn ra ra sao:
mỗi lần đọc có nên tính lại không? Ghi vào thì có phải báo cho ai đó biết không? Có nên lưu cache?
Kotlin cho phép bạn nói: **"việc đọc/ghi thuộc tính này, tôi uỷ quyền cho object X xử lý"** — và đó
là chữ `by`:

```kotlin
val count by state
```

Đọc là: biến `count` không tự chứa giá trị; **mỗi lần code đọc `count`, Kotlin đi hỏi `state`** ("cho
tôi giá trị"), và mọi phép *ghi* (nếu khai `var`) cũng được chuyển cho `state` xử lý. `state` gọi là
**delegate** (bên uỷ quyền) — nó kiểm soát hành vi đọc/ghi, không phải chỉ là "bí danh" của biến.
Điểm phân biệt quan trọng: *bí danh* là hai tên cho cùng một chỗ nhớ; *uỷ quyền* là hai cơ chế — đọc
`count` là một lời hỏi được chuyển tiếp, và bên nhận được quyền làm gì đó trước/trong/sau khi trả
giá trị (tính lại, ghi nhớ, phát thông báo…). Chính chỗ "làm gì đó" là nơi Compose cài viễn cảnh
"UI biết state đổi".

### Phân biệt với `val x = state.value` lần cuối, bằng hành vi

- `val x = state.value` — *đọc một lần, gán kết quả*. Sau đó `x` là giá trị tĩnh; state đổi, `x`
  không đổi theo.
- `val x by state` — *mỗi lần đọc `x` là một lần hỏi `state`*. Chuyện gì xảy ra ở từng lần hỏi
  (trả giá trị mới? giá trị cũ? thông báo ai đó?) do delegate quyết định.

Vì thế đừng dịch `by` thành "bằng" hay "= ". Dịch sát nghĩa: **"việc đọc/ghi tên này, giao cho
bên sau chữ `by` lo."**

Chưa dạy ở đây, có chủ đích: cơ chế *làm sao* một object trở thành delegate được (các hàm toán tử
`getValue`/`setValue`, giao diện `ReadOnlyProperty`…) — ngoài phạm vi nền tảng. Bạn chỉ cần nhận ra
`by` và dịch đúng câu trên.

---

## Phần 8 — Mối nối Compose: `by remember { mutableStateOf(...) }`

Bây giờ đọc lại đúng dòng bạn đã *nhìn qua* ở Chương 3, lần này tách rõ hai tầng:

```kotlin
var name by remember {
    mutableStateOf("")
}
```

| Mảnh | Thuộc về | Vai trò ở mức đọc |
|---|---|---|
| `var` | **Kotlin** | Khai biến cho phép *ghi* — cần `var` (không phải `val`) vì code sẽ gán lại `name` khi người dùng gõ. |
| `by` | **Kotlin** | Uỷ quyền việc đọc/ghi thuộc tính `name` cho object bên phải — đúng cơ chế Phần 7. |
| `{ mutableStateOf("") }` | **Kotlin** (lambda) | Một lambda không tham số, trả về object state — nhớ lại lambda và trailing lambda từ F1. |
| `remember { ... }` | **Compose** | API của Compose: tạo object một lần và *nhớ nó qua các lần vẽ lại*. |
| `mutableStateOf("")` | **Compose** | API của Compose: tạo "ô nhớ có thông báo" — khi giá trị đổi, Compose biết và vẽ lại chỗ đang đọc nó. |

Đọc khối code bằng hai tầng Kotlin/Compose tách bạch: **Compose cung cấp một object state có hành vi
đặc biệt; Kotlin `by` là cơ chế giúp code của bạn đọc/ghi nó như một biến thường.**

Không uỷ quyền thì sao? Về khái niệm, object state *phơi* giá trị của nó qua một thuộc tính `.value`:

```kotlin
// Tượng trưng cho hình dạng bên dưới (không phải code bạn sẽ viết):
val nameState = remember { mutableStateOf("") }

// đọc:
println(nameState.value)
// ghi:
nameState.value = "Mới"
```

Với `by`, code của bạn đọc/ghi `name` — mọi phép đọc/ghi được chuyển tiếp cho object state, nơi nó
tự xử lý (kể cả việc "nói cho Compose biết có gì vừa đổi"). Câu chính xác cần nhớ: **uỷ quyền giúp
việc đọc/ghi diễn ra như biến thường; hành vi "thông báo UI vẽ lại" nằm ở object state (Compose),
không nằm ở chữ `by`** — `by` chỉ là đường chuyển tiếp.

Một chi tiết từ Chương 3 giờ có lời giải ở mức nhận diện: vì sao thiếu
`import androidx.compose.runtime.getValue` (và `setValue` khi dùng `var`) là lỗi? Vì Compose *cung
cấp* khả năng uỷ quyền qua một bộ hàm hỗ trợ của Kotlin; thiếu import là thiếu bộ chuyển tiếp đó.
Bạn không cần biết chữ ký hàm — chỉ cần nhớ: **uỷ quyền cần bên uỷ quyền hỗ trợ, hỗ trợ đó nằm
trong import.**

Dừng lại đúng chỗ: cách object state hoạt động bên trong (recomposition, state hoisting, snapshot)
là nội dung phần State & kiến trúc. Ở đây mục tiêu chỉ là: *nhìn dòng `var x by remember {...}` và
kể đúng tên từng mảnh, biết mảnh nào là Kotlin mảnh nào là Compose.*

> **Tự kiểm tra 4.** Trong `var chatInputText by remember { mutableStateOf("") }`, mảnh nào là Kotlin,
> mảnh nào là Compose?  1. `by` — Kotlin  2. `remember` — Kotlin  3. `mutableStateOf` — Compose
> 4. `var` — Compose
>
> *(Đáp án: 1 và 3. `remember` và `mutableStateOf` là API Compose; `var` và `by` là từ khoá Kotlin.)*

---

## Phần 9 — Cùng cơ chế,delegate khác: `by preferencesDataStore(...)`

Để chứng minh `by` là **của Kotlin, không phải của Compose**, đây là hình dạng bạn sẽ gặp ở phần Dữ
liệu cục bộ:

```kotlin
val Context.dataStore by preferencesDataStore(
    name = "settings"
)
```

Ở mức này, chưa cần hiểu `Context` là gì (Android sẽ dạy), chưa cần biết DataStore là gì (phần Dữ
liệu cục bộ sẽ dạy), và chưa cần học *extension property* — thuộc tính được "gắn thêm" vào kiểu có
sẵn từ bên ngoài (Kotlin sẽ gloss khi lần đầu dùng thật). Cái cần thấy chỉ có vậy:

- **Cú pháp `by` y hệt Phần 7** — cùng một cơ chế ngôn ngữ Kotlin.
- Chỉ khác **bên uỷ quyền**: lần này delegate là `preferencesDataStore(...)` — một object lo việc
  tạo/quản lý kho lưu trữ thay vì một state giao diện.
- Nói một câu theo đúng nghĩa: *"việc tạo và giữ `dataStore` này, tôi giao cho
  `preferencesDataStore` lo"* — mỗi lần truy cập `dataStore` là một lần hỏi delegate, và delegate
  bảo đảm hành vi đúng (không tạo bản mới lung tung, tạo đúng một kho với tên đó).

Đây cũng là ví dụ cho kỹ năng đọc tổng: gặp `by` ở bất kỳ đâu, câu hỏi đúng luôn là *"bên uỷ quyền
ở đây là ai, và nó kiểm soát hành vi đọc/ghi ra sao?"* — câu hỏi đó dẫn bạn tới đúng tài liệu của
phần tương ứng.

---

## Phần 10 — Sealed state: một họ trạng thái có giới hạn

### Vấn đề trước cú pháp

Một màn hình chat tại một thời điểm chỉ có thể đang ở **một** trong vài tình huống: đang tải, tải
thành công (có dữ liệu), hoặc tải lỗi. Cách viết bằng boolean rời rạc:

```kotlin
// Cách "ba boolean" — làm được, nhưng dễ hỏng:
var isLoading = false
var hasError = false
var hasData = false
```

Vấn đề của cách này không phải là *không chạy được*, mà là nó **không diễn đạt được ràng buộc**: three
booleans tạo ra tám tổ hợp, trong đó chỉ có ba tổ hợp có nghĩa (`isLoading` và `hasError` cùng true
nghĩa là gì?). Mỗi chỗ đọc code phải tự nhớ (hoặc tự đoán) rằng các boolean này *loại trừ nhau*, và
mỗi chỗ ghi code có thể vô tình tạo ra tổ hợp vô nghĩa.

Cách Kotlin diễn đạt đúng ý: một kiểu đại diện cho *họ trạng thái khép kín*:

```kotlin
sealed interface UiState

object Loading : UiState

data class Success(
    val messages: List<Message>
) : UiState

data class Error(
    val message: String
) : UiState
```

Đọc từng mảnh — chỉ cần nhận diện, không sâu hơn:

- **`sealed`** — từ khoá nói: *"họ kiểu bên dưới này là có giới hạn, được khai báo rõ tại đây."*
  Nghĩa chính xác: mọi biến thể của `UiState` phải được khai báo trong cùng nơi Kotlin kiểm soát
  (cùng file/module với khai báo sealed). Ranh giới của họ kiểu là **chủ ý của người viết**, không
  phải ai ở đâu cũng đẻ thêm biến thể được.
- **`interface`** — ở đây chỉ cần đọc là *"một kiểu chung đặt tên cho cả họ"*: `UiState` là cái tên
  để chỉ *bất kỳ* trạng thái nào trong họ. (Interface trong Kotlin có đời sống sâu hơn — không nằm
  trong bài này.)
- **`class Loading : UiState`** — một biến thể của họ, không mang dữ liệu. Chú ý dấu `:` — trong
  ví dụ này nghĩa là *"kiểu bên trái thuộc họ kiểu bên phải"* (Loading là một UiState). Đây là *toàn
  bộ* ý nghĩa của `:` mà bài này dùng; kế thừa sâu hơn không dạy ở đây.
- **`object Loading`** — từ khoá `object` khai *một bản duy nhất tồn tại sẵn* của kiểu đó: không cần
  `Loading()`, dùng thẳng tên `Loading`. Vì "đang tải" không cần dữ liệu gì, cả app chỉ cần đúng một
  giá trị Loading. Nhận diện được vậy là đủ — pattern singleton sâu hơn không dạy ở đây.
- **`data class Success(...) : UiState`** — biến thể *có mang dữ liệu* (danh sách tin nhắn), và nó
  vẫn là data class đầy đủ: `==` theo giá trị, `copy`, destructuring — đúng như Phần 2–5.

Cách đọc mô hình này — điểm quan trọng nhất của phần: **biến state có kiểu `UiState`, và tại mỗi
thời điểm nó giữ đúng *một* biến thể, biến thể nào thì mang đúng dữ liệu của biến thể đó.**
`Loading` không thể "đồng thời" chứa tin nhắn; `Error` bắt buộc mang thông báo lỗi; dữ liệu chỉ tồn
tại khi `Success`. Ràng buộc trước đây phải *nhớ trong đầu* (booleans loại trừ nhau) giờ được *viết
vào kiểu* — trình biên dịch kiểm tra giúp bạn.

So sánh hai cách mô tả cùng một màn hình:

```kotlin
// Boolean rời: đọc code phải tự ghép, ghi code có thể tạo tổ hợp vô nghĩa
if (isLoading) ... else if (hasError) ... else if (hasData) ...

// Sealed state: một giá trị, một biến thể tại một thời điểm — các nhánh trùng khớp họ kiểu
val state: UiState = ...
```

(Thao tác *rẽ nhánh* trên sealed state — cấu trúc `when` của Kotlin — là công cụ tự nhiên đi kèm;
`when` **không** phải mục tiêu học của bài này: khoá sẽ gloss nó đúng chỗ dùng đầu tiên. Ở đây chỉ
cần mô hình dữ liệu: *một giá trị, một biến thể, họ có giới hạn.*)

Một cảnh báo chính xác: sealed kiểm soát **họ biến thể được phép khai báo**, không kiểm soát số
*lần tạo object*: bạn có thể có nhiều giá trị `Success` với dữ liệu khác nhau — chúng là các giá trị
riêng của cùng một biến thể. "Chỉ một object tồn tại" là nhầm với `object`; sealed nói về *giới hạn
biến thể*, không phải *số lượng instance*.

> **Tự kiểm tra 5.** Với họ `UiState` ở trên, câu nào đúng?
> 1. `Success(listOf(...))` tạo được nhiều giá trị khác nhau  2. Có thể thêm biến thể `class Timeout :
> UiState` trong file khác  3. `Loading` cần gọi `Loading()` để có bản dùng  4. `Error("404")` mang
> theo dữ liệu
>
> *(Đáp án: 1 và 4. Dòng 2 sai — sealed giới hạn nơi khai báo biến thể. Dòng 3 sai — `object` dùng
> thẳng tên, không tạo bản mới.)*

**Bạn sẽ gặp ở đâu:** đúng họ `UiState` này (Loading/Success/Error) là hình mẫu trung tâm của phần
State & kiến trúc và phần Mạng. Từ bây giờ, mỗi lần thấy `sealed interface UiState` bạn đã biết:
đây là *danh sách các trạng thái hợp lệ của một màn hình, viết ra thành kiểu*.

---

## Phần 11 — Ghép F1 + F2: một ví dụ không dùng Android API

Tất cả công cụ từ hai bài nền tảng, ghép thành một mô hình hoàn chỉnh — không một dòng Android:

```kotlin
// F2: data class + List<T>
data class Message(
    val text: String,
    val isMine: Boolean
)

// F2: sealed state — họ trạng thái của một "màn hình chat" giả lập
sealed interface ChatUiState

object Loading : ChatUiState

data class Loaded(
    val messages: List<Message>
) : ChatUiState

data class Failed(
    val reason: String
) : ChatUiState

fun describe(state: ChatUiState): String =
    if (state is Loaded) {
        val messages = state.messages             // is-kiểm tra rồi truy cập thuộc tính
        val mine = messages.filter { it.isMine }  // F1: filter + it
        "${messages.size} tin — ${mine.size} của tôi"
    } else if (state is Failed) {
        state.reason
    } else {
        "Đang tải…"
    }

fun demo() {
    val initial = Loaded(emptyList())             // một biến thể, rỗng
    val received = initial.copy(                  // F2: copy — tạo bản mới
        messages = listOf(
            Message("Chào!", true),
            Message("Học Kotlin nhé", false)
        )
    )
    println(describe(received))                   // "2 tin — 1 của tôi"
    println(received == Loaded(                   // F2: so theo giá trị
        listOf(Message("Chào!", true), Message("Học Kotlin nhé", false))
    ))                                            // true
}
```

Đọc lại và tự điểm danh: data class, sealed họ, `object` biến thể rỗng, `List<Message>`,
`copy`, so sánh theo giá trị — và từ F1: tham số có kiểu, expression body, lambda + `it`,
string template, `size`. Hai cấu trúc Kotlin nhỏ được gloss một câu: `state is Loaded`
(toán tử `is` — "giá trị có thuộc biến thể Loaded không") và `emptyList()` (hàm tạo List rỗng,
cùng họ với `listOf` đã biết). Không một dòng nào cần Android.

---

## Phần 12 — Bài kiểm tra cuối: đoạn code "kiểu Compose"

Đoạn dưới đây là *hình dạng* code Compose thật — và theo thiết kế của bài kiểm tra này, **mọi cấu
trúc Kotlin trong đó đều đã được dạy ở F1 hoặc F2**. Nhiệm vụ: chỉ ra từng mảnh và phân loại Kotlin
hay Compose. Lời giải nằm ngay dưới.

```kotlin
sealed interface NoteUiState

object Loading : NoteUiState

data class Ready(
    val notes: List<Note>
) : NoteUiState

data class Note(
    val id: Int,
    val title: String,
    val done: Boolean
)

fun noteTitleOf(state: NoteUiState): String? =
    if (state is Ready && state.notes.size > 0) state.notes[0].title else null

fun notesScreen() {
    var state by remember { mutableStateOf<NoteUiState>(Loading) }

    val firstTitle: String? = noteTitleOf(state)

    Button(onClick = {
        if (state is Ready) {
            val current = state as Ready
            state = current.copy(
                notes = current.notes.filter { !it.done }
            )
        }
    }) {
        Text(text = firstTitle ?: "Chưa có ghi chú")
    }
}
```

Điểm danh từng mảnh:

- **Kotlin (F2):** `sealed interface NoteUiState`; `object Loading`; `data class` `Ready`, `Note`;
  `:` nghĩa "thuộc họ kiểu" tại hai chỗ khai biến thể; `List<Note>` và `mutableStateOf<NoteUiState>`
  (generic recognition); `by` (uỷ quyền đọc/ghi `state` cho object Compose); `copy(...)` tạo state
  mới.
- **Kotlin (F1):** `var`/`val`, kiểu trả về `String?`, nullability `?:`, lambda `{ ... }` làm tham số,
  trailing lambda (`Button(...) { Text(...) }`), `it`, `filter`, string template, expression body,
  `if`/`else if`, index `notes[0]`, `size`.
- **Compose (chưa học — sẽ học ở Stage Compose):** `@Composable` (ẩn trong chữ ký thật của
  `notesScreen`), `remember`, `mutableStateOf`, `Button`, `Text`, `onClick` như một thuộc tính kiểu
  `() -> Unit`.

Hai mảnh Kotlin nhỏ xuất hiện lần đầu và được gloss đúng một câu ngay trong đoạn, không mở rộng:

- `state is Ready` — **toán tử `is`**: hỏi *"giá trị này có thuộc biến thể `Ready` không?"* (đúng
  hay sai). Nó là công cụ tự nhiên khi đọc sealed state; khoá sẽ dùng lại nó ở các bài sau, và
  `when` đi kèm sẽ được gloss tại chỗ dùng đầu tiên — `is` không phải mục tiêu học mới của bài này.
- `state as Ready` — **toán tử `as`**: *chuyển cách nhìn* giá trị sang biến thể đó, để truy cập được
  `current.notes`. Cặp `is`-kiểm-tra-then-`as` (kiểm tra rồi mới chuyển) là cách đọc an toàn; các
  biến thể khác của `as` (như `as?`) không dùng ở đây và chưa cần biết.

Đó là **toàn bộ** số cấu trúc Kotlin của đoạn — không có `let`, `run`, `apply`, `also`, `ifEmpty`,
`takeIf`, `as?`, `return@`, `when`, hay extension function nào. Bản chất kiểm tra: **bạn không cần
hiểu Compose làm gì, nhưng phải gọi đúng tên từng cấu trúc Kotlin.** Nếu làm được, F1 + F2 đã hoàn
thành việc của chúng — phần còn lại của code Android là khái niệm, và khái niệm sẽ được dạy ở từng
bài riêng.

---

## Cạm bẫy

**1. Coi `copy(...)` là "sửa bản gốc".** `copy` luôn tạo giá trị mới; bản gốc nguyên vẹn. Nhầm hai
điều này dẫn tới code "đổi state mà UI không cập nhật" hoặc hai biến trỏ hai giá trị không như mong
đợi. Quy tắc đọc: sau `val x = y.copy(...)`, `y` y như cũ, `x` là bản mới.

**2. Tưởng `copy` là nhân bản sâu.** `copy` chép *giá trị các thuộc tính*; object bên trong mà thuộc
tính trỏ tới (một danh sách thay đổi được, một object khác) không được nhân bản — hai bản vẫn chia
sẻ nó. Với data class toàn `val` và List chỉ-đọc như code Android thường dùng, hiếm khi thành vấn
đề; chỉ đừng tưởng nó "deep".

**3. Nhầm `List<Message>` với "cú pháp List đặc biệt".** Ngoặc nhọn chỉ khai báo *loại bên trong
hộp*. Không có "List kiểu Message riêng" — chỉ có List, và trình biên dịch biết phần tử là gì.

**4. Tưởng `by` là từ khoá của Compose.** `by` là Kotlin thuần — gặp ở `by remember`, `by
preferencesDataStore`, `by viewModels()`: cùng một cơ chế, khác delegate. Khi thấy `by`, hỏi: "bên
uỷ quyền là ai?"

**5. Tưởng thuộc tính uỷ quyền chỉ là "bí danh".** Bí danh = hai tên, một chỗ nhớ. Uỷ quyền = mỗi
phép đọc/ghi là một lời chuyển tiếp cho delegate, và delegate có hành vi riêng (tính lại, ghi nhớ,
thông báo). Chính hành vi đó là chỗ sức mạnh nằm — nên cũng là chỗ dễ hiểu sai nếu nghĩ "chỉ là
cách viết gọn".

**6. Tưởng `sealed` nghĩa là "chỉ một object tồn tại".** Sealed giới hạn *họ biến thể được khai báo
ở đâu*; không giới hạn số instance. `Success` tạo được bao nhiêu giá trị cũng được. "Một bản duy
nhất" là chuyện của `object` — và đó là *một* cách khai báo, không phải ý nghĩa của sealed.

**7. Destructuring giá trị nhiều trường.** `val (a, b, c, d, e) = bigObject` đọc không biết a là gì
và lệch thứ tự thì nhận nhầm dữ liệu mà không có lỗi. Từ ~4 trường trở lên: dùng truy cập thuộc tính
trực tiếp.

**8. Đọc `data class` như "class dành cho database".** `data class` là công cụ Kotlin tổng quát cho
*giá trị dữ liệu* — dùng cho UI model, state, network model, database model như nhau. Không gắn với
bất kỳ tầng kiến trúc nào.

---

## Tóm tắt

1. `class Message(val text: String, …)` định nghĩa kiểu; tham số khởi tạo có `val`/`var` trở thành
   thuộc tính của object; tạo object bằng cú pháp gọi `Message(...)`.
2. `data class` = class dữ liệu với ba món làm sẵn: so sánh theo **giá trị**, `toString` đọc được,
   `copy(...)` + destructuring.
3. `a == b` với data class so thuộc tính-cờ-tuộc-tính — hai lần tạo, nội dung khớp thì bằng.
4. `copy(isMine = true)` tạo giá trị mới; bản gốc không đổi; tham số không truyền giữ nguyên. Copy
   là nông đối với object bên trong thuộc tính trỏ tới.
5. Destructuring `val (a, b) = value` đặt tên theo *thứ tự* thuộc tính; tiện ở 2–3 trường, bỏ qua
   khi nhiều hơn.
6. Generic: `Hộp<Loại-bên-trong>` — `List<Message>`, `MutableStateFlow<UiState>`, `Result<T>`;
   `T` là placeholder được cung cấp ở chỗ dùng. Chỉ cần đọc được ngoặc nhọn.
7. `by` = uỷ quyền việc đọc/ghi thuộc tính cho một delegate; không phải gán, không phải bí danh;
   mỗi lần truy cập là một lời chuyển tiếp mà delegate kiểm soát hành vi.
8. `var name by remember { mutableStateOf("") }`: `var` + `by` + lambda là **Kotlin**;
   `remember` + `mutableStateOf` là **Compose**; hành vi "thông báo vẽ lại" nằm ở object state.
9. Sealed state: một kiểu đại diện cho *họ trạng thái khép kín*; một giá trị state giữ đúng một biến
   thể tại một thời điểm; thay ba boolean rời bằng một `UiState` — ràng buộc được viết vào kiểu.
10. `object` = khai một bản duy nhất dùng thẳng tên; dùng cho biến thể không mang dữ liệu.

---

## Editorial taxonomy correction

> **Nội dung biên tập nội bộ — KHÔNG đưa vào bài học cho người học.**

- `when` = **STAY JIT, KHÔNG phải F2.** Bài này KHÔNG dạy `when` và KHÔNG dùng `when` trong ví dụ;
  nó chỉ được nhắc tên một lần trong Phần 10/12 như "công cụ rẽ nhánh tự nhiên đi kèm sealed state,
  khoá sẽ gloss tại chỗ dùng". Đối chiếu F1: F1 cũng không dạy `when` — nhất quán.
- Inheritance deep-dive = **ngoài Foundation.** `:` chỉ được gloss đúng một ý trong Phần 10:
  "kiểu bên trái thuộc/triển khai họ kiểu bên phải". Không dạy hierarchy/overriding/polymorphism/
  abstract.
- Extension functions/properties = **STAY JIT.** `val Context.dataStore` được dán nhãn rõ "đây là
  extension property — sẽ gloss khi dùng thật ở phần Dữ liệu cục bộ", không giải thích cơ chế.
- Scope functions (`let`, `run`, `apply`, `also`) = **STAY JIT.** Không xuất hiện trong bài học và
  không xuất hiện trong canonical snippet Phần 12.
- `ifEmpty` = **JIT tại lần dùng thật đầu tiên**, không phải chủ đề Foundation. (F1 preview có nhắc
  với nhãn "chưa học" — hợp lệ vì đó là preview có chủ đích; F2 canonical snippet không chứa.)
- `is`/`as` = **recognition-level, gloss 1 câu có nhãn** trong Phần 11–12 vì sealed-state kiểm tra
  tự nhiên cần chúng; KHÔNG mở rộng (`as?`, `!is`, `when`-subject không dùng); không đưa vào mục
  tiêu học chính thức.
- `return@`/labeled return = **STAY JIT.** Bản canonical của snippet kiểm tra không dùng — được rút
  trong đợt Foundation-pair gate (trước đây bản nháp dùng `as? Ready ?: return@Button`; đã thay
  bằng `is`-kiểm tra + `as`, mọi cấu trúc còn lại thuộc F1/F2).

## Editorial migration notes

> **Nội dung biên tập nội bộ — KHÔNG đưa vào bài học.** Khác với F1: mục này KHÔNG ghi sửa đổi
> hiện tại (task này cấm đụng bài đã có); đây là bản phân loại để đối soát chung khi F1+F2 review
> cùng nhau.

### A. F2 proper — vật liệu hiện có đúng là nội dung F2, F2 dạy đầy đủ

| Vật liệu hiện có | Nơi ở | F2 dạy gì thêm |
|---|---|---|
| Bảng 3 thành phần `mutableStateOf`/`remember`/`by` ("nếu bỏ đi thì sao") | Ch03_1 mục 5.2 | Phần 7–8 dạy `by` ở mức Kotlin độc lập, rồi nối lại đúng bảng đó. |
| Bẫy thiếu `import getValue/setValue` | Ch03_1 mục 5.2 | Phần 8 giải thích ở mức nhận diện: "uỷ quyền cần bộ hỗ trợ nằm trong import". |
| `by preferencesDataStore` + giải thích "giao cho delegate lo" + bẫy khởi tạo lại | Ch09 (dòng ~708–718) | Phần 9 dùng đúng ví dụ đó làm payoff thứ hai; Ch09 giữ ngữ cảnh DataStore. |
| data class RecipeDb/IngredientDb + `@Entity` | Ch10_2 | Phần 2–4 dạy nền chung; Ch10_2 giữ ngữ cảnh Room. |
| Note "sealed class hoặc Int? nói rõ ý định hơn" | Ch10_4 (dòng ~237) | Phần 10 dạy khái niệm đầy đủ; Ch10_4 giữ note "nhận biết chỗ có thể làm tốt hơn". |
| `List<MessageUiModel>` trong ConversationUiState | Ch06 | Phần 6 generic recognition dùng hình dạng tương tự. |

### B. Payoff Android/Compose-only — không phải Kotlin nền, giữ nguyên chỗ cũ

| Vật liệu | Nơi ở | Lý do |
|---|---|---|
| `mutableStateOf` tạo "ô nhớ có thông báo", recomposition | Ch03_1 mục 5.2, Ch06 | Concept Compose/state — dạy ở Stage Compose & State. |
| `rememberSaveable`, `stateSaver` | Ch06 | API Compose. |
| `DataStore<Preferences>`, `stringPreferencesKey` | Ch09 | API Android — phần Dữ liệu cục bộ. |
| `@Entity`, `@Dao`, Room | Ch10_2 | Framework Android. |
| `Context` | Ch09, Ch03_3 | Android framework — F2 chỉ dán nhãn, không dạy. |

### C. Vẫn JIT — không thuộc F1/F2

| Chủ đề | Trạng thái hiện tại |
|---|---|
| `when` | Ch03_4 có gloss nhận diện "sẽ học kỹ ở phần Nền tảng" — khi F2 live cần *đổi chữ đích*: F2 không dạy `when`, gloss nên trỏ "khoá sẽ gloss khi dùng" hoặc bài Kotlin/theme cụ thể (xem D.3). |
| Extension property (`Context.dataStore`) | Ch09 gloss tại chỗ — giữ nguyên. |
| `is`/`as?`/`return@`, destructuring trong `for` | Các bài sau gloss tại chỗ dùng. |
| Scope functions, `ifEmpty` | JIT tại lần dùng đầu. |
| `ComponentActivity : ...`, `override`, `super` | Ch03_1 bảng onCreate — giữ nguyên (Android/OOP-specific). |

### D. Ứng viên đơn giản hoá khi F2 live

1. **Ch03_1 mục 5.2 bảng `by`** — dòng "Cú pháp property delegate của Kotlin: cho phép viết
   `chatInputText` thay vì `chatInputText.value`": khi F2 đứng trước, rút về 1 câu trỏ Nền tảng
   ("cơ chế `by` đã dạy ở phần Nền tảng Kotlin — đây là delegate của Compose"), giữ nguyên cột
   "nếu bỏ đi thì sao" và bẫy import. Không xóa bảng.
2. **Ch09 đoạn `by` (~dòng 708)** — "Bạn đã gặp `by` ở chapter 6…": đổi tham chiếu về "phần Nền
   tảng Kotlin (F2)" thay vì "chapter 6" sau khi hai bài live; giữ giải thích DataStore-specific
   (lý do không được khởi tạo lại).
3. **Ch03_4 gloss `when`** — bỏ cụm "sẽ học kỹ ở phần Nền tảng" (F2 không dạy `when`); thay bằng
   "khoá sẽ giải thích tại chỗ dùng" hoặc trỏ bài cụ thể nếu khi đó có primer. Đây là chỉnh *văn
   bản đích của forward-ref*, không đụng nội dung `when`.
4. **Ch06** các dòng `var x by rememberSaveable...` — giữ nguyên code; khi review có thể thêm 1 câu
   "cơ chế `by` đã học ở Nền tảng" nếu bài còn cảm giác nặng gloss.
5. **Ch10_4 note sealed** — giữ nguyên; chỉ cân nhắc nối thêm "(khái niệm sealed đã dạy ở phần Nền
   tảng Kotlin)" khi F2 live.

### Ghim cho "Cần biết trước" các bài sau

Stage Compose (C1+) và Stage State (S2+) nên liệt kê tiên quyết "Nền tảng Kotlin F1–F2" cho:
data class, `by`, sealed, generics — thay vì gloss lại; tương tự F1 cho val/fun/lambda/`?.`.

## Final readability-test inventory

> **Kiểm tra nội bộ của snippet Phần 12 (bản canonical — sạch, KHÔNG dùng `as?`/`return@`).**
> Yêu cầu: 0 cấu trúc Kotlin chưa dạy.

| Cấu trúc trong snippet | Phân loại |
|---|---|
| `sealed interface NoteUiState` | F2 (Phần 10) |
| `object Loading` | F2 (Phần 10, gloss `object` 1 câu) |
| `data class Ready/Note`, tham số khởi tạo, thuộc tính `val` | F2 (Phần 1–2) |
| `: NoteUiState` trên biến thể | F2 (Phần 10, gloss `:` 1 ý) |
| `List<Note>` | F2 (Phần 6) |
| `mutableStateOf<NoteUiState>(Loading)` — ngoặc nhọn generic | F2 (Phần 6) |
| `by` trong `var state by remember {...}` | F2 (Phần 7–8) |
| `copy(notes = ...)` | F2 (Phần 4) |
| `var`/`val`, expression body, kiểu `String?` | F1 (Phần 1–3) |
| `if (state is Ready && ...)` — `is` | gloss 1 câu trong bài (Phần 12) — ngoài nền tảng nhưng được gloss có nhãn |
| `state as Ready` — `as` | gloss 1 câu trong bài (Phần 12) — được dạy như cặp is-then-as; `as?` KHÔNG dùng |
| `&&` (and logic) | gloss 1 câu trong bài (Phần 12) — "và; cả hai điều kiện cùng đúng" |
| `notes[0]`, `size`, `filter { !it.done }` | F1 (Phần 4–5); `!` phủ định logic xuất hiện từ ví dụ `!it.isMine` |
| `?:`, trailing lambda, lambda/it, string template, `if`/`else` | F1 (Phần 3–6) |
| `remember`, `mutableStateOf`, `Button`, `Text`, `onClick`, `@Composable` | Compose-specific — dán nhãn rõ, không phải Kotlin nền |

**Danh sách loại trừ được xác minh:** đoạn canonical KHÔNG chứa `let`, `run`, `apply`, `also`,
`ifEmpty`, `takeIf`, `as?`, `return@`/labeled return, `when`, extension function/property,
operator overloading, coroutine syntax. Hai ví dụ trước (bản nháp đầu của Phần 12 và Phần 11)
đã được rút gọn trong đợt đối soát Foundation-pair để đoạn kiểm tra đạt chuẩn "0 cấu trúc chưa
dạy" mà không phải mở rộng phạm vi F1/F2 (chỉ thay `isNotEmpty()` → `size > 0`, bỏ `as?`/`return@`
trong Phần 12, bỏ destructuring một-dòng trong Phần 11 — thay bằng truy cập thuộc tính trực tiếp
sau `is`-kiểm tra).

**Verify criterion:** người học đọc snippet Phần 12 và gọi đúng tên **từng** cấu trúc Kotlin
(F1 + F2 + `is`/`as`/`&&` được gloss đúng một câu có nhãn ngay trong bài), tách bạch phần
Compose → **PASS**.

## Sources for future Nguồn block

> Tài liệu tham khảo khái niệm — KHÔNG kèm số dòng, KHÔNG chế provenance từ sách cũ.

- Kotlin Docs (kotlinlang.org) — *Classes* (constructor properties), *Data Classes* (equality,
  `copy`, destructuring), *Object & `object` declarations*.
- Kotlin Docs — *Generics: Type Parameters* (`List<T>` recognition).
- Kotlin Docs — *Delegated Properties* (`by`, `by lazy`/delegates overview — chỉ khái niệm, không
  giao thức operator) và *Delegation* (class delegation — không dùng).
- Kotlin Docs — *Sealed Classes/Interfaces*.
- Android Developers (developer.android.com) — *State and Jetpack Compose* (`by remember`/
  `mutableStateOf` payoff), *DataStore* (`preferencesDataStore` payoff). Hai nguồn này chỉ làm
  mối nối khái niệm; các API được dán nhãn "Compose/Android — sẽ học sau".
- Khoá học này: Ch03_1 (mục 5.2 — bảng `by remember` và bẫy import), Ch09 (đoạn `by`
  preferencesDataStore), Ch10_4 (note sealed) — nguồn tham chiếu ngữ cảnh payoff, không phải nguồn
  khái niệm.
