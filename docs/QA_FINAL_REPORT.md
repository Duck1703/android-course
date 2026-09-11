# QA_FINAL_REPORT

**Ngày:** 2026-09-11 · **HEAD bắt đầu:** `f24b63c` (branch `main`, tree clean, not pushed)
**Phạm vi:** QA kỹ thuật/runtime toàn sản phẩm + S-register no-regression + cleanup có kiểm soát + docs sync + final project gate.
**QUIZ: NO QUIZ AUDIT PERFORMED.** Quiz content thuộc phạm vi đã chấp nhận (gate 63e04f8/690e268) — phase này không inspect/đo/chỉnh nội dung quiz. **NO COURSE CONTENT RE-REVIEW** — content gate đã đóng (REVIEW_GATE_CONTENT_FINAL.md = GATE PASS).

## Final verdict

**FINAL_PROJECT_ADVERSARIAL_PASS — 0 unresolved BLOCKER / 0 unresolved MAJOR.** Tất cả điều kiện PASS §42 của mission đều đạt (chi tiết từng mục bên dưới). Website có thể dùng học từ đầu đến cuối: điều hướng, tiến độ, quiz shell, tìm kiếm, 2 theme, mobile drawer, legacy migration — không lỗi runtime chưa giải thích được.

## Final repository state

- Branch `main`, HEAD sau gate = xem cuối file; tree clean, **not pushed**.
- Build: 49 trang tĩnh (1 home + 48 unit live + 8 meta-refresh redirect đếm riêng — tổng file HTML dist = 57).
- Astro baseline giữ nguyên: 0 errors / 0 warnings / 67 hints.

## Course inventory

- **Core: 39** (F1–F2 · A1–A14 · C1–C5 · S1–S5 · N1–N2 · W1–W3 · D1–D2 · R1–R4 · X1–X2)
- **Optional: 6** (O1–O6 — track "Mở rộng", không bắt buộc)
- **Appendix: 3** (AP1–AP3 — reference, zero-quiz)
- **Total: 48 unit live** · 45 quiz · **8 redirects**
- ~22 giờ lõi (derive từ lessonStats, hiển thị trên homepage hero; con số được `check_counts` verify against registry)

## Automated checks

| Check | Kết quả |
|---|---|
| `npm run build` | PASS — 49 pages, 0 error |
| `npx astro check` | 0 errors / 0 warnings / 67 hints (= baseline, no hint regression) |
| `node scripts-maintenance/check_counts.mjs` | TRUTH-CHECK PASS — 0 lệch (registry ↔ dist ↔ home/sidebar/lesson metrics) |
| `node scripts-maintenance/progress_g_audit.mjs` | **79/79 PASS** (SPLIT_MAP 14 entry, no-fabricate, transitive/idempotent, corrupt-safe, seed, B-lite predicate) |
| Link crawl dist (`_qa_final_crawl.mjs`, local) | 0 broken internal hrefs · 0 broken internal anchors · 8/8 redirect targets tồn tại |

## Browser/runtime QA

Chạy bằng Chrome thực (playwright qua channel system Chrome, headless) trên `astro preview` serve `dist/` vừa build. Server cũ ở cổng 4321 serve dist cũ đã bị `astro preview stop` + chạy lại đúng dist hiện hành — mọi check dưới đây chạy trên build **tại HEAD `f24b63c`**.

- 0 `console.error` / 0 `pageerror` / 0 failed internal request trên **tất cả** các scenario bên dưới.
- Route spot-check: F1/O1/AP3 = 200, route giả = 404.

## Homepage state matrix

11 trạng thái seed localStorage thật + reload (script `_qa_final_states.mjs`):

