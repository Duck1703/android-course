// ==========================================================================
// lessonStats.ts — DERIVED data, khong phai data moi.
//
// Muc dich: dashboard va trang lesson can nhung so lieu that (bai nay co bao
// nhieu muc, bao nhieu code block, bao nhieu cau quiz, doc khoang bao lau) de
// hien thi. Truoc day nhung so nay khong ton tai o dau ca.
//
// MEMBERSHIP MOI (IMP-016 — registry-driven): nguon chuan cua "bai hoc nao
// ton tai" la REGISTRY CODE (ALL_CHAPTERS + LESSONS), KHONG PHAI glob. Glob
// `?raw` chi con la LOADER doc noi dung file; mot file ton tai tren dia
// (orphan quiz, draft ngu dong, _TEMPLATE) KHONG the tro thanh bai hoc chi vi
// ten khop. Moi stat record tuong ung 1 slug da dang ky; file nao khong duoc
// registry tham chieu thi khong duoc doc, khong duoc dem.
// ==========================================================================
import { ALL_CHAPTERS, chapterFileKey, type ChapterInfo } from "./chapters";
import { LESSONS } from "./lessons";

// eager: true => Vite noi cac file thanh string ngay luc build, khong can fs.
// Vai tro duy nhat cai glob nay: LOADER noi dung tho. Membership khong suy
// dien tu day — xem mo ta o dau file.
const RAW = import.meta.glob("../components/lessons/*.astro", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export interface Heading {
  id: string;
  text: string; // da bo the HTML, dung lam muc luc (TOC)
}

export interface LessonStats {
  headings: Heading[];
  sections: number; // so muc <h2> trong bai
  codeBlocks: number; // so <Code /> + <pre> trong bai
  quizQuestions: number; // so <fieldset data-answer> trong quiz (0 = khong co quiz)
  exercises: number; // so .exercise / .chal trong quiz
  words: number; // so tu cua phan van ban (khong tinh code)
  minutes: number; // thoi luong doc uoc luong, lam tron 5 phut
  stageId: string; // stage dich cua bai (IMP-016 metadata, chua render)
  stagePosition: number; // vi tri 1-based trong stage
  stageTotal: number; // tong so bai hien dang ky trong stage
}

/** Bo phan frontmatter (--- ... ---) o dau file .astro, chi giu phan markup. */
function stripFrontmatter(src: string): string {
  if (!src.startsWith("---")) return src;
  const end = src.indexOf("\n---", 3);
  return end === -1 ? src : src.slice(end + 4);
}

/** Doi mot doan HTML thanh text thuan: bo the, giai ma vai entity thuong gap. */
function toPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Lay danh sach <h2 id="..."> theo dung thu tu xuat hien trong bai. */
function extractHeadings(body: string): Heading[] {
  const out: Heading[] = [];
  const re = /<h2\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const text = toPlainText(m[2]!);
    if (text) out.push({ id: m[1]!, text });
  }
  return out;
}

/** Dem tu cua phan van ban: bo the HTML va bo ca bieu thuc {…} cua Astro. */
function countWords(body: string): number {
  const text = body
    .replace(/<Code\b[\s\S]*?\/>/g, " ")
    .replace(/<pre\b[\s\S]*?<\/pre>/g, " ")
    .replace(/\{[^{}]*\}/g, " ")
    .replace(/<[^>]*>/g, " ");
  const tokens = text.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t));
  return tokens.length;
}

function countMatches(src: string, re: RegExp): number {
  return (src.match(re) ?? []).length;
}

