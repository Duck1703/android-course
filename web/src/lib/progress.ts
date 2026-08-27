// Task 9 — tiện ích lưu tiến độ "đã học" trong localStorage của trình duyệt (không cần backend/DB).
// Dùng chung cho: sidebar (BaseLayout), nút đánh dấu trên trang chapter (ProgressToggle), tóm tắt ở trang chủ.
const STORAGE_KEY = "hoc-android-tv:progress";

export function getDoneSlugs(): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // localStorage hỏng/dữ liệu sai định dạng -> coi như chưa học gì, không crash trang.
    return [];
  }
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
