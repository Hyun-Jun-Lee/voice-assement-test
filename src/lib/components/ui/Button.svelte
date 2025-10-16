<!--
  Button.svelte
  재사용 가능한 버튼 컴포넌트
-->
<script>
	export let variant = 'primary'; // primary | secondary | outline | danger
	export let size = 'medium'; // small | medium | large
	export let disabled = false;
	export let type = 'button'; // button | submit | reset
	export let fullWidth = false;
</script>

<button
	class="btn btn-{variant} btn-{size}"
	class:full-width={fullWidth}
	{type}
	{disabled}
	on:click
>
	<slot />
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-weight: 600;
		border: 2px solid transparent;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
	}

	.btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	/* Variants */
	.btn-primary {
		background-color: var(--color-primary);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background-color: var(--color-primary-dark);
	}

	.btn-secondary {
		background-color: var(--color-secondary);
		color: white;
	}

	.btn-secondary:hover:not(:disabled) {
		background-color: var(--color-secondary-dark);
	}

	.btn-outline {
		background-color: transparent;
		color: var(--color-primary);
		border-color: var(--color-primary);
	}

	.btn-outline:hover:not(:disabled) {
		background-color: var(--color-primary);
		color: white;
	}

	.btn-danger {
		background-color: var(--color-error);
		color: white;
	}

	.btn-danger:hover:not(:disabled) {
		background-color: #dc2626;
	}

	/* Sizes */
	.btn-small {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
	}

	.btn-medium {
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
	}

	.btn-large {
		padding: 1rem 2rem;
		font-size: 1.125rem;
	}

	/* Full width */
	.full-width {
		width: 100%;
	}
</style>
