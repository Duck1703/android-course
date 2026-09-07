// Task 9 — tiện ích lưu tiến độ "đã học" trong localStorage của trình duyệt (không cần backend/DB).
// Dùng chung cho: sidebar (BaseLayout), nút đánh dấu trên trang chapter (ProgressToggle), tóm tắt ở trang chủ.
//
// ─── CHÍNH SÁCH MIGRATION v5+ (IMP-013) ─────────────────────────────────────
//
// A. ĐỊNH DANH TIẾN ĐỘ LÀ SLUG CÔNG KHAI. Bookmark/tiến độ gắn vào
//    `/chapters/<slug>/` — KHÔNG phải lessonId (A6, S4…). lessonId không bao giờ
//    xuất hiện trong storage.
//
// B. ENTRY MIGRATION CHỈ ĐƯỢC THÊM KHI MỘT BATCH THẬT SỰ ĐỔI slug đang live
//    (split/rename/move). Batch nào đổi slug thì trong CÙNG commit phải:
//    1. thêm/cập nhật SPLIT_MAP với đúng slug mới,
//    2. tăng SCHEMA_VERSION đúng 1 đơn vị,
//    3. thêm redirect nếu old URL chết (theo REDIRECT_MAP trong registry),
//    4. verify legacy credit đúng như SPLIT_MAP khai báo.
//
// C. SLUG GIỮ NGUYÊN KHÔNG CÓ ENTRY. Slug giữ nguyên URL (13 KEEP 1:1 + ch02-2
//    sống tiếp với tư cách A6) KHÔNG được thêm vào SPLIT_MAP chỉ vì lessonId
//    của nó đổi (vd A6 vẫn sống tại ch02-2-… dù id đổi từ "Chương 2.2" sang A6).
//
// D. NO-FABRICATE. Bài HỌC MỚI KHÔNG TỰ ĐỘNG "đã học". Bài hoàn toàn mới hoặc
//    trích-ra-là-mới không bao giờ nhận completion từ storage cũ. Hiện tại:
//    F1, F2, C5, S1, S5, N1, N2, O2–O6, AP1–AP3. Cơ chế migrate KHÔNG suy
//    diễn credit theo stage/giãn cách/chủ đề/tiền quyết/chương-sách — chỉ
//    entry khai báo tường minh trong SPLIT_MAP mới tạo credit thừa kế.
//    Đặc biệt: S5 KHÔNG thừa kế completion của ch10-1; ch10-1 chỉ sang R1.
//
// E. 3 CASE ĐẶC BIỆT (chính sách chốt):
//    1. ch02-2: fan-out-keep-source — old slug VẪN SỐNG với tư cách A6, nên
//       entry là old → [old, ch02-doc-project-mau (A7)] (union, không replace,
//       không redirect). Cơ chế hiện tại đã hỗ trợ an toàn: `SPLIT_MAP[slug]`
//       trả về mảng chứa chính old slug, `next.push(...replacement)` giữ old
//       lại và thêm con mới, dedup chống trùng (xem migrateProgress + bài test).
//    2. ch10-1: old → R1 ONLY. S5 không nhận credit. Old URL chết → redirect
//       do batch + IMP-014 lo, không phải ở đây.
//    3. ch07: old → O1. Kế nhiệm REDUCE trực tiếp — credit cố ý thừa kế vào
//       track optional.
//
// F. NGUỒN CHUẨN: docs/TARGET_REGISTRY_v5.md (bảng 48 unit, SPLIT_MAP draft
//    9 entry, REDIRECT_MAP 8 slug chết, legacy-credit policy). Số liệu đã khóa:
//    22 URL hiện tại = 14 giữ nguyên + 8 chết. KHÔNG dùng số "15/22" cũ.
//
// G. SCHEMA_VERSION là phiên bản CẤU TRÚC SLUG của tiến độ — không phải version
//    app, nội dung, hay registry. Hiện tại 6 = batch migration thứ hai (Stage 1:
//    ch02-2 fan-out-keep-source + ch03-2 dead-source split). Mỗi batch có entry
//    mới tăng đúng 1 lần TRONG CÙNG commit đó (atomic) — không gán cứng sẵn dãy
//    version tương lai.
// ────────────────────────────────────────────────────────────────────────────
const STORAGE_KEY = "hoc-android-tv:progress";
const MIGRATION_KEY = "hoc-android-tv:progress-migrated";

// Phiên bản cấu trúc chương hiện tại. Tăng lên 1 mỗi lần tách/gộp chương.
const SCHEMA_VERSION = 6;