// --- Membership: registry quyet dinh bai nao duoc doc/doi so lieu -------------
// Ten file luon bat dau bang ChNN (vd Ch09DataStore.astro, Ch09Quiz.astro).
// Chuong da tach thanh chuong nho dung them "_N": Ch10_2EntityDaoDatabase.astro,
// Ch10_2Quiz.astro. Khoa gom vi the la STRING: "09" hoac "10_2".
//
// NGOAI LE KEY (IMP-031/032 batch Stage 1 — preserve-numbering contract):
//   • Bai Nền tảng (F1/F2) không thuộc chương sách nào — file không theo quy uoc
//     "ChNN" (KotlinVariables…). Key cua chung la slug (khong suy ra tu ChNN).
//   • Split chèn-bài (2.2b/3.2a/3.2b) GIỮ key của chương cha (02_2 / 03_2) vì:
//     (1) contract đánh số mục liên tục — bài con là phần của cùng "Chương 2.2/
//     3.2" cũ; (2) đổi key sẽ phá bucket của anh em cùng key (02_2 = A6 + A7
//     chia sẻ nguyên một glob bucket) và tạo key rác 02_4/03_5 không có file.
//     Bucket 1 key chứa 2 lesson + 2 quiz là HỢP LỆ mới — resolve bên dưới ghép
//     theo TÊN FILE CHÍNH XÁC từ LESSONS thay vì theo bucket đơn.
//
// CHINH SUA IMP-016: bucket khong con duoc lap tu toan bo file glob matched
// (79 file pseudo-curriculum). Bucket chi lap tu NHUNG file ma registry tham
// chieu — resolve theo quy uoc ten file chuan cua tung slug, roi CHECK TEN FILE
// DO CO CHINH XAC la component live khong bang cach so voi danh sach file
// registry-da-xac-nhan. Orphan/dormant khong bao gio duoc chon.

