/**
 * 질문 관련 서비스 (DB 연동 가정)
 * Phase 4에서 실제 Supabase 연동 예정
 */

import { getQuestionById } from '$lib/data/questions';

/**
 * DB에서 특정 문항의 선택지를 가져옵니다
 * @param {number} questionNum - 문항 번호
 * @returns {Promise<Array<{value: string, label: string}>>} 선택지 배열
 */
export async function getChoicesByQuestionNum(questionNum) {
	// TODO Phase 4: Supabase에서 실제 데이터 가져오기
	// const { data, error } = await supabase
	//   .from('questions')
	//   .select('choices')
	//   .eq('id', questionNum)
	//   .single();

	// 현재는 로컬 데이터 사용
	const question = getQuestionById(questionNum);
	return question?.choices || [];
}

/**
 * DB에서 특정 문항의 전체 정보를 가져옵니다
 * @param {number} questionNum - 문항 번호
 * @returns {Promise<Object>} 문항 정보
 */
export async function getQuestionData(questionNum) {
	// TODO Phase 4: Supabase에서 실제 데이터 가져오기
	// const { data, error } = await supabase
	//   .from('questions')
	//   .select('*')
	//   .eq('id', questionNum)
	//   .single();

	// 현재는 로컬 데이터 사용
	const question = getQuestionById(questionNum);
	return question || null;
}

/**
 * 선택지 배열을 문자열 형태로 변환
 * @param {Array<{value: string, label: string}>} choices - 선택지 배열
 * @returns {string} "A: 전혀 그렇지 않다, B: 그렇지 않다, ..." 형식
 */
export function formatChoicesForPrompt(choices) {
	return choices.map((choice) => `${choice.value}: ${choice.label}`).join(', ');
}

/**
 * 선택지에서 value 목록만 추출
 * @param {Array<{value: string, label: string}>} choices - 선택지 배열
 * @returns {Array<string>} ["A", "B", "C", "D", "E"]
 */
export function extractChoiceValues(choices) {
	return choices.map((choice) => choice.value);
}
