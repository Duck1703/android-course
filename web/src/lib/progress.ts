// Task 9 — tiện ích lưu tiến độ "đã học" trong localStorage của trình duyệt (không cần backend/DB).
// Dùng chung cho: sidebar (BaseLayout), nút đánh dấu trên trang chapter (ProgressToggle), tóm tắt ở trang chủ.
const STORAGE_KEY = "hoc-android-tv:progress";
const MIGRATION_KEY = "hoc-android-tv:progress-migrated";

// Phiên bản cấu trúc chương hiện tại. Tăng lên 1 mỗi lần tách/gộp chương.
const SCHEMA_VERSION = 4;

// Khi một chương lớn được tách thành nhiều chương nhỏ, slug cũ trong localStorage
// của người học không còn ứng với trang nào — tiến độ của họ sẽ "bốc hơi".
// Bảng này đổi slug cũ thành đủ các slug mới: đã học cả chương lớn = đã học tất cả
// các chương nhỏ tách ra từ nó.
const SPLIT_MAP: Record<string, string[]> = {
  "ch01-welcome-to-android-kotlin": [
    "ch01-1-android-va-kotlin",
    "ch01-2-app-component",
    "ch01-3-manifest-resources",
    "ch01-4-gradle-va-ban-do",
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
 */
export function migrateProgress(): void {
  if (typeof localStorage === "undefined") return;
  try {
    if (Number(localStorage.getItem(MIGRATION_KEY)) >= SCHEMA_VERSION) return;

    const current = readRaw();
    const next: string[] = [];
    for (const slug of current) {
      const replacement = SPLIT_MAP[slug];
      if (replacement) next.push(...replacement);
      else next.push(slug);
    }
    const deduped = [...new Set(next)];
    const changed =
      deduped.length !== current.length || deduped.some((s, i) => s !== current[i]);
    if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
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