// Key file cua 1 chapter: nhung file "ChNN[_N]*" suy ra tu chapterFileKey;
// bai Nền tảng (khong theo quy uoc ChNN) key = slug la case-INSENSITIVE so
// file: file "KotlinVariablesNullCollectionsLambda.astro" giong slug
// "kotlin-variables-null-collections-lambda" bo dau gach ngang. Dung ham
// khong phan biet hoa-thuong: PascalCase file ↔ kebab-case slug.
//
// DOI KEY CUC BO cho split chèn-bài (batch Stage 1): 02_2 giờ là HAI bài
// (A6 + A7) và 03_2 là HAI bài (A10 + A11) — tất cả bốn file live vẫn mang
// tiền tố 02_2/03_2 (Ch02_2MayAo…, Ch02DocProjectMau không có số; Ch03String…,
// Ch03DocLoi…) nhưng registry subNumber phải tăng cho các bài sau (2.3 → 02_4,
// 3.4 → 03_5) mà file của chúng vẫn tên Ch02_3*/Ch03_4*. Nên ánh xạ key file
// theo slug quá trò trọc sẽ sai 2 slug này. Giải pháp: bảng GHIM key-file theo
// slug — chỉ những slug lệch quy uoc mới được liệt kê; mọi slug còn lại suy ra
// bằng chapterFileKey như cũ.
const FILE_KEY_PIN: Record<string, string> = {
  // A7 file Ch02DocProjectMau.astro không có số — key = tiền tố chương cha 02_2
  "ch02-doc-project-mau": "02_2",
  // A10/A11: file Ch03StringResourceVaLopR/Ch03DocLoiBienDichVaDebug — key = 03_2
  "ch03-string-resource-va-lop-r": "03_2",
  "ch03-doc-loi-bien-dich-va-debug": "03_2",
  // Stage 2 (IMP-033/044): file Ch05* mới KHÔNG theo quy ước ChNN_số (tên theo
  // registry §9 kebab→Pascal, không mang số đơn vị) — ghim key = "05_N" theo
  // subNumber registry để glob "Ch(\d{2})_(\d+)" không khớp nhầm file ngủ đông.
  "ch05-composable-va-layout": "05_1",
  "ch05-modifier-va-danh-sach": "05_2",
  "ch05-material-3-va-theming": "05_3",
  "ch05-preview-va-vong-doi": "05_4",
  "ch05-tiep-can-moi-nguoi-dung": "05_5",
  // Stage 3 (IMP-035/042/043): S2–S4 giữ file Ch06<Name>.astro không mang số đơn vị
  // (regex "Ch(\d{2})" khớp → key "06") — ghim key = "06_N" theo subNumber registry
  // để key "06" (của file ngủ đông Ch06_*) không tranh bucket với các bài live.
  // S1/S5 là bài NEW không theo quy ước ChNN (tên kebab→Pascal thuần) — file không
  // khớp regex nên TỰ rơi vào nhánh foundationKey (key = slug bỏ gạch, như F1/F2);
  // nhưng fileKeyOf phải trả về CÙNG key đó theo slug, nên vẫn cần hai dòng ghim
  // (key = slug-bỏ-gạch, không phải "06_N") để vòng resolve khớp vòng quét file.
  "coroutines-20-phut-khong-so": "coroutines20phutkhongso",
  "kien-truc-ui-data-repository": "kientrucuidatarepository",
  "ch06-state-va-recomposition": "06_2",
  "ch06-state-hoisting-va-udf": "06_3",
  "ch06-viewmodel-va-ui-state": "06_4",
};
// Bảng ngược cho vòng quét file: "Ch02DocProjectMau" → "02_2" v.v. (tên file
// không đuôi, cả lesson lẫn quiz).
// ⚠ Ghim theo slug→pascalOf(slug) có một ca lệch: "ch06-viewmodel-va-ui-state"
// pascalOf → "Ch06ViewmodelVaUiState" nhưng tên file thật là "Ch06ViewModelVaUiState"
// (registry §9: danh pháp API giữ nguyên casing). Nếu để pinByFile suy theo
// pascalOf thì file live KHÔNG được ghim key 06_4 → rơi vào key "06" (không thuộc
// registry) → bị loại, và file ngủ đông Ch06_4JumpToBottom* thắng key 06_4 — đúng
// bug-class stats-pairing mà Stage 1 đã gặp. Bảng FILE_NAME_CASE ghim TÊN FILE THẬT
// cho những slug như vậy; pinByFile ưu tiên nó trước pascalOf.
const FILE_NAME_CASE: Record<string, string> = {
  "ch06-viewmodel-va-ui-state": "Ch06ViewModelVaUiState",
};
const pinByFile: Map<string, string> = new Map(
  Object.entries(FILE_KEY_PIN).flatMap(([slug, key]) => {
    const ch = ALL_CHAPTERS.find((c) => c.slug === slug);
    if (!ch) return [];
    // slug kebab → tên file: theo quy uoc kebab→Pascal (mỗi segment hoa đầu),
    // TRỪ các ca lệch đã ghim ở FILE_NAME_CASE.
    const base = FILE_NAME_CASE[slug] ?? slug
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join("");
    return [
      [base, key],
      [`${base}Quiz`, key],
    ] as [string, string][];
  })
);
function foundationKey(slug: string): string {
  return slug.replace(/-/g, "").toLowerCase();
}
// Key-file của bài "ChNN" theo slug: bài 2.3 (A8) GIỮ nguyên tên file cũ
// (Ch02_3*) dù subNumber registry đã đẩy lên 4 sau split chèn-bài — quy ước
// "existing preserved components keep their current exact filenames"
// (registry §9). 3.4 (A13) thì KHÔNG cần ghim: file Ch03_4* vẫn tự khớp key
// "03_4" vì subNumber của ch03-3 (A12) là 4 và ch03-4 (A13) là 5… chính vì vậy
// ch03-3 mới cần ghim về key file thật của nó là 03_3 (file Ch03_3*).
const FILE_KEY_OVERRIDE: Record<string, string> = {
  "ch02-3-chay-app-va-cap-nhat": "02_3",
  "ch03-3-manifest-intent-permission": "03_3",
  "ch03-4-theme-va-doi-chieu": "03_4",
};
function fileKeyOf(ch: Pick<ChapterInfo, "number" | "subNumber" | "slug">): string {
  if (ch.number < 1) return foundationKey(ch.slug);
  return FILE_KEY_PIN[ch.slug] ?? FILE_KEY_OVERRIDE[ch.slug] ?? chapterFileKey(ch);
}
/** File name quy uoc cho 1 slug: tu chapterFileKey (vd "10_2") + ten nhom tu
 * lessons.ts import. Vi ten file khong suy ra duoc tu slug mot minh, buoc
 * validate duoi dung MAP NGUOC tu chinh LESSONS: moi entry import 2 component
 * cu the; doi tuong Astro build khong mang ten file tin cay, nen ta suy ra
 * file bang quy uoc giong cu NHUNG chi cho slug DA DANG KY, va build fail
 * nghiem khi file khong ton tai. */
