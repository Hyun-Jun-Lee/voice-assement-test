<!--
  ProgressBar.svelte
  검사 진행률 표시 컴포넌트
-->
<script>
	export let current = 0;
	export let total = 0;
	export let answeredCount = 0;

	$: percentage = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
</script>

<div class="progress-bar-container">
	<div class="progress-info">
		<span class="progress-text">
			<strong>{current}</strong> / {total} 문항
		</span>
		<span class="progress-percentage">{percentage}% 완료</span>
	</div>

	<div class="progress-bar">
		<div class="progress-fill" style="width: {percentage}%"></div>
	</div>

	<div class="progress-details">
		<span class="detail-item">답변 완료: {answeredCount}개</span>
		<span class="detail-item">남은 문항: {total - answeredCount}개</span>
	</div>
</div>

<style>
	.progress-bar-container {
		margin: 1.5rem 0;
		padding: 1rem;
		background-color: var(--color-bg-secondary);
		border-radius: 0.75rem;
	}

	.progress-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.progress-text {
		font-size: 1rem;
		color: var(--color-text);
	}

	.progress-text strong {
		font-size: 1.2rem;
		color: var(--color-primary);
	}

	.progress-percentage {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-primary);
	}

	.progress-bar {
		width: 100%;
		height: 12px;
		background-color: var(--color-border);
		border-radius: 6px;
		overflow: hidden;
		margin-bottom: 0.75rem;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(
			90deg,
			var(--color-primary) 0%,
			var(--color-secondary) 100%
		);
		transition: width 0.3s ease;
		border-radius: 6px;
	}

	.progress-details {
		display: flex;
		justify-content: space-between;
		font-size: 0.9rem;
		color: var(--color-text-secondary);
	}

	.detail-item {
		display: flex;
		align-items: center;
	}
</style>
