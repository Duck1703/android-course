# F1 — Kotlin đủ để học Compose, Phần 1

> **TRẠNG THÁI: DRAFT NỘI BỘ CHO BÀI HỌC TƯƠNG LAI.** File này KHÔNG phải trang site.
> Khi dựng bài chính thức (task IMP-043 trong `docs/COURSE_REDESIGN_IMPLEMENTATION_PLAN.md`),
> nội dung học nằm trong phần "Bài học" phía dưới; hai mục cuối file
> ("Editorial migration notes" và "Sources for future Nguồn block") là nội dung biên tập nội bộ,
> **không** đưa cho người học.
>
> Vị trí trong khoá: **Nền tảng, bài 1/2**, học ngay trước giai đoạn 1 (bài A1+).
> Phần 2 (F2) sở hữu: data class, `by` (property delegation), sealed-state, generics ở mức nhận diện.
> Bài này KHÔNG dạy Compose — chỉ dạy đúng số Kotlin cần để đọc code Compose mà không bỡ ngỡ.

---

# Bài học

## Mục tiêu — sau bài này bạn sẽ

- Đọc được một dòng khai báo Kotlin (`val`/`var`, kiểu tường minh hay suy luận) và nói được biến đó
  có được gán lại hay không.
- Đọc được một hàm Kotlin: tên, tham số, giá trị trả về — kể cả dạng viết gọn (expression body)
  và tham số mặc định/tham số đặt tên.
- Hiểu được `String?` nghĩa là gì, đọc được `?.` và `?:`, và biết vì sao **không** dùng `!!` để
  "im lặng" trình biên dịch.
- Làm được việc nhỏ với `List`: biến đổi từng phần tử bằng `map`, lọc bằng `filter`, ghép chuỗi bằng
  `joinToString`.
- Đọc được một lambda: nhận vào gì, trả về gì; hiểu được `it` là gì và không phải là gì; nhận ra
  cú pháp trailing lambda khi thấy ngoặc nhọn đứng ngoài ngoặc tròn.
- Nhận diện được kiểu hàm như `() -> Unit` hay `(String) -> Unit` — chỉ ở mức "đọc ra hình dạng",
  chưa cần viết các hàm bậc cao.
- Nhìn một đoạn code Compose 20–30 dòng và chỉ ra được những phần Kotlin đã học ở bài này, những
  phần chưa học (F2 sẽ dạy), và những phần là của Android/Compose (không phải Kotlin nền).

**Tại sao điều này quan trọng:** từ bài sau trở đi, gần như mỗi dòng code bạn gặp trong khoá là
Kotlin. Người mới hay bị kẹt không phải vì logic khó, mà vì *cú pháp* nhìn lạ: `?:`, `->`, `{ it }`,
trailing lambda. Học xong bài này, bạn đọc code Android/Compose mà cú pháp không còn là rào cản —
thứ còn lại để học là khái niệm, và khái niệm sẽ được dạy ở từng bài riêng.

**Cần biết trước:** chỉ cần biết "biến" và "if/else" là gì ở mức khái niệm lập trình chung.
Không cần biết Kotlin, Java, hay bất kỳ framework nào. Nếu bạn đã làm quen một ngôn ngữ khác
(Python, JavaScript), nhiều chỗ sẽ thấy quen — chỉ khác cách viết.

---

## Phần 1 — Giá trị và biến: `val`, `var`, và kiểu dữ liệu

### Vấn đề trước cú pháp

Mọi chương trình đều phải *nhớ* thứ gì đó: tên người dùng, số lần bấm, một chuỗi cần hiển thị.
Cái chỗ nhớ đó là **biến**. Trong Kotlin, tạo một biến bằng một dòng:

```kotlin
val name = "Duc"
```

Đọc dòng này theo từng mảnh:

| Mảnh | Nghĩa là gì |
|---|---|
| `name` | Tên của biến — nhãn để bạn dùng lại giá trị đó ở chỗ khác. |
| `"Duc"` | Giá trị được gán vào. Đặt trong dấu nháy kép → Kotlin hiểu đây là **chuỗi ký tự** (kiểu `String`). |
| `=` | Phép gán: "đưa giá trị bên phải vào chỗ nhớ mang tên bên trái". |
| `val` | Từ khoá khai báo: biến này **không được gán lại**. |
| *(không viết kiểu)* | Kotlin **tự suy ra** kiểu từ giá trị bên phải — đây là `String`, không cần bạn viết. |

Chuyện "Kotlin tự biết kiểu" gọi là **type inference** (suy luận kiểu). Bạn khai báo giá trị,
trình biên dịch nhìn vào giá trị mà kết luận kiểu — `val age = 26` suy ra `Int`, `val isLogged = true`
suy ra `Boolean`, `val name = "Duc"` suy ra `String`.

### `val` và `var`: một khác biệt, đúng một

Cặp từ khoá này giải quyết đúng một câu hỏi: *sau khi gán, tôi có được gán giá trị khác thay thế
không?*

```kotlin
val name = "Duc"
name = "Khác"   // ❌ KHÔNG compile được — val không cho gán lại

var count = 0
count = count + 1   // ✅ var cho phép gán lại
```

Đọc cẩn thận câu này, vì nó chính xác hơn nhiều người nghĩ:

> **`val`** cấm *gán lại chỗ nhớ đó*. Nó **không** hứa "giá trị bên trong sẽ không bao giờ đổi".

Ví dụ: một `val` trỏ tới một danh sách thì bạn vẫn có thể *thay đổi nội dung* danh sách đó (mục Phần 4
sẽ quay lại). Điều bị cấm chỉ là viết `name = <giá trị khác>` lần thứ hai. Vì vậy đừng dịch `val`
thành "hằng số" kiểu `const` của ngôn ngữ khác — dịch sát nghĩa hơn là **"gán một lần, rồi chỉ đọc"**
(read-only). `var` thì tự do gán lại bao nhiêu lần cũng được.

Vì sao Kotlin muốn bạn mặc định dùng `val`? Không phải để câu chữ đẹp: một biến không bao giờ bị
gán lại thì bạn đọc code ở đâu cũng biết chắc giá trị của nó — không cần lần theo cả hàm xem có chỗ
nào đổi nó không. Quy tắc thực dụng: **bắt đầu bằng `val`; chỉ chuyển sang `var` khi trình biên dịch
phàn nàn rằng bạn thật sự cần gán lại.** Trong code Compose bạn sẽ gặp tỷ lệ `val` áp đảo, trừ đúng
những chỗ state cần thay đổi.

