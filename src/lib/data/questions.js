/**
 * 심리검사 더미 문항 데이터
 *
 * 실제 심리검사는 전문적인 검사 도구를 사용해야 하며,
 * 이 데이터는 개발 및 테스트 목적으로만 사용됩니다.
 */

export const questions = [
	{
		id: 1,
		text: '나는 요즘 스트레스를 많이 받는다',
		category: '스트레스',
		choices: [
			{ value: 'A', label: '전혀 그렇지 않다' },
			{ value: 'B', label: '그렇지 않다' },
			{ value: 'C', label: '보통이다' },
			{ value: 'D', label: '그렇다' },
			{ value: 'E', label: '매우 그렇다' }
		]
	},
	{
		id: 2,
		text: '다른 사람들과 대화할 때 편안함을 느낀다',
		category: '대인관계',
		choices: [
			{ value: 'A', label: '전혀 그렇지 않다' },
			{ value: 'B', label: '그렇지 않다' },
			{ value: 'C', label: '보통이다' },
			{ value: 'D', label: '그렇다' },
			{ value: 'E', label: '매우 그렇다' }
		]
	},
	{
		id: 3,
		text: '밤에 잠을 잘 자지 못한다',
		category: '수면',
		choices: [
			{ value: 'A', label: '전혀 그렇지 않다' },
			{ value: 'B', label: '그렇지 않다' },
			{ value: 'C', label: '보통이다' },
			{ value: 'D', label: '그렇다' },
			{ value: 'E', label: '매우 그렇다' }
		]
	},
	{
		id: 4,
		text: '새로운 것에 도전하는 것을 좋아한다',
		category: '성격',
		choices: [
			{ value: 'A', label: '전혀 그렇지 않다' },
			{ value: 'B', label: '그렇지 않다' },
			{ value: 'C', label: '보통이다' },
			{ value: 'D', label: '그렇다' },
			{ value: 'E', label: '매우 그렇다' }
		]
	},
	{
		id: 5,
		text: '내 감정을 다른 사람에게 잘 표현한다',
		category: '감정표현',
		choices: [
			{ value: 'A', label: '전혀 그렇지 않다' },
			{ value: 'B', label: '그렇지 않다' },
			{ value: 'C', label: '보통이다' },
			{ value: 'D', label: '그렇다' },
			{ value: 'E', label: '매우 그렇다' }
		]
	},
	{
		id: 6,
		text: '일상생활에서 불안감을 자주 느낀다',
		category: '스트레스',
		choices: [
			{ value: 'A', label: '전혀 그렇지 않다' },
			{ value: 'B', label: '그렇지 않다' },
			{ value: 'C', label: '보통이다' },
			{ value: 'D', label: '그렇다' },
			{ value: 'E', label: '매우 그렇다' }
		]
	},
	{
		id: 7,
		text: '친구들과 함께 있을 때 즐겁다',
		category: '대인관계',
		choices: [
			{ value: 'A', label: '전혀 그렇지 않다' },
			{ value: 'B', label: '그렇지 않다' },
			{ value: 'C', label: '보통이다' },
			{ value: 'D', label: '그렇다' },
			{ value: 'E', label: '매우 그렇다' }
		]
	},
	{
		id: 8,
		text: '아침에 일어나는 것이 힘들다',
		category: '수면',
		choices: [
			{ value: 'A', label: '전혀 그렇지 않다' },
			{ value: 'B', label: '그렇지 않다' },
			{ value: 'C', label: '보통이다' },
			{ value: 'D', label: '그렇다' },
			{ value: 'E', label: '매우 그렇다' }
		]
	},
	{
		id: 9,
		text: '계획을 세우고 체계적으로 일을 처리한다',
		category: '성격',
		choices: [
			{ value: 'A', label: '전혀 그렇지 않다' },
			{ value: 'B', label: '그렇지 않다' },
			{ value: 'C', label: '보통이다' },
			{ value: 'D', label: '그렇다' },
			{ value: 'E', label: '매우 그렇다' }
		]
	},
	{
		id: 10,
		text: '슬플 때 눈물을 참지 않고 운다',
		category: '감정표현',
		choices: [
			{ value: 'A', label: '전혀 그렇지 않다' },
			{ value: 'B', label: '그렇지 않다' },
			{ value: 'C', label: '보통이다' },
			{ value: 'D', label: '그렇다' },
			{ value: 'E', label: '매우 그렇다' }
		]
	}
];

/**
 * ID로 특정 문항 조회
 */
export function getQuestionById(id) {
	return questions.find((q) => q.id === id);
}

/**
 * 전체 문항 수 반환
 */
export function getTotalQuestions() {
	return questions.length;
}

/**
 * 카테고리별 문항 조회
 */
export function getQuestionsByCategory(category) {
	return questions.filter((q) => q.category === category);
}

/**
 * 사용 가능한 모든 카테고리 목록
 */
export function getCategories() {
	return [...new Set(questions.map((q) => q.category))];
}
