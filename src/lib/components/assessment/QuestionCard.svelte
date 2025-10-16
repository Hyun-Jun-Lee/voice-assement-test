<!--
  QuestionCard.svelte
  심리검사 문항을 표시하는 카드 컴포넌트
-->
<script>
	export let question = null;
	export let currentAnswer = null;
</script>

{#if question}
	<div class="question-card card">
		<div class="question-header">
			<span class="question-number">문항 {question.id}</span>
			<span class="question-category badge">{question.category}</span>
		</div>

		<div class="question-text">
			{question.text}
		</div>

		{#if currentAnswer}
			<div class="current-answer">
				<span class="label">현재 답변:</span>
				<span class="answer-value">{currentAnswer}</span>
			</div>
		{/if}
	</div>
{:else}
	<div class="question-card card">
		<p class="text-muted">문항을 불러오는 중...</p>
	</div>
{/if}

<style>
	.question-card {
		padding: 2rem;
		margin-bottom: 1.5rem;
	}

	.question-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.question-number {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-primary);
	}

	.question-category {
		font-size: 0.9rem;
	}

	.question-text {
		font-size: 1.3rem;
		line-height: 1.6;
		color: var(--color-text);
		margin-bottom: 1rem;
	}

	.current-answer {
		padding: 0.75rem;
		background-color: var(--color-bg-secondary);
		border-radius: 0.5rem;
		margin-top: 1rem;
	}

	.current-answer .label {
		color: var(--color-text-secondary);
		margin-right: 0.5rem;
	}

	.current-answer .answer-value {
		font-weight: 600;
		color: var(--color-primary);
	}
</style>
