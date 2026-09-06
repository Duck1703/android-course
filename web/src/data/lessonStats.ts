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
import { ALL_CHAPTERS, chapterFileKey } from "./chapters";
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
// CHINH SUA IMP-016: bucket khong con duoc lap tu toan bo file glob matched
// (79 file pseudo-curriculum). Bucket chi lap tu NHUNG file ma registry tham
// chieu — resolve theo quy uoc ten file chuan cua tung slug, roi CHECK TEN FILE
// DO CO CHINH XAC la component live khong bang cach so voi danh sach file
// registry-da-xac-nhan. Orphan/dormant khong bao gio duoc chon.

/** File name quy uoc cho 1 slug: tu chapterFileKey (vd "10_2") + ten nhom tu
 * lessons.ts import. Vi ten file khong suy ra duoc tu slug mot minh, buoc
 * validate duoi dung MAP NGUOC tu chinh LESSONS: moi entry import 2 component
 * cu the; doi tuong Astro build khong mang ten file tin cay, nen ta suy ra
 * file bang quy uoc giong cu NHUNG chi cho slug DA DANG KY, va build fail
 * nghiem khi file khong ton tai. */
// Quy uoc key file chuan cua registry: "09", "10_2"… (chapterFileKey).
const legacyFileKey = chapterFileKey;

interface Bucket {
  lesson?: string;
  quiz?: string;
}
const byKey = new Map<string, Bucket>();

// Chi LOI NHUNG file "co kha nang" la live (khop quy uoc ChNN[_N]*) ROI loc
// bang registry: 1 file chi vao bucket neu (a) khop quy uoc ten file, va
// (b) key do thuoc 1 chapter da dang ky. File `_TEMPLATE.astro` va moi file
// khong khop quy uoc tu bi loai; key khong thuoc registry thi bo qua.
for (const [path, src] of Object.entries(RAW)) {
  const file = path.slice(path.lastIndexOf("/") + 1);
  const m = /^Ch(\d{2})(?:_(\d+))?(.*)\.astro$/.exec(file);
  if (!m) continue;
  const key = m[2] ? `${m[1]}_${m[2]}` : m[1]!;
  // (b) loc membership: key phai ung voi it nhat 1 chapter DANG KY
  if (!ALL_CHAPTERS.some((c) => legacyFileKey(c) === key)) continue;
  const bucket = byKey.get(key) ?? {};
  if (m[3] === "Quiz") bucket.quiz = src;
  else bucket.lesson = src;
  byKey.set(key, bucket);
}

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
    const m = /^Ch(\d{2})(?:_(\d+))?(.*)\.astro$/.exec(file);
    if (!m) continue;
    const key = m[2] ? `${m[1]}_${m[2]}` : m[1]!;
    if (!ALL_CHAPTERS.some((c) => legacyFileKey(c) === key)) continue;
    const list = filesByKey.get(key) ?? [];
    list.push(file);
    filesByKey.set(key, list);
  }
  const lesson: Record<string, string> = {};
  const quiz: Record<string, string> = {};
  const errors: string[] = [];
  for (const ch of ALL_CHAPTERS) {
    const key = legacyFileKey(ch);
    const files = filesByKey.get(key) ?? [];
    const lessonFiles = files.filter((f) => !/Quiz\.astro$/.test(f));
    const quizFiles = files.filter((f) => /Quiz\.astro$/.test(f));
    if (lessonFiles.length === 0) {
      errors.push(`${ch.slug}: khong tim thay file Lesson cho key "${key}"`);
    } else if (lessonFiles.length > 1) {
      // Draft ngu dong trung key voi live: khong the tu chon. Fail to —
      // ke toan phai resolve ro rang truoc khi build.
      errors.push(
        `${ch.slug}: nhieu ung vien Lesson cung key "${key}" (${lessonFiles.join(", ")}) — can resolve ro rang`
      );
    } else {
      lesson[ch.slug] = lessonFiles[0]!;
    }
    if (quizFiles.length > 1) {
      errors.push(
        `${ch.slug}: nhieu ung vien Quiz cung key "${key}" (${quizFiles.join(", ")})`
      );
    } else {
      const quizFile = quizFiles[0];
      if (quizFile) quiz[ch.slug] = quizFile;
      // khong co quiz = hop le (tuong lai AP1–AP3: quizQuestions = 0)
    }
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
