# C5 — Tiếp cận mọi người dùng: a11y cơ bản trong Jetpack Compose

> **TRẠNG THÁI: DRAFT NỘI BỘ CHO BÀI HỌC TƯƠNG LAI.** File này KHÔNG phải trang site.
> Khi dựng bài chính thức (task IMP-047 trong `docs/COURSE_REDESIGN_IMPLEMENTATION_PLAN.md`),
> nội dung học là phần "Bài học" phía dưới. Bốn mục cuối file — "Thu hoạch code thật (phân loại nội
> bộ)", "Future accessibility reference notes", "Editorial migration notes", "Sources for future
> Nguồn block" — là **nội dung biên tập nội bộ, KHÔNG đưa cho người học** và không được để lọt vào
> trang bài học.
>
> **Vị trí trong khoá:** Giai đoạn 2 (Jetpack Compose), bài **5/5** — ngay sau C4 (Preview & vòng
> đời composable), trước Giai đoạn 3 (State & kiến trúc). Phân loại **Lõi (core-lite)**, mục tiêu
> ~20 phút.
>
> **Đánh số mục tiếp nối Ch05** (theo ranh giới tách đã ghi trong `Ch05JetpackCompose.astro`):
> C1 = mục 1–3 · C2 = mục 4–9 · C3 = mục 10–14 · C4 = mục 15–18 ⇒ **C5 = mục 19–28**.
>
> **Phạm vi:** đây là một **nền tảng nhỏ**, không phải khoá accessibility đầy đủ. Bài này có đúng
> **năm điều cốt lõi** (xem "Tóm tắt"), và mọi chi tiết khác được cố tình hạ xuống mức *nhận biết*
> hoặc chuyển vào mục nội bộ "Future accessibility reference notes" để không cạnh tranh với năm điều
> đó. Ngân sách nhấn mạnh: **4 callout** (mô hình hai bản mô tả · quy tắc `contentDescription` ·
> kích thước ≠ vùng chạm · bắt buộc tự kiểm bằng tay) và **3 checkpoint**. Chi tiết vượt mức nhận
> biết (cấu trúc cây semantics, `SemanticsPropertyKey`, `clearAndSetSemantics`, `stateDescription`,
> API test, cơ chế nới vùng chạm, con số tương phản chính xác, phóng chữ không tuyến tính) nằm ở mục
> nội bộ nói trên — **không xoá, chỉ hạ ưu tiên**.

---

# Bài học

## Mục tiêu — sau bài này bạn sẽ

- Giải thích được vì sao một giao diện luôn có **hai bản mô tả** — cái người dùng *nhìn thấy* và cái
  các dịch vụ hỗ trợ *hiểu được* — và nói được **semantics** là gì ở mức người mới.
- Quyết định được khi nào `contentDescription` phải là một câu chữ và khi nào `null` mới là lựa chọn
  đúng, rồi viết được mô tả theo **hành động** thay vì theo hình dáng.
- Chỉ ra được khác biệt giữa **kích thước nhìn thấy** và **vùng chạm**, và tự đặt được vùng chạm
  48dp cho một icon 24dp.
- Chỉ ra được những kiểu bố cục bị vỡ khi người dùng **tăng cỡ chữ**, và vì sao *chỉ* dùng màu để
  báo lỗi là không đủ.
- Chọn được đúng mức can thiệp (dùng component có nghĩa sẵn → điền mô tả → tự viết semantics khi cần
  như `mergeDescendants`), rồi **tự soi màn hình của mình** bằng TalkBack và cỡ chữ lớn.

**Tại sao điều này quan trọng khi làm Android.** Bốn bài trước cho bạn dựng được một màn hình *nhìn*
đúng. Nhưng người dùng Android không chỉ có một kiểu: có người bật TalkBack và không nhìn màn hình,
có người đặt cỡ chữ hệ thống lên mức lớn nhất, có người dùng đầu ngón tay to hơn cái icon 24dp của
bạn. Những việc trong bài này đều **nhỏ và làm ngay trong lúc dựng UI** — sửa sau thì đắt hơn nhiều,
vì lúc đó nó thành một đợt rà soát toàn app.

**Cần biết trước:** Nền tảng Kotlin F1–F2 (hàm, tham số, lambda đuôi, `if`/`else` là biểu thức,
`null`) · **C1** (composable, `Column`/`Row`/`Box`) · **C2** (`Modifier`, **thứ tự nối chuỗi**,
`LazyColumn`) · **C3** (`MaterialTheme`, `colorScheme`, vai trò màu, `typography`) · **C4**
(`@Preview` và ba việc nó không chứng minh được). Bài này dùng lại cả năm, không dạy lại.

---

## 19. Một giao diện luôn có hai bản mô tả

Nhìn vào app bar của màn hình chat: góc trái có một icon mũi tên. Bạn hiểu ngay nó nghĩa là "quay
lại" — vì bạn *nhìn thấy* hình mũi tên và đã học được quy ước đó từ hàng trăm app khác.

Bây giờ tưởng tượng một người dùng bật **TalkBack** (dịch vụ đọc màn hình có sẵn của Android). Họ
không nhìn màn hình. TalkBack đi qua từng thành phần và **đọc lên** thứ mà nó biết về thành phần đó.
Hình mũi tên không giúp gì cả: TalkBack không "xem" pixel, nó **đọc mô tả**. Nếu không ai cung cấp
mô tả, câu duy nhất người dùng nghe được là đại ý "một cái gì bấm được" — không biết bấm để làm gì.

> **Mô hình trực quan: bản vẽ và bản chú thích.**
> Giao diện của bạn giống một bản vẽ kỹ thuật đi kèm **bản chú thích**. Bản vẽ là phần hiện lên màn
> hình: hình, màu, khoảng cách. Bản chú thích là phần ghi *cái này là gì, làm được gì, đang ở trạng
> thái nào*. Người sáng mắt đọc bản vẽ. TalkBack, Switch Access, và các công cụ hỗ trợ khác chỉ đọc
> được **bản chú thích**. Hai bản không tự khớp nhau — bản chú thích do bạn viết.

Trong Compose, bản chú thích đó có tên: **semantics** (ngữ nghĩa). Khi bạn viết một composable,
Compose dựng song song hai thứ: phần vẽ ra màn hình, và một mô tả kèm theo về **nghĩa**, **hành
động** và **trạng thái** của từng phần. Các dịch vụ hỗ trợ đọc mô tả đó.

Tin tốt: với các component Material bạn đã dùng từ C1 tới C3, phần mô tả **phần lớn đã có sẵn**. `Text`
tự mang nội dung chữ của nó. `Button` tự nói "đây là một nút, bấm được". `Checkbox` tự nói nó đang được
tích hay chưa. Việc của bạn trong bài này chỉ là ba nhóm nhỏ:

1. **Điền phần Compose không thể tự đoán** — nghĩa của một hình ảnh, icon (mục 20–21).
2. **Đừng phá phần đã có sẵn** — vùng chạm quá nhỏ, hộp cao cứng, màu ghi cứng (mục 22–24).
3. **Gom hoặc mô tả lại đúng chỗ cần** — khi cấu trúc hình ảnh không diễn đạt đúng ý nghĩa (mục 25–26).

Ba nhóm việc đó là **nguyên lý, không phải cú pháp**: "mọi thứ bấm được phải có tên gọi có nghĩa",
"vùng chạm phải đủ lớn", "chữ phải sống được khi to lên" sẽ còn đúng lâu hơn Compose — còn tên API cụ
thể (`contentDescription`, `Modifier.semantics`) thì có thể đổi. Học nguyên lý trước, API sau.

---

## 20. `contentDescription`: khi nào là chữ, khi nào là `null`

`Icon` và `Image` đều có một tham số bắt buộc bạn phải trả lời: `contentDescription`. Compose bắt bạn
điền chính vì nó **không thể tự đoán** một tấm ảnh nghĩa là gì.

Có đúng hai câu trả lời hợp lệ, và chọn sai câu nào cũng gây hại:

```kotlin
// (1) Icon MANG THÔNG TIN — phải có mô tả
Icon(
    imageVector = Icons.Filled.ArrowBack,
    contentDescription = "Quay lại"
)

// (2) Icon chỉ TRANG TRÍ — null là câu trả lời đúng
Icon(
    imageVector = Icons.Filled.Warning,
    contentDescription = null
)
```

> **Quy tắc quyết định `contentDescription` — nhớ đúng ba dòng này.**
> Hỏi: *nếu xoá thành phần này đi, người dùng có mất thông tin nào không?*
> · **Mất** ⇒ viết một **câu chữ** mô tả nó.
> · **Không mất** ⇒ `null`.
> · Và một điều đè lên cả hai: **mọi thứ bấm được đều phải có tên gọi**, kể cả khi nó *nhìn* như
> trang trí.

- Icon mũi tên trong app bar là **cách duy nhất** để biết có nút quay lại ⇒ mang thông tin ⇒ phải có
  mô tả.
- Icon dấu chấm than nằm cạnh dòng chữ "Không thể kết nối" **không thêm thông tin nào** — dòng chữ đã
  nói hết ⇒ trang trí ⇒ `null`.

### Vì sao `null` là một lựa chọn *tốt*, không phải sự lười

`null` không có nghĩa "tôi bỏ qua accessibility". Nó là một câu phát biểu có nội dung: *thành phần này
không cần được đọc lên*. TalkBack sẽ bỏ qua nó và đi tiếp.

Điều đó quan trọng vì thứ làm người dùng TalkBack khổ nhất **không phải thiếu mô tả** — mà là **quá
nhiều mô tả vô nghĩa**. Một hàng có avatar, icon trạng thái, icon đã-đọc, icon đính kèm mà cả bốn đều
có mô tả thì mỗi lần lướt qua một tin nhắn, người dùng phải nghe bốn câu trước khi tới nội dung thật.
Điền `null` cho phần trang trí là cách bạn **giảm tiếng ồn**.

### Bẫy phổ biến nhất: mô tả trùng trong một nút đã có chữ

Đây là lỗi phổ biến nhất của người mới, và nó *xuất phát từ ý tốt*:

```kotlin
// SAI — nút sẽ được đọc lên hai lần cùng một chữ
Button(onClick = onSend) {
    Icon(imageVector = Icons.Filled.Send, contentDescription = "Gửi")
    Text("Gửi")
}

// ĐÚNG — icon là trang trí, chữ của nút đã là tên gọi
Button(onClick = onSend) {
    Icon(imageVector = Icons.Filled.Send, contentDescription = null)
    Text("Gửi")
}
```

Lý do nằm ở một hành vi mặc định của Compose: **khi một composable cha có thể bấm được, Compose tự gộp
mô tả của các con vào cha** và đưa cả nhóm cho dịch vụ hỗ trợ như *một* thành phần. `Button` là như
vậy. Nên với bản SAI, cái mà TalkBack nhận được là một nút tên "Gửi Gửi".

Cách nhớ: **trong một nút đã có chữ hiển thị, mọi icon bên trong là trang trí.** Chỉ nút *chỉ có
icon* (icon-only) mới cần mô tả — và lúc đó mô tả nên đặt ở chính icon đó hoặc ở nút bọc ngoài, một
chỗ duy nhất.

> **Tự kiểm tra 1.** Ba trường hợp sau, `contentDescription` nên là chữ hay `null`?
> 1. Icon kính lúp trong một `IconButton` không có chữ nào bên cạnh.
> 2. Ảnh nền trang trí phía sau một khối chữ.
> 3. Ảnh đại diện của người gửi trong một hàng tin nhắn, mà **bấm vào được** để mở trang cá nhân.
>
> <details><summary>Đáp án</summary>
>
> 1. **Chữ** — icon-only, không có gì khác nói nó làm gì: `"Tìm kiếm"`.
> 2. **`null`** — không mang thông tin, và nếu đọc lên thì chỉ thêm tiếng ồn trước phần chữ thật.
> 3. **Chữ.** Đây là bẫy: ảnh *nhìn* có vẻ trang trí, nhưng nó **bấm được** — mọi thứ bấm được đều
>    phải có tên gọi, nếu không người dùng nghe được đúng "bấm được" mà không biết bấm ra cái gì. Mô
>    tả tốt: `"Ảnh đại diện của Ada, mở trang cá nhân"`. (Ở mục 28 bạn sẽ gặp đúng tình huống này
>    trong code thật của project.)
> </details>

