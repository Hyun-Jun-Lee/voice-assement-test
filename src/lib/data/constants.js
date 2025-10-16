/**
 * 애플리케이션 상수 정의
 */

// 앱 설정
export const APP_CONFIG = {
	APP_NAME: '심리검사 음성 인터페이스',
	VERSION: '1.0.0',
	LANGUAGE: 'ko-KR'
};

// 음성 설정 (Phase 3용)
export const VOICE_CONFIG = {
	MAX_RECORDING_TIME: 10000, // 10초
	MIN_CONFIDENCE: 0.7,
	LANGUAGE: 'ko-KR'
};

// 명령 패턴 (Mock 모드용)
export const COMMAND_PATTERNS = {
	CHECK_ANSWER: /(\d+)번.*([A-E]|[가-마])/,
	NEXT: /(다음|담|넥스트)/,
	PREVIOUS: /(이전|앞|백)/,
	GO_TO: /(\d+)번.*(가|이동)/,
	SKIP: /(건너뛰|스킵|패스)/,
	GET_PROGRESS: /(몇|진행|퍼센트|상황)/,
	REPEAT: /(다시|반복)/,
	GET_ANSWER: /(\d+)번.*뭐|(\d+)번.*답/,
	GET_ALL_ANSWERS: /(전체|모두|지금까지).*답/
};

// 한글 → 영문 변환 맵
export const ANSWER_MAP = {
	가: 'A',
	나: 'B',
	다: 'C',
	라: 'D',
	마: 'E'
};

// 피드백 메시지
export const FEEDBACK_MESSAGES = {
	LISTENING: '🎤 듣고 있습니다...',
	PROCESSING: '⏳ 처리 중입니다...',
	SUCCESS: '✅ 명령이 실행되었습니다',
	ERROR: '❌ 오류가 발생했습니다',
	RETRY: '🔄 다시 한번 말씀해주세요',
	LOW_CONFIDENCE: '🤔 잘 이해하지 못했습니다'
};

// UI 색상
export const COLORS = {
	PRIMARY: '#4CAF50',
	SECONDARY: '#2196F3',
	SUCCESS: '#8BC34A',
	ERROR: '#f44336',
	WARNING: '#ff9800',
	INFO: '#2196F3'
};

// 로그 타입
export const LOG_TYPES = {
	INPUT: '입력',
	LLM_RESPONSE: 'LLM 응답',
	EXECUTION: '실행',
	ERROR: '오류'
};
