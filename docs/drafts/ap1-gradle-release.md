# AP1 Draft — Gradle release, signing và tối ưu build

> **TRẠNG THÁI: DRAFT NỘI BỘ.** File này KHÔNG được route, KHÔNG được link cho người học.
> Nó là kho nguyên liệu để dựng trang phụ lục AP1 ("Gradle nâng cao: signing, keystore, minify")
> ở Workstream F (task IMP-056 theo `docs/COURSE_REDESIGN_IMPLEMENTATION_PLAN.md`).
> Toàn bộ nội dung dưới đây được DI CHUYỂN từ bài Ch04 (A14) trong đợt "CONTENT BATCH 04 —
> CH04 QUALITY-FIRST GRADLE CORE" để không mất tri thức khi A14 được rút về lõi Gradle người mới.
> Nhiệm vụ của AP1 khi dựng trang: tra cứu reference, không quiz, badge "Mở rộng".

## Why this is appendix material

Toàn bộ phần dưới đây phục vụ đúng một việc: **phát hành ứng dụng**. Người mới ở A14 chỉ cần
biết là "bản release tồn tại và cần ký" — còn cách cấu hình signing, sinh keystore, bật R8,
đọc ProGuard rules là kỹ năng của thời điểm chuẩn bị đưa app ra cho người dùng thật. Nhét vào
A14 thì person mới phải giữ trong đầu nhiều khái niệm mà họ chưa có dịp dùng, vi phạm nguyên tắc
"optional complexity leaves the main path" (spec v2 §3.5, §6 dòng AP1, MR-034).

Bối cảnh kỹ thuật khi dựng AP1: các ví dụ dưới đây dùng bộ số của project mẫu chương 4
(Gradle 8.2, AGP 8.2.0, Kotlin 1.9.10 — cuối 2023). Concept không đổi theo phiên bản; khi dựng
trang chính thức, cập nhật bảng version-drift ở cuối file này.

## Debug vs release recap

(Mental model gốc giữ ở A14; bản ghi đầy đủ để tham chiếu.)

- Build system **luôn** có sẵn hai build type mặc định, dù có viết ra trong `build.gradle.kts` hay không:
  - `debug` — `isDebuggable = true`
  - `release` — `isDebuggable = false`
- Khai build type trong file build **không phải để "tạo ra"** mà để **tuỳ biến thuộc tính**; thuộc tính
  nào không đổi thì giữ mặc định. Đây là mental model dùng lại nhiều lần trong Gradle: *khối cấu hình
  thường là "chỉnh cái đã có", không phải "khai sinh cái mới"*.
- Bản debug Android Studio **ký hộ** bằng keystore debug tự tạo — vì thế suốt các chương đầu chỉ bấm
  Run là app cài được lên emulator. Việc ký chỉ hiện ra khi bắt đầu nghĩ tới phát hành.
- File `proguard-rules.pro` trong project gần như trống, toàn bộ là comment do template sinh:

```properties
# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile
```

- Vì sao hai dòng bị comment kia đáng biết: khi R8 làm rối code, số dòng trong crash log cũng mất theo,
  stack trace từ máy người dùng gần như không đọc được. `-keepattributes SourceFile,LineNumberTable`
  giữ lại số dòng; `-renamesourcefileattribute` ẩn tên file gốc. Cặp này hầu như mọi app release đều bật.
- Lưu ý emulator: mọi app chạy trên emulator của Android Studio đều được coi là debuggable **bất kể**
  `isDebuggable` đặt thế nào — đừng kết luận "release build vẫn debug được" cho máy thật.
  (Nguồn: note trong giáo trình gốc, Ch04 mục build types.)

## Signing and keystore mental model

Ba mệnh đề dựng nên toàn bộ bức tranh (giáo trình gốc, Ch04):

1. Không có signature thì **không publish được** — chữ ký là cách xác minh bạn là chủ app.
2. Bản **debug** bạn không cần tự ký — Android Studio ký hộ.
3. Bản **release** thì **bắt buộc** phải ký trước khi phát hành.

Khái niệm gốc: để *cài* một app lên thiết bị, Android đòi một **certificate** (chứng thư) khẳng định
app là thật. Việc gắn certificate đó vào app gọi là **app signing** (ký app).

Phạm vi: giáo trình gốc **không** dạy sinh keystore trong chương này (dẫn sang tutorial
"Android App Distribution" riêng). Phần thực hành thực sự là *cấu hình Gradle để dùng keystore*,
không phải tạo keystore — AP1 có thể mở rộng phần sinh keystore sau.

## signingConfig

Khai `signingConfigs` **bên trong** khối `android { }` và **phía trên** khối `buildTypes { }`
(bản template minh hoạ):