> **Tự kiểm tra 1.** `var score = 10` rồi `val maxScore = score`. Dòng nào dưới đây compile được?
> 1. `score = 15`  2. `maxScore = 15`  3. Cả hai  4. Không cái nào
>
> *(Đáp án: chỉ dòng 1 — `score` là `var`; `maxScore` là `val` nên cấm gán lại dù nó được sao từ một
> `var`.)*

### Kiểu tường minh: khi nào thì viết ra?

Suy luận kiểu tiện, nhưng có lúc bạn muốn tự viết kiểu ra — bằng dấu hai chấm:

```kotlin
val username: String = "Duc"
```

Ba tình huống viết kiểu tường minh là hợp lý:

1. **Biến chưa có giá trị ngay lúc khai báo** — phải nói trước kiểu thì Kotlin mới biết chỗ nhớ này
   chứa gì (bài sau bạn sẽ gặp trường hợp này với biến state).
2. **Muốn ép việc:** giá trị bên phải là số nguyên nhưng bạn *muốn* nó là `Long` hay `Double` —
   viết kiểu ra là tuyên bố rõ ý mình.
3. **Làm tài liệu:** tên biến chưa rõ, kiểu hiện ra giúp người đọc. (Nhưng ưu tiên đổi tên biến
   trước khi phải resort tới ghi kiểu.)

Ngoài ba trường hợp đó, để Kotlin tự suy — code gọn hơn và vẫn an toàn tuyệt đối, vì suy luận kiểu
được kiểm tra lúc biên dịch chứ không phải "đoán mò lúc chạy".

### Các kiểu cơ bản bạn sẽ gặp suốt

| Kiểu | Chứa gì | Ví dụ |
|---|---|---|
| `String` | chuỗi ký tự, trong nháy kép | `"Xin chào"` |
| `Int` | số nguyên | `42` |
| `Double` | số thập phân | `3.14` |
| `Boolean` | đúng/sai | `true`, `false` |

Bốn kiểu này phủ phần lớn biến bạn gặp ở giai đoạn đầu. Kotlin cũng có `Long`, `Float`, `Char`… —
nhận ra tên là đủ, chưa cần học chi tiết.

Một chi tiết chạy suốt bài này, gặp ở mọi ví dụ tiếp theo:

```kotlin
val name = "Duc"
val greeting = "Xin chào $name"   // greeting == "Xin chào Duc"
```

Ký tự `$` đặt trong chuỗi nhúng giá trị của biến vào giữa chuỗi — gọi là **string template**.
Bạn sẽ thấy nó gần như mọi chuỗi trong code Android (nội dung tin nhắn, nhãn nút…). Có thể chèn cả
biểu thức: `"Tổng: ${a + b}"` — bọc trong `${ }` khi nhiều hơn một biến.

---

## Phần 2 — Hàm: đóng gói một việc để gọi lại

### Vấn đề trước cú pháp

Cùng một câu chào cần hiện ở ba chỗ khác nhau. Viết ba lần là ba chỗ phải sửa khi đổi lời chào.
Giải pháp mọi ngôn ngữ đều có: gói việc đó vào một **hàm** (function) đặt tên, rồi gọi tên ở mọi nơi.

```kotlin
fun greet(name: String): String {
    return "Xin chào $name"
}
```

Đọc từng mảnh — đây là khuôn mà mọi hàm Kotlin đều theo:

| Mảnh | Nghĩa là gì |
|---|---|
| `fun` | Từ khoá khai báo hàm. |
| `greet` | Tên hàm — thứ bạn gọi ở chỗ khác: `greet("Duc")`. |
| `(name: String)` | **Danh sách tham số**: hàm nhận vào một giá trị, gọi tạm là `name`, và giá trị đó phải là `String`. |
| `: String` *(sau ngoặc)* | **Kiểu trả về**: hàm này đưa ra một `String` cho người gọi. |
| `return "..."` | Lệnh trả kết quả về cho người gọi hàm. |

Gọi hàm thì đúng như bạn đoán: `greet("Duc")` trả về `"Xin chào Duc"`. Giá trị `"Duc"` được truyền
vào **tham số** `name` — nói cách khác, tham số là biến cục bộ của hàm, được gán giá trị ngay lúc gọi.

### Kiểu trả về `Unit`: "không có kết quả đáng kể"

Vì sao phải chú ý kiểu trả về? Vì nhiều hàm chỉ *làm việc* chứ không *cho lại kết quả* để dùng tiếp:

```kotlin
fun showWelcome(name: String): Unit {
    println("Chào $name, sẵn sàng học Kotlin!")
}
```

`Unit` là kiểu trả về của "hàm này không đưa ra kết quả đáng kể nào cho người gọi". Không bắt được
giá trị nào có nghĩa từ nó — gọi là xong việc. Kotlin cho phép bỏ luôn `: Unit`:

```kotlin
fun showWelcome(name: String) {        // Unit được hiểu ngầm
    println("Chào $name, sẵn sàng học Kotlin!")
}
```

Hai cách viết tương đương nhau. Chú ý chính xác: `Unit` *không* đơn thuần là "void" của Java/C —
nó là một *kiểu thật* có đúng một giá trị (cũng tên là `Unit`), vì vậy mọi hàm Kotlin đều trả về
*thứ gì đó*; với hàm không cần kết quả thì thứ đó là `Unit` và bạn gần như không bao giờ phải dùng
giá trị đó. Cách dịch bàng bản thân: **"hàm làm việc xong là xong, không có gì để nhận lại"**.
Từ khoá này bạn sẽ gặp lại sắp tới trong kiểu hàm `() -> Unit` (Phần 6) — vì thế đừng bỏ qua.

### Expression body: hàm một dòng viết kiểu một dòng

Nhiều hàm chỉ có đúng một dòng `return`. Kotlin cho phép bỏ cặp ngoặc nhọn và cả từ khoá `return`,
gán *biểu thức* thẳng vào hàm:

```kotlin
fun double(x: Int) = x * 2
```

