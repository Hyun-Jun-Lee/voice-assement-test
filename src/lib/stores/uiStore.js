/**
 * UI 상태 관리 Store
 */

import { writable } from 'svelte/store';

// === Writable Stores ===

/**
 * 명령 히스토리 표시 여부
 */
export const showCommandHistory = writable(false);

/**
 * 도움말 표시 여부
 */
export const showHelp = writable(false);

/**
 * 테마: "light" | "dark"
 */
export const theme = writable('light');

/**
 * 디버그 모드 (개발용)
 */
export const debugMode = writable(true); // Phase 1에서는 기본 활성화

// === Actions ===

/**
 * 명령 히스토리 토글
 */
export function toggleCommandHistory() {
	showCommandHistory.update((show) => {
		const newValue = !show;
		console.log(`📜 명령 히스토리: ${newValue ? '표시' : '숨김'}`);
		return newValue;
	});
}

/**
 * 도움말 토글
 */
export function toggleHelp() {
	showHelp.update((show) => {
		const newValue = !show;
		console.log(`❓ 도움말: ${newValue ? '표시' : '숨김'}`);
		return newValue;
	});
}

/**
 * 테마 설정
 */
export function setTheme(newTheme) {
	if (newTheme !== 'light' && newTheme !== 'dark') {
		console.warn('⚠️ 유효하지 않은 테마:', newTheme);
		return;
	}

	theme.set(newTheme);
	console.log(`🎨 테마 변경: ${newTheme}`);
}

/**
 * 디버그 모드 토글
 */
export function toggleDebugMode() {
	debugMode.update((mode) => {
		const newValue = !mode;
		console.log(`🐛 디버그 모드: ${newValue ? 'ON' : 'OFF'}`);
		return newValue;
	});
}

/**
 * 모든 UI 관련 actions를 하나의 객체로 export
 */
export const uiActions = {
	toggleCommandHistory,
	toggleHelp,
	setTheme,
	toggleDebugMode
};