// Quy uoc key file chuan cua registry: "09", "10_2"… (chapterFileKey).
const legacyFileKey = fileKeyOf;

interface Bucket {
  lesson?: string;
  quiz?: string;
}
const byKey = new Map<string, Bucket>();

// Chi LOI NHUNG file "co kha nang" la live (khop quy uoc ChNN[_N]* HOAC thuoc
// Nền tảng không theo quy uoc) ROI loc bang registry: 1 file chi vao bucket
// neu key do thuoc it nhat 1 chapter DANG KY. File `_TEMPLATE.astro` va moi
// file key khong thuoc registry tu bi loai.
for (const [path] of Object.entries(RAW)) {
  const file = path.slice(path.lastIndexOf("/") + 1);
  const m = /^Ch(\d{2})(?:_(\d+))?(.*)\.astro$/.exec(file);
  // Stage 2 (IMP-033/044): file không mang số đơn vị (Ch05ComposableVaLayout…) được ghim key
  // qua pinByFile theo TÊN FILE thay vì theo số — khớp cách vòng filesByKey làm.
  // Stage 3: ba file tách Ch06 (Ch06StateVaRecomposition…) không mang số đơn vị — cùng cơ chế.
  const noNumber = m ? pinByFile.get(file.replace(/\.astro$/, "")) : undefined;
  const key = noNumber ?? (m
    ? m[2] ? `${m[1]}_${m[2]}` : m[1]!
    : foundationKey(file.replace(/\.astro$/, "").replace(/Quiz$/, "")));
  // (b) loc membership: key phai ung voi it nhat 1 chapter DANG KY
  if (!ALL_CHAPTERS.some((c) => legacyFileKey(c) === key)) continue;
  const bucket = byKey.get(key) ?? {};
  if (m && m[3] === "Quiz") bucket.quiz = path.slice(path.lastIndexOf("/") + 1);
  else bucket.lesson = file;
  byKey.set(key, bucket);
}
void byKey; // bucket mo rong (lesson/quiz co the bi ghi de khi 2 file cung key
// chia sẻ 02_2/03_2) — du lieu thuc duoc resolve lai chinh xac o filesByKey.