Đọc là: "hàm `double` nhận một `Int` tên `x`, và *kết quả của hàm* chính là biểu thức `x * 2`".
Kiểu trả về cũng không cần viết — Kotlin suy ra `Int` từ biểu thức. Hai khai báo sau tương đương:

```kotlin
fun double(x: Int) = x * 2

fun double(x: Int): Int {
    return x * 2
}
```

Dạng gọn gọi là **expression body** (thân-hàm-dạng-biểu-thức); dạng ngoặc nhọn là **block body**.
Quy tắc chọn: việc gì tính ra một giá trị ngay → expression body; cần vài bước, vòng lặp, if/else
nhiều dòng → block body. Code Compose và code Android trong khoá dùng cả hai dạng liên tục, nên bạn
phải đọc trôi cả hai.

### Tham số mặc định: tham số "có thể không truyền"

Hàm càng nhiều tham số thì người gọi càng phải viết dài. Kotlin cho phép gán giá trị mặc định cho
tham số — ai không truyền thì dùng giá trị đó:

```kotlin
fun createMessage(
    text: String,
    isImportant: Boolean = false
): String {
    return if (isImportant) "❗ $text" else text
}
```

Giờ gọi được cả hai kiểu:

```kotlin
createMessage("Học Kotlin nhé")            // "Học Kotlin nhé"        — dùng mặc định false
createMessage("Đừng quên sync!", true)     // "❗ Đừng quên sync!"
```

### Tham số đặt tên: gọi hàm mà đọc hiểu ngay

Chữ `true` đứng thứ hai trong ví dụ trên có một vấn đề: người đọc phải *nhớ* tham số thứ hai của
`createMessage` là gì. Kotlin cho phép gọi kèm tên tham số:

```kotlin
createMessage(
    text = "Đừng quên sync!",
    isImportant = true
)
```

Cùng một ý nghĩa với cách viết theo thứ tự, nhưng đọc không cần mở định nghĩa hàm. Lợi ích thật
nổ ra khi hàm có nhiều tham số cùng kiểu:

```kotlin
// Không ai nhớ nổi true thứ hai nghĩa là gì:
sendNotification("Học Kotlin nhé", true, false)

// Gọi bằng tên thì tự giải thích:
sendNotification(
    text = "Học Kotlin nhé",
    showBadge = true,
    playSound = false
)
```

Một quy ước đáng nhớ: khi một tham số *đầu tiên* đã được gọi bằng tên, Kotlin yêu cầu các tham số
sau đó cũng gọi bằng tên (dùng vị trí xen lẫn tên sẽ báo lỗi trừ khi tên đứng sau vị trí đúng thứ tự).
Thực tế: hoặc toàn vị trí, hoặc toàn tên — code sạch hơn cả.

> **Tự kiểm tra 2.** Với hàm `fun send(msg: String, retry: Int = 3): Unit`, hai lời gọi nào sau đây
> hợp lệ?  1. `send("hi")`  2. `send("hi", 1)`  3. `send(msg = "hi")`  4. `send(retry = 1)`
>
> *(Đáp án: 1, 2, 3 đều hợp lệ — `retry` có mặc định nên được bỏ qua. Dòng 4 thiếu tham số bắt buộc
> `msg`, không compile được.)*

**Bạn sẽ gặp ở đâu:** mọi hàm Compose đều có tham số mặc định (màu, cỡ chữ, decoration…), và code
Android gọi hàm bằng tên tham số là thường — `Text(text = "...")`, `Button(onClick = { ... })`.
Hai phần này của Kotlin là "vé vào cửa" để đọc giao diện.

---

## Phần 3 — Null safety: khi giá trị có thể không tồn tại

### Vấn đề trước cú pháp

Có những giá trị *đôi lúc không tồn tại*: biệt danh của tài khoản (người dùng chưa đặt), ảnh đại
diện (chưa tải lên), tin nhắn đang soạn (chưa gõ gì). Trong Kotlin, tình huống "có thể không có
giá trị" được đưa thẳng vào hệ thống kiểu:

```kotlin
var nickname: String? = null
```

Đọc: biến `nickname` chứa một `String`, **hoặc** chứa `null` — cái đánh dấu "không có giá trị nào
cả". Dấu `?` bám đuôi kiểu (`String?`) là cách khai báo điều đó. Còn `String` (không có `?`) là
hứa hẹn *"biến này chắc chắn chứa một chuỗi, không bao giờ null"* — trình biên dịch sẽ bắt lỗi ngay
nếu bạn cố gán `null` vào `String` thường.

Chú ý chính xác: `nickname` không "rỗng" và cũng không "trống" — nó đang **chứa giá trị null**, tức
một giá trị đặc biệt nghĩa là *không có giá trị nào*. Phân biệt này quan trọng: chuỗi rỗng `""` là
một `String` thật có độ dài 0; `null` thì **không phải chuỗi**, không có độ dài, không gọi được gì
từ nó cả.

### `?.`: safe call — "nếu có thì làm, không có thì thôi"

Câu hỏi tự nhiên: nếu `nickname` có thể là `null`, làm sao hỏi "biệt danh dài mấy chữ?" mà không
làm vỡ chương trình? Gọi thẳng `nickname.length` sẽ không compile được — Kotlin cấm từ trước, vì
đó chính là nơi null làm crash.

Công cụ đầu tiên là **safe call** `?.`:

```kotlin
var nickname: String? = null

val length = nickname?.length
```

Đọc `?.` là: *"nếu bên trái có giá trị thật → gọi `.length` như thường; nếu là `null` → toàn bộ
biểu thức cho ra `null`, không gọi gì cả, không crash."*

Chú ý **kiểu kết quả**: `String` có `length` là `Int`, nhưng `nickname?.length` có kiểu là `Int?` —
vì kết quả hoặc là một số, hoặc là `null`. Safe call "lan truyền" tính được-null: mỗi lần thêm
`?.` là kết quả có thêm một lần *có thể* null. `nickname?.uppercase()?.length` cũng cho `Int?`.

### `?:`: Elvis operator — "không có thì dùng cái này"

`Int?` vẫn hơi khó dùng (một biến "có thể là số"). Thường bạn muốn *quyết định luôn*: nếu null thì
dùng giá trị thay thế. Đó là việc của **Elvis operator** `?:`:

```kotlin
var nickname: String? = null

val displayName = nickname ?: "Chưa có tên"
```

Đọc `?:` là: *"nếu bên trái có giá trị → dùng nó; nếu null → dùng bên phải."* Ở đây
`displayName` có kiểu `String` — chắc chắn không null, vì cả hai nhánh đều cho ra một chuỗi thật.
Ba dòng sau tương đương nhau, Elvis là cách gọn:

```kotlin
val displayName = nickname ?: "Chưa có tên"

// tương đương viết thường:
val displayName2 = if (nickname != null) nickname else "Chưa có tên"

// và còn kết hợp được:
val len = nickname?.length ?: 0     // "độ dài nếu có, ngược lại 0"
```

Cặp `?.` + `?:` là cặp ruột của Kotlin; trong code Android bạn sẽ thấy chúng dày đặc: đọc tham số
đích từ Intent, đọc setting, xử lý kết quả tra cứu… Nắm chắc hai ký hiệu này là bạn hoá giải được
phần lớn dấu hỏi đỏ thời mới học.

### Cạm bẫy: `!!` — và vì sao không nên

Kotlin còn một toán tử thứ ba liên quan tới null: `!!`. Nó nói với trình biên dịch: *"tôi bảo đảm
đây không phải null — cứ coi như có, và nếu tôi sai thì cho app crash."*

```kotlin
val length = nickname!!.length   // chạy được nếu nickname khác null…
                                  // …và CRASH (NullPointerException) nếu nó là null
```

Đừng dùng nó như một giải pháp thông thường. `!!` không xoá được vấn đề null — nó chỉ *chuyển lỗi
biên dịch thành lỗi lúc chạy*, trên máy người dùng thật, vào lúc không ai kiểm soát. Trong hầu hết
trường hợp, `?.` hoặc `?:` diễn đạt đúng ý hơn và an toàn hơn. Bạn có thể gặp `!!` trong code người
khác — đủ để *nhận ra*, nhưng hãy coi mỗi lần gặp như một nơi đáng nghi ngờ.

> **Tự kiểm tra 3.** Với `var city: String? = null`, biểu thức nào dưới đây cho ra kiểu `String`
> (không phải `String?`)?  1. `city`  2. `city?.uppercase()`  3. `city ?: "Không rõ"`
> 4. `city?.uppercase() ?: "Không rõ"`
>
> *(Đáp án: 3 và 4 — cả hai đều có nhánh "nếu null thì…" cho ra chuỗi thật. Dòng 1 là `String?`;
> dòng 2 là `String?` vì safe call giữ tính được-null.)*

**Chưa dạy ở đây, để bài sau:** `?` còn xuất hiện trong kiểu kiểu như `List<Recipe?>` hay `Bundle?`
gắn với class — cơ chế giống hệt, chỉ thêm chỗ khác; bạn đã đủ nền để đọc khi gặp. `!!` được nhắc
chỉ để bạn đừng bị sốc, không phải để dùng.

---

## Phần 4 — Collections: làm việc với một danh sách giá trị

### Vấn đề trước cú pháp

App luôn phải xử lý *một nhóm* thứ: danh sách món ăn, danh sách tin nhắn, danh sách tên. Kotlin gọi
chúng là **collection**, và ở giai đoạn này bạn chỉ cần một loại phổ biến nhất: **List** — danh sách
có thứ tự, phần tử đánh số từ 0.

```kotlin
val names = listOf("An", "Bình", "Chi")
```

`listOf(...)` tạo ra một List các chuỗi; Kotlin suy ra kiểu `List<String>`. Bạn đọc được số phần tử
(`names.size`), đọc phần tử theo vị trí (`names[0]` là `"An"` — vị trí gọi là *index*, đánh số từ 0),
và duyệt qua từng phần tử.

Một lưu ý chính xác nhưng dễ hiểu: biến `names` là `val`, nghĩa là *không gán lại được* — nhưng
"không gán lại" khác với "nội dung không đổi". Kotlin có hai mặt của chuyện này:

- Mức **tên**: `val` cấm gán `names = listOf(...)` khác. Luôn luôn.
- Mức **nội dung**: List mà Kotlin trả về từ `listOf` là một *giao diện chỉ-đọc* (read-only) nhìn từ
  tham chiếu này — bạn **không** có phương thức thêm/xoá/sửa trên nó (không `names.add(...)`), nên
  trong code thường nó hoạt động như bất biến. Kotlin còn có `MutableList` — bản có thật phương thức
  `add`/`remove` — nhưng ở giai đoạn này bạn gần như chỉ gặp và dùng List; gặp `MutableList` thì
  nhận ra tên là đủ.

Cách nói an toàn: **List là danh sách có thứ tự, đọc được theo index, và "chỉ đọc" từ phía bạn cầm —
muốn thay đổi nội dung thì tạo danh sách mới.** Tư duy "tạo bản mới thay vì sửa bản cũ" sẽ quay lại
liên tục trong Android (mục Phần 5 và các bài Compose sau).

### Ba việc làm với List suốt khoá: `map`, `filter`, `joinToString`

Toàn bộ phần này xoay quanh một List mẫu:

```kotlin
val names = listOf("An", "Bình", "Chi")
```

**`map` — biến mỗi phần tử thành một giá trị khác.**

```kotlin
val lengths = names.map { it.length }   // [2, 4, 3]
```

`map` chạy qua **từng phần tử**, áp dụng khối code trong `{ }` lên phần tử đó, rồi gom kết quả thành
*một List mới* (độ dài bằng List gốc, nhưng là kết quả biến đổi). Ở đây khối `it.length` đo độ dài
mỗi tên → kết quả là một `List<Int>`. Câu tự nhiên cần nhớ: **"map: biến mỗi phần tử thành một giá
trị khác."** Chú ý: `names` không đổi — bạn nhận về danh sách *mới*.

**`filter` — giữ lại phần tử đạt điều kiện.**

```kotlin
val shortNames = names.filter { it.length <= 3 }   // ["An", "Chi"]
```

`filter` cũng chạy qua từng phần tử, nhưng khối code phải trả ra `Boolean` — đúng (`true`) thì phần
tử *được giữ lại* vào danh sách mới, sai thì bị bỏ. Số phần tử kết quả có thể ít hơn, không bao giờ
nhiều hơn. Câu cần nhớ: **"filter: giữ lại phần tử đạt điều kiện."**