---

## 21. Mô tả **ý nghĩa và hành động**, không mô tả hình dáng

Khi đã quyết định là "có mô tả", vẫn còn một câu hỏi nữa: viết gì trong đó. Nguyên tắc chỉ có một
câu: **mô tả việc thành phần đó làm, không mô tả nó trông thế nào.**

| Nên viết | Đừng viết | Vì sao |
|---|---|---|
| `"Xoá tin nhắn"` | `"Biểu tượng thùng rác màu đỏ"` | Người dùng cần biết *bấm vào thì gì xảy ra*, không cần biết hình gì. |
| `"Quay lại"` | `"Mũi tên trái"` | "Mũi tên trái" không nói được nó dẫn tới đâu. |
| `"Mở menu điều hướng"` | `"Logo Kodeco"` | Cùng một hình có thể làm việc khác nhau ở hai chỗ khác nhau. |
| `"Đính kèm ảnh"` | `"Icon ảnh"` | Tên hành động dùng được cả khi hình đổi. |

Hệ quả thực dụng: **đổi hình không phải đổi mô tả.** Nếu mô tả của bạn là "mũi tên trái" thì hôm
designer đổi sang hình chữ V, mô tả thành sai. Nếu mô tả là "Quay lại" thì nó vẫn đúng.

Ba chi tiết nhỏ nhưng quan trọng:

- **Đừng nhồi loại thành phần vào mô tả.** Viết `"Nút gửi"` là dư: dịch vụ hỗ trợ **tự** thông báo
  phần "nút" cho một `Button` — người dùng sẽ nghe "nút gửi, nút". Chỉ viết `"Gửi"`.
- **Đừng nhồi màu sắc hay hình dáng vào mô tả.** `"Nút loa màu xám"` nói hai thứ mà đúng người cần
  mô tả nhất đều không dùng được. Với một icon loa mà bấm vào thì tắt tiếng cuộc gọi, mô tả đúng chỉ
  gồm hành động: `"Tắt tiếng"`.
- **Mô tả là chữ người dùng nghe được ⇒ nó là chuỗi hiển thị.** Nên nó thuộc `strings.xml` như mọi
  chữ khác trong app (Chương 3), không phải chuỗi gõ thẳng trong code:
  `contentDescription = stringResource(id = R.string.info)`. Đây là điều project mẫu làm đúng ở mọi
  chỗ có mô tả (mục 28) — và là điều kiện để app dịch được sang ngôn ngữ khác.

---

## 22. Kích thước nhìn thấy **khác** vùng chạm

Ở C2 mục 6 bạn đã học: thứ tự nối `Modifier` quyết định kết quả, và `clickable` đặt sau `padding` thì
vùng bấm co lại. Bây giờ là lý do *vì sao chuyện đó đáng quan tâm*.

Một icon chuẩn Material là **24dp** — vừa đủ để nhìn rõ. Nhưng đầu ngón tay không chạm chính xác được
vào một ô 24dp, nhất là khi đang đi bộ, tay ướt, hoặc khi người dùng bị hạn chế vận động. Hướng dẫn
accessibility của Android nêu con số cụ thể: **mỗi thành phần tương tác nên có vùng chạm tối thiểu
48dp × 48dp — lớn hơn thì càng tốt.**

> **Mô hình trực quan: cái nút và cái công tắc quanh nó.**
> **24dp là thứ bạn thấy. 48dp là thứ ngón tay bạn chạm được.** Hai con số này không nhất thiết phải
> bằng nhau, và trong đa số trường hợp thì **không** bằng nhau: phần dư là khoảng trống trong suốt bao
> quanh icon, vẫn nhận thao tác bấm.

Cách viết thẳng nhất — một hộp 48dp nhận thao tác bấm, icon 24dp nằm giữa:

```kotlin
Box(
    modifier = Modifier
        .size(48.dp)                       // vùng chạm
        .clickable(onClick = onDismiss),
    contentAlignment = Alignment.Center
) {
    Icon(
        imageVector = Icons.Filled.Close,
        contentDescription = "Đóng thông báo",
        modifier = Modifier.size(24.dp)    // phần nhìn thấy
    )
}
```

Đọc lại đúng thứ tự (C2 mục 6): `size(48.dp)` đứng **trước** `clickable`, nên hộp đã rộng 48dp *trước
khi* vùng bấm được đăng ký ⇒ vùng bấm là cả 48dp. Icon bên trong vẫn vẽ ở 24dp. Nếu nội dung có thể to
hơn 48dp, dùng `sizeIn(minWidth = 48.dp, minHeight = 48.dp)` thay cho `size` — nó đặt *sàn* thay vì ép
cứng.

### Nhưng thường bạn không phải tự làm việc này

Nhiều component Material **đã** tự giữ mức tối thiểu đó khi chúng thật sự nhận thao tác của người
dùng: `Button`, `IconButton`, `ListItem`, `Checkbox`, `RadioButton`, `Switch`, `Slider`. Nghĩa là:

```kotlin
// Đủ rồi — IconButton tự lo vùng chạm tối thiểu
IconButton(onClick = onDismiss) {
    Icon(
        imageVector = Icons.Filled.Close,
        contentDescription = "Đóng thông báo"
    )
}
```

Hai lưu ý để không hiểu sai lời hứa đó:

- **Chỉ khi component thật sự tương tác.** Một `Checkbox` có `onCheckedChange = null` (chỉ để hiển
  thị, không bấm được) thì **không** được cấp phần đệm đó — hợp lý, vì không ai bấm nó.
- **Bạn vẫn ép được nó nhỏ lại.** `Modifier.height(36.dp)` truyền từ ngoài vào một `Button` sẽ ép
  chiều cao xuống 36dp. Component đã cho bạn mức tối thiểu; bạn có quyền lấy lại. Đừng ép chiều cao
  của một control xuống dưới 48dp mà không có lý do rõ ràng.

**Quy tắc thực dụng:** dùng component Material cho mọi control ⇒ khỏi nghĩ về vùng chạm. Chỉ tự dựng
hộp 48dp khi bạn tự làm control bằng `Box` + `clickable` — và đó chính là lúc dễ quên nhất.

> **Tự kiểm tra 2.** Chuỗi `Modifier.padding(12.dp).clickable { … }.size(24.dp)` cho một icon 24dp.
> Vùng chạm rộng bao nhiêu, và sửa thế nào?
>
> <details><summary>Đáp án</summary>
>
> Vùng chạm chỉ khoảng **24dp**: `padding` đã chèn 12dp *trước khi* `clickable` được đăng ký, nên phần
> đệm nằm ngoài vùng bấm (C2 mục 6). Đổi thành `Modifier.clickable { … }.padding(12.dp).size(24.dp)`
> thì vùng bấm bao trọn cả phần đệm ⇒ 24 + 12 × 2 = **48dp**, mà hình icon không to lên. Đây là cùng
> một quy tắc thứ tự bạn đã học, lần này với hậu quả accessibility.
> </details>

---

## 23. Cỡ chữ hệ thống có thể to hơn bạn tưởng

Trong Cài đặt của Android có mục cỡ chữ, và mức lớn nhất trên các bản Android hiện nay là **200%** —
gấp đôi cỡ chữ bạn đang thấy. Đây không phải trường hợp hiếm: đó là thiết lập đầu tiên rất nhiều người
trên 40 tuổi bật lên.

Hai đơn vị đo, hai vai trò — và đây là chỗ duy nhất trong Compose bạn **không** được dùng lẫn:

| Đơn vị | Dùng cho | Hành vi khi người dùng tăng cỡ chữ |
|---|---|---|
| `sp` (*scalable pixels*) | **cỡ chữ**, và `lineHeight` của chữ | **To lên** theo thiết lập của người dùng |
| `dp` (*density-independent pixels*) | kích thước, khoảng cách, đệm, icon | **Không đổi** |

Quy tắc: **cỡ chữ luôn ghi bằng `sp`; mọi thứ còn lại ghi bằng `dp`.** Ngược lại cũng cấm — đừng dùng
`sp` cho `padding` hay chiều cao, vì việc phóng chữ không phải một phép nhân đơn giản (chữ tiêu đề
phóng ít hơn chữ nhỏ), nên mọi phép tính bố cục dựa trên `sp` sẽ lệch.

Tin tốt: nếu bạn dùng `MaterialTheme.typography` như đã học ở C3 thì bạn **đã** dùng `sp` — bộ kiểu
chữ của theme khai bằng `sp` sẵn. Vấn đề gần như không bao giờ nằm ở cỡ chữ, mà nằm ở **cái hộp bọc
quanh chữ**.

### Bốn lỗi làm bố cục vỡ khi chữ to lên

1. **Hộp cao cứng quanh chữ** — `Modifier.height(40.dp)` quanh một dòng chữ: chữ to lên, hộp không, chữ
   bị cắt mất phần dưới hoặc mất hẳn dòng thứ hai.
2. **Giả định chữ luôn một dòng** — một cái tên vừa khít ở cỡ chữ mặc định sẽ xuống dòng ở 200%, và mọi
   thứ nằm dưới nó bị đẩy xuống.
3. **Xếp hai thành phần quá sát nhau** — ở cỡ chữ lớn, chữ nở ra và hai phần đè lên nhau.
4. **Ghi cứng cỡ chữ tuỳ ý khắp nơi** — `fontSize = 13.sp` rải rác thì bạn mất luôn hệ thống phân cấp
   của theme, và không có chỗ nào để điều chỉnh một lần cho cả app.

So sánh nhỏ:

```kotlin
// TỆ — chiều cao cứng + cỡ chữ ghi cứng
Row(modifier = Modifier.height(40.dp)) {
    Text(text = title, fontSize = 13.sp)
}

// TỐT — để chiều cao tự theo nội dung, cỡ chữ lấy từ theme
Row(modifier = Modifier.padding(vertical = 8.dp)) {
    Text(
        text = title,
        style = MaterialTheme.typography.titleMedium
    )
}
```

Điểm khác biệt cốt lõi: bản TỐT **không nói trước chiều cao**. Nó nói "đệm 8dp trên dưới" và để nội
dung tự quyết định phần còn lại. Chữ to lên thì hàng cao lên — đúng như người dùng muốn.

Chỗ này nối thẳng vào C4: bảng "ba việc `@Preview` không chứng minh được" đã nói bản xem trước dùng
một cấu hình cố định, còn cỡ chữ hệ thống của người dùng thì có thể khác — giờ phần đó có tên và có
cách kiểm tra (mục 27). Phạm vi ở đây chỉ là **cỡ chữ**; bố cục cho tablet/màn hình gập là chủ đề khác
nằm ở track Mở rộng.

---

## 24. Màu: "hiện ra được" chưa phải "đọc được"

Một dòng chữ có thể được vẽ hoàn toàn đúng mà vẫn không đọc nổi — chữ xám nhạt trên nền trắng là ví
dụ kinh điển. Trình biên dịch không báo gì, bản xem trước trông "ổn" trên màn hình sáng của bạn, và
lỗi chỉ xuất hiện với người dùng thật ngoài trời hoặc mắt kém hơn bạn.

### Vai trò màu làm sẵn phần lớn việc — nhưng không phải tất cả

C3 mục 11 đã dạy `MaterialTheme.colorScheme` theo **vai trò**, và chỗ này là lý do thứ hai để dùng nó.
Các tên màu của Material 3 đi thành **cặp nền / chữ-trên-nền**:

```kotlin
Surface(color = MaterialTheme.colorScheme.surface) {
    Text(
        text = title,
        color = MaterialTheme.colorScheme.onSurface
    )
}
```

