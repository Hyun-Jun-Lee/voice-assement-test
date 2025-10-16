<script>
	import { questions, getTotalQuestions, getCategories } from '$lib/data/questions';
	import { APP_CONFIG } from '$lib/data/constants';
	import { testActions, currentQuestion, answers, progress, answeredCount } from '$lib/stores/testStore';
	import { commandActions, isProcessing } from '$lib/stores/commandStore';
	import { processTextCommand } from '$lib/services/commandProcessor';

	// Data Layer 검증
	console.log('=== Data Layer Validation ===');
	console.log('APP_CONFIG:', APP_CONFIG);
	console.log('Total Questions:', getTotalQuestions());
	console.log('Categories:', getCategories());

	// Stores Layer 검증
	console.log('\n=== Stores Layer Validation ===');
	console.log('테스트를 위해 다음 함수들을 사용할 수 있습니다:');
	console.log('- testActions.startTest()');
	console.log('- testActions.setAnswer(1, "A")');
	console.log('- testActions.nextQuestion()');
	console.log('- commandActions.setSuccess("테스트 메시지")');

	// Services Layer 검증
	console.log('\n=== Services Layer Validation ===');
	console.log('명령 처리 테스트를 위해 다음 함수를 사용할 수 있습니다:');
	console.log('- await processTextCommand("3번 A 체크", { current_question: 1, total_questions: 10 })');
	console.log('- await processTextCommand("다음", { current_question: 3, total_questions: 10 })');
	console.log('- await processTextCommand("5번으로 가줘", { current_question: 3, total_questions: 10 })');
	console.log('- await processTextCommand("진행 상황", { current_question: 5, total_questions: 10 })');

	// 전역으로 노출 (브라우저 콘솔에서 테스트용)
	if (typeof window !== 'undefined') {
		window.testActions = testActions;
		window.commandActions = commandActions;
		window.processTextCommand = processTextCommand;
	}
</script>

<div class="container">
	<div class="card text-center">
		<h1>{APP_CONFIG.APP_NAME}</h1>
		<p class="text-muted">음성 명령으로 심리검사를 수행하는 혁신적인 인터페이스</p>

		<div class="mt-md">
			<p><strong>전체 문항 수:</strong> {getTotalQuestions()}개</p>
			<p><strong>카테고리:</strong> {getCategories().join(', ')}</p>
		</div>

		<div class="mt-md">
			<a href="/assessment">
				<button style="background-color: var(--color-primary); color: white; padding: 1rem 2rem; font-size: 1.1rem;">
					검사 시작하기
				</button>
			</a>
		</div>

		<div class="mt-md text-small text-muted">
			<p>💡 브라우저 개발자 도구(F12) 콘솔을 열어 검증 결과를 확인하세요</p>
			<p>📝 콘솔에서 <code>testActions.startTest()</code> 등을 실행해보세요</p>
		</div>
	</div>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	a {
		text-decoration: none;
	}
</style>
