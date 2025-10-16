<!--
  StatusMessage.svelte
  성공/에러 메시지 표시 컴포넌트
-->
<script>
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	export let type = 'info'; // success | error | warning | info
	export let message = '';
	export let show = false;
	export let dismissible = true;
	export let autoDismiss = true; // 자동으로 사라지게 할지 여부
	export let duration = 5000; // 자동으로 사라지는 시간 (ms)

	const dispatch = createEventDispatcher();
	let timeoutId;

	function handleDismiss() {
		show = false;
		dispatch('dismiss');
	}

	// 메시지가 표시될 때 자동 닫기 타이머 설정
	$: if (show && message && autoDismiss) {
		if (timeoutId) clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			handleDismiss();
		}, duration);
	}
</script>

{#if show && message}
	<div class="status-message status-{type}" role="alert">
		<span class="status-icon">
			{#if type === 'success'}
				✅
			{:else if type === 'error'}
				❌
			{:else if type === 'warning'}
				⚠️
			{:else}
				ℹ️
			{/if}
		</span>
		<span class="status-text">{message}</span>
		{#if dismissible}
			<button class="dismiss-button" on:click={handleDismiss} aria-label="닫기">
				✕
			</button>
		{/if}
	</div>
{/if}

<style>
	.status-message {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.25rem;
		border-radius: 0.5rem;
		margin: 1rem 0;
		border-left: 4px solid;
		animation: slideIn 0.3s ease;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.status-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.status-text {
		flex: 1;
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.dismiss-button {
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0.25rem;
		opacity: 0.6;
		transition: opacity 0.2s ease;
		flex-shrink: 0;
	}

	.dismiss-button:hover {
		opacity: 1;
	}

	/* Type variants */
	.status-success {
		background-color: #f0fdf4;
		border-color: #22c55e;
		color: #166534;
	}

	.status-error {
		background-color: #fef2f2;
		border-color: var(--color-error);
		color: #991b1b;
	}

	.status-warning {
		background-color: #fffbeb;
		border-color: #f59e0b;
		color: #92400e;
	}

	.status-info {
		background-color: #eff6ff;
		border-color: #3b82f6;
		color: #1e40af;
	}
</style>