`surface` là màu nền; `onSurface` là màu dành cho nội dung **nằm trên** nền đó. Cặp `primary` /
`onPrimary`, `errorContainer` / `onErrorContainer` cũng vậy. Bộ màu của Material 3 được thiết kế sao
cho mỗi cặp `X` / `onX` giữ được độ tương phản ở cả chế độ sáng và tối. Dùng đúng cặp ⇒ bạn được thừa
hưởng phần việc đó mà không phải tính gì.

⚠ **Đừng hiểu quá lời hứa này.** MaterialTheme **không** tự làm mọi giao diện trở nên tương phản đủ.
Nó chỉ bảo đảm cho các cặp vai trò *khi bạn dùng đúng cặp*. Ghép `onSurface` lên nền `primary`, đặt
chữ lên một tấm ảnh, hay giảm `alpha` của chữ cho "đẹp" — cả ba đều đưa bạn ra ngoài vùng bảo đảm và
phải tự kiểm tra.

Thứ đáng mang ra khỏi bài là **kỹ năng quyết định**, không phải con số: chữ và nền phải còn đọc được,
nên hãy ưu tiên cặp vai trò của theme và tự soi lại mọi chỗ bạn tự chọn màu. *(Mức tham khảo, không
cần học thuộc: hướng dẫn accessibility đặt ngưỡng tương phản tối thiểu 4.5:1 cho chữ thường và 3:1 cho
chữ lớn, và có công cụ quét màn hình đo giúp bạn — mục 27.)*

Ba chỗ hay vỡ:

- **Chữ xám nhạt trên nền trắng** — thường sinh ra từ "chữ phụ thì cho nhạt đi cho dịu mắt". Dùng vai
  trò `onSurfaceVariant` thay vì tự chọn một mã xám.
- **Chữ đặt trên ảnh** — ảnh nào cũng có chỗ sáng chỗ tối, không có màu chữ nào đúng cho mọi ảnh. Cần
  một lớp nền mờ hoặc bóng đổ phía sau chữ.
- **Màu ghi cứng** — `Color(0xFF9E9E9E)` chạy đúng ở chế độ sáng rồi vỡ ở chế độ tối. Đây đúng là cạm
  bẫy (g) ở bài C3, giờ thêm một lý do nữa để tránh.

### Đừng để màu là kênh thông tin duy nhất

Nếu cách duy nhất để biết "có lỗi" là **ô nhập chuyển sang màu đỏ**, thì người mù màu đỏ-xanh, người
dùng TalkBack, và người đang để màn hình ở chế độ đơn sắc đều không nhận được thông tin đó. Hướng dẫn
của Android nói thẳng: hãy dùng **thêm** dấu hiệu khác ngoài màu — hình dạng, vị trí, hoặc **chữ**.

| Chỉ có màu | Có màu **và** thứ khác |
|---|---|
| Ô nhập viền đỏ | Viền đỏ + dòng chữ `"Không thể kết nối"` (+ icon cảnh báo) |
| Tin chưa đọc in màu đậm hơn | Đậm hơn + một dấu chấm/nhãn `"chưa đọc"` |
| Trạng thái online là chấm xanh | Chấm xanh + mô tả `"Đang trực tuyến"` |

Chữ là dấu hiệu tốt nhất trong ba loại, vì nó phục vụ **cả** người nhìn thấy màu **và** dịch vụ hỗ trợ
cùng một lúc — bạn không phải làm hai lần.

> **Tự kiểm tra 3.** Vì sao "ô nhập đổi sang màu đỏ khi sai" là chưa đủ, dù ai cũng thấy màu đỏ nghĩa
> là lỗi?
>
> <details><summary>Đáp án</summary>
>
> Ba lý do độc lập: (1) người bị hạn chế nhận biết màu có thể không phân biệt được viền đỏ với viền xám;
> (2) người dùng TalkBack **không nhận được màu chút nào** — màu không nằm trong bản chú thích;
> (3) ngay cả khi thấy đỏ, người dùng vẫn không biết *sai cái gì* nên không biết sửa thế nào. Thêm một
> dòng chữ nói rõ vấn đề giải quyết cả ba.
> </details>

---

## 25. Semantics: siêu dữ liệu về **nghĩa** và **việc làm được**

Đến đây bạn đã dùng semantics ba lần mà chưa cần gọi tên nó: `contentDescription` chính là một thuộc
tính semantics; `Text` tự đặt nội dung chữ của nó vào semantics; `Button` tự đặt vào đó "tôi là nút,
bấm được".

Định nghĩa đủ dùng ở mức người mới: **semantics là phần mô tả kèm theo mỗi thành phần giao diện, nói
nó có nghĩa gì, làm được gì và đang ở trạng thái nào.** Dịch vụ hỗ trợ chỉ đọc phần này.

Khi cần tự thêm vào phần mô tả đó, công cụ là một modifier:

```kotlin
Modifier.semantics {
    contentDescription = "Đang trực tuyến"
}
```

Khối `{ … }` sau `semantics` vẫn là lambda đuôi đã học ở F1, chỉ khác là bên trong nó bạn *gán* vào
các thuộc tính mô tả có sẵn chứ không gọi hàm nào — nên viết được `contentDescription = …` mà không
cần tên đối tượng ở trước. Ở bài này chỉ cần đọc được khuôn hình đó.

### `mergeDescendants = true`: nhiều mảnh hình, một ý nghĩa

Đây là công cụ semantics hữu ích nhất cho người mới, và lý do rất dễ hình dung. Một hàng tin nhắn gồm
avatar, tên người gửi, thời gian, nội dung — với mắt thì đó rõ ràng là **một** tin nhắn. Nhưng với
dịch vụ hỗ trợ, mỗi `Text` là một thành phần riêng: người dùng phải lướt bốn lần, nghe bốn câu rời rạc,
rồi tự ghép lại trong đầu.

```kotlin
// Gộp tên + thời gian thành MỘT thành phần với dịch vụ hỗ trợ
Row(modifier = Modifier.semantics(mergeDescendants = true) {}) {
    Text(text = userFullName)
    Spacer(modifier = Modifier.width(8.dp))
    Text(text = timeAgo)
}
```

Ba điều cần đọc trong đoạn trên:

- `mergeDescendants = true` nói: *coi cả nhóm này là một thành phần, và gom mô tả của các con lại*.
  TalkBack dừng một lần ở cả hàng và đọc `"Ada Lovelace, 5 phút trước"` thay vì hai lần.
- Khối `{}` **để trống** là bình thường: bạn không thêm thuộc tính nào, chỉ bật việc gộp.
- Bạn **không phải** viết nó cho `Button` hay bất cứ thứ gì `clickable`: những cái đó đã tự gộp
  (mục 20). Chỉ nhóm *không* bấm được mới cần bật tay.

Cách quyết định: **gộp khi các mảnh chỉ có nghĩa khi đi cùng nhau, và không mảnh nào cần bấm riêng.**
Đừng gộp một khối lớn gồm nhiều hành động khác nhau — lúc đó bạn tạo ra một câu thông báo rất dài mà
người dùng không tách được thao tác nào ra.

### Trạng thái cũng là một phần của nghĩa (mức nhận biết)

Dịch vụ hỗ trợ cần biết cả **trạng thái**, không chỉ tên gọi: đã tích / chưa tích, đang chọn / không
chọn, bật / tắt được. Một `Checkbox` mà chỉ đọc lên `"Nhận thông báo"` là chưa đủ — người dùng còn cần
biết nó **đang** được tích hay không.

Tin tốt: các component Material đã làm việc này. `Checkbox`, `Switch`, `RadioButton` tự thông báo trạng
thái của chúng; một control bị `enabled = false` cũng tự được thông báo là đang tắt. Nên bài học ở đây
gọn đúng một câu: **nếu component Material đã thể hiện đúng trạng thái thì dùng nó, đừng dựng lại bằng
`Box` + `clickable`.**

Bài này dừng ở mức đó. Bên trong Compose còn cả một cây semantics với các thuộc tính tự định nghĩa và
API kiểm thử riêng, nhưng bạn *không* cần chúng để làm app của khoá — gặp một cái tên lạ trong code
thật (mục 28) thì nhận ra rồi đi tiếp là đủ.

---

## 26. Đừng lạm dụng semantics

Kết luận sai phổ biến nhất sau khi học accessibility lần đầu là: *"vậy mình phải thêm mô tả cho mọi
thứ."* Không.

**Thứ tự ưu tiên, luôn luôn:**

1. **Dùng component có nghĩa sẵn** — `Button`, `Text`, `Checkbox`, `Switch`, `IconButton`, `ListItem`
   và các component Material khác. Chúng mang sẵn tên gọi, loại thành phần, trạng thái, vùng chạm.
2. **Chỉ điền phần Compose không thể tự đoán** — `contentDescription` cho icon/ảnh mang thông tin.
3. **Chỉ tự viết semantics khi cấu trúc hình ảnh không diễn đạt đúng ý nghĩa** — ví dụ đúng nhất là
   `mergeDescendants` cho một nhóm rời rạc, hoặc một control bạn tự dựng bằng `Box` + `clickable` nên
   không có sẵn nghĩa nào.

Vì sao thứ tự này quan trọng: mỗi lần bạn tự viết semantics là một lần bạn **nhận trách nhiệm** duy trì
nó. Mô tả tự viết sẽ lạc hậu khi chức năng đổi, còn `Button` thì không bao giờ quên nói mình là nút.
Dùng component có sẵn là cách ít công nhất **và** bền nhất.

---

## 27. Tự kiểm tra bằng tay: 8 bước

> **Không một điều nào trong bài này kiểm được bằng cách đọc code.** `@Preview` (C4) và chiếc điện
> thoại của bạn ở thiết lập mặc định đều không chứng minh được gì: mô tả sai vẫn compile, vùng chạm
> 24dp vẫn trông đẹp, chữ vẫn vừa khít một dòng. **Mỗi màn hình bạn dựng phải được thử ba lần — một
> lần với TalkBack, một lần ở cỡ chữ lớn nhất, một lần bằng ngón tay.** Khoảng 5 phút mỗi màn hình, và
> đó là toàn bộ phần "kiểm tra" mà bài này yêu cầu ở bạn.

**Bật TalkBack:** *Cài đặt → Trợ năng (Accessibility) → TalkBack → bật*. Lần đầu bật sẽ có hướng dẫn
ngắn — nên xem hết một lượt. Hai cách di chuyển cần biết: **lướt phải/trái** để đi lần lượt qua từng
thành phần, **chạm hai lần** ở bất kỳ đâu để chọn thành phần đang được đọc.

**Đổi cỡ chữ:** *Cài đặt → Trợ năng → Cỡ hiển thị và văn bản (Display size and text) → Cỡ chữ*, tăng
lên mức lớn nhất.

Checklist:

1. Bật TalkBack.
2. Đi qua **cả** màn hình bằng cách lướt, mắt không nhìn (hoặc quay màn hình ra chỗ khác).
3. Mọi thành phần bấm được đều có lời đọc **có nghĩa**? Có chỗ nào chỉ nghe được "bấm được" mà không
   biết bấm ra gì?
4. Có lời đọc nào **trùng lặp hoặc ồn** (đọc hai lần cùng một chữ, đọc cả icon trang trí)?
5. Có thành phần nào **không lướt tới được**? Có thông báo/hộp thoại nào hiện lên mà không được đọc?
6. Tăng cỡ chữ hệ thống lên mức lớn nhất.
7. Chữ có bị **cắt, chồng lên nhau, hay mất hẳn** không? Nút còn bấm được không?
8. Thử bấm vào các icon nhỏ — có phải thử **nhiều lần** mới trúng?

Và một bước không cần thiết bị: **đọc lại màn hình, tìm mọi chỗ mà thông tin chỉ được truyền bằng
màu.**