```kotlin
signingConfigs {
  create("release") {
    storeFile = file("path to your keystore file")
    storePassword = "your store password"
    keyAlias = "your key alias"
    keyPassword = "your key password"
  }
}
```

Sau đó bản release phải **áp dụng** config đó — định nghĩa mà không áp dụng thì bản release vẫn
không được ký:

```kotlin
release {
  signingConfig = signingConfigs.getByName("release")
  // ...
}
```

**Thứ tự khai báo có ảnh hưởng** (ít chỗ trong file Gradle mà đảo thứ tự là vỡ build):
`signingConfigs` phải nằm *trước* `buildTypes`, vì Kotlin DSL chạy tuần tự từ trên xuống —
`buildTypes` gọi `signingConfigs.getByName("release")`; nếu tới thời điểm đó config chưa được
`create`, Gradle báo lỗi không tìm thấy. Đã kiểm project mẫu:
`aaf-materials/04-gradle-basics-a-look-behind-the-curtain/projects/final/app/build.gradle.kts`
đặt `signingConfigs` ở dòng 27–34, `buildTypes` ở dòng 35–47.

Hai lời khuyên từ giáo trình gốc:

- **Đặt tên config theo build type mà nó ký** — config tên `"release"` trùng tên build type
  `release` không phải ngẫu nhiên.
- **Đường dẫn keystore tính tương đối với thư mục module**, không phải gốc project:
  keystore `keystore.jks` đặt trong thư mục module thì viết `storeFile = file("keystore.jks")`.

Kết quả cuối ở project `final` (buildTypes có thêm debug suffix — đối chiếu với
`projects/starter/app/build.gradle.kts` dòng 22–30):

```kotlin
  buildTypes {
    release {
      isMinifyEnabled = false
      proguardFiles(
          getDefaultProguardFile("proguard-android-optimize.txt"),
          "proguard-rules.pro"
      )
      signingConfig = signingConfigs.getByName("release")
    }
    debug {
      applicationIdSuffix = ".debug"
    }
  }
```

Nối với mental model `applicationIdSuffix` (giữ ở A14): bản debug có ID
`com.kodeco.chat.debug` — tránh gửi nhầm bản lên Play Store (thấy `.debug` là biết build sai)
và vì ID khác nhau nên hai bản cùng tồn tại trên một máy không ghi đè nhau.

**Bẫy đã kiểm bằng code thật (giữ nguyên khi dựng AP1):** thêm `applicationIdSuffix = ".debug"`
làm vỡ instrumented test có sẵn —
`aaf-materials/04-gradle-basics-a-look-behind-the-curtain/projects/final/app/src/androidTest/java/com/kodeco/chat/ExampleInstrumentedTest.kt`
(dòng 47–55) hard-code `assertEquals("com.kodeco.chat", appContext.packageName)`.
Instrumented test chạy trên variant debug; sau khi thêm suffix, package thực tế là
`com.kodeco.chat.debug` → test fail dù không ai sửa dòng test nào. Sửa kỳ vọng trong test
hoặc dùng `BuildConfig.APPLICATION_ID`. Unit test chạy trên JVM không bị ảnh hưởng
(`projects/final/app/src/test/java/com/kodeco/chat/ExampleUnitTest.kt`, dòng 44–49).

## Creating a release build

- Bấm *Run* trong Android Studio = tạo **APK debug** cài lên emulator.
- File phát hành: build biến thể **release**, và để nộp Google Play thì xuất **AAB**.
- Định dạng đóng gói:

| | `.apk` (Android Package) | `.aab` (Android App Bundle) |
|---|---|---|
| Bản chất | File **cài trực tiếp** lên máy/emulator | **Không cài trực tiếp** — "bản gốc" gửi cho Play Store |
| Ai đọc nó | Thiết bị Android | Play Store: từ AAB *sinh ra* nhiều APK tối ưu cho từng loại máy |
| Dùng khi | Test nhanh, chia sẻ bản dùng thử, cài tay | **Bắt buộc** để đăng app mới lên Google Play |

- Vì sao có AAB: một app phải mang theo ảnh cho mọi mật độ điểm ảnh, chuỗi dịch cho mọi ngôn ngữ,
  code máy cho mọi loại CPU; máy người dùng chỉ cần một bộ. Play Store cắt phần thừa trước khi tải
  xuống → app nhẹ hơn đáng kể.
- **Yêu cầu hiện hành của Play Store (tính 2026):** từ 31/08/2026, app mới và bản cập nhật phải
  `targetSdk` ≥ 36 (app đã có trên store: ≥ 35). Project mẫu đặt `targetSdk = 34` — đem đúng cấu
  hình này đi nộp hôm nay thì **bị từ chối**; cách hoạt động của `targetSdk` không đổi, chỉ con số
  tối thiểu tăng theo từng năm.
