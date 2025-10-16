<!--
  CommandInput.svelte
  텍스트 명령 입력 컴포넌트
-->
<script>
	import { createEventDispatcher } from 'svelte';

	export let disabled = false;
	export let placeholder = '명령을 입력하세요 (예: 3번 A 체크, 다음, 5번으로 가줘)';

	let inputValue = '';
	const dispatch = createEventDispatcher();

	function handleSubmit() {
		const command = inputValue.trim();
		if (command && !disabled) {
			dispatch('submit', { command });
			inputValue = '';
		}
	}

	function handleKeydown(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit();
		}
	}
</script>

<div class="command-input-container">
	<div class="input-wrapper">
		<input
			type="text"
			class="command-input"
			bind:value={inputValue}
			on:keydown={handleKeydown}
			{placeholder}
			{disabled}
		/>
		<button
			class="submit-button"
			on:click={handleSubmit}
			disabled={disabled || !inputValue.trim()}
		>
			전송
		</button>
	</div>

	<div class="input-hints text-small text-muted">
		💡 사용 예시: "3번 A 체크" / "다음" / "5번으로 가줘" / "진행 상황"
	</div>
</div>

<style>
	.command-input-container {
		margin: 1.5rem 0;
	}

	.input-wrapper {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.command-input {
		flex: 1;
		padding: 0.875rem 1rem;
		font-size: 1rem;
		border: 2px solid var(--color-border);
		border-radius: 0.5rem;
		background-color: var(--color-bg-primary);
		color: var(--color-text);
		transition: border-color 0.2s ease;
	}

	.command-input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.command-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		background-color: var(--color-bg-secondary);
	}

	.submit-button {
		padding: 0.875rem 1.5rem;
		font-size: 1rem;
		font-weight: 600;
		background-color: var(--color-primary);
		color: white;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.submit-button:hover:not(:disabled) {
		background-color: var(--color-primary-dark);
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.submit-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.input-hints {
		padding: 0.5rem 0.75rem;
		background-color: var(--color-bg-secondary);
		border-radius: 0.375rem;
	}
</style>
