<script>
	import { onMount } from 'svelte';

	// Components
	import QuestionCard from '$lib/components/assessment/QuestionCard.svelte';
	import AnswerSelector from '$lib/components/assessment/AnswerSelector.svelte';
	import ProgressBar from '$lib/components/assessment/ProgressBar.svelte';
	import CommandInput from '$lib/components/assessment/CommandInput.svelte';
	import VoiceButton from '$lib/components/assessment/VoiceButton.svelte';
	import CommandHistory from '$lib/components/assessment/CommandHistory.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import StatusMessage from '$lib/components/ui/StatusMessage.svelte';
	import DebugPanel from '$lib/components/debug/DebugPanel.svelte';

	// Data
	import { getQuestionById } from '$lib/data/questions';

	// Stores
	import {
		testActions,
		currentQuestion,
		answers,
		totalQuestions,
		progress,
		answeredCount,
		testStatus,
		canGoNext,
		canGoPrevious
	} from '$lib/stores/testStore';

	import {
		commandActions,
		isProcessing,
		isListening,
		commandHistory,
		errorMessage,
		successMessage,
		lastCommand
	} from '$lib/stores/commandStore';

	import { debugMode, showCommandHistory, uiActions } from '$lib/stores/uiStore';

	// Services
	import { processTextCommand } from '$lib/services/commandProcessor';
	import { speakQuestionWithChoices, speakMessage } from '$lib/services/ttsService';

	// Reactive variables
	$: currentQuestionData = getQuestionById($currentQuestion);
	$: currentAnswer = $answers[$currentQuestion] || null;

	// TTS 로그 저장 (화면 표시용)
	let ttsLogs = [];
	const MAX_TTS_LOGS = 5;

	function addTtsLog(text) {
		const newLog = {
			id: Date.now(),
			text,
			timestamp: new Date()
		};
		ttsLogs = [newLog, ...ttsLogs].slice(0, MAX_TTS_LOGS);
	}

	// 문항 변경 시 자동으로 TTS 읽기 (Phase 3 대비)
	$: if (currentQuestionData && $testStatus === 'in_progress') {
		speakQuestionWithChoices(currentQuestionData);
		addTtsLog(`${currentQuestionData.id}번 문항을 읽습니다`);
	}

	// === Page Lifecycle ===

	onMount(() => {
		console.log('📄 Assessment 페이지 마운트');
		testActions.startTest();
		console.log('🔍 초기 Store 값:', {
			answeredCount: $answeredCount,
			progress: $progress,
			answers: $answers
		});
	});

	// === Command Processing (Pages Layer Orchestration) ===

	async function handleCommand(commandText) {
		console.log('🎯 명령 처리 시작:', commandText);

		// 1. 처리 시작
		commandActions.startProcessing();
		commandActions.clearMessages();

		try {
			// 2. Service 레이어 호출 (API 또는 Mock)
			const result = await processTextCommand(commandText, {
				current_question: $currentQuestion,
				total_questions: $totalQuestions,
				answered_count: $answeredCount ?? 0,
				progress: Math.round($progress ?? 0)
			});

			console.log('📦 명령 처리 결과:', result);

			// 3. 결과에 따라 Store 업데이트
			await executeCommandAction(result);

			// 4. 히스토리 추가
			commandActions.addToHistory(commandText);

			// 5. 성공 메시지
			commandActions.setSuccess(result.message || '명령이 실행되었습니다');
		} catch (error) {
			console.error('❌ 명령 처리 실패:', error);
			commandActions.setError(error.message || '명령 처리 중 오류가 발생했습니다');
		} finally {
			commandActions.finishProcessing();
		}
	}

	// === Command Action Executor ===

	async function executeCommandAction(result) {
		const { action } = result;

		switch (action) {
			case 'multiple':
				// 여러 tool을 순차적으로 실행
				console.log('🔄 다중 명령 실행:', result.actions);
				for (const singleAction of result.actions) {
					await executeCommandAction(singleAction);
					// 각 액션 사이에 약간의 지연
					await new Promise((resolve) => setTimeout(resolve, 300));
				}
				break;

			case 'check_answer':
				testActions.setAnswer(result.question_num, result.answer);
				// 답변 후 미답변 문항으로 이동
				await new Promise((resolve) => setTimeout(resolve, 500));

				// 미답변 문항 찾기
				let nextUnanswered = null;

				// 1. 현재 문항 이후에서 미답변 문항 찾기
				for (let i = $currentQuestion + 1; i <= $totalQuestions; i++) {
					if (!$answers[i]) {
						nextUnanswered = i;
						break;
					}
				}

				// 2. 없으면 처음부터 현재 문항 이전까지 찾기
				if (!nextUnanswered) {
					for (let i = 1; i < $currentQuestion; i++) {
						if (!$answers[i]) {
							nextUnanswered = i;
							break;
						}
					}
				}

				// 3. 미답변 문항이 있으면 이동
				if (nextUnanswered) {
					testActions.goToQuestion(nextUnanswered);
				}
				// 4. 모든 문항 답변 완료 시 완료 메시지
				else if ($answeredCount === $totalQuestions) {
					commandActions.setSuccess('모든 문항에 답변하셨습니다! 완료 버튼을 눌러주세요.');
				}
				break;

			case 'next_question':
				testActions.nextQuestion();
				break;

			case 'previous_question':
				testActions.previousQuestion();
				break;

			case 'go_to_question':
				testActions.goToQuestion(result.question_num);
				break;

			case 'skip_question':
				testActions.nextQuestion();
				break;

			case 'get_progress':
				console.log('📊 get_progress 실행 - 값 확인:', {
					currentQuestion: $currentQuestion,
					totalQuestions: $totalQuestions,
					answeredCount: $answeredCount ?? 0,
					progress: $progress ?? 0
				});
				const progressMessage = `현재 ${$currentQuestion}번 문항입니다. 전체 ${$totalQuestions}개 중 ${$answeredCount ?? 0}개 답변 완료 (${Math.round($progress ?? 0)}%)`;
				commandActions.setSuccess(progressMessage);
				addTtsLog(progressMessage);
				await speakMessage(progressMessage);
				break;

			case 'repeat_question':
				// 현재 문항을 다시 읽어줍니다
				const repeatMessage = `${$currentQuestion}번 문항: ${currentQuestionData.text}`;
				commandActions.setSuccess(repeatMessage);
				addTtsLog(`${$currentQuestion}번 문항을 다시 읽습니다`);
				await speakQuestionWithChoices(currentQuestionData);
				break;

			case 'get_answer':
				const answer = $answers[result.question_num];
				let answerMessage;
				if (answer) {
					answerMessage = `${result.question_num}번 문항의 답변: ${answer}`;
				} else {
					answerMessage = `${result.question_num}번 문항은 아직 답변하지 않았습니다`;
				}
				commandActions.setSuccess(answerMessage);
				addTtsLog(answerMessage);
				await speakMessage(answerMessage);
				break;

			case 'get_all_answers':
				const answeredList = Object.entries($answers)
					.map(([num, ans]) => `${num}번: ${ans}`)
					.join(', ');
				const allAnswersMessage = answeredList || '아직 답변한 문항이 없습니다';
				commandActions.setSuccess(allAnswersMessage);
				addTtsLog(allAnswersMessage);
				await speakMessage(allAnswersMessage);
				break;

			case 'unknown':
			default:
				commandActions.setError(result.message || '명령을 이해하지 못했습니다');
				break;
		}
	}

	// === Event Handlers ===

	function handleCommandSubmit(event) {
		const { command } = event.detail;
		handleCommand(command);
	}

	function handleAnswerSelect(event) {
		const { answer } = event.detail;
		const command = `${$currentQuestion}번 ${answer} 체크`;
		handleCommand(command);
	}

	function handleVoiceStart() {
		commandActions.startListening();
		// Phase 3에서 Whisper API 연동
		commandActions.setSuccess('음성 녹음 기능은 Phase 3에서 구현됩니다');
		setTimeout(() => {
			commandActions.stopListening();
		}, 2000);
	}

	function handleVoiceStop() {
		commandActions.stopListening();
	}

	function handleNext() {
		testActions.nextQuestion();
		commandActions.setSuccess('다음 문항으로 이동했습니다');
	}

	function handlePrevious() {
		testActions.previousQuestion();
		commandActions.setSuccess('이전 문항으로 이동했습니다');
	}

	function handleComplete() {
		if ($answeredCount === $totalQuestions) {
			testActions.completeTest();
			commandActions.setSuccess('검사가 완료되었습니다! 🎉');
		} else {
			commandActions.setError(
				`아직 ${$totalQuestions - $answeredCount}개 문항이 남아있습니다`
			);
		}
	}
