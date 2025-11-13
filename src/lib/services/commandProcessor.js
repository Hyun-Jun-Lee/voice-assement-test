/**
 * 명령 처리 서비스 (LLM Tool Calling)
 *
 * OpenRouter API를 사용하여 자연어 명령을 처리합니다.
 */

import { ANSWER_MAP } from '$lib/data/constants';
import {
	getQuestionData,
	formatChoicesForPrompt,
	extractChoiceValues
} from './questionService';

// 환경 변수에서 API 설정 가져오기
const OPENROUTER_API_KEY =
	typeof import.meta !== 'undefined' ? import.meta.env.VITE_OPENROUTER_API_KEY : '';
const MODEL_NAME =
	typeof import.meta !== 'undefined'
		? import.meta.env.VITE_MODEL_NAME || 'openai/gpt-4'
		: 'openai/gpt-4';
const APP_URL =
	typeof import.meta !== 'undefined'
		? import.meta.env.VITE_APP_URL || 'http://localhost:5173'
		: 'http://localhost:5173';

/**
 * 한글 답변을 영문으로 변환
 */
function convertAnswer(answer) {
	return ANSWER_MAP[answer] || answer;
}

/**
 * OpenRouter API 호출
 */
async function callOpenRouter(text, context) {
	// DB에서 현재 문항의 정보와 선택지를 가져옴
	const questionData = await getQuestionData(context.current_question);
	const choices = questionData?.choices || [];
	const choiceValues = extractChoiceValues(choices);
	const choicesFormatted = formatChoicesForPrompt(choices);

	// 선택지 레이블 → 값 매핑 정보 생성
	const labelToValueMapping = choices
		.map((c) => `"${c.label}" → ${c.value}`)
		.join(', ');

	const systemPrompt = `당신은 심리검사 음성 인터페이스 어시스턴트입니다.

**중요: 반드시 제공된 도구(tool)를 호출해야 합니다. 텍스트 응답만 하지 마세요!**

현재 상황:
- 현재 문항 번호: ${context.current_question}번
- 전체 문항 수: ${context.total_questions}개
- 답변 완료 문항 수: ${context.answered_count || 0}개
- 진행률: ${context.progress || 0}%
- 현재 문항 질문: "${questionData?.text || ''}"
- 답변 선택지: ${choicesFormatted}

답변 인식 규칙 (매우 중요!):
1. 사용자가 선택지의 "레이블(텍스트)"로 답하면, 반드시 해당하는 "값(알파벳)"으로 변환하세요:
   ${labelToValueMapping}

   예시:
   - "전혀 그렇지 않다" 또는 "전혀" → A
   - "그렇지 않다" → B
   - "보통이다" 또는 "보통" → C
   - "그렇다" → D
   - "매우 그렇다" 또는 "매우" → E

2. 사용자가 알파벳으로 답하면 그대로 사용:
   - "A", "B", "C", "D", "E" → 그대로 사용

3. 사용자가 한글 자모로 답하면 변환:
   - "가" → A, "나" → B, "다" → C, "라" → D, "마" → E

4. 문항 번호 처리:
   - 문항 번호 없이 답변만 말하면 → 현재 문항(${context.current_question}번)
   - "3번 보통" 처럼 문항 번호를 명시하면 → 해당 문항 번호 사용

5. 네비게이션 명령 (문항 이동):
   - "다음", "다음 문항", "넘어가" → next_question 호출
   - "이전", "이전 문항", "뒤로", "돌아가", "이전 문항 보기", "이전 문항을 다시 볼래" → previous_question 호출
   - "건너뛰기", "스킵", "패스" → skip_question 호출
   - "3번으로 가", "5번 보여줘" → go_to_question 호출 (question_num 지정)

6. 조회 명령:
   - "진행 상황", "몇 번", "퍼센트", "몇 문항", "남았어", "남은 문항" → get_progress 호출
   - "다시 읽어", "반복", "다시 들려줘" → repeat_question 호출
   - "3번 뭐라고 했어", "5번 답변" → get_answer 호출 (question_num 지정)
   - "전체 답변", "지금까지 답변" → get_all_answers 호출

**필수 규칙:**
- 사용자의 모든 명령은 반드시 위의 도구(tool) 중 하나를 호출해야 합니다.
- 도구를 호출하지 않고 텍스트만 응답하면 안 됩니다.
- 명령을 이해하지 못했다면 unknown action을 반환하세요.

사용자의 명령을 분석하고 적절한 도구(tool)를 호출하세요.`;

	const tools = [
		{
			type: 'function',
			function: {
				name: 'check_answer',
				description: '특정 문항에 답변을 체크합니다',
				parameters: {
					type: 'object',
					properties: {
						question_num: {
							type: 'integer',
							description: '문항 번호 (1부터 시작)'
						},
						answer: {
							type: 'string',
							enum: choiceValues, // 동적으로 DB에서 가져온 선택지
							description: `답변 (${choiceValues.join(', ')} 중 하나)`
						}
					},
					required: ['question_num', 'answer']
				}
			}
		},
		{
			type: 'function',
			function: {
				name: 'next_question',
				description: '다음 문항으로 이동합니다',
				parameters: {
					type: 'object',
					properties: {},
					required: []
				}
			}
		},
		{
			type: 'function',
			function: {
				name: 'previous_question',
				description: '이전 문항으로 이동합니다',
				parameters: {
					type: 'object',
					properties: {},
					required: []
				}
			}
		},
		{
			type: 'function',
			function: {
				name: 'go_to_question',
				description: '특정 문항 번호로 이동합니다',
				parameters: {
					type: 'object',
					properties: {
						question_num: {
							type: 'integer',
							description: '이동할 문항 번호'
						}
					},
					required: ['question_num']
				}
			}
		},
		{
			type: 'function',
			function: {
				name: 'skip_question',
				description: '현재 문항을 건너뛰고 다음 문항으로 이동합니다',
				parameters: {
					type: 'object',
					properties: {},
					required: []
				}
			}
		},
		{
			type: 'function',
			function: {
				name: 'get_progress',
				description: '현재 검사 진행 상황을 조회합니다 (완료된 문항 수, 남은 문항 수, 진행률)',
				parameters: {
					type: 'object',
					properties: {},
					required: []
				}
			}
		},
		{
			type: 'function',
			function: {
				name: 'repeat_question',
				description: '현재 문항을 다시 읽어줍니다',
				parameters: {
					type: 'object',
					properties: {},
					required: []
				}
			}
		},
		{
			type: 'function',
			function: {
				name: 'get_answer',
				description: '특정 문항의 답변을 조회합니다',
				parameters: {
					type: 'object',
					properties: {
						question_num: {
							type: 'integer',
							description: '조회할 문항 번호'
						}
					},
					required: ['question_num']
				}
			}
		},
		{
			type: 'function',
			function: {
				name: 'get_all_answers',
				description: '지금까지 답변한 모든 문항을 조회합니다',
				parameters: {
					type: 'object',
					properties: {},
					required: []
				}
			}
		}
	];

	const requestBody = {
		model: MODEL_NAME,
		messages: [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content: text }
		],
		tools: tools,
		tool_choice: 'required' // 반드시 tool을 호출하도록 강제
	};

	console.log('📤 OpenRouter 요청 데이터:', requestBody);

	const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${OPENROUTER_API_KEY}`,
			'Content-Type': 'application/json',
			'HTTP-Referer': APP_URL,
			'X-Title': 'Psychological Assessment Voice Interface'
		},
		body: JSON.stringify(requestBody)
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`OpenRouter API 오류: ${response.status} - ${errorText}`);
	}

	const data = await response.json();
	console.log('🤖 OpenRouter 응답:', JSON.stringify(data, null, 2));

	// Tool call 파싱
	const message = data.choices[0].message;
	console.log('📨 Message 객체:', JSON.stringify(message, null, 2));

	if (message.tool_calls && message.tool_calls.length > 0) {
		console.log(`🔧 Tool Calls: ${message.tool_calls.length}개 감지`);

		// 여러 tool이 있는 경우 배열로 반환
		if (message.tool_calls.length > 1) {
			const actions = message.tool_calls.map((toolCall, index) => {
				console.log(`🔧 Tool Call ${index + 1}:`, JSON.stringify(toolCall, null, 2));

				const functionName = toolCall.function.name;
				const args = JSON.parse(toolCall.function.arguments);

				const result = {
					action: functionName,
					...args,
					message: `${functionName} 실행`
				};

				// 한글 답변 변환
				if (result.answer) {
					result.answer = convertAnswer(result.answer).toUpperCase();
				}

				return result;
			});

			console.log('📦 최종 결과 (다중):', actions);
			return {
				action: 'multiple',
				actions: actions,
				message: `${actions.length}개 명령 실행`,
				raw_response: data
			};
		}

		// 단일 tool인 경우 기존 방식
		const toolCall = message.tool_calls[0];
		console.log('🔧 Tool Call:', JSON.stringify(toolCall, null, 2));

		const functionName = toolCall.function.name;
		const args = JSON.parse(toolCall.function.arguments);

		console.log('✅ 파싱 성공:', { functionName, args });

		// 결과 구성
		const result = {
			action: functionName,
			...args,
			message: `${functionName} 실행`,
			raw_response: data
		};

		// 한글 답변 변환
		if (result.answer) {
			result.answer = convertAnswer(result.answer).toUpperCase();
		}

		console.log('📦 최종 결과:', result);
		return result;
	}

	// Mistral 모델이 텍스트로 반환하는 경우 처리
	if (message.content && message.content.includes('[TOOL_CALLS')) {
		console.log('🔄 텍스트 형식 tool call 감지, 파싱 시도 중...');

		try {
			// 형식: [TOOL_CALLSfunction_name{"arg1": "value1", "arg2": "value2"}
			// 또는: [TOOL_CALLSfunction_name[ARGS{"arg1": "value1"}
			const content = message.content;

			// 함수명 추출
			let functionName = '';
			let argsJson = '';

			// 패턴 1: [TOOL_CALLSfunction_name{"args"}
			const pattern1 = /\[TOOL_CALLS([a-z_]+)(\{.*?\})/i;
			const match1 = content.match(pattern1);

			if (match1) {
				functionName = match1[1];
				argsJson = match1[2];
			} else {
				// 패턴 2: [TOOL_CALLSfunction_name[ARGS{"args"}
				const pattern2 = /\[TOOL_CALLS([a-z_]+)\[ARGS(\{.*?\})/i;
				const match2 = content.match(pattern2);

				if (match2) {
					functionName = match2[1];
					argsJson = match2[2];
				}
			}

			if (functionName && argsJson) {
				console.log('🔍 파싱된 함수:', functionName);
				console.log('🔍 파싱된 인자:', argsJson);

				const args = JSON.parse(argsJson);
				console.log('✅ JSON 파싱 성공:', args);

				// 결과 구성
				const result = {
					action: functionName,
					...args,
					message: `${functionName} 실행`,
					raw_response: data
				};

				// 한글 답변 변환
				if (result.answer) {
					result.answer = convertAnswer(result.answer).toUpperCase();
				}

				console.log('📦 최종 결과:', result);
				return result;
			}
		} catch (parseError) {
			console.error('❌ 텍스트 파싱 실패:', parseError);
			console.error('원본 텍스트:', message.content);
		}
	}

	return {
		action: 'unknown',
		message: message.content || '명령을 이해하지 못했습니다',
		raw_response: data
	};
}

/**
 * 메인 명령 처리 함수
 */
export async function processTextCommand(text, context) {
	if (!text || !text.trim()) {
		throw new Error('명령이 비어있습니다');
	}

	// API 키 확인
	if (!OPENROUTER_API_KEY || !OPENROUTER_API_KEY.trim()) {
		throw new Error('VITE_OPENROUTER_API_KEY가 설정되지 않았습니다. .env 파일을 확인해주세요.');
	}

	// Context 기본값
	const ctx = {
		current_question: context?.current_question || 1,
		total_questions: context?.total_questions || 10,
		answered_count: context?.answered_count || 0,
		progress: context?.progress || 0
	};

	console.log('📝 명령 처리:', { text, context: ctx });

	// OpenRouter API 호출
	return await callOpenRouter(text, ctx);
}