| Trạng thái | % | Hero CTA | Resume | Terminal |
|---|---|---|---|---|
| A. mới (0 done) | 0% | Bắt đầu học → F1 | "Bắt đầu từ đây" F1 | hidden |
| B. Foundation 1/2 | 3% | Tiếp tục học → F2 | F2 | hidden |
| C. giữa core (6 bài) | 15% | Tiếp tục → A2 | A2 · stage "Android cơ bản" | hidden |
| D. đã nộp quiz, chưa confirm | 0% | Bắt đầu học → F1 (attempt không tính done) | F1 | hidden |
| E. nhiều stage xong (23) | 59% | Tiếp tục → S3 | S3 · stage "State & kiến trúc" | hidden |
| F. 38/39 | 97% | Tiếp tục → X2 | X2 · "Real-world" | hidden |
| G. 39/39 core | 100% | **Xem lộ trình → #roadmap** | ẩn | **hiện** |
| H. 39/39 + 2 optional | 100% | Xem lộ trình (optional KHÔNG thành bước kế) | ẩn | hiện |
| I. 45/45 instructional | 100% | Xem lộ trình | ẩn | hiện |
| J. chỉ optional done | 0% | Bắt đầu học → F1 (optional không đếm vào core) | F1 | hidden |

Optional/appendix không bao giờ trở thành required ở mọi trạng thái. Stage strip tô đúng "đang học/chưa bắt đầu".

## Sidebar / drawer

- Sidebar: 48 link (39+6+3) chia 10 nhóm stage đúng thứ tự; **0 nhãn dạng số `5.1`/`A5` learner-facing** trong tiêu đề bài (identity = tiêu đề; metadata nội bộ chỉ còn trong data-*). Nhóm core mở sẵn; Mở rộng/Phụ lục thu gọn, tự mở khi bài active nằm trong đó. Bài active có `aria-current="page"` + class `active`; module có data-state todo/active/done (không chỉ màu: mark tick/đốm/vành + progress bar per module).
- Drawer mobile 390px: mở/đóng bằng nút hamburger (`aria-expanded` đúng), overlay bấm để đóng, **Escape đóng + trả focus về nút mở**, bấm link → đóng + điều hướng; **Tab khi drawer đóng KHÔNG chạm vào link trong rail** (25 bước Tab đầu xác nhận). Không overflow ngang khi mở.
- Long-title wrap: 340px vẫn 0 overflow ngang ở home và lesson (title dài nhất F1 + W2 tested).

## Search

- Query test: Kotlin, Compose, Keystore, Room, Ditto, WorkManager, "du lieu" (không dấu — fold dấu hoạt động), "ký" — đều có kết quả đúng, ngữ cảnh hiển thị stage "Mở rộng · …" / "Phụ lục · …".
- Empty state: "Không tìm thấy nội dung nào." Keyboard: Ctrl+K focus, ↑/↓ điều hướng (`aria-activedescendant` + highlight), Enter điều hướng đúng route, Escape đóng.
- **48/48 route độc nhất trong search index resolve 200** (0 dead route); optional và appendix đều có mặt trong index.
- Top-12 cap giữ nguyên theo quyết định IMP-081 (không redesign khi không có defect).

## Route / link integrity

- 48/48 registry route tồn tại trong dist; 0 live route ngoài registry (check_counts verify).
- 8 redirect meta-refresh, 8/8 target khớp astro.config + registry §6 (mỗi old slug 1 đích; verified từng target tồn tại).
- Crawl toàn dist: **0 broken internal link** (href + anchor). Asset (css/svg/js/ico) resolve tốt (favicon.svg, BaseLayout css present).
- Dead-route cũ (ch03-2, ch05, ch06, ch07, ch08, ch09, ch10-1, ch11) đều là redirect trang — đúng chính sách, không route 404.

## Model B-lite

Live flow trên C3 (script `_qa_final_states.mjs`):

1. Chưa nộp quiz → bấm "Đánh dấu" **bị chặn**, storage không đổi, hint accessible (`role="status"`): "Hãy làm quiz ít nhất một lần… không cần đúng hết."
2. Nộp quiz 1 lần → `quiz-attempts` ghi slug (không phụ thuộc điểm — submit đáp án sai vẫn tính), hint tự ẩn.
3. Lesson **không** tự done sau submit.
4. Bấm đánh dấu → done; chip "Đã hoàn thành" hiện.
5. Reload → done + attempt còn nguyên.
6. Bỏ đánh dấu → attempt **giữ lại**.
7. Đánh dấu lại → không cần nộp lại.
- Optional (O2): cùng gating (bị chặn khi chưa nộp).
- Appendix (AP1): toggle tự do, không có quiz form, không hint giả — đúng reference policy.
- Terminal card 39/39 hiện đúng, resume ẩn, hero CTA đổi "Xem lộ trình".