</script>

<svelte:head>
	<title>심리검사 진행 - 음성 인터페이스</title>
</svelte:head>

<div class="assessment-page">
	<div class="container">
		<!-- Header -->
		<header class="page-header">
			<h1>심리검사</h1>
			<div class="header-actions">
				<Button
					variant="outline"
					size="small"
					on:click={() => uiActions.toggleCommandHistory()}
				>
					{$showCommandHistory ? '히스토리 숨기기' : '히스토리 보기'}
				</Button>
				<Button variant="outline" size="small" on:click={() => uiActions.toggleDebugMode()}>
					{$debugMode ? 'Debug OFF' : 'Debug ON'}
				</Button>
			</div>
		</header>

		<!-- Status Messages -->
		<StatusMessage
			type="success"
			message={$successMessage}
			show={!!$successMessage}
			on:dismiss={() => commandActions.clearMessages()}
		/>
		<StatusMessage
			type="error"
			message={$errorMessage}
			show={!!$errorMessage}
			on:dismiss={() => commandActions.clearMessages()}
		/>

		<!-- Progress Bar -->
		<ProgressBar
			current={$currentQuestion}
			total={$totalQuestions}
			answeredCount={$answeredCount}
		/>

		<!-- Question Card -->
		<QuestionCard question={currentQuestionData} currentAnswer={currentAnswer} />

		<!-- Answer Selector -->
		<AnswerSelector
			choices={currentQuestionData?.choices || []}
			selectedAnswer={currentAnswer}
			disabled={$isProcessing}
			on:select={handleAnswerSelect}
		/>

		<!-- Command Input -->
		<div class="command-section">
			<h3 class="section-title">💬 텍스트 명령</h3>
			<CommandInput disabled={$isProcessing} on:submit={handleCommandSubmit} />
		</div>

		<!-- Voice Button -->
		<div class="command-section">
			<h3 class="section-title">🎤 음성 명령 (Phase 3 예정)</h3>
			<VoiceButton
				isListening={$isListening}
				disabled={$isProcessing}
				on:start={handleVoiceStart}
				on:stop={handleVoiceStop}
			/>

			<!-- TTS Logs -->
			{#if ttsLogs.length > 0}
				<div class="tts-logs">
					<h4 class="tts-logs-title">🔊 TTS 시뮬레이션 로그</h4>
					<div class="tts-logs-list">
						{#each ttsLogs as log (log.id)}
							<div class="tts-log-item">
								<span class="tts-log-icon">🔊</span>
								<span class="tts-log-text">{log.text}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Command History -->
		<CommandHistory history={$commandHistory} show={$showCommandHistory} />

		<!-- Navigation Buttons -->
		<div class="navigation-buttons">
			<Button variant="outline" disabled={!$canGoPrevious || $isProcessing} on:click={handlePrevious}>
				⬅️ 이전
			</Button>
			<Button variant="outline" disabled={!$canGoNext || $isProcessing} on:click={handleNext}>
				다음 ➡️
			</Button>
			<Button
				variant="primary"
				disabled={$answeredCount !== $totalQuestions || $isProcessing}
				on:click={handleComplete}
			>
				✅ 완료
			</Button>
		</div>
	</div>

	<!-- Debug Panel -->
	<DebugPanel
		show={$debugMode}
		currentQuestion={$currentQuestion}
		totalQuestions={$totalQuestions}
		answers={$answers}
		testStatus={$testStatus}
		lastCommand={$lastCommand}
		isProcessing={$isProcessing}
		errorMessage={$errorMessage}
		successMessage={$successMessage}
	/>
</div>

<style>
	.assessment-page {
		min-height: 100vh;
		padding: 2rem 0;
		background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
	}

	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid var(--color-border);
	}

	.page-header h1 {
		font-size: 2rem;
		color: var(--color-text);
		margin: 0;
	}

	.header-actions {
		display: flex;
		gap: 0.75rem;
	}

	.command-section {
		margin: 2rem 0;
	}

	.section-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 1rem;
	}

	/* TTS Logs */
	.tts-logs {
		margin-top: 1.5rem;
		padding: 1rem;
		background-color: #f0fdf4;
		border: 1px solid #86efac;
		border-radius: 0.5rem;
	}

	.tts-logs-title {
		font-size: 0.9rem;
		font-weight: 600;
		color: #166534;
		margin: 0 0 0.75rem 0;
	}

	.tts-logs-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.tts-log-item {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 0.5rem;
		background-color: white;
		border-radius: 0.375rem;
		font-size: 0.9rem;
		line-height: 1.5;
	}

	.tts-log-icon {
		flex-shrink: 0;
		font-size: 1rem;
	}

	.tts-log-text {
		flex: 1;
		color: var(--color-text);
	}

	.navigation-buttons {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color-border);
	}

	.navigation-buttons :global(button:first-child) {
		flex: 1;
	}

	.navigation-buttons :global(button:nth-child(2)) {
		flex: 1;
	}

	.navigation-buttons :global(button:last-child) {
		flex: 2;
	}

	@media (max-width: 768px) {
		.page-header {
			flex-direction: column;
			gap: 1rem;
			align-items: flex-start;
		}

		.header-actions {
			width: 100%;
			justify-content: flex-end;
		}

		.navigation-buttons {
			flex-direction: column;
		}

		.navigation-buttons :global(button) {
			width: 100%;
		}
	}
</style>
