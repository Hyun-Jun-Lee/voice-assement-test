<!--
  VoiceButton.svelte
  음성 명령 녹음 버튼 (Phase 3용, 현재는 UI만)
-->
<script>
	import { createEventDispatcher } from 'svelte';

	export let isListening = false;
	export let disabled = false;

	const dispatch = createEventDispatcher();

	function handleClick() {
		if (!disabled) {
			if (isListening) {
				dispatch('stop');
			} else {
				dispatch('start');
			}
		}
	}
</script>

<div class="voice-button-container">
	<button
		class="voice-button"
		class:listening={isListening}
		class:disabled
		on:click={handleClick}
		{disabled}
		aria-label={isListening ? '음성 녹음 중지' : '음성 녹음 시작'}
	>
		<span class="icon">
			{#if isListening}
				⏹️
			{:else}
				🎤
			{/if}
		</span>
		<span class="label">
			{#if isListening}
				녹음 중... (클릭하여 중지)
			{:else}
				음성 명령
			{/if}
		</span>
	</button>

	{#if isListening}
		<div class="listening-indicator">
			<span class="pulse"></span>
			<span class="pulse"></span>
			<span class="pulse"></span>
		</div>
	{/if}

	<p class="voice-note text-small text-muted">
		🔔 Phase 3에서 Whisper API 연동 예정
	</p>
</div>

<style>
	.voice-button-container {
		margin: 1.5rem 0;
		text-align: center;
	}

	.voice-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 1rem 2rem;
		font-size: 1.1rem;
		font-weight: 600;
		background-color: var(--color-secondary);
		color: white;
		border: none;
		border-radius: 2rem;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.voice-button:hover:not(.disabled) {
		background-color: var(--color-secondary-dark);
		transform: scale(1.05);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
	}

	.voice-button.listening {
		background-color: var(--color-error);
		animation: pulse-button 1.5s ease-in-out infinite;
	}

	.voice-button.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.icon {
		font-size: 1.5rem;
	}

	.label {
		font-size: 1rem;
	}

	.listening-indicator {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.pulse {
		width: 10px;
		height: 10px;
		background-color: var(--color-error);
		border-radius: 50%;
		animation: pulse-dot 1.4s ease-in-out infinite;
	}

	.pulse:nth-child(2) {
		animation-delay: 0.2s;
	}

	.pulse:nth-child(3) {
		animation-delay: 0.4s;
	}

	.voice-note {
		margin-top: 0.75rem;
	}

	@keyframes pulse-button {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
		}
		50% {
			box-shadow: 0 0 0 15px rgba(239, 68, 68, 0);
		}
	}

	@keyframes pulse-dot {
		0%,
		100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.5);
			opacity: 0.5;
		}
	}
</style>