**`joinToString` — ghép các phần tử thành chuỗi.**

```kotlin
val text = names.joinToString(", ")   // "An, Bình, Chi"
```

`joinToString` làm đúng một việc: ghép mọi phần tử thành *một chuỗi*, chèn phần ngăn cách bạn chỉ định
giữa các phần tử (thường dùng cho hiện thị, log, debug). Câu cần nhớ: **"joinToString: ghép các phần
tử thành chuỗi."**

Ba hàm này phủ phần lớn việc xử lý danh sách trong code Android giai đoạn đầu: từ dữ liệu thô →
`filter` lấy phần cần → `map` biến đổi thành dạng cần hiển thị → `joinToString` (hoặc hiển thị từng
phần tử trong UI). Chúng là hàm *thư viện chuẩn Kotlin*, không phải của Android — gặp ở mọi project
Kotlin, không chỉ Android.

> **Tự kiểm tra 4.** Với `val nums = listOf(1, 2, 3, 4)`, kết quả của `nums.filter { it > 2 }` là gì?
> Và của `nums.map { it * 10 }`?
>
> *(Đáp án: `[3, 4]` và `[10, 20, 30, 40]`. Chú ý `filter` trả về đúng kiểu phần tử gốc, `map` trả về
> kiểu theo khối biến đổi.)*

---

## Phần 5 — Lambda: khối code có thể cầm trên tay

Đây là phần quan trọng nhất của bài. Compose *là* lambdas: mọi khối `{ }` bạn thấy trong code giao
diều đều là lambda. Làm chủ phần này là làm chủ nửa đọc của Compose.

### Vấn đề trước cú pháp

Đến giờ, "code" của bạn luôn nằm ngay tại chỗ nó chạy. Nhưng có tình huống bạn muốn *cất một khối
code vào một biến* và *chạy nó sau* — ví dụ: "khối lệnh xử lý khi nút được bấm" phải nằm sẵn đó, chờ
người dùng bấm; bạn không thể viết nó ngay lúc dựng giao diện. Cái bạn cần trao cho nút là *khối
code*, không phải *kết quả* của khối code.

Kotlin gọi cái đó là **lambda** — một khối code có thể lưu vào biến hoặc trao đi như một giá trị:

```kotlin
val greet = { name: String ->
    "Xin chào $name"
}
```

Đọc: biến `greet` *chứa một khối code*. Khối đó nhận một tham số kiểu `String` (tên cục bộ là `name`),
và *kết quả của khối* là biểu thức cuối cùng — `"Xin chào $name"`. Chạy khối bằng cách gọi như hàm:

```kotlin
greet("Duc")            // "Xin chào Duc"
```

Điểm quan trọng nhất, dễ nhầm nhất: khai báo `val greet = { ... }` **không chạy** khối code; nó chỉ
*cất* khối code. Khối chỉ chạy khi có người *gọi* nó (`greet("Duc")`). Đó là khác biệt giữa **gọi
hàm** (thực thi ngay) và **truyền hàm** (trao khối code đi để người khác gọi sau) — cặp khái niệm
này nắm vững thì mọi callback/sự kiện về sau đều dễ.

### Lambda trong `map`/`filter`: khối code nhận phần tử vào

Quay lại Phần 4 với ánh mắt mới:

```kotlin
names.map { name ->
    name.uppercase()
}
```

Giờ bạn biết `{ name -> ... }` là một lambda với tham số đặt tên `name`. `map` làm việc như sau:
với *mỗi* phần tử của `names`, nó **gọi lambda bạn trao**, truyền phần tử đó vào tham số `name`, lấy
kết quả trả về gom thành List mới. Cách nói tự nhiên: "`map` cho lambda ăn từng phần tử, gom kết quả."
`filter` tương tự — lambda trả `Boolean` quyết định giữ hay bỏ.

### `it`: tên mặc định cho tham số duy nhất

Lambda chỉ có *một* tham số thì Kotlin cho phép bỏ luôn `name ->`, và gọi tham số đó bằng tên mặc định
**`it`**:

```kotlin
names.map { it.uppercase() }
```

Hai cách viết này hoàn toàn tương đương. `it` không phải biến toàn cục hay từ khoá của Android — nó
chỉ là **tên mặc định Kotlin gán cho tham số duy nhất của lambda** khi bạn không đặt tên. Quy tắc:

- Lambda một tham số → được dùng `it` (hoặc đặt tên riêng nếu muốn rõ nghĩa hơn).
- Lambda nhiều tham số → **bắt buộc** đặt tên (`{ a, b -> ... }`), không dùng được `it`.

Khi nào nên đặt tên thay vì dùng `it`? Khi lambda *lồng nhau* (hai `it` ở hai tầng sẽ mù mất) hoặc
khi đọc không rõ `it` là gì. Trong code ngắn kiểu `map { it.length }`, dùng `it` là tự nhiên.

### Trailing lambda: khối cuối cùng được mời ra ngoài ngoặc

Giờ là cú pháp bạn sẽ thấy *khắp nơi* trong Compose. Bắt đầu từ cách viết "đầy đủ":

```kotlin
doSomething({ value ->
    println(value)
})
```

`doSomething` là một hàm nhận lambda; bạn truyền lambda trong ngoặc tròn như một tham số. Kotlin cho
phép một rút gọn: **nếu tham số cuối cùng của hàm là lambda, bạn được viết lambda ra ngoài ngoặc
tròn**:

```kotlin
doSomething { value ->
    println(value)
}
```

Hai cách viết này ý nghĩa y hệt nhau. Vì sao Kotlin cho phép? Cầm lên một lý do thật: tham số cuối
thường là *hành vi* (khối code), các tham số trước là *dữ liệu*. Đưa khối code ra ngoài làm lời gọi
đọc như một khối công việc riêng — đặc biệt quý khi khối dài hoặc khi nó *lồng khối khác bên trong*:

```kotlin
// Cùng một nghĩa, bên phải dễ đọc hơn hẳn:
Column({ header() }, { body() }, { footer() })

Column {
    header()
    body()
    footer()
}
```

