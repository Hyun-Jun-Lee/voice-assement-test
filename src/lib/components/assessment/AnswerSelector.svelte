<!--
  AnswerSelector.svelte
  답변 선택 UI (A-E 버튼)
-->
<script>
	import { createEventDispatcher } from 'svelte';

	export let choices = [];
	export let selectedAnswer = null;
	export let disabled = false;

	const dispatch = createEventDispatcher();

	function handleSelect(value) {
		if (!disabled) {
			dispatch('select', { answer: value });
		}
	}
</script>

<div class="answer-selector">
	<div class="choices-grid">
		{#each choices as choice}
			<button
				class="choice-button"
				class:selected={selectedAnswer === choice.value}
				class:disabled
				on:click={() => handleSelect(choice.value)}
				disabled={disabled}
			>
				<span class="choice-value">{choice.value}</span>
				<span class="choice-label">{choice.label}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.answer-selector {
		margin: 1.5rem 0;
	}

	.choices-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: 1fr;
	}

	@media (min-width: 768px) {
		.choices-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.choices-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.choice-button {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 1.5rem 1rem;
		background-color: var(--color-bg-primary);
		border: 2px solid var(--color-border);
		border-radius: 0.75rem;
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 100px;
	}

	.choice-button:hover:not(.disabled) {
		border-color: var(--color-primary);
		background-color: var(--color-bg-secondary);
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.choice-button.selected {
		border-color: #22c55e;
		background-color: #22c55e;
		color: white;
		box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
	}

	.choice-button.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.choice-value {
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
	}

	.choice-label {
		font-size: 0.95rem;
		text-align: center;
		line-height: 1.4;
	}

	.choice-button.selected .choice-value,
	.choice-button.selected .choice-label {
		color: white;
	}
</style>
