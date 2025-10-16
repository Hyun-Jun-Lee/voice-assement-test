<!--
  DebugPanel.svelte
  개발 디버깅용 정보 패널
-->
<script>
	export let show = false;
	export let currentQuestion = 1;
	export let totalQuestions = 10;
	export let answers = {};
	export let testStatus = 'idle';
	export let lastCommand = '';
	export let isProcessing = false;
	export let errorMessage = '';
	export let successMessage = '';
</script>

{#if show}
	<div class="debug-panel">
		<div class="debug-header">
			<h3>🐛 Debug Panel</h3>
			<span class="debug-badge">개발 모드</span>
		</div>

		<div class="debug-content">
			<!-- Test State -->
			<div class="debug-section">
				<h4>검사 상태</h4>
				<div class="debug-grid">
					<div class="debug-item">
						<span class="label">현재 문항:</span>
						<span class="value">{currentQuestion} / {totalQuestions}</span>
					</div>
					<div class="debug-item">
						<span class="label">검사 상태:</span>
						<span class="value status-{testStatus}">{testStatus}</span>
					</div>
					<div class="debug-item">
						<span class="label">답변 수:</span>
						<span class="value">{Object.keys(answers).length}개</span>
					</div>
					<div class="debug-item">
						<span class="label">처리 중:</span>
						<span class="value">{isProcessing ? '⏳ Yes' : '✅ No'}</span>
					</div>
				</div>
			</div>

			<!-- Answers -->
			<div class="debug-section">
				<h4>답변 현황</h4>
				<div class="debug-answers">
					{#if Object.keys(answers).length === 0}
						<p class="text-muted text-small">아직 답변한 문항이 없습니다</p>
					{:else}
						<div class="answers-grid">
							{#each Object.entries(answers) as [questionNum, answer]}
								<div class="answer-chip">
									<span class="q-num">Q{questionNum}</span>
									<span class="q-answer">{answer}</span>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Last Command -->
			{#if lastCommand}
				<div class="debug-section">
					<h4>마지막 명령</h4>
					<div class="debug-command">
						<code>{lastCommand}</code>
					</div>
				</div>
			{/if}

			<!-- Messages -->
			<div class="debug-section">
				<h4>메시지 상태</h4>
				<div class="debug-messages">
					{#if successMessage}
						<div class="message-item success">
							<span class="message-icon">✅</span>
							<span class="message-text">{successMessage}</span>
						</div>
					{/if}
					{#if errorMessage}
						<div class="message-item error">
							<span class="message-icon">❌</span>
							<span class="message-text">{errorMessage}</span>
						</div>
					{/if}
					{#if !successMessage && !errorMessage}
						<p class="text-muted text-small">메시지 없음</p>
					{/if}
				</div>
			</div>

			<!-- Store Info -->
			<div class="debug-section">
				<h4>Store 정보</h4>
				<div class="debug-stores">
					<details>
						<summary>답변 객체 (Raw JSON)</summary>
						<pre>{JSON.stringify(answers, null, 2)}</pre>
					</details>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.debug-panel {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		width: 400px;
		max-height: 600px;
		overflow-y: auto;
		background-color: #1e1e1e;
		color: #d4d4d4;
		border-radius: 0.75rem;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
		z-index: 1000;
		font-size: 0.875rem;
	}

	.debug-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background-color: #2d2d2d;
		border-bottom: 1px solid #3e3e3e;
		border-radius: 0.75rem 0.75rem 0 0;
	}

	.debug-header h3 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
	}

	.debug-badge {
		padding: 0.25rem 0.75rem;
		background-color: #f59e0b;
		color: #1e1e1e;
		border-radius: 1rem;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.debug-content {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.debug-section h4 {
		margin: 0 0 0.75rem 0;
		font-size: 0.9rem;
		color: #60a5fa;
		font-weight: 600;
	}

	.debug-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}

	.debug-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.5rem;
		background-color: #2d2d2d;
		border-radius: 0.375rem;
	}

	.debug-item .label {
		font-size: 0.75rem;
		color: #9ca3af;
	}

	.debug-item .value {
		font-weight: 600;
		font-size: 0.875rem;
	}

	.value.status-idle {
		color: #9ca3af;
	}

	.value.status-in_progress {
		color: #60a5fa;
	}

	.value.status-completed {
		color: #34d399;
	}

	.answers-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.answer-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.75rem;
		background-color: #2d2d2d;
		border-radius: 1rem;
		border: 1px solid #3e3e3e;
	}

	.q-num {
		font-size: 0.75rem;
		color: #9ca3af;
	}

	.q-answer {
		font-weight: 600;
		color: #60a5fa;
	}

	.debug-command code {
		display: block;
		padding: 0.75rem;
		background-color: #2d2d2d;
		border-radius: 0.375rem;
		font-family: 'Courier New', monospace;
		font-size: 0.85rem;
		color: #34d399;
		overflow-x: auto;
	}

	.debug-messages {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.message-item {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 0.75rem;
		border-radius: 0.375rem;
		font-size: 0.85rem;
		line-height: 1.4;
	}

	.message-item.success {
		background-color: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.3);
		color: #34d399;
	}

	.message-item.error {
		background-color: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		color: #f87171;
	}

	.message-icon {
		flex-shrink: 0;
		font-size: 1rem;
	}

	.message-text {
		flex: 1;
		word-break: break-word;
	}

	.text-muted {
		color: #9ca3af;
		font-style: italic;
	}

	.text-small {
		font-size: 0.8rem;
	}

	.debug-stores details {
		background-color: #2d2d2d;
		border-radius: 0.375rem;
		padding: 0.75rem;
	}

	.debug-stores summary {
		cursor: pointer;
		font-weight: 600;
		color: #9ca3af;
		font-size: 0.85rem;
	}

	.debug-stores pre {
		margin: 0.75rem 0 0 0;
		padding: 0.75rem;
		background-color: #1e1e1e;
		border-radius: 0.375rem;
		overflow-x: auto;
		font-size: 0.75rem;
		color: #d4d4d4;
	}

	/* 스크롤바 스타일링 */
	.debug-panel::-webkit-scrollbar {
		width: 6px;
	}

	.debug-panel::-webkit-scrollbar-track {
		background: #1e1e1e;
	}

	.debug-panel::-webkit-scrollbar-thumb {
		background: #3e3e3e;
		border-radius: 3px;
	}

	.debug-panel::-webkit-scrollbar-thumb:hover {
		background: #4e4e4e;
	}

	@media (max-width: 768px) {
		.debug-panel {
			width: calc(100% - 2rem);
			max-height: 400px;
		}
	}
</style>
