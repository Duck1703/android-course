// ==========================================================================
// progressStages.ts — helper tiến độ theo STAGE cho Workstream G (IMP-070 §15).
//
// Nguồn dữ liệu: registry (ALL_CHAPTERS + STAGES từ chapters.ts) — KHÔNG suy
// nhóm từ số bài/đánh số hiển thị. Mỗi helper chỉ đếm trên thành viên stage
// thực sự, nên:
//   • core = 39 (foundation 2 + android 14 + compose 5 + state 5 + navigation 2
//     + network 3 + data 6 + realworld 2),
//   • optional = 6 (track "Mở rộng", tự giữ 0/6 riêng — KHÔNG đếm vào core),
//   • appendix = 3 reference — không thuộc completion/progress gating.
//
// Tính sẵn cho Workstream H (homepage/sidebar UI sau này): completed/total per
// stage, core total, optional total, next/resume. KHÔNG xây UI H ở đây.
// Vanilla TS thuần, đọc localStorage qua lib/progress — không framework.
// ==========================================================================
import { ALL_CHAPTERS, STAGES, type ChapterInfo, type StageId } from "../data/chapters";
import { getDoneSlugs } from "./progress";

/** Track của một unit theo stage metadata — không nhìn lesson number. */
export type Track = "core" | "optional" | "appendix";

export function trackOf(ch: ChapterInfo): Track {
  const stage = STAGES.find((s) => s.id === ch.stageId);
  return stage?.kind ?? "core";
}

/** Danh sách unit thuộc một stage, đúng thứ tự registry. */
export function stageUnits(stageId: StageId): ChapterInfo[] {
  return ALL_CHAPTERS.filter((ch) => ch.stageId === stageId);
}

export interface StageProgress {
  stageId: StageId;
  done: number;
  total: number;
}

/** Tiến độ 1 stage (chỉ đếm thành viên stage đó). */
export function stageProgress(stageId: StageId, doneSlugs: string[] = getDoneSlugs()): StageProgress {
  const units = stageUnits(stageId);
  const doneSet = new Set(doneSlugs);
  return {
    stageId,
    done: units.filter((ch) => doneSet.has(ch.slug)).length,
    total: units.length,
  };
}

/** Tiến độ từng stage theo thứ tự học (STAGES.order), chỉ stage có unit. */
export function allStageProgress(doneSlugs: string[] = getDoneSlugs()): StageProgress[] {
  return STAGES.filter((st) => stageUnits(st.id).length > 0).map((st) =>
    stageProgress(st.id, doneSlugs)
  );
}

/** Tổng lõi (core) — denominator của % toàn khoá. Hiện tại = 39. */
export function coreUnits(): ChapterInfo[] {
  return ALL_CHAPTERS.filter((ch) => trackOf(ch) === "core");
}

/** Tổng "Mở rộng" (optional) — denominator riêng của track mở rộng. Hiện tại = 6. */
export function optionalUnits(): ChapterInfo[] {
  return ALL_CHAPTERS.filter((ch) => trackOf(ch) === "optional");
}

/** Tổng core đã hoàn thành — completing O1–O6/AP1–AP3 không đổi con số này. */
export function coreProgress(doneSlugs: string[] = getDoneSlugs()): { done: number; total: number } {
  const doneSet = new Set(doneSlugs);
  const units = coreUnits();
  return { done: units.filter((ch) => doneSet.has(ch.slug)).length, total: units.length };
}

/**
 * Bài "tiếp theo" cho resume/continue-learning (Model B-lite semantics):
 *   • bài CHƯA hoàn thành (kể cả đã nộp quiz nhưng chưa tự xác nhận) vẫn là
 *     unfinished — attempt KHÔNG biến nó thành done;
 *   • bài đã hoàn thành được bỏ qua theo logic hiện tại;
 *   • appendix (reference) không bao giờ là bước học lõi tiếp theo.
 * Trả về unit đầu tiên chưa done theo thứ tự: core trước, optional sau.
 */
export function nextLesson(doneSlugs: string[] = getDoneSlugs()): ChapterInfo | undefined {
  const doneSet = new Set(doneSlugs);
  const ordered = [...coreUnits(), ...optionalUnits()];
  return ordered.find((ch) => !doneSet.has(ch.slug));
}