Có công cụ tự động cho phần này — Accessibility Scanner (app quét màn hình) và Compose UI Check trong
Android Studio — nhưng ở đây chỉ cần **biết chúng tồn tại**; cách dùng thuộc track Mở rộng. Tám bước
bằng tay ở trên phát hiện được gần hết vấn đề thật, và quan trọng hơn: nó cho bạn *cảm giác* app của
mình dùng như thế nào khi không nhìn thấy nó.

---

## 28. Đọc code thật: "người dùng TalkBack sẽ gặp gì ở đây?"

Project Kodeco Chat của bốn bài trước có khá nhiều code accessibility — nhiều hơn phần lớn project mẫu.
Đọc lại nó với một câu hỏi duy nhất: **người dùng TalkBack sẽ gặp gì ở chỗ này?** Đây là bài tập đọc
phê phán, không phải đi tìm lỗi để chấm điểm: một project đang xây dở thì có chỗ xong, chỗ chưa.

### Mẫu tốt 1 — icon-only trong app bar (`components/KodecochatIcon.kt`, `KodecochatAppBar.kt`)

```kotlin
// KodecochatAppBar.kt — dòng 69–77: nút mở menu, chỉ có icon
navigationIcon = {
    KodecoChatIcon(
        contentDescription = stringResource(id = R.string.navigation_drawer_open),
        modifier = Modifier
            .size(64.dp)
            .clickable(onClick = onNavIconPressed)
            .padding(16.dp)
    )
}
```

```kotlin
// KodecochatIcon.kt — dòng 49–74 (rút gọn): logo gồm HAI lớp hình
@Composable
fun KodecoChatIcon(contentDescription: String?, modifier: Modifier = Modifier) {
    val semantics = if (contentDescription != null) {
        Modifier.semantics {
            this.contentDescription = contentDescription
            this.role = Role.Image
        }
    } else {
        Modifier
    }
    Box(modifier = modifier.then(semantics)) {
        Icon(painter = /* lớp dưới */, contentDescription = null, tint = …)
        Icon(painter = /* lớp trên */, contentDescription = null, tint = …)
    }
}
```

Bốn điều làm đúng, cả bốn đều là điều bài này vừa dạy:

1. **Vùng chạm 64dp cho một logo vẽ ở khoảng 32dp.** `size(64.dp)` đứng trước `clickable` nên vùng bấm
   là cả 64dp — vượt mức 48dp một cách thoải mái (C4 mục 15 đã cho bạn *nhìn thấy* con số này khi đổi
   `padding` từ 16dp xuống 3dp).
2. **Mô tả là hành động, không phải hình:** chuỗi `navigation_drawer_open` = *"Open navigation drawer"*
   — không phải "logo Kodeco".
3. **Mô tả lấy từ `strings.xml`,** không gõ thẳng vào code ⇒ dịch được.
4. **Hai `Icon` bên trong đều `contentDescription = null`.** Chúng là hai *lớp vẽ* của cùng một hình:
   nếu cả hai có mô tả, người dùng sẽ nghe hai lần. Mô tả duy nhất được đặt ở **hộp bọc ngoài**. Đây
   đúng là mẫu "phần bọc mang nghĩa, phần bên trong là trang trí".

Chi tiết `role = Role.Image` chỉ cần **nhận ra**: `role` là chỗ nói *loại* thành phần cho dịch vụ hỗ
trợ. Bạn không cần tự đặt `role` trong khoá này — component Material tự làm.

Cùng khuôn hình đó còn xuất hiện ở bộ chọn emoji (`conversation/UserInput.kt` dòng 327–359): một
`IconButton` đặt 56dp, mô tả lấy từ `strings.xml` là `"Show Emoji selector"` và `"Attach Photo"` —
lại là **tên hành động**. Ở đây vùng chạm còn không phải nghĩ, vì `IconButton` đã giữ mức tối thiểu.

### Mẫu tốt 2 — gộp tên và thời gian (`conversation/Conversation.kt` dòng 265–289)

```kotlin
// Combine author and timestamp for author.
Row(modifier = Modifier.semantics(mergeDescendants = true) {}) {
    Text(text = userFullName, style = MaterialTheme.typography.titleMedium, …)
    Spacer(modifier = Modifier.width(8.dp))
    Text(text = msg.message.createdOn.toString().isoToTimeAgo(), …)
}
```

Đây chính là ví dụ `mergeDescendants` của mục 25, có thật trong project — kể cả dòng comment giải thích
ý định ngay trên đầu. "Ada Lovelace" và "5 phút trước" là hai `Text` riêng vì cần hai kiểu chữ khác
nhau, nhưng với dịch vụ hỗ trợ thì chúng là **một** thông tin: *ai gửi, lúc nào*.

### Chỗ đáng đặt câu hỏi 1 — avatar bấm được nhưng không có tên (dòng 207–219)

```kotlin
Image(
    modifier = Modifier
        .clickable(onClick = { onAuthorClick(msg.message.userId) })
        .padding(horizontal = 16.dp)
        .size(42.dp)
        …,
    painter = painterResource(id = authorImageId),
    contentDescription = null          // ← dòng 218
)
```

Đọc bằng câu hỏi của mục 20: **ảnh này bấm được** — nên nó *không* phải trang trí, và `null` để lại một
thành phần bấm được **không có tên gọi**. Người dùng TalkBack dừng ở đó, nghe đại ý "bấm được", và không
có cách nào biết bấm ra cái gì.

Đây là chỗ đọc code phê phán thú vị, vì có hai cách đọc đều hợp lý:

- Ở **trạng thái hiện tại của chương**, lời gọi `onAuthorClick` được truyền vào là một lambda **rỗng**
  (`Conversation.kt` dòng 171: `MessageUi(onAuthorClick = { }, …)`) — bấm vào không xảy ra gì. Toàn
  chương chỉ làm tầng giao diện. Với một ảnh *không* thật sự tương tác thì `null` là đúng.
- Nhưng `Modifier.clickable` **vẫn** đăng ký thành phần đó là bấm được với dịch vụ hỗ trợ, dù việc bấm
  không làm gì. Nên hai cách sửa hợp lý: **bỏ `clickable`** trong khi chức năng chưa có, **hoặc** cấp
  cho nó mô tả hành động thật (`"Ảnh đại diện của Ada, mở trang cá nhân"`) ngay lúc nối chức năng vào.

Còn một chi tiết kích thước ở cùng chuỗi đó: `clickable` đứng đầu nên vùng chạm bao trọn phần đệm, ra
`42 + 16 × 2 = 74dp` **chiều ngang** — nhưng **chiều dọc vẫn chỉ 42dp**, dưới mức 48dp. (Con số 74 này
chính là con số của `Spacer(Modifier.width(74.dp))` ở dòng 222 mà C2 mục 7 đã tính.) Sửa nhỏ: thêm
`sizeIn(minHeight = 48.dp)`, hoặc dùng đệm dọc thay vì chỉ đệm ngang.

### Chỗ đáng đặt câu hỏi 2 — mô tả đặt tên đồ vật thay vì việc làm (dòng 366–376)

```kotlin
Icon(
    imageVector = Icons.Outlined.Info,
    modifier = Modifier
        .clickable(onClick = { })
        .padding(horizontal = 12.dp, vertical = 16.dp)
        .height(24.dp),
    contentDescription = stringResource(id = R.string.info)   // "Information"
)
```

Phần **vùng chạm ở đây làm đúng**, và đúng theo cách bạn vừa học: `clickable` đứng **trước** `padding`,
nên vùng bấm bao cả phần đệm — khoảng `24 + 12 × 2 = 48dp` ngang và `24 + 16 × 2 = 56dp` dọc. Hãy so
với cạm bẫy (d) ở bài C2: cùng ba modifier, đổi thứ tự thì còn 24dp.

Phần đáng bàn là **lời mô tả**: `"Information"` đặt tên *đồ vật* ("thông tin"), không nói *việc* bấm vào
thì gì xảy ra. Người dùng nghe "Information, bấm hai lần để mở" và vẫn không biết mở ra cái gì. Bản tốt
hơn: `"Xem thông tin kênh"`. (Cũng như avatar, `onClick = { }` ở đây còn để trống — tầng giao diện chưa
được nối.)

### Chỗ đáng đặt câu hỏi 3 — ô nhập tự dựng phải tự gắn mô tả (`UserInput.kt` dòng 371–441)

Ô nhập chữ ở đây không dùng `OutlinedTextField` như C2 mục 4, mà dùng `BasicTextField` — thành phần thô
nhất, chỉ vẽ chữ và nhận gõ, **không có** `label` hay `placeholder`. Không có `label` nghĩa là không có
tên gọi nào để dịch vụ hỗ trợ đọc, nên `Row` bọc ngoài phải tự gắn `contentDescription` bằng
`Modifier.semantics` (dòng 386–389, nhãn lấy từ `strings.xml`). Đây là nguyên tắc của mục 26 nhìn từ
chiều ngược lại: **chọn thành phần thô thì bạn nhận luôn phần việc semantics mà component Material đã
làm sẵn** — code này không sai, nó chỉ đang trả giá cho lựa chọn đó. (Trong cùng khối còn một thuộc
tính semantics tự định nghĩa ở dòng 366–367: ngoài phạm vi bài này, nhận ra tên rồi đi tiếp.)

### Nhận diện vấn đề — chưa sửa ở bài này: liên kết nằm trong chuỗi chữ (dòng 322–352)

`ClickableMessage` làm cho @mention và đường link *bên trong* một đoạn chữ bấm được. Với mắt thì rõ
ràng; với dịch vụ hỗ trợ thì những liên kết đó **không** hiện ra thành thành phần thao tác riêng —
người dùng TalkBack nghe được cả đoạn chữ nhưng không có cách nào lướt tới từng liên kết.

**Nhận diện vấn đề — chưa sửa ở bài này.** Cách sửa đúng cần API liên kết trong `AnnotatedString` của
bản Compose mới hơn, vượt phạm vi C5. Ghi nhận rồi đi tiếp vẫn tốt hơn là dạy nửa vời một giải pháp
nâng cao — và bản thân việc *nhìn ra* được vấn đề này đã là kỹ năng bài này muốn bạn có.

### Tổng kết đợt đọc

Hai mẫu tốt nữa không cần đoạn riêng: bộ kiểu chữ của project (`theme/Typography.kt`) khai **toàn bộ
bằng `sp`**, nên chữ phóng được theo thiết lập của người dùng; và mọi mô tả trong app đều nằm trong
`strings.xml`. Còn một chỗ đáng sửa cùng họ với mục 22: nút Send bị ép `Modifier.height(36.dp)`
(`conversation/UserInput.kt` dòng 311) — chiều cao dưới mức tối thiểu, đúng lỗi "ép cứng kích thước một
control".

| Chỗ | Đọc ra gì |
|---|---|
| Nút menu app bar (64dp, mô tả hành động lấy từ `strings.xml`, hai lớp icon bên trong đều `null`) | Mẫu tốt — dùng làm khuôn |
| `IconButton` chọn emoji/ảnh (56dp, mô tả hành động) | Mẫu tốt — Material lo vùng chạm |
| `Row` gộp tên + thời gian | Mẫu tốt — đúng ca dùng `mergeDescendants` |
| `theme/Typography.kt`: 15 vai trò kiểu chữ, tất cả khai bằng `sp` | Mẫu tốt — chữ phóng được theo thiết lập của người dùng |
| Avatar `clickable` + `contentDescription = null`, cao 42dp | Đáng sửa: thành phần bấm được không có tên; chiều dọc dưới 48dp |
| `"Information"` cho icon thông tin | Đáng chỉnh lời: nên là tên **hành động** |
| Nút Send bị ép `Modifier.height(36.dp)` (`UserInput.kt` dòng 311) | Đáng sửa: đừng ép chiều cao một control xuống dưới 48dp |
| `BasicTextField` + semantics tay | Hợp lý *vì* chọn thành phần thô — nhưng `OutlinedTextField` thì miễn phí |
| Liên kết/@mention trong `ClickableText` | **Nhận diện vấn đề — chưa sửa ở bài này** (cách sửa cần API mới hơn) |
| Thuộc tính semantics tự định nghĩa | Ngoài phạm vi — nhận ra rồi đi tiếp |

