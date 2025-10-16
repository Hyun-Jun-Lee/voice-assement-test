/**
 * 검사 진행 상태 관리 Store
 *
 * Svelte의 writable과 derived를 사용하여 상태를 관리합니다.
 */

import { writable, derived } from 'svelte/store';
import { getTotalQuestions } from '$lib/data/questions';

// === Writable Stores (기본 상태) ===

/**
 * 현재 문항 번호 (1부터 시작)
 */
export const currentQuestion = writable(1);

/**
 * 답변 저장 객체 { questionNum: answer }
 * 예: { 1: 'A', 3: 'C', 5: 'B' }
 */
export const answers = writable({});

/**
 * 전체 문항 수
 */
export const totalQuestions = writable(getTotalQuestions());

/**
 * 검사 시작 시간
 */
export const testStartTime = writable(null);

/**
 * 세션 ID (UUID)
 */
export const sessionId = writable(null);

/**
 * 검사 상태: "idle" | "in_progress" | "completed"
 */
export const testStatus = writable('idle');

// === Derived Stores (계산된 상태) ===

/**
 * 진행률 (0-100)
 */
export const progress = derived([answers, totalQuestions], ([$answers, $totalQuestions]) => {
	const answeredCount = Object.keys($answers).length;
	return (answeredCount / $totalQuestions) * 100;
});

/**
 * 답변한 문항 수
 */
export const answeredCount = derived(answers, ($answers) => {
	return Object.keys($answers).length;
});

/**
 * 검사 완료 여부
 */
export const isCompleted = derived(
	[answeredCount, totalQuestions],
	([$answeredCount, $totalQuestions]) => {
		return $answeredCount === $totalQuestions;
	}
);

/**
 * 다음 문항으로 이동 가능 여부
 */
export const canGoNext = derived(
	[currentQuestion, totalQuestions],
	([$currentQuestion, $totalQuestions]) => {
		return $currentQuestion < $totalQuestions;
	}
);

/**
 * 이전 문항으로 이동 가능 여부
 */
export const canGoPrevious = derived(currentQuestion, ($currentQuestion) => {
	return $currentQuestion > 1;
});

// === Actions (상태 변경 함수) ===

/**
 * 검사 시작
 */
export function startTest() {
	const newSessionId = crypto.randomUUID();
	sessionId.set(newSessionId);
	testStartTime.set(new Date());
	testStatus.set('in_progress');
	currentQuestion.set(1);
	answers.set({});

	console.log('📝 검사 시작:', {
		sessionId: newSessionId,
		startTime: new Date().toISOString()
	});
}

/**
 * 답변 설정
 */
export function setAnswer(questionNum, answer) {
	answers.update((current) => ({
		...current,
		[questionNum]: answer
	}));

	console.log(`✅ 답변 저장: ${questionNum}번 → ${answer}`);
}

/**
 * 답변 제거
 */
export function removeAnswer(questionNum) {
	answers.update((current) => {
		const updated = { ...current };
		delete updated[questionNum];
		return updated;
	});

	console.log(`🗑️ 답변 제거: ${questionNum}번`);
}

/**
 * 다음 문항으로 이동
 */
export function nextQuestion() {
	currentQuestion.update((n) => {
		const total = getTotalQuestions();
		const next = Math.min(n + 1, total);
		console.log(`➡️ 다음 문항: ${n} → ${next}`);
		return next;
	});
}

/**
 * 이전 문항으로 이동
 */
export function previousQuestion() {
	currentQuestion.update((n) => {
		const prev = Math.max(n - 1, 1);
		console.log(`⬅️ 이전 문항: ${n} → ${prev}`);
		return prev;
	});
}

/**
 * 특정 문항으로 이동
 */
export function goToQuestion(questionNum) {
	const total = getTotalQuestions();

	// 범위 체크
	if (questionNum < 1 || questionNum > total) {
		console.warn(`⚠️ 유효하지 않은 문항 번호: ${questionNum} (1-${total})`);
		return;
	}

	currentQuestion.set(questionNum);
	console.log(`🎯 문항 이동: ${questionNum}번`);
}

/**
 * 검사 완료
 */
export function completeTest() {
	testStatus.set('completed');
	console.log('🎉 검사 완료!');
}

/**
 * 검사 초기화
 */
export function resetTest() {
	currentQuestion.set(1);
	answers.set({});
	testStartTime.set(null);
	sessionId.set(null);
	testStatus.set('idle');

	console.log('🔄 검사 초기화');
}

/**
 * 모든 test 관련 actions를 하나의 객체로 export
 */
export const testActions = {
	startTest,
	setAnswer,
	removeAnswer,
	nextQuestion,
	previousQuestion,
	goToQuestion,
	completeTest,
	resetTest
};