// --- Validate toan ven Lesson/Quiz cho tung slug da dang ky -------------------
// Tim file "ngu dong cung key": quy uoc cho nhieu file trung key. Bien phong
// truoc "draft ngu dong thang vi tien to trung": moi key chi duoc dung NEU
// file do chinh xac la component live. Do tin cay tuyet doi, ta doi chieu voi
// danh sach TEN FILE chinh xac duoc dan xuat tu import tĩnh cua lessons.ts.
//   Vite/Vite 6+ không cung cap ten file tu component, nên buoc 2 cua validate
// dung quy tac: bucket(key).lesson/quiz phai ton tai, va NEU co nhieu ung vien
// cung key (draft ngu dong trung tien to) thi file bucket duoc GIU la
// ung vien co ten khop chinh xac quy uoc `<TenImport>.astro` — lay tu chuoi
// import cua lessons.ts.
function resolveLiveFileNames(): { lesson: Record<string, string>; quiz: Record<string, string> } {
  const src = RAW as Record<string, string>;
  // lessons.ts la nguon chuan cua cap component; ten file chinh xac duoc doc
  // tu chinh source lessons.ts (raw) de tranh hardcode 48-row registry thu 2.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const lessonsSource = (RAW["../components/lessons/../data/lessons.ts"] ?? null) as string | null;
  void lessonsSource; // khong dung duoc vi glob chi chua lessons/
  // Fallback hop le: quy uoc ten file da chot — "ChNN[_N]<Ten>.astro" va quiz
  // "ChNN[_N]Quiz.astro" hoac "ChNN<Ten>Quiz.astro". Do ten Ten khong suy ra
  // duoc tu slug, ta quet bucket keys da qua loc registry, va voi moi key:
  //   - lesson = file duy nhat khong phai *Quiz.astro trong ung vien key
  //   - quiz   = file *Quiz.astro trong ung vien key (neu co)
  // Nhung file thuoc key da loc thi toan bo deu la con chot cua chapter do
  // (vi du Ch05_1, Ch06_3: khong thuoc key dang ky nao → da bi buoc loc (b)
  // loai tu bucket). Nhung van con truong hop draft ngu dong trung key voi
  // monolith live — vd ch03: Ch03_2Quiz (live) vs Ch03_2StringResourceVaDebug
  // (live lesson) — khac ten file nhung cung key "03_2". Quan trong: CAC FILE
  // NAY THUOC CUNG KEY LA TAT CA DEU LIVE CUA CHUONG DO (vi chi chapter dang
  // ky moi duoc qua buoc loc), nen bucket khong the "thang" file ngu dong
  // khac chapter. Truong hop duy nhat can phong: 2+ file lesson cung key
  // (live + draft trung key). Kiem tra va fail lo hon neu xay ra.
  const filesByKey = new Map<string, string[]>();
  for (const [path] of Object.entries(src)) {
    const file = path.slice(path.lastIndexOf("/") + 1);
    // Key moi file: "ChNN[_N]*" suy ra tu quy uoc; file Nền tảng (không khớp
    // quy uoc ChNN) key = tên file không đuôi (vd "KotlinVariables…Quiz").
    const m = /^Ch(\d{2})(?:_(\d+))?(.*)\.astro$/.exec(file);
    let key: string;
    if (m) {
      // A7/A10/A11: file KHÔNG mang số chương (Ch02DocProjectMau*, Ch03DocLoi*,
      // Ch03StringResource*) nhưng thuộc key 02_2/03_2 của split chèn-bài —
      // khớp qua bảng ghim (FILE_KEY_PIN) theo tên file thay vì theo số.
      const noNumber = pinByFile.get(file.replace(/\.astro$/, ""));
      key = noNumber ?? (m[2] ? `${m[1]}_${m[2]}` : m[1]!);
    } else {
      key = foundationKey(file.replace(/\.astro$/, "").replace(/Quiz$/, ""));
    }
    if (!ALL_CHAPTERS.some((c) => legacyFileKey(c) === key)) continue;
    const list = filesByKey.get(key) ?? [];
    list.push(file);
    filesByKey.set(key, list);
  }
  const lesson: Record<string, string> = {};
  const quiz: Record<string, string> = {};
  const errors: string[] = [];
  const seenKeys = new Set<string>();
  for (const ch of ALL_CHAPTERS) {
    const key = legacyFileKey(ch);
    if (seenKeys.has(key)) continue; // resolve 1 lần cho mỗi key (không per-slug)
    seenKeys.add(key);
    const files = filesByKey.get(key) ?? [];
    const lessonFiles = files.filter((f) => !/Quiz\.astro$/.test(f));
    const quizFiles = files.filter((f) => /Quiz\.astro$/.test(f));
    // Key chia sẻ hợp lệ (batch Stage 1): 02_2 = A6 + A7 (2 lesson + 2 quiz),
    // 03_2 = A10 + A11. Ghép 1-1 theo TÊN FILE CHÍNH XÁC suy từ lessons.ts:
    // slug kebab → PascalCase phải khớp nguyên vẹn tên file ("ch02-2-may-ao…"
    // → "Ch02-2-May-Ao…" chuẩn hoá bỏ ký tự không-alnum, so KHÔNG phân biệt
    // hoa/thường — "Ch02_2MayAoMayThatDocProject" và "Ch02DocProjectMau" khác
    // nhau rõ, không bao giờ đổi chỗ). Mọi file không khớp slug nào = ứng viên
    // ngủ đông → fail-loud. Đây là phép ghép duy nhất không thể hoán vị: một
    // slug chỉ khớp đúng một tên file.
    const registeredLessonSlugs = ALL_CHAPTERS.filter((c) => legacyFileKey(c) === key).map((c) => c.slug);
    // Ghép 1-1: file lesson đầu tiên (alphabet) về slug đầu tiên (alphabet),
    // file thứ hai về slug thứ hai… KHÔNG dựa alphabet "trùng nhau" — mà dựa
    // THỨ TỰ TƯƠNG ỨNG được GHIM tường minh ở bảng dưới cho từng key chia sẻ
    // (đơn vị duy nhất cần ghép nhiều-file). Bảng ghim = khẳng định kế toán:
    // 02_2: A6 (ch02-2-may-ao…) ↔ Ch02_2MayAoMayThatDocProject, A7 ↔ Ch02DocProjectMau;
    // 03_2: A11 (ch03-doc-loi…) ↔ Ch03DocLoiBienDichVaDebug, A10 ↔ Ch03StringResourceVaLopR.
    // Key đơn (mọi key còn lại): file duy nhất về slug duy nhất — hành vi cũ.
    const SHARED_FILE_PIN: Record<string, Record<string, { lesson: string; quiz: string }>> = {
      "02_2": {
        "ch02-2-may-ao-may-that-doc-project": { lesson: "Ch02_2MayAoMayThatDocProject.astro", quiz: "Ch02_2Quiz.astro" },
        "ch02-doc-project-mau": { lesson: "Ch02DocProjectMau.astro", quiz: "Ch02DocProjectMauQuiz.astro" },
      },
      "03_2": {
        "ch03-string-resource-va-lop-r": { lesson: "Ch03StringResourceVaLopR.astro", quiz: "Ch03StringResourceVaLopRQuiz.astro" },
        "ch03-doc-loi-bien-dich-va-debug": { lesson: "Ch03DocLoiBienDichVaDebug.astro", quiz: "Ch03DocLoiBienDichVaDebugQuiz.astro" },
      },
    };
    const lessonPin = SHARED_FILE_PIN[key];
    if (lessonPin) {
      for (const [slug, pinned] of Object.entries(lessonPin)) {
        if (!lessonFiles.includes(pinned.lesson)) {
          errors.push(`${slug}: file Lesson ghim "${pinned.lesson}" không tồn tại trong key "${key}" (có: ${lessonFiles.join(", ")})`);
        } else {
          lesson[slug] = pinned.lesson;
        }
        if (quizFiles.includes(pinned.quiz)) quiz[slug] = pinned.quiz;
        else if (LESSONS[slug]?.Quiz) errors.push(`${slug}: file Quiz ghim "${pinned.quiz}" không tồn tại trong key "${key}" (có: ${quizFiles.join(", ")})`);
      }
      // File thừa cùng key (không được ghim) = draft ngủ đông → fail-loud.
      for (const f of lessonFiles) {
        if (!Object.values(lessonPin).some((p) => p.lesson === f)) {
          errors.push(`${key}: file "${f}" không khớp slug nào đã ghim — draft ngủ đông trùng key, cần resolve rõ ràng`);
        }
      }
      continue;
    }
    // Key đơn: slug↔file 1-1 tường minh. Stage 2: khi key có NHIỀU ứng viên
    // (file live mới + file ngủ đông trùng tiền tố Ch05_N — tồn tại trên đĩa
    // nhưng không thuộc registry), chọn ứng viên có tên khớp CHÍNH XÁC tên file
    // quy ước của slug (kebab→Pascal, cả lesson lẫn quiz); fail-loud nếu không
    // khớp được ứng viên nào — draft ngủ đông không bao giờ được "thắng" bằng
    // alphabet hay thứ tự glob.
    if (registeredLessonSlugs.length > 1) {
      errors.push(`${key}: nhiều slug (${registeredLessonSlugs.join(", ")}) chia sẻ key nhưng thiếu bảng ghim SHARED_FILE_PIN`);
      continue;
    }
    const slug = registeredLessonSlugs[0]!;
    const pascalOf = (s: string) =>
      s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
    // Ghim tường minh cho những slug có TÊN FILE lệch chuẩn pascalOf(slug):
    // duy nhất một ca hiện tại là "ch06-viewmodel-va-ui-state" — pascalOf cho ra
    // "Ch06ViewmodelVaUiState" trong khi tên file thật (registry §9: tên thật giữ
    // nguyên danh pháp API) là "Ch06ViewModelVaUiState". Bảng này chỉ ghi CA LỆCH.
    const FILE_NAME_PIN: Record<string, string> = {
      "ch06-viewmodel-va-ui-state": "Ch06ViewModelVaUiState",
    };
    const fileBase = FILE_NAME_PIN[slug] ?? pascalOf(slug);
    const exactLesson = `${fileBase}.astro`;
    const exactQuiz = `${fileBase}Quiz.astro`;
    if (lessonFiles.length === 0) {
      errors.push(`${slug}: khong tim thay file Lesson cho key "${key}"`);
    } else if (lessonFiles.length === 1) {
      lesson[slug] = lessonFiles[0]!;
    } else if (lessonFiles.includes(exactLesson)) {
      lesson[slug] = exactLesson;
    } else {
      errors.push(`${slug}: nhieu ung vien Lesson cho key "${key}" (${lessonFiles.join(", ")}) va khong file nao khop ten chuan "${exactLesson}"`);
    }
    if (quizFiles.length > 1) {
      if (quizFiles.includes(exactQuiz)) quiz[slug] = exactQuiz;
      else errors.push(`${slug}: nhieu ung vien Quiz cho key "${key}" (${quizFiles.join(", ")}) va khong file nao khop "${exactQuiz}"`);
    } else if (quizFiles.length === 1) {
      quiz[slug] = quizFiles[0]!;
    }
    // khong co quiz = hop le (tuong lai AP1–AP3: quizQuestions = 0)
  }
  // Doi chieu nguoc: moi slug co LESSONS entry? (tinh toan ven registry↔LESSONS)
  for (const ch of ALL_CHAPTERS) {
    if (!LESSONS[ch.slug]) errors.push(`${ch.slug}: co trong registry nhung khong co entry LESSONS`);
  }
  const registrySlugs = new Set(ALL_CHAPTERS.map((c) => c.slug));
  for (const slug of Object.keys(LESSONS)) {
    if (!registrySlugs.has(slug)) errors.push(`${slug}: co entry LESSONS nhung khong co trong registry`);
  }
  if (errors.length > 0) {
    throw new Error(
      `[lessonStats] registry/file integrity failed:\n  - ${errors.join("\n  - ")}`
    );
  }
  return { lesson, quiz };
}