---

## Cạm bẫy

> *Khi dựng trang: đây là khối `<h2 id="cam-bay">` duy nhất của bài. Ba cạm bẫy dưới đây được gom theo
> **niềm tin sai của người học** — mỗi cạm bẫy sửa một quyết định, không phải một API — và vừa đúng
> giới hạn "tối đa 3 cạm bẫy / bài" của template.*

**(a) "Cứ thêm mô tả cho mọi thứ là an toàn."** Đây là kết luận sai phổ biến nhất sau khi học
accessibility lần đầu, và nó tạo ra ba lỗi một lúc. Ảnh nền trang trí có mô tả ⇒ mỗi lần lướt tới nội
dung thật, người dùng phải nghe trước một câu vô nghĩa. Một `Button` đã có chữ "Gửi" mà icon bên trong
cũng mô tả `"Gửi"` ⇒ nghe thành "Gửi Gửi", vì nút tự gộp mô tả của các con. Gắn thêm
`Modifier.semantics { }` lên một `Checkbox` hay `Switch` là công vô ích — chúng đã tự thông báo đúng
loại và trạng thái, còn mô tả bạn tự viết sẽ là thứ đầu tiên lạc hậu khi chức năng đổi. Trong khi đó
thứ **luôn** phải có mô tả lại thường bị quên: mọi thành phần **bấm được** mà không có chữ hiển thị nào
bên cạnh. Quy tắc gọn: điền phần Compose không thể tự đoán, đừng điền phần đã có người làm sẵn.

**(b) "Icon 24dp thì vùng bấm 24dp, và UI nhìn ổn trên máy mình là ổn."** Hai nửa của cùng một thói
quen: nói trước một con số mà đáng ra phải để ngón tay và nội dung quyết định.
`Modifier.padding(12.dp).clickable { … }` để lại vùng bấm đúng 24dp cho một icon 24dp (đổi thứ tự là
xong — C2 mục 6). Truyền `Modifier.height(36.dp)` vào một `Button` là **lấy lại** mức tối thiểu mà
Material vừa cho bạn. `Modifier.height(40.dp)` quanh một dòng `Text` trông ổn trên máy bạn rồi cắt mất
chữ ở cỡ chữ lớn nhất. Cả ba **không hiện ra trong `@Preview`**, và cũng không hiện ra trên điện thoại
đang để thiết lập mặc định của bạn — chỉ hiện khi có ngón tay thật và thiết lập thật (mục 27).

**(c) "Đổi sang màu đỏ là đủ để báo lỗi."** Màu **không** nằm trong phần mô tả mà dịch vụ hỗ trợ đọc,
nên nếu tín hiệu duy nhất của "có lỗi" là viền đỏ thì với người dùng TalkBack thông tin đó **không tồn
tại** — chưa kể người khó phân biệt màu và người đang để màn hình ở chế độ đơn sắc. Cách sửa rẻ nhất là
thêm một dòng chữ nói thẳng vấn đề: chữ phục vụ cả người thấy màu **và** dịch vụ hỗ trợ, nên bạn không
phải làm hai lần.

---

## Tóm tắt

Bài này có **năm** điều cốt lõi. Nếu một tuần sau bạn chỉ còn nhớ năm thứ, hãy để chúng là năm thứ này.

1. **Một giao diện luôn có hai bản mô tả.** Phần vẽ ra màn hình, và phần **semantics** — nói *nghĩa,
   hành động, trạng thái* — mà dịch vụ hỗ trợ đọc. Bản thứ hai không tự khớp với bản thứ nhất.
2. **`contentDescription` là để nói nghĩa, không phải để điền cho có.** Mang thông tin ⇒ một câu chữ mô
   tả **việc làm được** (`"Xoá tin nhắn"`, không phải `"Icon thùng rác"`; và vì người dùng nghe được nó,
   nó thuộc `strings.xml`). Trang trí ⇒ `null`. Bấm được ⇒ **luôn** phải có tên gọi.
3. **Kích thước nhìn thấy ≠ vùng chạm.** Icon 24dp, vùng chạm ít nhất **48dp × 48dp**. Component
   Material tương tác đã giữ mức đó; control tự dựng bằng `Box` + `clickable` thì bạn tự đặt.
4. **Giao diện phải sống được khi chữ to lên, và không được nói bằng màu.** Cỡ chữ ghi bằng `sp`, mọi
   thứ khác bằng `dp`; đừng ép chiều cao hộp chứa chữ, đừng giả định chữ luôn một dòng; dùng cặp vai trò
   màu (`surface` / `onSurface`) để giữ phần tương phản; và mọi thông tin đang truyền bằng màu phải có
   thêm chữ hoặc hình đi kèm.
5. **Ưu tiên component có nghĩa sẵn, rồi tự kiểm bằng tay.** Component Material trước → điền phần Compose
   không đoán được → chỉ tự viết semantics (ví dụ `mergeDescendants = true` cho một nhóm mảnh rời chỉ có
   nghĩa khi đi cùng nhau) khi cấu trúc hình ảnh không diễn đạt đúng ý nghĩa. Sau đó bật TalkBack + cỡ
   chữ lớn nhất và soi lại màn hình theo checklist mục 27 — `@Preview` không chứng minh được phần này.

---

## Luyện tập — soi một thanh thông báo nhỏ

Dưới đây là một thanh thông báo "chưa gửi được tin" mà một người mới có thể viết. Nó **compile được,
chạy được, và trông tạm ổn** trên máy của người viết. Tìm càng nhiều vấn đề accessibility càng tốt trước
khi mở đáp án — mỗi vấn đề đều thuộc một mục bạn vừa đọc.

```kotlin
@Composable
fun ThongBaoLoi(soTin: Int, onDismiss: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(40.dp)
            .background(Color(0xFFFFF3F3))
    ) {
        Icon(
            imageVector = Icons.Filled.Warning,
            tint = Color.Red,
            contentDescription = "Hình tam giác màu đỏ",
            modifier = Modifier.size(24.dp)
        )
        Text(
            text = "$soTin tin nhắn",
            color = Color(0xFFBDBDBD),
            fontSize = 13.sp
        )
        Icon(
            imageVector = Icons.Filled.Close,
            contentDescription = null,
            modifier = Modifier
                .padding(12.dp)
                .clickable { onDismiss() }
                .size(24.dp)
        )
    }
}
```

*(`Color(0xFFFFF3F3)` là cách ghi một màu cụ thể bằng số hex — đúng kiểu "ghi cứng màu" mà C3 đã cảnh
báo, và ở đây nó gây thêm một vấn đề nữa.)*

<details>
<summary><strong>Sáu vấn đề — mở sau khi đã tự tìm</strong></summary>

1. **Mô tả tả hình, không tả nghĩa** (mục 21). `"Hình tam giác màu đỏ"` không nói cho ai biết chuyện gì
   xảy ra. Ở đây icon cảnh báo thật ra là **trang trí** — nếu dòng chữ nói rõ vấn đề thì mô tả đúng là
   `null`.
2. **Nút đóng không có tên gọi** (mục 20). `contentDescription = null` trên một thành phần **bấm được**
   để lại một nút vô danh: người dùng nghe "bấm được" mà không biết bấm ra gì. Phải là `"Đóng thông báo"`.
3. **Vùng chạm của nút đóng chỉ 24dp** (mục 22). `padding` đứng trước `clickable` nên phần đệm không nhận
   thao tác bấm. Sửa bằng cách đổi thứ tự, hoặc gọn hơn: dùng `IconButton`.
4. **Chiều cao cứng 40dp** (mục 23). Ở cỡ chữ lớn, dòng chữ bị cắt hoặc mất hẳn. Bỏ `height`, dùng đệm.
5. **Chữ xám nhạt trên nền gần trắng + màu ghi cứng** (mục 24). `0xFFBDBDBD` trên `0xFFFFF3F3` là xám
   nhạt trên gần-trắng: tương phản quá thấp để đọc được ngoài trời hoặc với mắt kém hơn bạn — và vì cả
   hai màu đều ghi cứng, chế độ tối sẽ vỡ. Dùng cặp vai trò `errorContainer` / `onErrorContainer`.
   `fontSize = 13.sp` cũng nên thay bằng kiểu chữ của theme.
6. **Thông tin "có lỗi" chỉ được truyền bằng màu** (mục 24). Dòng chữ chỉ nói `"3 tin nhắn"` — hoàn toàn
   trung tính. Người dùng TalkBack không nhận được sắc đỏ, nên với họ màn hình này **không có lỗi nào**.
   Chữ phải nói ra vấn đề.

Bản đã sửa:

```kotlin
@Composable
fun ThongBaoLoi(soTinChuaGui: Int, onDismiss: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.errorContainer)
            .padding(horizontal = 8.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(                                                       // 1
            imageVector = Icons.Filled.Warning,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onErrorContainer,
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(                                                       // 2
            text = "Không thể kết nối — $soTinChuaGui tin nhắn chưa gửi",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onErrorContainer,
            modifier = Modifier.weight(1f)
        )
        IconButton(onClick = onDismiss) {                           // 3
            Icon(
                imageVector = Icons.Filled.Close,
                contentDescription = "Đóng thông báo",              // 4
                tint = MaterialTheme.colorScheme.onErrorContainer
            )
        }
    }
}
```

Bốn thay đổi đáng nói:

1. Icon cảnh báo thành **trang trí** (`null`) — vì dòng chữ đã nói hết. Người dùng nghe *một* câu có
   nghĩa thay vì một câu vô nghĩa rồi mới tới câu có nghĩa.
2. Dòng chữ **nói ra vấn đề**, nên thông tin không còn phụ thuộc vào màu; `weight(1f)` (C2 mục 8) cho nó
   nhận phần chỗ còn lại và tự xuống dòng khi chữ to lên — thay cho `height` cứng.
3. `IconButton` thay cho `Box` + `clickable`: **ngắn hơn và đã có vùng chạm tối thiểu** — đúng nguyên tắc
   mục 26, đừng tự dựng lại thứ Material đã làm.
4. Mọi màu là **vai trò**, nên bản này đúng ở cả chế độ sáng và tối, và cặp `errorContainer` /
   `onErrorContainer` giữ phần tương phản.

**Kiểm lại bằng tay** (mục 27): bật TalkBack, lướt qua thanh này — phải nghe đúng hai thành phần: câu
"Không thể kết nối — 3 tin nhắn chưa gửi", và nút "Đóng thông báo". Rồi tăng cỡ chữ lên mức lớn nhất:
hàng phải cao lên, chữ không bị cắt, nút đóng vẫn bấm được.

</details>

---

## Thu hoạch code thật — bảng phân loại nội bộ

> **Nội dung biên tập nội bộ — KHÔNG đưa vào bài học.** Toàn bộ số dòng đã kiểm bằng lệnh thật trên
> `aaf-materials/05-jetpack-compose/projects/final/app/src/main` ngày 2026-09-05. Phân loại:
> **A** = mẫu accessible tốt · **B** = cần giải thích (không phải lỗi) · **C** = vấn đề accessibility
> thật · **D** = không liên quan / ngoài phạm vi C5. Nguyên tắc: **không bịa lỗi** — mọi dòng C dưới
> đây đều là code có thật, và ba trong bốn dòng C được đặt trong ngữ cảnh "project đang xây tầng giao
> diện, chưa nối chức năng".

