/**
 * 명령 처리 상태 관리 Store
 */

import { writable, derived } from 'svelte/store';

// === Writable Stores ===

/**
 * 음성 듣기 상태 (Phase 3용)
 */
export const isListening = writable(false);

/**
 * 명령 처리 중 상태
 */
export const isProcessing = writable(false);

/**
 * 마지막 음성 인식 텍스트 (Phase 3용)
 */
export const lastTranscript = writable('');

/**
 * 마지막 명령
 */
export const lastCommand = writable('');

/**
 * 명령 히스토리
 */
export const commandHistory = writable([]);

/**
 * 에러 메시지
 */
export const errorMessage = writable('');

/**
 * 성공 메시지
 */
export const successMessage = writable('');

/**
 * 음성 인식 신뢰도 (Phase 3용, 0-1)
 */
export const confidence = writable(0);

// === Derived Stores ===

/**
 * 음성 상태: "listening" | "processing" | "idle"
 */
export const voiceStatus = derived(
	[isListening, isProcessing],
	([$isListening, $isProcessing]) => {
		if ($isListening) return 'listening';
		if ($isProcessing) return 'processing';
		return 'idle';
	}
);

// === Actions ===

/**
 * 음성 듣기 시작 (Phase 3용)
 */
export function startListening() {
	isListening.set(true);
	console.log('🎤 음성 듣기 시작');
}

/**
 * 음성 듣기 중지 (Phase 3용)
 */
export function stopListening() {
	isListening.set(false);
	console.log('🎤 음성 듣기 중지');
}

/**
 * 명령 처리 시작
 */
export function startProcessing() {
	isProcessing.set(true);
	errorMessage.set('');
	successMessage.set('');
	console.log('⏳ 명령 처리 시작');
}

/**
 * 명령 처리 완료
 */
export function finishProcessing() {
	isProcessing.set(false);
	console.log('✅ 명령 처리 완료');
}

/**
 * 음성 인식 텍스트 설정 (Phase 3용)
 */
export function setTranscript(text, conf = 1.0) {
	lastTranscript.set(text);
	confidence.set(conf);
	console.log(`📝 음성 인식: "${text}" (신뢰도: ${(conf * 100).toFixed(0)}%)`);
}

/**
 * 명령 히스토리에 추가
 */
export function addToHistory(command, transcript = '') {
	const entry = {
		timestamp: new Date(),
		command,
		transcript
	};

	commandHistory.update((history) => [entry, ...history].slice(0, 50)); // 최근 50개만 유지
	lastCommand.set(command);

	console.log('📋 히스토리 추가:', entry);
}

/**
 * 에러 메시지 설정
 */
export function setError(message) {
	errorMessage.set(message);
	successMessage.set('');
	console.error('❌ 에러:', message);
}

/**
 * 성공 메시지 설정
 */
export function setSuccess(message) {
	successMessage.set(message);
	errorMessage.set('');
	console.log('✅ 성공:', message);
}

/**
 * 메시지 초기화
 */
export function clearMessages() {
	errorMessage.set('');
	successMessage.set('');
}

/**
 * 모든 command 관련 actions를 하나의 객체로 export
 */
export const commandActions = {
	startListening,
	stopListening,
	startProcessing,
	finishProcessing,
	setTranscript,
	addToHistory,
	setError,
	setSuccess,
	clearMessages
};