- Mất keystore/mật khẩu = mất khả năng cập nhật app đã publish: mọi lần nộp bản mới phải dùng
  **đúng keystore và mật khẩu đó**.

## minify / R8 / obfuscation

- `isMinifyEnabled` bảo build system **obfuscate (làm rối tên), optimize và shrink (thu nhỏ)** code —
  đúng thứ bạn muốn ở bản release. Nhưng Android Studio để `false` mặc định và nhường quyết định
  cho lập trình viên: nếu ProGuard rules chưa định nghĩa đúng, bật lên có thể **crash lúc chạy bản
  release** — crash trên máy người dùng thật, không phải máy bạn.
- `proguardFiles(...)` chỉ cho build system biết tìm rules ở đâu; thường là file
  `proguard-rules.pro` (xem bản trống do template sinh ở phần recap đầu file).

## ProGuard / rules recognition

- Đa số rules rút lại là bạn **nói rõ class nào KHÔNG được obfuscate/xoá** (thường là class chỉ
  được gọi qua reflection). Cú pháp chi tiết nằm ngoài phạm vi người mới — AP1 là nơi dạy.
- Hai dòng trong file rules mặc định của project (giữ line number cho crash log / ẩn tên file gốc)
  — xem phần Debug vs release recap.

## Security traps

Các bẫy đã kiểm chứng bằng code trong `aaf-materials`, giữ nguyên giá trị sư phạm:

1. **`.gitignore` không gỡ file đã commit.** Sách dặn *"ĐỪNG commit mật khẩu keystore"*, nhưng
   file `projects/final/keys.properties` **đang được git track** trong chính repo mẫu (may là chỉ
   chứa placeholder `"your store password"…`, không phải secret thật). Thêm tên file vào
   `.gitignore` chỉ tác động tới file *chưa* được track; muốn bỏ hẳn phải chạy
   `git rm --cached keys.properties` rồi commit.
2. **Thiếu `keys.properties` làm sync fail ngay.** Dòng
   `keysProperties.load(FileInputStream(keysPropertiesFile))` không kiểm tra file tồn tại. Ai clone
   project mà thiếu file này (mà file này lẽ ra không nên nằm trong repo) thì Gradle sync fail với
   `FileNotFoundException` — app chưa build được dòng nào. Bản vá an toàn hơn (kiến thức bổ sung
   của bài, không có trong sách):
   ```kotlin
   val keysPropertiesFile: File = rootProject.file("keys.properties")
   val keysProperties = Properties()

   if (keysPropertiesFile.exists()) {
     keysProperties.load(FileInputStream(keysPropertiesFile))
   }
   ```
   Thiếu file thì `keysProperties` rỗng — bản **debug** vẫn build, chỉ build **release** mới báo
   lỗi. Hành vi hợp lý hơn nhiều.
3. **Không đặt mật khẩu vào `gradle.properties` của project** — file này được commit. File
   `gradle.properties` trong `~/.gradle/` của máy là file khác và *ghi đè* bản của project, nên
   build hành xử khác đồng nghiệp mà không hiểu vì sao. (Ghi chú liên quan được giữ một câu ở A14.)
4. **`rootProject.file(...)` ≠ `file(...)`.** Trong cấu hình ký: `rootProject.file("keys.properties")`
   trỏ tới **gốc project**, còn `storeFile = file(...)` tính **tương đối với module**. Hai hàm giống
   tên nhưng gốc quy chiếu khác nhau — lỗi đường dẫn kinh điển.
5. **Đây là code Java thuần trong file Gradle.** `Properties` và `FileInputStream` là class chuẩn
   Java (không phải API Android); dùng được vì file `.kts` là code Kotlin thật chạy trên JVM. Sức
   mạnh và cái bẫy cùng lúc: logic phức tạp trong file build rất khó debug.

## keys.properties pattern (full wiring — AP1 giữ bản đầy đủ)

Cấu trúc đọc secret trong `app/build.gradle.kts` của project `final`
(imports ở dòng 1–2, phần đọc file dòng 9–12):

```kotlin
import java.io.FileInputStream
import java.util.Properties

plugins {
  id("com.android.application")
  id("org.jetbrains.kotlin.android")
}

val keysPropertiesFile: File = rootProject.file("keys.properties")
val keysProperties = Properties()

keysProperties.load(FileInputStream(keysPropertiesFile))
```

`signingConfigs` chuyển sang lấy giá trị theo key
(`aaf-materials/04-gradle-basics-a-look-behind-the-curtain/projects/final/app/build.gradle.kts`
dòng 27–34):

```kotlin
  signingConfigs {
    create("release") {
      keyAlias = keysProperties["keyAlias"] as String
      keyPassword = keysProperties["keyPassword"] as String
      storeFile = file(keysProperties["storeFile"] as String)
      storePassword = keysProperties["storePassword"] as String
    }
  }
```