const LIVE_FILES = resolveLiveFileNames();

// --- Gom noi dung raw theo slug da dang ky ------------------------------------
const rawBySlug = new Map<string, Bucket>();
for (const ch of ALL_CHAPTERS) {
  const lessonFile = LIVE_FILES.lesson[ch.slug];
  const quizFile = LIVE_FILES.quiz[ch.slug];
  const findRaw = (file: string): string => {
    const path = `../components/lessons/${file}`;
    const raw = RAW[path];
    if (raw === undefined) {
      throw new Error(
        `[lessonStats] file "${file}" (slug ${ch.slug}) khong load duoc qua glob — kiem tra lai ten file/duong dan`
      );
    }
    return raw;
  };
  rawBySlug.set(ch.slug, {
    lesson: lessonFile ? findRaw(lessonFile) : undefined,
    quiz: quizFile ? findRaw(quizFile) : undefined,
  });
}

// --- Stage metadata (tinh tu registry, khong hardcode) ------------------------
interface StageRun {
  id: string;
  total: number;
}
const stageRuns = new Map<string, StageRun>();
for (const ch of ALL_CHAPTERS) {
  const run = stageRuns.get(ch.stageId) ?? { id: ch.stageId, total: 0 };
  run.total += 1;
  stageRuns.set(ch.stageId, run);
}
const stageSeen = new Map<string, number>();

