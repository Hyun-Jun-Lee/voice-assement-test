<!--
  CommandHistory.svelte
  명령 히스토리 표시 컴포넌트
-->
<script>
	export let history = [];
	export let show = false;

	function formatTime(date) {
		if (!date) return '';
		const d = new Date(date);
		return d.toLocaleTimeString('ko-KR', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}
</script>

{#if show && history.length > 0}
	<div class="command-history">
		<div class="history-header">
			<h3>명령 히스토리</h3>
			<span class="history-count">{history.length}개</span>
		</div>

		<div class="history-list">
			{#each history as entry}
				<div class="history-item">
					<div class="history-time">{formatTime(entry.timestamp)}</div>
					<div class="history-content">
						{#if entry.transcript}
							<div class="transcript">🎤 {entry.transcript}</div>
						{/if}
						<div class="command">→ {entry.command}</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	.command-history {
		margin: 1.5rem 0;
		padding: 1rem;
		background-color: var(--color-bg-secondary);
		border-radius: 0.75rem;
		border: 1px solid var(--color-border);
	}

	.history-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--color-border);
	}

	.history-header h3 {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
	}

	.history-count {
		font-size: 0.9rem;
		color: var(--color-text-secondary);
		padding: 0.25rem 0.75rem;
		background-color: var(--color-bg-primary);
		border-radius: 1rem;
	}

	.history-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		max-height: 400px;
		overflow-y: auto;
	}

	.history-item {
		display: flex;
		gap: 0.75rem;
		padding: 0.75rem;
		background-color: var(--color-bg-primary);
		border-radius: 0.5rem;
		border-left: 3px solid var(--color-primary);
	}

	.history-time {
		flex-shrink: 0;
		font-size: 0.85rem;
		color: var(--color-text-secondary);
		font-family: 'Courier New', monospace;
	}

	.history-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.transcript {
		font-size: 0.9rem;
		color: var(--color-text-secondary);
		font-style: italic;
	}

	.command {
		font-size: 0.95rem;
		color: var(--color-text);
		font-weight: 500;
	}

	/* 스크롤바 스타일링 */
	.history-list::-webkit-scrollbar {
		width: 6px;
	}

	.history-list::-webkit-scrollbar-track {
		background: var(--color-bg-secondary);
		border-radius: 3px;
	}

	.history-list::-webkit-scrollbar-thumb {
		background: var(--color-border);
		border-radius: 3px;
	}

	.history-list::-webkit-scrollbar-thumb:hover {
		background: var(--color-text-secondary);
	}
</style>
