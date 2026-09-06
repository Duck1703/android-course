import { defineConfig } from "astro/config";

// ─── Redirect strategy (IMP-014) ────────────────────────────────────────────
// COURSE_REDIRECTS chứa các redirect old-slug → new-slug cho các URL bài học
// thật sự chết khi tách/đổi slug. Bản build là STATIC: Astro sinh trang HTML
// meta-refresh cho từng entry (không phải HTTP 301/302 từ server) — đủ để
// người học từ bookmark cũ đi tới bài mới.
//
// CONTRACT cho mỗi entry thật (đồng thời trong CÙNG batch migration):
//   1. slug cũ đã bị retired/đổi trong batch đó (route cũ không còn tồn tại);
//   2. SPLIT_MAP tương ứng được kích hoạt trong progress.ts;
//   3. SCHEMA_VERSION tăng đúng 1;
//   4. legacy credit được verify đúng như khai báo;
//   5. redirect target PHẢI khớp cột redirectTarget trong docs/TARGET_REGISTRY_v5.md.
// URL được GIỮ NGUYÊN (14/22, gồm ch02-2 sống tiếp với tư cách A6) KHÔNG có
// redirect. Danh sách 8 slug chết dự kiến nằm ở registry §6 — không khai báo
// tại đây trước khi batch tương ứng chạy.
//
// Hiện tại: TRỐNG — chưa có redirect nào được kích hoạt.
const COURSE_REDIRECTS = {
  // populated atomically by migration batches (see docs/TARGET_REGISTRY_v5.md)
};

export default defineConfig({
  redirects: COURSE_REDIRECTS,
});