## Storage resilience

- JSON hỏng (`{not json!!`, `][bad`) → page vẫn render, progress coi như rỗng, không crash (0 console error).
- Non-array JSON → coi như rỗng.
- Ghost slug lạ → đi qua nguyên vẹn, không tính vào core % (4/39 đúng như 1 ghost + 1 core done… measured 4/39 với seed "ch08-networking" migrate ra 3 W-bài + ghost — đúng migration semantics).
- Missing keys → trang mới, 0 lỗi. (SecurityError/private-mode: code paths try/catch đủ theo review — `readRaw`/`toggleDone`/`recordQuizAttempt` đều catch; không tạo storage framework mới.)

## Responsive

| Width | Home | Lesson (C3/W2) | AP3 | Ghi chú |
|---|---|---|---|---|
| 1440 | 0 overflow | 0 | 0 | full rail |
| 1180 | 0 | 0 | 0 | rail |
| 1024 | 0 | 0 | 0 | breakpoint rail→drawer |
| 768 | 0 | 0 | 0 | drawer |
| 390 | 0 | 0 | 0 | drawer |
| 340 stress | 0 | 0 (code scrolls nội bộ) | — | long titles wrap |

Code block tại 390px: trang không giãn ngang, `pre` scroll nội bộ đúng thiết kế.

## Light / dark

- Theme apply trước paint (inline script), save localStorage, `aria-label` nút đổi theo trạng thái.
- Home + lesson R1 ở dark: nền `rgb(18,16,25)`, text/callout/code contrast đọc được (screenshot lưu local); light: `rgb(246,244,251)` — không có dark-only optimization; search dropdown + code block + callout ở cả 2 theme (screenshot bộ `_qa_shot_*` local, không track).

## Accessibility

- `lang="vi"` trên mọi trang; skip link đầu body ("Bỏ qua điều hướng, tới nội dung"); 1 H1 duy nhất mỗi trang; heading order không nhảy cấp trên 3 trang đại diện (home, A9, AP3).
- Landmarks: `main#main` + `nav[aria-label]` (sidebar) + nav lesson.
- Keyboard: Tab thứ 2 = brand link với **outline 2px** (focus-visible có CSS); drawer/search/quiz đều reachable; Escape drawer trả focus.
- Trạng thái không chỉ dựa màu: aria-current (sidebar), aria-pressed (progress btn), role="status" + aria-live (hint/quiz score), data-state + hình dạng mark (module), chip "Đã hoàn thành".
- `prefers-reduced-motion: reduce` có rule (base.css — scroll-behavior auto + transition off).
- `<details>/<summary>` dùng cho sidebar module (keyboard-native).

## Console / runtime errors

Tổng cộng toàn bộ scenario (11 homepage states + 1 B-lite flow + drawer/responsive/theme/search/legacy/a11y + 13 shell pages): **0 console.error, 0 pageerror, 0 failed internal request.**

## S-register no-regression

Feature-presence check (không re-review nội dung):

| S-item | Bằng chứng |
|---|---|
| Tiếng Việt độc lập (voice) | content gate đã chốt; grep leak không regression |
| Mental models | callout `mental` ×27 file live |
| Cạm bẫy pedagogy | heading `#cam-bay` ×47 file live |
| Code-copy UX | CodeEnhance bọc mọi pre (13/13 shell page đủ `.codeblock`), click → "Đã copy" feedback, fallback execCommand, 390px scroll nội bộ |
| Source/provenance | `#nguon` ×49 file; src line-citations giữ nguyên (không đụng content) |
| PROJECT/CURRENT drift apparatus | callout `diff` ×31 + bảng "nên theo" |
| Search | работает như trên (48 route, keyboard, fold dấu) |
| Sidebar navigation | 10 stage groups, aria-current |
| Progress + resume | state matrix §trên; nextLesson core-first |
| Quiz shell present | 45/45 instructional có quiz form; "Câu x/N", score, retry |
| TOC / wayfinding | `.toc` đủ trên 13 shell page; "Bài x/y" chip theo stage (C3 = Bài 3/5; AP không chip) |
| Accessibility basics | mục trên |
| Dark/light | mục trên |
| Mobile drawer | mục trên |
| Previous/next | 13/13 shell page đủ nav-card |