| # | Vị trí (file · dòng) | Nội dung | Loại | Dùng trong bài |
|---|---|---|---|---|
| 1 | `components/KodecochatIcon.kt` 49–74 | Hộp bọc cấp `contentDescription` khi khác `null`; hai `Icon` lớp trong đều `null` | **A** | mục 28, Mẫu tốt 1 |
| 2 | `components/KodecochatAppBar.kt` 69–77 | `size(64.dp)` trước `clickable` ⇒ vùng chạm 64dp; mô tả `navigation_drawer_open` = "Open navigation drawer" | **A** | mục 28, Mẫu tốt 1 |
| 3 | `conversation/UserInput.kt` 327–359 (mô tả từ 281, 287) | `IconButton` 56dp + mô tả hành động ("Show Emoji selector", "Attach Photo") | **A** | mục 28, một đoạn trong Mẫu tốt 1 |
| 4 | `conversation/Conversation.kt` 265–289 (merge ở 273) | `Row(Modifier.semantics(mergeDescendants = true) {})` gộp tên + thời gian, có comment nêu ý định | **A** | mục 25 + mục 28, Mẫu tốt 2 |
| 5 | `conversation/Conversation.kt` 366–376 | Icon info: `clickable` **trước** `padding` ⇒ vùng chạm ~48×56dp | **A** | mục 28 (phần vùng chạm) |
| 6 | `res/values/strings.xml` 47–59 | Khối `<!-- Accessibility descriptions -->`: mô tả nằm trong string resource | **A** | mục 21 + mục 28 |
| 7 | `theme/Typography.kt` 68–174 | 15 vai trò kiểu chữ, toàn bộ khai bằng `sp` | **A** | mục 23 (câu "dùng typography là đã dùng `sp`") + một hàng trong bảng tổng kết mục 28 |
| 8 | `conversation/Conversation.kt` 366–376 | Mô tả `R.string.info` = "Information" — tên **đồ vật**, không phải tên **hành động** | **B** | mục 28, Chỗ đáng đặt câu hỏi 2 |
| 9 | `conversation/UserInput.kt` 371–441 (nhãn 381, semantics 386–389) | `BasicTextField` không có `label` ⇒ phải tự gắn `contentDescription` cho `Row` bọc ngoài | **B** | mục 28, Chỗ đáng đặt câu hỏi 3 — sau C5B rút còn **prose, bỏ code block** (bài học của nó đã nằm ở mục 26) |
| 10 | `conversation/UserInput.kt` 443–479 (semantics 456) | `Column` của bộ chọn emoji mang một `contentDescription` nhóm | **B** | không dùng (đã đủ ví dụ) |
| 11 | `conversation/MessageFormatter.kt` 179 | `fontSize = 12.sp` ghi cứng trong `SpanStyle` của đoạn code inline | **B** | không dùng (vẫn là `sp` nên vẫn phóng; chỉ là không lấy từ `typography`) |
| 12 | `conversation/Conversation.kt` 207–219 (mô tả 218, gọi ở 171) | `Image` có `clickable` nhưng `contentDescription = null` ⇒ thành phần bấm được không tên; `onAuthorClick` truyền vào là lambda rỗng | **C** | mục 28, Chỗ đáng đặt câu hỏi 1 |
| 13 | `conversation/Conversation.kt` 207–219 | Vùng chạm avatar `74dp × 42dp` — chiều dọc dưới mức 48dp | **C** (nhỏ) | mục 28, cùng chỗ |
| 14 | `conversation/UserInput.kt` 310–322 (dòng 311) | Nút Send bị ép `Modifier.height(36.dp)`, dưới mức 48dp | **C** (nhỏ) | mục 22 + Cạm bẫy (b) ở dạng nguyên tắc, và một hàng trong bảng tổng kết mục 28 |
| 15 | `conversation/Conversation.kt` 322–352 | `ClickableText`: liên kết/@mention bên trong chuỗi **không** được đưa ra thành thành phần thao tác riêng cho dịch vụ hỗ trợ | **C — hoãn** | mục 28: **dùng ở mức nhận diện**, gắn nhãn "Nhận diện vấn đề — chưa sửa ở bài này". Không dạy cách sửa (cần API liên kết trong `AnnotatedString`, Compose 1.7+) |
| 16 | `conversation/UserInput.kt` 366–367 | `SemanticsPropertyKey<Boolean>("KeyboardShownKey")` tự định nghĩa | **D** | mục 28: sau C5B chỉ còn một mệnh đề "một thuộc tính semantics tự định nghĩa" — **không nêu tên API** trong bài học; tên và ngữ cảnh nằm ở "Future accessibility reference notes" |
| 17 | `components/KodecochatIcon.kt` 57 | `role = Role.Image` trên node mà bên gọi gắn `clickable` | **D** | mục 28: chỉ một câu "role là chỗ nói loại thành phần"; không bắt lỗi |
| 18 | `ui/theme/Type.kt`, `ui/theme/Theme.kt` | Thư mục theme thứ hai — code chết (đã kết luận ở C3 mục 14) | **D** | không dùng |

**Hai điểm chính xác đã cố ý giữ mức "không khẳng định quá":**

- **Dòng 14 (nút Send 36dp).** Bài học nói "đừng ép chiều cao control xuống dưới 48dp" và **không** khẳng
  định vùng chạm cuối cùng rộng đúng bao nhiêu. Lý do: Material còn có cơ chế nới vùng chạm ra **ngoài**
  biên hiển thị của component, nên tính ra con số chính xác đòi đọc phần cài đặt bên trong Material —
  vượt phạm vi bài. Phát biểu được giữ ở mức nguyên tắc (đúng, kiểm được) thay vì con số (không kiểm
  được trong bài).
- **Vùng chạm nhỏ hơn mức tối thiểu nói chung.** Compose *có* nới vùng chạm cho composable bấm được nhỏ
  hơn mức tối thiểu, nhưng hướng dẫn chính thức vẫn yêu cầu tự đặt kích thước (vì các vùng chạm nới ra
  có thể chồng lên nhau, và việc nới không cứu được một vùng chạm bị co lại do sai thứ tự modifier). Bài
  học vì vậy dạy **đặt kích thước tường minh**, và không dựa vào cơ chế nới đó.

---

## Future accessibility reference notes

> **Nội dung biên tập nội bộ — KHÔNG đưa vào bài học.** Đây là **kho ghi nhớ kỹ thuật** cho các chi
> tiết đã được **hạ ưu tiên** khỏi prose học của C5 ở đợt C5B: chúng đúng và đã kiểm, nhưng không giúp
> người mới ra quyết định hằng ngày tốt hơn, nên nếu để trong bài thì chúng cạnh tranh với năm điều cốt
> lõi. Đây **không** phải nội dung học tương lai đã được duyệt — cột "nhà khả dĩ" chỉ là gợi ý.
>
> Mỗi mục ghi: phát biểu đầy đủ · vì sao không ở lõi C5 · dấu vết còn lại trong bài (nếu có).

**1. Phóng chữ không tuyến tính và mốc phiên bản.** Từ Android 14, người dùng đặt được cỡ chữ tới 200%,
và đường phóng là **không tuyến tính**: chữ đã lớn phóng ít hơn chữ nhỏ, nên `4sp + 20sp` không còn bằng
`24sp` và mọi phép tính bố cục dựa trên `sp` sẽ lệch. *Không ở lõi:* biến hành vi theo phiên bản Android
thành một bài con là đúng thứ C5B cấm; quyết định thực dụng ("cỡ chữ dùng `sp`, mọi thứ khác dùng `dp`")
không cần con số nào để đúng. *Dấu vết trong bài:* mục 23 giữ mức 200% và một mệnh đề "việc phóng chữ
không phải một phép nhân đơn giản". *Nhà khả dĩ:* AP3 (bảng tra cứu) hoặc O3 (adaptive UI).

**2. Ngưỡng tương phản chính xác.** Chữ nhỏ hơn 18sp (hoặc in đậm nhỏ hơn 14sp) nên đạt tối thiểu
**4.5:1** so với nền; chữ lớn hơn thì **3:1**. *Không ở lõi:* nhớ con số không phải kỹ năng C5 dạy —
kỹ năng là "ưu tiên cặp vai trò màu, và tự kiểm chỗ mình tự chọn màu". *Dấu vết trong bài:* mục 24 nêu
hai con số **một lần**, in nghiêng, kèm chữ "mức tham khảo, không cần học thuộc", và không đưa ngưỡng
kích thước chữ vào. *Nhà khả dĩ:* AP3.

**3. Hành vi gộp ở biên cha/con.** Một cha đặt `mergeDescendants = true` **không** gộp được một con đã
tự gộp (ví dụ một `IconButton` nằm trong hàng): con đó vẫn là thành phần thao tác riêng — và đó là điều
mong muốn. *Không ở lõi:* đây là lời giải thích *vì sao an toàn*, còn quyết định của người học đã được
quy tắc "đừng gộp nhóm có mảnh cần bấm riêng" xử lý xong. *Dấu vết trong bài:* mục 25 giữ đúng quy tắc
quyết định đó. *Nhà khả dĩ:* một bài a11y nâng cao, nếu khoá học mở track đó.