// Khi một chương lớn được tách thành nhiều chương nhỏ, slug cũ trong localStorage
// của người học không còn ứng với trang nào — tiến độ của họ sẽ "bốc hơi".
// Bảng này đổi slug cũ thành đủ các slug mới: đã học cả chương lớn = đã học tất cả
// các chương nhỏ tách ra từ nó.
//
// Chú ý hai hành vi của migrateProgress phụ thuộc hình dạng entry:
//   • entry thường (old chết): old → [con1, con2] — old bị thay.
//   • entry keep-source (old VẪN SỐNG, vd ch02-2 = A6): old → [old, con] —
//     vì thuật toán push nguyên mảng thay thế rồi dedup, old slug được GIỮ
//     lại trong done (union semantics), không mất tiến độ tại URL cũ. Đây là
//     cơ chế fan-out-keep-source mà IMP-013 đã kiểm bằng mô phỏng (case C/D).
//     Batch ch02-2 tương lai chỉ cần khai đúng mảng này + bump version.
const SPLIT_MAP: Record<string, string[]> = {
  "ch01-welcome-to-android-kotlin": [
    "ch01-1-android-va-kotlin",
    "ch01-2-app-component",
    "ch01-3-manifest-resources",
    "ch01-4-gradle-ban-do",
  ],
  "ch02-getting-started-with-android-studio": [
    "ch02-1-cai-dat-va-tao-project",
    "ch02-2-may-ao-may-that-doc-project",
    "ch02-3-chay-app-va-cap-nhat",
  ],
  "ch03-android-fundamentals": [
    "ch03-1-activity-va-giao-dien",
    "ch03-2-string-resource-va-debug",
    "ch03-3-manifest-intent-permission",
    "ch03-4-theme-va-doi-chieu",
  ],
  "ch10-room-database": [
    "ch10-1-vi-sao-can-database",
    "ch10-2-entity-dao-database",
    "ch10-3-repository-viewmodel",
    "ch10-4-giao-dien-va-cam-bay",
  ],
  // IMP-020 (v5) — pilot: old R1 slug chết, đổi thành slug registry R1.
  // Credit ch10-1 cũ → R1 ONLY (S5 là bài mới, không tự done — chính sách §D).
  "ch10-1-vi-sao-can-database": ["ch10-room-la-gi-va-sqlite"],
  // IMP-031 (v6) — Stage 1b: ch02-2 fan-out-keep-source (registry §7 entry 1).
  // Old slug VẪN SỐNG với tư cách A6 (2.2a — máy ảo/máy thật), nên entry là
  // old → [old, A7] (union semantics — xem chú thích keep-source ở trên):
  // done cũ chứa ch02-2 → sau migrate chứa ch02-2 (A6) VÀ ch02-doc-project-mau
  // (A7). KHÔNG redirect cho ch02-2 — URL không chết.
  "ch02-2-may-ao-may-that-doc-project": [
    "ch02-2-may-ao-may-that-doc-project",
    "ch02-doc-project-mau",
  ],
  // IMP-032 (v6) — Stage 1c: ch03-2 dead-source split (registry §7 entry 2).
  // Old slug CHẾT (route retired) → replace: A10 (3.2a — string resource/lớp R,
  // đích của redirect) + A11 (3.2b — đọc lỗi & debug). Hai bài hoàn toàn mới
  // về slug, nhưng nội dung kế nhiệm trực tiếp old ch03-2 nên credit chia đôi
  // theo đúng mapping khai báo (registry §7 + §8).
  "ch03-2-string-resource-va-debug": [
    "ch03-string-resource-va-lop-r",
    "ch03-doc-loi-bien-dich-va-debug",
  ],
};

/** Đọc thô mảng slug, không chuyển đổi gì — dùng nội bộ để tránh gọi vòng. */
function readRaw(): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    // localStorage hỏng/dữ liệu sai định dạng -> coi như chưa học gì, không crash trang.
    return [];
  }
}

/**
 * Chạy MỘT LẦN cho mỗi phiên bản cấu trúc: đổi slug cũ thành các slug mới, giữ
 * nguyên tiến độ người học đã có. Đã chạy rồi thì chỉ tốn một lần đọc
 * localStorage, nên gọi bao nhiêu lần cũng không sao.
 *
 * Thuật toán (IMP-020 — dùng fixed-point thay cho 1 lượt duyệt):
 *   – mỗi lượt: slug có trong SPLIT_MAP thì push nguyên mảng thay thế (entry
 *     keep-source chứa old slug → old được giữ lại), không thì giữ nguyên;
 *   – LẶP cho đến khi tập ổn định (fixed-point, giới hạn an toàn = số entry
 *     của map) — cần thiết vì chuỗi migration nhiều bước: người học bỏ lỡ các
 *     version trước (vd storage còn chứa monolith "ch10-room-database" từ v4
 *     mà chưa từng migrate) phải đi hết chuỗi
 *     ch10-room-database → ch10-1… → R1 mới trong MỘT lần chạy;
 *   – dedup bằng Set: kết quả luôn là một tập ổn định, old/con không nhân đôi;
 *   – entry keep-source tự nhiên hội tụ (old được giữ, không tái map vô hạn —
 *     visited-set ở dưới chặn vòng lặp nếu một mapping nào đó tự trỏ);
 *   – slug không liên quan đi qua nguyên vẹn (không bị đụng).
 */
export function migrateProgress(): void {
  if (typeof localStorage === "undefined") return;
  try {
    if (Number(localStorage.getItem(MIGRATION_KEY)) >= SCHEMA_VERSION) return;

    let current = readRaw();
    const maxPasses = Object.keys(SPLIT_MAP).length + 1;
    for (let pass = 0; pass < maxPasses; pass++) {
      const next: string[] = [];
      for (const slug of current) {
        const replacement = SPLIT_MAP[slug];
        if (replacement) next.push(...replacement);
        else next.push(slug);
      }
      const deduped = [...new Set(next)];
      const changed =
        deduped.length !== current.length || deduped.some((s, i) => s !== current[i]);
      if (!changed) break;
      current = deduped;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    localStorage.setItem(MIGRATION_KEY, String(SCHEMA_VERSION));
  } catch {
    // localStorage bị chặn: bỏ qua, tiến độ chỉ không được chuyển đổi.
  }
}

export function getDoneSlugs(): string[] {
  // Chuyển đổi ngay tại chỗ đọc: mọi trang (trang chủ, sidebar, nút đánh dấu)
  // đều đi qua đây, nên không phụ thuộc thứ tự nạp script giữa các file.
  migrateProgress();
  return readRaw();
}

export function isDone(slug: string): boolean {
  return getDoneSlugs().includes(slug);
}

export function toggleDone(slug: string): boolean {
  const current = getDoneSlugs();
  const idx = current.indexOf(slug);
  if (idx >= 0) {
    current.splice(idx, 1);
  } else {
    current.push(slug);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  return current.includes(slug);
}