## Dormant / scratch cleanup decisions

**Dormant lesson files — GIỮ (17 file + template).** Phân loại bằng script so registry ↔ git (`_qa_final_dormant.mjs`): 111 tracked, 93 imported, **18 dormant** = Ch07_1..4, Ch08_1..4, Ch09_1..4, Ch11_1..5, `_TEMPLATE.astro`. Cả 17 draft split **được giữ CHỦ ĐỊCH** theo quyết định đã ghi sẵn (QUIZ_MIGRATION_STATUS "File ngủ đông được GIỮ CHỦ ĐỊCH"; REVIEW_GATE_WORKSTREAM_F "4 file ngủ đông Ch07_1..4 giữ nguyên (IMP-064)"); `lessonStats` registry-driven fail-loud đã chứng minh không file nào thắng bucket; `_TEMPLATE.astro` là kit copy-to-start (IMP-015, docs/LESSON_TEMPLATE.md). Xoá sẽ chỉ là archaeological cleanup không có gate đòi — không thực hiện (mission §24: "It is perfectly valid to KEEP dormant source artifacts if they are deliberately documented").

**Scratch artifacts — GIỮ trên máy, không track (chính sách đã có sẵn, không đổi).** 144 file ignored: `web/scripts/` (~190 file một-off: `_t48_*`, `_cdp_*`, `audit-*`, tool quiz `quiz_audit/quiz_dist/quiz_letters.mjs`…), `.h-shots/` (42 screenshot QA), `.wc3_3.txt`, `scripts/.out-wc.txt`, dotfiles `web/.*.txt`. Tất cả đều bị ignore đúng bởi `.gitignore` nhóm 6 + `.git/info/exclude` — **0 file scratch untracked** trong `git status`; không có debris lọt vào git. Không `git clean -fd`; không đụng evidence/report assets.

**Gitignore — không đổi.** Các họ scratch đều đã được cover (`git check-ignore` verified); không thêm pattern rộng, không giấu source.

## Permanent maintenance checks

Final check set owner-facing (không đòi quiz audit):

```
npm run build
npx astro check
node scripts-maintenance/check_counts.mjs
node scripts-maintenance/progress_g_audit.mjs
```

- **`web/scripts-maintenance/` (TRACKED — mới):** `check_counts.mjs` (IMP-082 truth-check) và `progress_g_audit.mjs` (Workstream G regression, 79 asserts) được **copy nguyên văn** từ `web/scripts/` (vốn gitignored theo .gitignore nhóm 6) vào vị trí track được — chỉ sửa dòng Usage cho đúng đường dẫn mới. Cả hai đã chạy PASS từ vị trí mới. Lý do: một "permanent regression test" mà Git không giữ được là ảo — mission §35 yêu cầu track.
- Quiz tooling (`quiz_audit/quiz_dist/quiz_letters.mjs`) **giữ nguyên** trong `web/scripts/` (gitignored, local-only) — vẫn còn trong repo history/tooling, chỉ không nằm trong final workflow (owner override §36; không xoá).

## Documentation synchronization

| File | Thay đổi |
|---|---|
| `README.md` | Mô tả Bước 5 cập nhật: cấu trúc 2+7 stage/39 lõi/6 mở rộng/3 phụ lục, "Cạm bẫy & tài liệu lỗi thời", quiz 8–12 câu, Model B-lite (làm quiz ≥1 lần trước khi đánh dấu); bảng docs bổ sung QA_FINAL_REPORT/spec/plan/registry/standard; **bảng lệnh maintenance 2 script tracked**; sửa claim "quiz làm xong tải lại là mất" → tiến độ lưu localStorage |
| `docs/PROJECT_PLAN.md` | Header mới: **REDESIGN: COMPLETE · FINAL CONTENT REVIEW: PASS · FINAL TECHNICAL QA: PASS** + tổng kết 48 unit/8 redirect/schema 13/SPLIT_MAP 14/~22h + đường dẫn gate reports; trạng thái 2026-08-31 chuyển thành "LỊCH SỬ" rõ ràng (Phase 7 ĐÃ ĐÓNG); mục "CÒN TỒN" được đánh dấu đã giải quyết về sau |
| `docs/COURSE_REDESIGN_SPEC_432cbf8_v2.md` | **30-min hard cap → quality-first owner rule** tại §3 principle 4, §12 hard parameters, §17 lesson-body row, §21, §25 (hero phrasing + total time rows cập nhật ~22h core, ghi rõ giá trị cũ = historical); "trim to cap" neutralized trong bảng unit |
| `docs/TARGET_REGISTRY_v5.md` | §2 docs-sync backlog: đánh dấu DONE; §12 backlog checklist cập nhật trạng thái từng mục |
| `docs/CHAPTER_SPLIT_MAP.md` | Banner **SUPERSEDED bởi TARGET_REGISTRY_v5** + note Chuẩn mẫu là lịch sử |
| `docs/REVIEW_GATE_CONTENT_FINAL.md` | **Metadata-only correction (§28):** commit-table row `*(new)*` → `d084eed`; header ghi rõ phân biệt content-repair commit (`d084eed`) vs gate/docs close (`f24b63c` = final HEAD của gate). Không đổi bất kỳ finding nào. |