**4. `stateDescription`.** Thuộc tính semantics cho phép **đổi lời** thông báo trạng thái (nói "Đã đăng
ký" thay vì "Đã tích"). *Không ở lõi:* C5 đã có một mục tiêu về semantics; thêm một API nữa là thêm một
thứ phải nhớ mà không đổi được quyết định nào, vì bài học thật là "component Material đã thông báo đúng
trạng thái, đừng dựng lại bằng `Box` + `clickable`". *Dấu vết trong bài:* mục 25 giữ nguyên bài học đó,
không nêu tên API. *Nhà khả dĩ:* bài a11y nâng cao / AP3.

**5. Công cụ tự động.** **Accessibility Scanner** (app trên Play Store, quét một màn hình và báo touch
target nhỏ, tương phản thấp, thiếu nhãn) · **Compose UI Check** trong Android Studio (kiểm ngay trong
chế độ xem trước) · các **API kiểm thử accessibility** của Compose. *Không ở lõi:* C5 sở hữu phần *nhận
thức thủ công* — biết app của mình dùng như thế nào khi không nhìn thấy nó; kiểm thử tự động là một chủ
đề khác và đã có nhà. *Dấu vết trong bài:* mục 27 có **đúng một câu** nêu tên hai công cụ đầu ở mức
"biết là chúng tồn tại". *Nhà khả dĩ:* O2 (testing) cho API kiểm thử; AP3 cho tên công cụ.

**6. Cơ chế nới vùng chạm.** Compose/Material có nới vùng chạm ra **ngoài** biên hiển thị cho composable
bấm được nhỏ hơn mức tối thiểu, nhưng các vùng nới có thể chồng nhau và việc nới **không** cứu được một
vùng chạm bị co lại vì sai thứ tự modifier — nên hướng dẫn chính thức vẫn yêu cầu tự đặt kích thước.
*Không ở lõi:* biết cơ chế này ở mức nửa vời dễ dẫn tới kết luận sai "Compose tự lo, khỏi đặt size".
*Dấu vết trong bài:* mục 22 dạy đặt kích thước tường minh và **không** khẳng định con số vùng chạm cuối
cùng của nút Send 36dp. *Nhà khả dĩ:* bài a11y nâng cao. (Xem thêm hai gạch "không khẳng định quá" ở
mục "Thu hoạch code thật".)

**7. Phần còn lại của bề mặt API semantics.** Cấu trúc cây semantics (merged tree vs unmerged tree) ·
`SemanticsPropertyKey` tự định nghĩa — trong project mẫu là `SemanticsPropertyKey<Boolean>("KeyboardShownKey")`
(`conversation/UserInput.kt` 366–367) · `clearAndSetSemantics` (xoá và ghi đè toàn bộ mô tả của một
nhánh) · điều khiển thứ tự đọc · `Role` do người viết tự đặt. *Không ở lõi:* C5 cố tình **không** là
tutorial API semantics; người học chỉ cần `contentDescription` và `mergeDescendants` để làm app của khoá.
*Dấu vết trong bài:* mục 25 có một câu "bên trong Compose còn cả một cây semantics… nhận ra rồi đi tiếp",
mục 28 nhắc một mệnh đề về `role` và một mệnh đề về thuộc tính tự định nghĩa (không nêu tên API).
*Nhà khả dĩ:* bài a11y nâng cao.

**8. Liên kết trong chuỗi chữ (`ClickableText` → `AnnotatedString` link API).** `ClickableMessage`
(`conversation/Conversation.kt` 322–352) làm @mention và URL bấm được bằng `ClickableText`, nên các liên
kết đó không hiện ra thành thành phần thao tác riêng cho dịch vụ hỗ trợ. Cách sửa đúng dùng API liên kết
trong `AnnotatedString` (Compose 1.7+), tức là một API **chưa** có trong stack 2023 của khoá. *Không ở
lõi:* dạy cách sửa sẽ kéo theo một API mới ngoài phạm vi; nhưng **nhìn ra** vấn đề thì đúng tầm C5.
*Dấu vết trong bài:* mục 28 giữ mục này ở mức nhận diện, gắn nhãn "Nhận diện vấn đề — chưa sửa ở bài
này". *Nhà khả dĩ:* bài a11y nâng cao, hoặc một ghi chú drift khi khoá nâng phiên bản Compose.

---

## Editorial migration notes

> **Nội dung biên tập nội bộ — KHÔNG đưa vào bài học.** Task này **không** được sửa Ch05; mục này chỉ
> ghi lại việc cần làm ở batch sau (IMP-035 tách C1–C4, IMP-047 dựng C5) để hai bên không dạy trùng.

**Tình trạng nền:** C5 gần như **thuần bổ sung**. Ch05 hiện tại không dạy accessibility ở bất kỳ đâu —
không có đoạn nào giải thích `contentDescription`, semantics, cỡ chữ hệ thống, độ tương phản hay TalkBack.
Vì vậy **không có khối nội dung nào cần xoá**; chỉ có một dòng ghi chú kế hoạch cần dọn và ba chỗ nên
thêm liên kết chéo.

### A. Cần dọn khi C5 live

| Vị trí | Nội dung hiện tại | Việc cần làm |
|---|---|---|
| `Ch05JetpackCompose.astro` dòng 34–35 (khối comment đầu file) | `→ C5 (A11y cơ bản): contentDescription, Modifier.semantics(mergeDescendants), kích thước vùng chạm của icon 64.dp/24.dp.` | Đây là ghi chú **hoãn**. Khi C5 live: đổi thành ghi chú "đã chuyển sang C5 — xem `c5-…`" hoặc bỏ, vì việc hoãn đã hoàn tất. Ba mục được liệt kê ở đó **đều** đã có nhà trong C5 (mục 20/25/22). |

### B. Nên thêm liên kết chéo (không xoá nội dung, không đổi ý)

| Vị trí | Nội dung hiện tại | Đề xuất khi C5 live |
|---|---|---|
| C2 "Kiểm tra nhanh — Đơn vị 2" (dòng 1754–1771) | Câu hỏi đổi thứ tự `padding`/`clickable`, đáp án nêu "khoảng 48dp mỗi chiều: dễ bấm hơn nhiều" | **Giữ nguyên** — đây là checkpoint về thứ tự modifier, thuộc C2. Thêm đúng một mệnh đề: "vì sao 48dp là con số đáng nhớ ⇒ C5". |
| C2 Cạm bẫy (d) (dòng 2749–2754) | "…khác biệt là giữa vùng bấm 24dp (khó bấm) và khoảng 48dp (dễ bấm). Đây là lỗi trải nghiệm thật…" | **Giữ nguyên trap** (nó là trap về `Modifier`). Rút phần biện luận accessibility còn 1 mệnh đề + trỏ C5, để C5 là nơi dạy chính con số 48dp. |
| C4 mục 15, ghi chú live-preview (dòng 2417–2422) | Giải thích vì sao giảm `padding` làm logo to ra, với chuỗi `.size(64.dp).clickable(...).padding(16.dp)` | **Giữ nguyên**. Thêm 1 mệnh đề: "chuỗi này còn là mẫu vùng chạm 64dp — xem C5 mục 22/28". |
| C4 bảng "ba việc `@Preview` không chứng minh được", hàng 2 (dòng 2437–2442) | "Cỡ chữ hệ thống của người dùng… đều có thể khác" | **Giữ nguyên**. Thêm trỏ tới C5 mục 23 + checklist mục 27 (đây là chỗ trả lời "vậy kiểm bằng gì"). |

### C. Cân nhắc, không bắt buộc

1. **Khối code chuỗi `Modifier` của avatar trong C2** (biến `avatarChainCode`, dòng 329–341) có
   `contentDescription = null` mà C2 không giải thích (đúng phạm vi C2 — bài đó nói về chuỗi modifier).
   Khi C5 live, có thể thêm nửa câu "tham số `contentDescription` thuộc phần a11y — C5" để người học
   không thấy một dòng lạ không ai nhắc tới. Không bắt buộc.
2. **Độ chính xác của cách nói "vùng bấm chỉ còn đúng 24dp"** (C2 checkpoint + trap (d)): chính xác hơn
   là "vùng bấm **được đăng ký** chỉ còn 24dp". Compose vẫn có thể nới vùng chạm ra ngoài biên cho
   composable quá nhỏ, nhưng không nên dựa vào cơ chế đó. C5 mục 22 đã dạy theo hướng "tự đặt kích
   thước tường minh", nên nếu muốn chỉnh chữ ở C2 thì chỉ là chỉnh **độ chính xác của cách phát biểu**,
   không đổi kết luận. Ưu tiên thấp.
3. **Ch05 hiện là một route gộp.** Nếu C5 được dựng **trước** khi Ch05 tách (IMP-035), mọi liên kết chéo
   ở mục B phải trỏ tới trang gộp `ch05-jetpack-compose` kèm anchor mục (`#thu-tu-modifier`,
   `#cam-bay`, `#preview`), rồi cập nhật lại khi tách. Thứ tự trong plan là **C1–C4 trước, C5 sau**
   (IMP-035 → IMP-036/047), nên trường hợp này chỉ xảy ra nếu đảo thứ tự.
4. **Nhãn tham chiếu chéo trong thân bài.** Draft này gọi bốn bài trước là **C1–C4** và giới thiệu nội
   dung của từng bài ngay ở khối "Cần biết trước" để nhãn tự giải thích. Nếu đợt tách chọn cách gọi khác
   (trang gộp hiện dùng "Đơn vị 1–4"; registry dùng tên bài đầy đủ), thì thay nhãn cho khớp — đây là
   việc sửa **chữ**, không đụng nội dung. Chỗ cần sửa: mục 22 (C2 mục 6), mục 23 (nối lại với C4),
   mục 24 (C3 mục 11 + cạm bẫy (g) ở bài C3), mục 28 (cạm bẫy (d) ở bài C2, C2 mục 4, C4 mục 15),
   Luyện tập (C2 mục 8, C3), và khối "Cần biết trước".

### D. Việc còn lại của IMP-047 mà draft này KHÔNG làm (đúng phạm vi task)

- **Quiz ≥ 8 câu** theo chuẩn §13 (4 phương án, cân rank độ dài + vị trí, giải thích cả distractor).
  **Năm** mục tiêu ở đầu bài đều cần ≥ 1 câu; nguồn câu hỏi tốt nhất, theo đúng thứ tự ưu tiên của bài:
  cặp `null` vs chữ (mục 20), mô tả trùng trong `Button` (mục 20), lời mô tả theo hành động (mục 21),
  thứ tự modifier ⇒ vùng chạm (mục 22), `sp`/`dp` + hộp cao cứng (mục 23), màu-đơn-kênh (mục 24), ca
  dùng `mergeDescendants` + thứ tự ưu tiên component (mục 25–26), và một câu đọc code lấy từ đoạn Luyện
  tập. **Không** hỏi các chi tiết đã hạ xuống mức tham khảo (con số tương phản, phóng chữ không tuyến
  tính, `stateDescription`, tên công cụ tự động) — chúng không nằm trong mục tiêu nào.
- **Slug + registry + `stageId=compose` + badge "Lõi"**, `lessons.ts`, `TARGET_REGISTRY_v5.md`: theo
  IMP-012/IMP-047. C5 là bài **NEW** ⇒ slug mới, **không** tự done từ progress cũ (§12.2 case D).
- **Khối `<h2 id="nguon">`** dựng từ mục "Sources for future Nguồn block" bên dưới.
- Kiểm tra template: đúng 1 `cam-bay`, đúng 1 `nguon`, số mục **19–28** liên tục với C1–C4, **4 callout**
  và **3 checkpoint** như draft này đang có (đừng thêm callout mới khi chuyển sang Astro — mọi khối `>`
  còn lại trong phần "Bài học" đều đã được chọn có chủ ý).

### E. Ngân sách nhấn mạnh sau đợt C5B

**Vấn đề đã sửa.** Bản trước **không** sai nội dung và cũng không dư chủ đề — nó sai **thứ bậc**: 9
callout, 5 checkpoint, 7 mục tiêu, 10 điểm tóm tắt, và các chi tiết tham chiếu (con số tương phản, phóng
chữ không tuyến tính, `stateDescription`, tên công cụ tự động) nằm ngang hàng với năm quyết định cốt lõi.
Với một bài **nền tảng nhỏ / core-lite** thì đó là quá tải nhận thức, kể cả khi từng câu đều đúng. Đợt
C5B xếp lại thứ bậc chứ **không** cắt nội dung cho ngắn:

| | Trước | Sau |
|---|---|---|
| Callout (khối `>` nổi trong phần Bài học) | 9 | **4** |
| Checkpoint ("Tự kiểm tra") | 5 | **3** |
| Mục tiêu đầu bài | 7 | **5** (vẫn phủ đủ 8 câu hỏi của learning job) |
| Điểm Tóm tắt | 10 | **5** — đúng năm điều cốt lõi |
| Cạm bẫy | 3 nhóm theo chủ đề API | 3 nhóm theo **niềm tin sai của người học** |
| Code block trong mục 28 | 6 | 5 (`BasicTextField` còn lại prose) |
| Chi tiết nâng cao trong prose học | ngang hàng với nội dung lõi | 0 chỗ ở mức "phải nhớ" — xuống mức nhận biết hoặc vào "Future accessibility reference notes" (8 mục) |
| Số từ phần "Bài học" | ~8.060 | ~8.080 (gần như không đổi — đây **không** phải đợt rút ngắn) |

**Bốn callout giữ lại và lý do từng cái xứng đáng đứng riêng:**

1. *Mô hình "bản vẽ và bản chú thích"* (mục 19) — mô hình trực quan duy nhất của bài; nếu người học chỉ
   nhớ một hình ảnh thì phải là hình này.
2. *Quy tắc quyết định `contentDescription`* (mục 20) — quyết định người học sẽ gặp nhiều nhất, mỗi lần
   đặt một `Icon`; ba dòng, dán được lên tường.
3. *"24dp là thứ bạn thấy, 48dp là thứ ngón tay chạm được"* (mục 22) — hiểu sai chỗ này tạo ra một app
   khó dùng mà vẫn "trông đúng"; nó cần đứng cao hơn phần cú pháp quanh nó.
4. *"Không một điều nào trong bài này kiểm được bằng cách đọc code"* (mục 27) — cảnh báo thực sự nghiêm
   trọng và là cửa vào checklist; nó cũng là chỗ trả lời câu hỏi "vậy tôi tự soi màn hình bằng gì".

**Bảy khối callout cũ được chuyển xuống, không mất một chữ nào:**

| Callout cũ | Nay nằm ở đâu |
|---|---|
| "Kiến thức bền vs cú pháp dễ đổi" (mục 19) | đoạn văn thường, cuối mục 19 |
| Định nghĩa semantics (mục 25) | câu in đậm trong prose — định nghĩa vẫn là câu đầu tiên người học đọc |
| "Chú giải cú pháp (Kotlin)" cho khối `semantics` (mục 25) | prose, rút còn 2 câu (vẫn giữ chú giải tại điểm dùng đầu tiên theo chuẩn §8) |
| "Cố ý để ngoài phạm vi bài này" (mục 25) | một câu prose + mục nội bộ "Future accessibility reference notes" |
| "Nối lại với C4" (mục 23) | đoạn văn thường, cùng chỗ |
| "Đừng hiểu quá lời hứa này" (mục 24) | prose mở đầu bằng **⚠** — spec §19 cho phép ⚠-trên-chữ thay cho hộp |
| "Đây không phải kiểm thử tự động" (mục 27) | một câu nhận biết ở cuối mục 27; chi tiết công cụ vào reference notes |

**Phép cộng callout:** 9 cũ − 7 chuyển xuống = 2 giữ nguyên ("bản vẽ và bản chú thích" ở mục 19,
"24dp/48dp" ở mục 22) **+ 2 callout mới** (quy tắc quyết định `contentDescription` ở mục 20, cảnh báo
"không kiểm được bằng cách đọc code" ở mục 27) = **4**. Hai callout mới không phải nội dung mới: cả hai
nâng một đoạn prose đã có sẵn lên mức nổi, đúng hai chỗ người học cần nhớ nhất.

**Hai checkpoint bỏ đi, bài học của chúng ở lại:** Tự kiểm tra 2 (chọn lời mô tả) → bảng "Nên viết / Đừng
viết" + gạch đầu dòng "đừng nhồi màu sắc hay hình dáng vào mô tả" ở mục 21. Tự kiểm tra 5 (khi nào
`mergeDescendants`) → câu "Cách quyết định" ở mục 25 + được kiểm lại trong đoạn Luyện tập.