Quy tắc tra ngược khi đọc code lạ: thấy `{` đứng ngay sau tên hàm hoặc sau `)` của lời gọi hàm → đó
là trailing lambda, tức tham số cuối cùng. Trong Compose, `Column { ... }`, `Button(...) { ... }` đều
là đúng hình dạng này.

> **Tự kiểm tra 5.** Hai dòng sau có cùng ý nghĩa không? Vì sao có thể viết dòng thứ hai?
>
> ```kotlin
> show({ a -> a * 2 })
> show { a -> a * 2 }
> ```
>
> *(Đáp án: cùng ý nghĩa — lambda là tham số cuối cùng của `show`, nên được mời ra ngoài ngoặc.
> Dòng 1 là cách viết đầy đủ.)*

**Bạn sẽ gặp ở đâu:** chính code bạn đã *nhìn qua* trong các chương trước là ví dụ: khối
`setContent { ... }`, `Column { ... }`, và đặc biệt `onValueChange = { chatInputText = it }` — một
lambda một tham số dùng đúng `it`. Học xong Phần 5, dòng đó đọc ra là: "trao cho `onValueChange` một
khối code một tham số; mỗi lần nội dung ô nhập đổi, khối được gọi với nội dung mới tên là `it`."

---

## Phần 6 — Function type: "hình dạng" của một hàm

Khi một lambda được cất vào biến hoặc trao qua tham số, nó cần có *kiểu* — và kiểu của hàm mô tả
*hình dạng* của nó: nhận vào gì, trả ra gì.

```kotlin
val onClick: () -> Unit
```

Đọc `() -> Unit` là: **"một hàm không nhận tham số nào và không trả về kết quả đáng kể"** — ngoặc
rỗng là danh sách tham số, `Unit` (mục Phần 2) là "không có kết quả". Đây đúng là kiểu mà một nút
bấm cần: việc cần làm khi bấm — không cần dữ liệu vào, không cần kết quả ra.

Ba hình dạng bạn sẽ gặp nhiều nhất:

| Kiểu hàm | Đọc là | Ví dụ dùng |
|---|---|---|
| `() -> Unit` | không nhận gì, không trả gì | `onClick` của nút |
| `(String) -> Unit` | nhận một `String`, không trả gì | `onValueChange` của ô nhập |
| `(Int) -> String` | nhận một `Int`, trả một `String` | biến đổi số thành nhãn |

Kiểu hàm xuất hiện ở **khai báo biến** (như trên) và ở **tham số của hàm** — khi một hàm cần nhận
"một hành vi" từ bên ngoài:

```kotlin
fun runApp(onStart: () -> Unit) {   // nhận một hành vi tên onStart
    println("App chuẩn bị…")
    onStart()                         // chạy hành vi đó
}

runApp { println("Bắt đầu!") }        // trao hành vi bằng trailing lambda
```

Đọc `fun runApp(onStart: () -> Unit)`: tham số `onStart` có *kiểu hàm* `() -> Unit` — tức "một khối
code không tham số, không kết quả". Trong thân hàm, gọi `onStart()` là *thực thi* khối code đó. Đây
là chỗ hai khái niệm "truyền hàm" và "gọi hàm" (Phần 5) gặp nhau.

Đây là mức bạn cần: **nhận diện hình dạng** khi gặp `() -> Unit`, `(String) -> Unit` trong chữ ký hàm
Android/Compose — biết đó là "hàm nhận (cái gì), trả (cái gì)". Viết các hàm bậc cao phức tạp, đặt
biệt danh kiểu (`typealias`), hay những kỹ thuật higher-order nâng cao là chủ đề khác, không nằm
trong bài này.

> **Tự kiểm tra 6.** Kiểu `(String) -> Unit` mô tả hàm thế nào?  1. nhận `String`, trả `String`
> 2. nhận `String`, không cần kết quả  3. không nhận gì, trả `Unit`  4. nhận một `Unit`
>
> *(Đáp án: 2. Bên trái mũi tên là tham số, bên phải là kiểu trả về.)*

---

## Nhìn về phía trước: một đoạn code "kiểu Compose"

Đoạn dưới đây *giống hình dạng* code giao diện bạn sẽ viết bằng Compose vài bài nữa. **Chưa cần hiểu
Compose** — chỉ cần đọc và chỉ ra từng mảnh Kotlin bạn đã học. Đáp án gợi ý nằm ngay dưới.

```kotlin
val chatHistory = listOf(
    ChatMessage(text = "Chào bạn!", isMine = false),
    ChatMessage(text = "Học Kotlin vui quá", isMine = true),
)

fun unreadCount(messages: List<ChatMessage>): Int =
    messages.filter { !it.isMine }.size

fun badgeText(count: Int): String? =
    if (count > 0) "$count tin mới" else null

fun chatScreen() {
    val unread = unreadCount(chatHistory)
    val badge = badgeText(unread) ?: ""

    Button(
        onClick = {
            chatHistory.map { it.text }
                .joinToString("\n")
                .let { println(it) }   // ①
        }
    ) {
        Text(text = badge.ifEmpty { "Đã đọc hết" })   // ②
    }
}
```

Chỉ ra trong đoạn trên:

- **`val`** với suy luận kiểu — `chatHistory`, `unread`, `badge`.
- **Hàm** với tham số có kiểu và kiểu trả về — `unreadCount`, `badgeText`, `chatScreen` (không trả
  gì → `Unit` ngầm định).
- **Expression body** với `=` — cả ba hàm đều viết gọn.
- **Tham số đặt tên + mặc định** — `text = ...`, `isMine = ...` khi gọi "khởi tạo".
- **Nullable** — `badgeText` trả `String?` (có thể không có badge), `?: ""` là Elvis "nếu null thì
  chuỗi rỗng".
- **List + `filter`** — `messages.filter { !it.isMine }` giữ lại tin *không phải của mình*.
- **Lambda + `it`** — `{ !it.isMine }`, `{ it.text }`.
- **Trailing lambda** — `Button(...) { Text(...) }`: khối `{ Text(...) }` đứng sau ngoặc tròn, đúng
  quy tắc "tham số cuối là lambda thì mời ra ngoài".
- **Kiểu hàm** — tham số `onClick` của `Button` có kiểu `() -> Unit`: không tham số, không kết quả.

Còn những gì bạn *chưa* cần hiểu — và đây là ranh giới bài học:

- `ChatMessage(...)` tạo object từ class, `List<ChatMessage>` viết kiểu có tham số — là nội dung
  **F2** (data class, generics ở mức nhận diện). Ở đây chỉ cần thấy: khối gọi giống một hàm, và List
  chứa "thứ gì đó" tên `ChatMessage`.
- `Text`, `Button`, `chatScreen` là *hàm của Compose* — hiện chưa cần biết chúng vẽ gì, chạy ra sao.
- Hai chỗ đánh dấu ① (`let`) và ② (`ifEmpty`) là hàm thư viện bạn **chưa** học: gặp code thật bạn
  sẽ thấy nữa — cách đọc đúng là "một khối code nhận giá trị vào", và chúng sẽ được gloss đúng chỗ
  dùng đầu tiên. Không cần tra trước.

Nếu bạn đọc đoạn trên và thấy *cú pháp Kotlin không còn làm bạn giật mình* — dù chưa hiểu Compose
làm gì — thì bài này đã xong việc của nó. Còn một kiểu khai báo bạn chưa thấy: biến chưa có giá trị
ngay (`val x: Int`) và `class`/`data class` — F2 sẽ nối tiếp.

---

## Cạm bẫy của người mới

**1. Nhầm `val` với "object không bao giờ đổi".** `val` chỉ cấm *gán lại tên*. Một `val` trỏ tới
object thay đổi được thì object vẫn thay đổi được qua tham chiếu khác; và ngược lại, object bất biến
thì `var` trỏ tới cũng không làm nó đổi được — chỉ đổi được chỗ *trỏ*. Câu hỏi đúng khi đọc code:
"tên này có được gán lại không?" — không phải "giá trị này có đổi không?".

**2. Nhầm `String?` với "chuỗi rỗng".** `""` là một chuỗi thật, có độ dài 0, gọi được mọi hàm chuỗi.
`null` **không phải chuỗi** — không có độ dài, không gọi được gì. Kiểm tra "chuỗi rỗng hay không"
dùng `isEmpty()`; kiểm tra "có giá trị hay không" dùng `?.`/`?:` — hai việc, hai công cụ.

**3. Dùng `!!` để "im" trình biên dịch.** Báo đỏ của Kotlin về null là trình biên dịch đang *cứu
bạn khỏi crash tương lai*. Bọc `!!` là bênh lỗi từ lúc biên dịch sang lúc chạy — trên máy người dùng.
Thử `?.` và `?:` trước; nếu *thật sự* chắc chắn không null, thường là chỗ đó nên cấu trúc lại.

**4. Tưởng mọi lambda đều có `it`.** `it` chỉ tồn tại khi lambda có đúng *một* tham số. Lambda hai
tham số buộc đặt tên (`{ key, value -> ... }`); dùng `it` ở đó là lỗi biên dịch. Và `it` là tên
*tham số*, không phải biến toàn cục — mỗi lambda một `it` riêng.

**5. Nhầm gọi hàm với truyền hàm.** `greet("Duc")` là *gọi* (thực thi ngay, lấy kết quả).
`onClick = { greet("Duc") }` là *truyền* (cất khối code, chạy khi có sự kiện). Chữ "gọi được cầm đi"
này giải thích vì sao code Android có những khối `{ }` "chưa chạy ngay lúc đọc tới".

**6. Lạc trong ngoặc nhọn lồng nhau.** Lambda lồng lambda là chuyện thường ở Compose. Mẹo đọc: tìm
`->` gần nhất để biết lambda đó nhận gì; đếm ngoặc nhọn mở/đóng theo cặp; đặt tên lambda bằng tham
số (thay vì `it`) khi lồng hai tầng để tránh nhầm hai `it`.

---

## Tóm tắt

1. `val` = gán một lần, chỉ đọc; `var` = cho gán lại. Mặc định chọn `val`; "không gán lại được" ≠
   "giá trị bên trong không đổi".
2. Kotlin tự suy kiểu từ giá trị; viết kiểu tường minh (`: String`) khi biến chưa có giá trị ngay,
   khi muốn khác kiểu suy luận, hoặc làm tài liệu.
3. Hàm: `fun tên(tham_số: Kiểu): Kiểu_trả_về { return ... }`; `Unit` = không có kết quả đáng kể;
   expression body `fun f(x: Int) = x * 2` cho hàm một biểu thức; tham số mặc định bỏ được khi gọi;
   gọi bằng tên tham số cho lời gọi tự giải thích.
4. `Kiểu?` = có thể là null. `?.` = có thì gọi, không thì null. `?:` = null thì dùng giá trị thay
   thế. `!!` = "tin mình đi" — biết là có, đừng dùng thường.
5. `List` = danh sách có thứ tự, đọc theo index, chỉ-đọc từ phía cầm; `map` biến mỗi phần tử,
   `filter` giữ phần tử đạt điều kiện, `joinToString` ghép thành chuỗi — đều trả danh sách/chuỗi mới.
6. Lambda = khối code cầm được, truyền được; `it` = tên mặc định của tham số duy nhất; trailing
   lambda = tham số cuối được mời ra ngoài ngoặc.
7. Kiểu hàm `() -> Unit`, `(String) -> Unit`, `(Int) -> String` = hình dạng "nhận gì → trả gì" của
   một hành vi; Android/Compose dùng chúng cho mọi sự kiện (onClick, onValueChange…).

---

## Editorial migration notes

> **Nội dung biên tập nội bộ — KHÔNG đưa vào bài học cho người học.**

Tổng hợp các gloss Kotlin JIT đang nằm trong các bài Ch01–Ch03 (đã chuẩn hoá 2026-09) và phân loại
đích đến sau khi F1/F2 live:

### A. Thuộc F1 đúng nghĩa — F1 dạy rồi, các bài sau nên trỏ về F1 thay vì gloss lại