## Owner policy updates

- **Không còn "30-min hard cap" như acceptance gate:** spec v2 các mục đã sync theo chính sách owner — *"Không cắt vì dài. Chỉ cắt khi nội dung thừa, sai scope, trùng lặp, hoặc nên thuộc một lesson khác."* Giờ học chỉ còn là ước lượng planning (registry `min`, hiển thị "khoảng X phút"). Wording cũ được giữ lại trong chính file spec như lịch sử, không xoá xoàng (mission §29).
- **Quiz audit KHÔNG nằm trong final workflow:** script quiz giữ trong tooling local/history; 4 lệnh maintenance owner-facing không có quiz audit.
- **~17h → ~22h:** product truth là derive từ lessonStats; các mention ~17h còn lại trong docs đều được label historical.

## Deviations

- **X2 chip "Bài 2/2"** hiển thị "Real-world" stage đúng; không deviation.
- Browser: dùng playwright + system Chrome (chromium bundled của playwright không có binary trên máy) — headless Chrome thật, vẫn là browser QA đầy đủ; DOM/HTTP chỉ dùng cho link crawl (đúng ý "crawl dist").
- AP1/AP2 vẫn thiếu `<h2 id="cam-bay">` (deferred từ content gate — appendix reference structure, cosmetic, owner's call) — không phải defect runtime.
- `astro preview` cũ ở cổng 4321 serve dist cũ đã được stop; QA chạy trên preview mới đúng dist HEAD (móc nối "Another astro preview server is already running" — xử lý bằng `astro preview stop`).

## Findings

- **blocker:** 0 found / 0 open
- **major:** 0 found / 0 open
- **minor:** 1 — preview-server instance cũ (4321, dist cũ) có thể gây nhầm khi QA thủ công; đã stop, không phải defect sản phẩm. Ghi nhận: `.git/info/exclude` chứa `.h-shots/` (local exclude, không share) — intentional, docs ghi ở trên.

## Final adversarial review

Reviewer độc lập (fresh sub-agent, không inspect quiz, không re-review content), 35 vector tấn công §38. Kết quả: **FINAL_PROJECT_ADVERSARIAL_PASS — 0 BLOCKER / 0 MAJOR / 2 MINOR** (đã repair + re-verify: bảng số liệu plan "22 route thật" nằm trong mục lịch sử có nhãn rõ; README doc-table thêm QA_FINAL_REPORT). Chi tiết verdict trong log chat của reviewer; các vector 1–35 đều có bằng chứng đáp ứng ở các mục trên.

## Final gate

**FINAL PROJECT QA: GATE PASS @ commit close (xem git log).** Toàn bộ PASS conditions §42 đạt: RUNTIME ✓ · INTEGRITY (48/8/0 broken/registry-dist aligned/13/14) ✓ · RESPONSIVE ✓ · THEMES ✓ · ACCESSIBILITY ✓ · S-REGISTER ✓ · CLEANUP ✓ · DOCS ✓ · MAINTENANCE ✓ · QUIZ: NO QUIZ CONTENT AUDIT PERFORMED ✓ · BUILD ✓ (0/0/67) · ADVERSARIAL PASS (0B/0M) ✓ · GIT clean, not pushed ✓.
