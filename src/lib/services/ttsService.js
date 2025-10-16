/**
 * TTS (Text-to-Speech) 서비스
 *
 * Phase 1-2: 콘솔 로그로 시뮬레이션
 * Phase 3: OpenAI Whisper TTS API 연동 예정
 */

/**
 * 텍스트를 음성으로 읽어줍니다
 * @param {string} text - 읽을 텍스트
 * @param {Object} options - TTS 옵션
 * @returns {Promise<void>}
 */
export async function speakText(text, options = {}) {
	const {
		voice = 'alloy', // OpenAI TTS 음성 (alloy, echo, fable, onyx, nova, shimmer)
		speed = 1.0, // 속도 (0.25 ~ 4.0)
		language = 'ko' // 언어
	} = options;

	// Phase 1-2: 콘솔 로그로 시뮬레이션
	console.log('🔊 [TTS 시뮬레이션]');
	console.log(`📢 읽기: "${text}"`);
	console.log(`⚙️ 옵션:`, { voice, speed, language });

	// TODO Phase 3: OpenAI TTS API 연동
	// const response = await fetch('https://api.openai.com/v1/audio/speech', {
	//   method: 'POST',
	//   headers: {
	//     'Authorization': `Bearer ${OPENAI_API_KEY}`,
	//     'Content-Type': 'application/json',
	//   },
	//   body: JSON.stringify({
	//     model: 'tts-1',
	//     input: text,
	//     voice: voice,
	//     speed: speed
	//   })
	// });
	// const audioBlob = await response.blob();
	// const audioUrl = URL.createObjectURL(audioBlob);
	// const audio = new Audio(audioUrl);
	// await audio.play();

	// 시뮬레이션: 짧은 대기 시간
	await new Promise((resolve) => setTimeout(resolve, 500));
}

/**
 * 문항을 읽어줍니다
 * @param {Object} question - 문항 객체
 * @returns {Promise<void>}
 */
export async function speakQuestion(question) {
	if (!question) {
		console.warn('⚠️ TTS: 문항 정보가 없습니다');
		return;
	}

	const text = `${question.id}번 문항. ${question.text}`;
	await speakText(text);
}

/**
 * 선택지를 읽어줍니다
 * @param {Array} choices - 선택지 배열
 * @returns {Promise<void>}
 */
export async function speakChoices(choices) {
	if (!choices || choices.length === 0) {
		console.warn('⚠️ TTS: 선택지가 없습니다');
		return;
	}

	const choicesText = choices
		.map((c) => `${c.value}. ${c.label}`)
		.join('. ');

	const text = `선택지는 다음과 같습니다. ${choicesText}`;
	await speakText(text);
}

/**
 * 문항과 선택지를 함께 읽어줍니다
 * @param {Object} question - 문항 객체
 * @returns {Promise<void>}
 */
export async function speakQuestionWithChoices(question) {
	if (!question) {
		console.warn('⚠️ TTS: 문항 정보가 없습니다');
		return;
	}

	// 문항과 선택지를 하나의 텍스트로 결합
	const questionText = `${question.id}번 문항. ${question.text}`;

	const choicesText = question.choices
		?.map((c) => `${c.value}. ${c.label}`)
		.join('. ');

	const fullText = `${questionText}. 선택지는 다음과 같습니다. ${choicesText}`;

	await speakText(fullText);
}

/**
 * 메시지를 읽어줍니다 (성공/에러 메시지 등)
 * @param {string} message - 읽을 메시지
 * @returns {Promise<void>}
 */
export async function speakMessage(message) {
	if (!message) return;
	await speakText(message);
}

/**
 * TTS를 중지합니다
 */
export function stopSpeaking() {
	console.log('🔇 [TTS 중지]');

	// TODO Phase 3: 실제 오디오 중지
	// if (currentAudio) {
	//   currentAudio.pause();
	//   currentAudio = null;
	// }
}