Các key (`keyAlias`, `keyPassword`, `storeFile`, `storePassword`) chính là tên đặt trong
`keys.properties` ở gốc project:

```properties
storeFile = "path to your keystore file"
storePassword = "your store password"
keyAlias = "your key alias"
keyPassword = "your key password"
```

Nguồn: `projects/final/keys.properties` (dòng 33–36; dòng 1–32 là license header).

Bước cuối — `.gitignore` của `final` (9 → 12 dòng, hai dòng cuối là phần thêm):

```gitignore
*.iml
.gradle
/local.properties
.idea/
.DS_Store
/build
/captures
.externalNativeBuild
.cxx
local.properties

# Keystore confidential information
keys.properties
```

> **Lưu ý phân công khi dựng AP1:** pattern "build script đọc file properties + `.gitignore`"
> ở đây trình bày ở **mức cấu hình ký release**. Phiên bản *reusable cho API key* (đọc
> `keys.properties` rồi inject vào BuildConfig cho phần Mạng) thuộc W3 — khi dựng W3, lấy ý
> tưởng từ file này nhưng trình bày theo ngữ cảnh API key và đừng ràng buộc nó với keystore.
> A14 chỉ giữ một câu định hướng: cấu hình build có thể đọc giá trị cục bộ, nhưng xử lý secret
> là chủ đề riêng.

## Source provenance / material moved from Ch04

Toàn bộ vật liệu trên được di chuyển từ bài LIVE Ch04
(`web/src/components/lessons/Ch04GradleBasics.astro` trước đợt CONTENT BATCH 04) — cụ thể:

| Nội dung | Mục cũ trong Ch04 | Nơi lưu trong draft này |
|---|---|---|
| Certificate / app signing, 3 mệnh đề debug/release | mục 11 | Signing and keystore mental model |
| `signingConfigs` + thứ tự khai báo + đường dẫn module | mục 11 | signingConfig |
| `signingConfig = signingConfigs.getByName("release")` | mục 11 | signingConfig |
| Debug vs release mặc định, `isDebuggable` | mục 8 | Debug vs release recap |
| `isMinifyEnabled` / R8 / obfuscate / shrink | mục 8 | minify / R8 / obfuscation |
| ProGuard rules nhận diện + 2 dòng `#-keepattributes…` | mục 8 | ProGuard / rules recognition + recap |
| APK vs AAB (bảng + vì sao AAB) | mục 1, mục 13 | Creating a release build |
| `keys.properties` + `Properties`/`FileInputStream` + `signingConfigs` đọc key | mục 12 | keys.properties pattern |
| `.gitignore` 9→12 dòng | mục 12 | keys.properties pattern |
| Bẫy: file đã track vẫn commit; bẫy: thiếu file → sync fail | mục 12 + cạm bẫy | Security traps |
| `applicationIdSuffix = ".debug"` + bẫy instrumented test | mục 8 + cạm bẫy | signingConfig (bẫy) |
| Mất keystore = mất khả năng cập nhật | mục 12 + key points | Creating a release build |
| Note emulator luôn debuggable | mục 8 | Debug vs release recap |
| Yêu cầu `targetSdk` Play Store 2026 | mục 14 | Creating a release build |

Ngoài ra, các `const` Astro liên quan đã bị bỏ khỏi A14 sau đợt này và có thể cần khi dựng trang
AP1 (lấy lại bằng git history của `Ch04GradleBasics.astro` nếu cần bản đầy đủ):
`starterBuildTypesCode`, `finalBuildTypesCode`, `bookSigningConfigsCode`, `finalSigningConfigsCode`,
`keysLoadCode`, `safeKeysLoadCode`, `keysPropertiesCode`, `gitignoreCode`, `bookReleaseSigningCode`,
`bookDebugSuffixCode`, `proguardRulesCode`, `instrumentedTestCode`, `unitTestCode`.

## Version drift cần giữ khi dựng AP1

Bộ số project mẫu = cuối 2023 (`gradle-wrapper.properties` ghi timestamp tháng 10/2023):
Gradle 8.2, AGP 8.2.0, Kotlin 1.9.10, Compose BOM 2023.10.00. Concept không đổi; khi dựng trang
chính thức nên cập nhật: Gradle 9.x, AGP 9.x (built-in Kotlin: bỏ plugin
`org.jetbrains.kotlin.android`, `kotlinOptions` → `kotlin { compilerOptions { } }`),
Compose BOM mới hơn, Version Catalog do Android Studio tạo sẵn. Tính 2026: Play Store yêu cầu
`targetSdk` ≥ 36 cho app mới/cập nhật từ 31/08/2026.
