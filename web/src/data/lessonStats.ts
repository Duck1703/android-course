// ==========================================================================
// lessonStats.ts — DERIVED data, khong phai data moi.
//
// Muc dich: dashboard va trang lesson can nhung so lieu that (bai nay co bao
// nhieu muc, bao nhieu code block, bao nhieu cau quiz, doc khoang bao lau) de
// hien thi. Truoc day nhung so nay khong ton tai o dau ca.
//
// Cach lay: doc chinh cac file .astro cua lesson/quiz duoi dang text tai
// BUILD TIME bang import.meta.glob({ query: "?raw" }). Khong tao syllabus moi,
// khong sua noi dung — chi DEM lai nhung gi da co san trong file.
// ==========================================================================
import { ALL_CHAPTERS, chapterFileKey } from "./chapters";

// eager: true => Vite noi cac file thanh string ngay luc build, khong can fs.
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
  quizQuestions: number; // so <fieldset data-answer> trong quiz
  exercises: number; // so .exercise / .chal trong quiz
  words: number; // so tu cua phan van ban (khong tinh code)
  minutes: number; // thoi luong doc uoc luong, lam tron 5 phut
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

// --- Gom file theo chapter ----------------------------------------------------
// Ten file luon bat dau bang ChNN (vd Ch09DataStore.astro, Ch09Quiz.astro).
// Chuong da tach thanh chuong nho dung them "_N": Ch10_2EntityDaoDatabase.astro,
// Ch10_2Quiz.astro. Khoa gom vi the la STRING: "09" hoac "10_2".
interface Bucket {
  lesson?: string;
  quiz?: string;
}
const byKey = new Map<string, Bucket>();

for (const [path, src] of Object.entries(RAW)) {
  const file = path.slice(path.lastIndexOf("/") + 1);
  const m = /^Ch(\d{2})(?:_(\d+))?(.*)\.astro$/.exec(file);
  if (!m) continue;
  const key = m[2] ? `${m[1]}_${m[2]}` : m[1]!;
  const bucket = byKey.get(key) ?? {};
  if (m[3] === "Quiz") bucket.quiz = src;
  else bucket.lesson = src;
  byKey.set(key, bucket);
}

// --- Tinh so lieu cho tung chapter -------------------------------------------
const stats: Record<string, LessonStats> = {};

for (const ch of ALL_CHAPTERS) {
  const bucket = byKey.get(chapterFileKey(ch));
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

  stats[ch.slug] = {
    headings,
    sections: headings.length,
    codeBlocks,
    quizQuestions: countMatches(quizBody, /<fieldset\b[^>]*\bdata-answer=/g),
    exercises:
      countMatches(quizBody, /class="exercise"/g) + countMatches(lessonBody, /class="chal"/g),
    words,
    minutes,
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