| Gloss hiện tại | Nơi ở | Ghi chú |
|---|---|---|
| `fun` = từ khoá khai báo hàm | Ch03_1 bảng onCreate (mục 2) | F1 Phần 2 dạy đầy đủ; Ch03_1 giữ 1 câu trỏ về Nền tảng. |
| Tham số `Bundle?` — `?` = "có thể null" | Ch03_1 bảng onCreate (mục 2) | F1 Phần 3 dạy `?` đầy đủ; Ch03_1 chỉ giữ ngữ cảnh Android của Bundle. |
| Lambda "khối code truyền vào như giá trị" | Ch03_1 mục 2 (setContent) | F1 Phần 5 dạy đúng khái niệm này. |
| Trailing lambda + quy tắc "tham số cuối mời ra ngoài" | Ch03_1 mục 5.5 | F1 Phần 5 dạy đầy đủ kèm ví dụ doSomething; Ch03_1 giữ ví dụ Button/Column. |
| `it` = tham số duy nhất của lambda, "toàn bộ chuỗi mới" trong onValueChange | Ch03_1 mục 5.4 | F1 Phần 5 dạy `it` đúng cơ chế; Ch03_1 giữ *nội dung Android* (it là toàn bộ chuỗi mới, gọi 3 lần khi gõ "abc"). |
| Null "có thể không có gì cả" | Ch03_1 mục 7 (findViewById trả null) | F1 Phần 3 nền; Ch03_1 giữ ngữ cảnh view lookup. |
| String template `$name` | rải rác trong code Ch03 | F1 Phần 1 nêu 1 chỗ; các bài sau không cần gloss. |

### B. Thuộc F2 — KHÔNG đưa vào F1 (đã kiểm: F1 không dạy)

| Chủ đề | Nơi hiện đang gloss | Đích |
|---|---|---|
| `by` (property delegation) + bảng mutableStateOf/remember/by | Ch03_1 mục 5.2 | F2; Ch03_1 giữ bảng 3 thành phần ở mức Compose. |
| `class ... : ComponentActivity()` — dấu `:` kế thừa | Ch03_1 bảng onCreate (mục 1) | F2 + Android-specific; F1 không dạy `:` ở ngữ cảnh class (F1 chỉ dùng `:` cho kiểu). |
| `when` chọn nhánh | Ch03_4 (gloss "sẽ học kỹ ở phần Nền tảng") | F2/bài Kotlin sau; giữ nguyên. |
| data class, `List<RecipeDb>` generics | Ch10_2, Ch10_3 | F2 (generics ở mức nhận diện); giữ nguyên. |
| Sealed-state | Ch10_4 note | F2. |

### C. Vẫn là Android-specific JIT — F1 không đủ, giữ ở các bài Android

| Gloss | Nơi ở | Lý do giữ |
|---|---|---|
| `override`, `super.onCreate()` bắt buộc | Ch03_1 bảng onCreate | Thuộc OOP/framework Android; người học chỉ cần nhận diện tại chỗ. |
| `setContent` là ranh giới Kotlin↔Compose | Ch03_1 mục 2 | Concept Android/Compose, không phải Kotlin nền. |
| `R` class, resource, `stringResource` | Ch03_2 | Android framework. |
| `Context`, `Intent`, `permission` | Ch03_3 | Android framework. |
| `@Composable`, recomposition, state hoisting | Ch03_1, Ch03_4 | Compose — dạy ở giai đoạn Compose/State. |
| `!!` trong ngữ cảnh code mẫu | (không xuất hiện trong các bài live) | F1 đã đặt tâm thế "nhận ra, đừng dùng". |

### D. Ứng viên CẮT BỚT khi F1/F2 live (redundant sau khi F1/F2 là tiên quyết thật)

1. **Ch03_1 mục 5.5** — câu "cú pháp này cũng sẽ nằm trong phần Nền tảng Kotlin" về trailing lambda:
   khi F1 đi trước A9, đổi thành liên kết ngắn "quy tắc này đã dạy ở phần Nền tảng Kotlin" (bỏ
   lời hứa tương lai).
2. **Ch03_1 bảng onCreate mục 2** — nửa câu gloss `fun`/`?` ("`fun` là từ khoá khai báo hàm… `?`
   nghĩa là có thể null"): rút về 1 câu trỏ Nền tảng, giữ phần Android (onCreate là điểm vào,
   Bundle là gì). Không xóa bảng.
3. **Ch03_4** — gloss `when` "sẽ học kỹ ở phần Nền tảng": giữ forward-ref nhưng cập nhật tên đích
   thành đúng bài khi F2 được dựng (F2 hoặc bài Kotlin kế).
4. **Ch01_1 dòng 382 / Ch01_4 mục roadmap** — lời hứa "phần Nền tảng Kotlin, 2 bài, ngay trước giai
   đoạn 1": giữ, chỉ cập nhật mô tả phạm vi ("biến, hàm, null safety, collections, lambda…" =
   đúng nội dung F1; "data class, by, sealed…" = F2) sau khi hai bài live.
5. Không cắt gloss nào trong Ch03_1 mục 5.2 (bảng `by remember`) — bảng đó dạy *Compose state*,
   không phải `by` ở mức Kotlin; F2 dạy `by` tổng quát nhưng bảng Compose vẫn cần.

### Ghim nội dung cho "Cần biết trước" của các bài sau

Sau khi F1/F2 live, mọi bài dùng `val`/`fun`/lambda/`?.` lần đầu nên liệt kê tiên quyết
"Nền tảng Kotlin (F1)" thay vì gloss riêng — tránh mỗi bài gloss một kiểu.

---

## Sources for future Nguồn block

> Danh sách để dựng khối Nguồn tham khảo khi bài được dựng chính thức. KHÔNG kèm số dòng — đây là
> tài liệu tham khảo khái niệm, không trích code mẫu.

- Kotlin Docs (kotlinlang.org) — *Basic Syntax*: val/var, functions, string templates.
- Kotlin Docs — *Functions*: default/named arguments, single-expression functions, `Unit`.
- Kotlin Docs — *Null Safety*: nullable types, safe calls `?.`, Elvis `?:`, `!!`.
- Kotlin Docs — *Collections Overview* & *Collection Operations* (`listOf`, `map`, `filter`,
  `joinToString`).
- Kotlin Docs — *Lambdas* & *Higher-Order Functions*: trailing lambda, `it`, function types.
- Khoá học này, các bài đã sửa: Ch03_1 (mục 5.4–5.5: `it`, trailing lambda trong ngữ cảnh Android),
  Ch03_1 bảng onCreate (gloss `?`/`fun` hiện tại) — nguồn tham chiếu giọng và ngữ cảnh, không phải
  nguồn khái niệm.
