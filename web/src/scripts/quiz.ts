// IMP-001 — shared quiz harness (spec §13, kế hoạch tổng thể docs/COURSE_REDESIGN_IMPLEMENTATION_PLAN.md).
//
// Một runtime chấm bài dùng chung cho mọi quiz, thay cho script inline lặp lại
// trong từng file *Quiz.astro. Tham chiếu hành vi: prototype
// learning-experience-v1 @ 3ae75d1 (Ch10_2Quiz) — chỉ lấy hành vi, không merge code.
//
// Harness sở hữu trọn vòng đời quiz:
//   1. Nhãn "Câu x/N" đầu mỗi legend (aria-hidden — số thứ tự đã có sẵn trong text).
//   2. Submit: chấm từng fieldset (data-answer), hiện .explain, tô .correct/.incorrect.
//   3. Kết quả "Kết quả: x/N câu đúng." vào #quiz-score (role="status" + aria-live="polite"),
//      scrollIntoView để người học thấy điểm ngay (MR-016).
//   4. Nút "Làm lại" #quiz-retry: ẩn trước submit → hiện sau submit → confirm →
//      reset (bỏ chọn, ẩn explain, bỏ correct/incorrect, xoá điểm) → ẩn lại (MR-017).
//
// Tương thích tiến dần (blast radius có kiểm soát): quiz cũ KHÔNG cần sửa gì —
// thiếu #quiz-retry thì retry tự tắt, submit/chấm/giải thích vẫn chạy như cũ.
// Quiz mới tham gia bằng cách thêm đúng 1 dòng `import "../../scripts/quiz.ts";`
// vào <script> của component (xem web/src/components/lessons/Ch10_2Quiz.astro,
// Ch05Quiz.astro — 2 quiz chứng minh của IMP-001) và (tuỳ chọn) nút #quiz-retry.
//
// Hợp đồng markup (giữ nguyên như quiz.css đã chốt):
//   form#quiz-form > fieldset[data-answer] > legend + label>input[type=radio] + p.explain[hidden]
//   p#quiz-score[hidden]   ·   button#quiz-retry[hidden] (tuỳ chọn)

import { recordQuizAttempt } from "../lib/progress";

// Model B-lite (IMP-070): identity của bài học hiện tại = data-page-slug trên
// <main> (đăng ký bởi BaseLayout khi trang chapter truyền slug). KHÔNG suy
// đoán slug từ text hiển thị/đánh số/URL badge — chỉ nhận slug đăng ký tường
// minh, nên quiz trả về đúng slug registry của bài đang mở.
function lessonSlug(): string {
	return document.querySelector<HTMLElement>("main[data-page-slug]")?.dataset.pageSlug ?? "";
}

export function initQuiz(root: ParentNode = document): void {
	const form = root.querySelector<HTMLFormElement>("form#quiz-form");
	if (!form || form.dataset.quizBound === "true") return;
	form.dataset.quizBound = "true";

	const fieldsets = [...form.querySelectorAll<HTMLFieldSetElement>("fieldset[data-answer]")];
	const scoreEl = form.querySelector<HTMLParagraphElement>("#quiz-score");
	const retryBtn = root.querySelector<HTMLButtonElement>("#quiz-retry");

	// "Câu x/N" — số câu hỏi hiện lên đầu mỗi fieldset (Redesign spec §13).
	// aria-hidden vì số thứ tự "1." đã có sẵn trong text của legend.
	fieldsets.forEach((fs, i) => {
		const legend = fs.querySelector("legend");
		if (legend && !legend.querySelector(".q-num")) {
			const num = document.createElement("span");
			num.className = "q-num";
			num.setAttribute("aria-hidden", "true");
			num.textContent = `Câu ${i + 1}/${fieldsets.length}`;
			legend.prepend(num);
		}
	});

	form.addEventListener("submit", (e) => {
		e.preventDefault();
		let correct = 0;

		// Model B-lite (IMP-070): một lần NỘP THẬT = một lượt quiz-attempt cho bài
		// hiện tại. Tích hợp TẬP TRUNG ở đây — 45 quiz không cần sửa gì. Chỉ chạy
		// khi form có slug identity (trang bài học qua BaseLayout data-page-slug);
		// quiz ngoài context đó không tự bịa slug. Retry KHÔNG xoá flag này.
		const slug = lessonSlug();
		if (slug) {
			recordQuizAttempt(slug);
			// Báo cho progress UI đang mount (vd hint "Chưa làm quiz") cập nhật
			// không cần reload — cùng pattern CustomEvent của "progress-changed".
			document.dispatchEvent(new CustomEvent("quiz-attempted", { detail: slug }));
		}

		fieldsets.forEach((fs) => {
			const answer = fs.getAttribute("data-answer");
			const name = fs.querySelector("input")?.getAttribute("name");
			const picked = form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
			const explain = fs.querySelector(".explain");
			explain?.removeAttribute("hidden");

			fs.classList.remove("correct", "incorrect");
			if (picked && picked.value === answer) {
				correct++;
				fs.classList.add("correct");
			} else {
				fs.classList.add("incorrect");
			}
		});

		if (scoreEl) {
			scoreEl.textContent = `Kết quả: ${correct}/${fieldsets.length} câu đúng.`;
			scoreEl.removeAttribute("hidden");
			// Đưa kết quả vào khung nhìn ngay sau khi chấm (MR-016).
			scoreEl.scrollIntoView({ behavior: "smooth", block: "center" });
		}
		// "Làm lại" chỉ có nghĩa sau khi đã nộp bài ít nhất một lần.
		retryBtn?.removeAttribute("hidden");
	});

	// "Làm lại" — xoá lựa chọn + ẩn giải thích, không reload trang (MR-017).
	retryBtn?.addEventListener("click", () => {
		if (!window.confirm("Xoá toàn bộ lựa chọn và làm lại từ đầu?")) return;
		fieldsets.forEach((fs) => {
			fs.classList.remove("correct", "incorrect");
			fs.querySelector(".explain")?.setAttribute("hidden", "");
			fs.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((r) => (r.checked = false));
		});
		if (scoreEl) {
			scoreEl.textContent = "";
			scoreEl.setAttribute("hidden", "");
		}
		// Làm lại xong: ẩn nút cho tới lần nộp tiếp theo.
		retryBtn.setAttribute("hidden", "");
	});
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => initQuiz());
} else {
	initQuiz();
}