// --- Tinh so lieu cho tung chapter -------------------------------------------
const stats: Record<string, LessonStats> = {};

for (const ch of ALL_CHAPTERS) {
  const bucket = rawBySlug.get(ch.slug);
  const lessonBody = bucket?.lesson ? stripFrontmatter(bucket.lesson) : "";
  const quizBody = bucket?.quiz ? stripFrontmatter(bucket.quiz) : "";

  const headings = extractHeadings(lessonBody);
  const codeBlocks =
    countMatches(lessonBody, /<Code\b/g) + countMatches(lessonBody, /<pre\b/g);
  const words = countWords(lessonBody);

  // 200 tu/phut cho van ban tieng Viet + ~0.5 phut cho moi code block,
  // lam tron len boi so 5 de con so doc len tu nhien ("35 phut", khong "34").
  const rawMinutes = words / 200 + codeBlocks * 0.5;
  const minutes = Math.max(5, Math.round(rawMinutes / 5) * 5);

  const pos = (stageSeen.get(ch.stageId) ?? 0) + 1;
  stageSeen.set(ch.stageId, pos);

  stats[ch.slug] = {
    headings,
    sections: headings.length,
    codeBlocks,
    quizQuestions: countMatches(quizBody, /<fieldset\b[^>]*\bdata-answer=/g),
    exercises:
      countMatches(quizBody, /class="exercise"/g) + countMatches(lessonBody, /class="chal"/g),
    words,
    minutes,
    stageId: ch.stageId,
    stagePosition: pos,
    stageTotal: stageRuns.get(ch.stageId)!.total,
  };
}

export const LESSON_STATS: Record<string, LessonStats> = stats;

const EMPTY: LessonStats = {
  headings: [],
  sections: 0,
  codeBlocks: 0,
  quizQuestions: 0,
  exercises: 0,
  words: 0,
  minutes: 0,
  stageId: "",
  stagePosition: 0,
  stageTotal: 0,
};

export function getStats(slug: string): LessonStats {
  return LESSON_STATS[slug] ?? EMPTY;
}

/** Tong hop toan khoa — dung cho hero va the tien do o trang chu. */
export const COURSE_TOTALS = {
  chapters: ALL_CHAPTERS.length,
  sections: ALL_CHAPTERS.reduce((n, c) => n + getStats(c.slug).sections, 0),
  codeBlocks: ALL_CHAPTERS.reduce((n, c) => n + getStats(c.slug).codeBlocks, 0),
  quizQuestions: ALL_CHAPTERS.reduce((n, c) => n + getStats(c.slug).quizQuestions, 0),
  exercises: ALL_CHAPTERS.reduce((n, c) => n + getStats(c.slug).exercises, 0),
  minutes: ALL_CHAPTERS.reduce((n, c) => n + getStats(c.slug).minutes, 0),
};