**Tín hiệu thời lượng — thông tin, không phải tiêu chí đánh giá.** Phần "Bài học" ~8.080 từ ⇒ đọc khoảng
**33–35 phút** (đối chiếu: F2 ≈ 6.000 từ cho mục tiêu 25 phút). Spec §12 nêu cap 30 phút, nên IMP-047 phải
**chọn một** trong ba đường, và đây là quyết định cấu trúc khoá nên C5B cố tình không tự quyết:

1. **Nhận C5 ~33 phút như một ngoại lệ có ghi chép** — nội dung đã đúng thứ bậc, không mục nào dư chủ đề,
   và mọi mục đều bị một trong năm mục tiêu gọi tên.
2. **Đưa mục 28 (đọc code thật) vào khối gập "đọc thêm"** — giữ nguyên chữ, giảm thời lượng bắt buộc
   xuống ~25 phút. Mục 28 là mục dài nhất và cũng là mục ít "phải nhớ" nhất.
3. **Tách thành C5a (mô tả + kích thước) và C5b (chữ/màu/semantics + tự kiểm)** — chỉ nên làm nếu registry
   chấp nhận thêm một bài; sẽ đổi §6 của spec, `stageId=compose` và số mục 19–28.

**Tín hiệu thứ hai còn lại: số code block.** Phần "Bài học" có **15** khối code (mục 28 chiếm 5, mục
20/22/25/Luyện tập mỗi mục 2, mục 23/24 mỗi mục 1) trong khi template nêu 3–8. Không khối nào dài (đa số
6–12 dòng) và mỗi khối đều có giải thích, nhưng nếu IMP-047 chọn đường (2) ở trên thì con số này xuống
còn 10 cùng lúc. C5B **không** xoá code block nào để chạy theo hạn mức: các cặp SAI/ĐÚNG ở mục 20 và
TỆ/TỐT ở mục 23 là cách dạy chính của hai mục đó.

**Không cắt trong mọi trường hợp:** mục 20 (cặp `null`/chữ + bẫy mô tả trùng), mục 22 (48dp), mục 23
(`sp`/`dp` + hộp cao cứng), checklist mục 27, đoạn Luyện tập, và các quan sát code thật ở mục 28 — đây là
chỗ năm điều cốt lõi được dạy và được kiểm.


---

## Sources for future Nguồn block

> **Nội dung biên tập nội bộ.** Khi dựng khối `<h2 id="nguon">` cho C5, dùng đúng các nguồn dưới đây.
> **Không chế provenance:** C5 là bài **NEW** — giáo trình gốc *không* có phần dạy accessibility, nên
> **không** được viết một dải dòng "giáo trình gốc dạy nội dung này". Cách nêu trung thực đã ghi rõ ở
> gạch đầu dòng đầu tiên.

**1. Quan hệ với giáo trình gốc (nêu chính xác, không hơn).**
`content/book/ch05-jetpack-compose.md` (941 dòng) **chứa code** accessibility như một phần các bước dựng
UI, nhưng **không giải thích** nó: `contentDescription = stringResource(id = R.string.info)` (dòng 352) ·
`contentDescription = stringResource(id = R.string.navigation_drawer_open)` (dòng 397) ·
`contentDescription = null` cho avatar (dòng 726) · `Row(modifier = Modifier.semantics(mergeDescendants = true) {})`
kèm comment "Combine author and timestamp for author." (dòng 780) · và một mệnh đề duy nhất về a11y ở
dòng 148: *"Text: A basic text element that displays text and provides accessibility information."*
⇒ Cách nêu đúng: **các dòng code là vật liệu có sẵn; phần dạy là do khoá học dựng, dựa trên tài liệu
chính thức của Android.**

**2. Tài liệu chính thức Android / Jetpack Compose (thẩm quyền kỹ thuật của bài).**
Đã đối chiếu 2026-09-05; mỗi mục ghi rõ nó chống lưng cho phát biểu nào:

| Nguồn | Chống lưng cho |
|---|---|
| *Accessibility in Compose* — `developer.android.com/develop/ui/compose/accessibility` | Mô hình "Compose dựng phần semantics song song với phần vẽ" (mục 19) |
| *Compose accessibility · API defaults* — `/develop/ui/compose/accessibility/api-defaults` | Mức tối thiểu **48dp**; các component Material tự giữ mức đó **chỉ khi** nhận được thao tác (ví dụ `Checkbox` với `onCheckedChange = null` thì không); `sizeIn(minWidth, minHeight)` cho control tự dựng; Compose có nới vùng chạm ra ngoài biên nhưng vẫn nên tự đặt kích thước (mục 22) |
| *Compose accessibility · Semantics* — `/develop/ui/compose/accessibility/semantics` | Semantics = nghĩa/vai trò/trạng thái; "icon camera về hình chỉ là một ảnh, nhưng nghĩa của nó có thể là *Chụp ảnh*" (mục 19, 21); `Role` ở mức nhận biết (mục 28) · `stateDescription`: sau C5B **không** còn trong bài học — chống lưng cho "Future accessibility reference notes" mục 4 |
| *Compose accessibility · Merging and clearing* — `/develop/ui/compose/accessibility/merging-clearing` | `mergeDescendants = true`; **cha `clickable` tự gộp con** ⇒ giải thích bẫy mô tả trùng trong `Button` (mục 20); ví dụ chính thức của tài liệu là đúng hàng avatar + tác giả + ngày (mục 25) · "con đã tự gộp thì không bị cha gộp" và `clearAndSetSemantics`: chống lưng cho reference notes mục 3 và 7 |
| *Make apps more accessible* — `/guide/topics/ui/accessibility/apps` | Vùng chạm **48dp × 48dp**, "lớn hơn thì càng tốt", `Button`/`IconButton`/`ListItem` đã bảo đảm, control tự dựng thì tự đặt (mục 22) · "mô tả mục đích và kết quả của thao tác, không mô tả chi tiết hình ảnh" + `Role` (mục 21) · độ tương phản **4.5:1** cho chữ < 18sp (hoặc in đậm < 14sp) và **3:1** cho chữ lớn hơn: mục 24 nêu hai con số **một lần ở mức tham khảo**, ngưỡng kích thước chữ ở reference notes mục 2 · Accessibility Scanner: một câu nhận biết ở mục 27 |
| *Principles for improving app accessibility* — `/guide/topics/ui/accessibility/principles` | "Use cues other than color" — dùng hình dạng, vị trí, chữ **cùng với** màu (mục 24) |
| *Test your app's accessibility* — `/guide/topics/ui/accessibility/testing` | Cách bật TalkBack; hai kiểu di chuyển (lướt phải/trái tuần tự, chạm hai lần để chọn); checklist thủ công: lời đọc có truyền đúng nội dung/mục đích, có ngắn gọn hay rườm rà, có lướt tới được mọi thành phần, thông báo tạm thời có được đọc (mục 27) · phân loại vấn đề của pre-launch report: touch target size, low contrast, content labeling |
| *Android 14 features · Non-linear font scaling to 200%* — `/about/versions/14/features` | Cỡ chữ tới **200%** và đường dẫn Cài đặt → Trợ năng → Cỡ hiển thị và văn bản (mục 23, 27); "luôn ghi cỡ chữ bằng `sp`", không dùng `sp` cho `padding`/chiều cao (mục 23) · đường phóng **không tuyến tính** + phép tính `4sp + 20sp ≠ 24sp` + mốc Android 14: chống lưng cho reference notes mục 1 |

**3. Code thật của project mẫu** (đường dẫn gốc
`aaf-materials/05-jetpack-compose/projects/final/app/src/main/java/com/kodeco/chat`, đã kiểm số dòng
2026-09-05 — chi tiết đầy đủ ở bảng "Thu hoạch code thật" phía trên):
`components/KodecochatIcon.kt` (`KodecoChatIcon` 49–74; `semantics` 54–61; hai `Icon` `null` 63–72) ·
`components/KodecochatAppBar.kt` (nav icon 69–77; `size(64.dp)` 73) ·
`conversation/Conversation.kt` (avatar 207–219 với `contentDescription = null` ở 218 và
`onAuthorClick = { }` ở 171; `Spacer(width = 74.dp)` 222; `AuthorNameTimestamp` 265–289 với
`mergeDescendants` 273; `ChannelNameBar` 354–378 với icon info 368–376) ·
`conversation/UserInput.kt` (`UserInputSelector` 263–324 với nút Send `height(36.dp)` 311 và mô tả
281/287; `InputSelectorButton` 327–359 với `IconButton` 341 + `size(56.dp)` 344;
`KeyboardShownKey` 366–367; `UserInputText` 371–441 với `semantics` 386–389) ·
`theme/Typography.kt` (15 vai trò kiểu chữ 68–174, toàn bộ bằng `sp`) ·
`res/values/strings.xml` (khối `<!-- Accessibility descriptions -->` 47–59; `navigation_drawer_open` 41,
`emoji_selector_bt_desc` 49, `attach_photo_desc` 51, `textfield_desc` 54, `info` 59).

**4. Nội bộ khoá học** (tham chiếu ngữ cảnh, không phải nguồn khái niệm): C2 mục 6–7 (thứ tự nối
`Modifier`, phép tính `42 + 16 × 2 = 74`) · C2 Cạm bẫy (d) · C3 mục 11–12 (vai trò màu, `typography`) ·
C3 Cạm bẫy (g) (ghi cứng màu vỡ ở chế độ tối) · C4 mục 15 (bảng "ba việc `@Preview` không chứng minh
được" và ghi chú live-preview 64dp) · Chương 3 (string resource).

**5. Phần do khoá học tự dựng** (ghi vào gạch "Phần bổ sung ngoài giáo trình"): mô hình "bản vẽ và bản
chú thích" · quy tắc quyết định "xoá đi thì người dùng có mất thông tin nào không" · bảng "nên viết / đừng
viết" cho lời mô tả · mô hình "24dp là thứ bạn thấy, 48dp là thứ ngón tay chạm được" · bốn lỗi vỡ bố cục
khi tăng cỡ chữ + cặp so sánh tệ/tốt · bảng "chỉ có màu / có màu và thứ khác" · checklist 8 bước kiểm
bằng tay · đoạn `ThongBaoLoi` sáu lỗi và bản đã sửa · ba khối Tự kiểm tra và ba cạm bẫy gom theo niềm tin
sai của người học.

