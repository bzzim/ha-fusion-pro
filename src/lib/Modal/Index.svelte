<script lang="ts">
	import { motion, ripple } from '$lib/Stores';
	import { onMount, onDestroy } from 'svelte';
	import { modals, closeModal } from 'svelte-modals';
	import { fly, scale } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	import Icon from '@iconify/svelte';
	import Ripple from 'svelte-ripple';
	import '$lib/Modal/Modal.css';

	export let backdropImage = true;
	export let size: string | undefined = undefined;

	let backdrop: HTMLDivElement | null;
	let opacityValue = 1;
	let top = 0;

	// delay count to prevent backdrop flickering on stacked modals
	let delayedModalCount: number;
	$: if ($modals.length === 1) {
		setTimeout(() => {
			delayedModalCount = 1;
		}, $motion);
	} else {
		delayedModalCount = 2;
	}

	function debounce(func: any, wait: number | undefined) {
		let timeout: ReturnType<typeof setTimeout>;
		return function executedFunction(...args: any[]) {
			const later = () => {
				clearTimeout(timeout);
				func(...args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	}

	function handleOpacityChange() {
		opacityValue = 1 - (top / window.innerHeight) * 3;
		if (opacityValue < 0) opacityValue = 0;
		if (opacityValue > 1) opacityValue = 1;
		if (backdrop) {
			backdrop.style.transition = 'opacity 100ms ease';
			backdrop.style.opacity = opacityValue.toString();
		}
	}

	const debouncedOpacityChange = debounce(handleOpacityChange, 50);

	$: if (delayedModalCount === 1 && backdrop) debouncedOpacityChange();

	onMount(() => {
		if (document?.body) {
			if (document?.body) document.body.style.overflow = 'hidden';
		}
		backdrop = document.querySelector('div.backdrop');
		if (backdropImage) {
			if (backdrop) {
				backdrop.style.backgroundColor = 'transparent';
				backdrop.style.backgroundImage = 'var(--theme-background-image)';
			}
		} else {
			if (backdrop) {
				backdrop.style.backgroundImage = 'none';
				backdrop.style.backgroundColor = 'rgba(0,0,0,0.7)';
			}
		}
	});

	onDestroy(async () => {
		if ($modals.length === 0) {
			document.body.style.overflow = 'unset';
		}
	});
</script>

<div
	role="dialog"
	in:fly|global={{
		duration: $motion * 3,
		y: -35,
		easing: expoOut,
		opacity: 0.9
	}}
	out:scale|global={{ duration: $motion / 2, start: 0.85 }}
>
	<div id="modal">
		<div
			style:width={size === 'large' ? '80vw' : '40rem'}
			class="contents"
			class:warning={!backdropImage}
		>
			<div class="header">
				<h1>
					<slot name="title" />
				</h1>

				<button
					on:click={() => {
						closeModal();
					}}
					aria-label="close"
					style:outline="none"
					use:Ripple={$ripple}
				>
					<Icon icon="mingcute:close-fill" height="auto" />
				</button>
			</div>

			<slot />
		</div>
	</div>
</div>

<style>
	.header {
		padding-right: 2rem;
	}

	.warning {
		color: white;
		background-color: rgb(38 39 38) !important;
	}

	div[role='dialog'] {
		position: fixed;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		pointer-events: none;
		z-index: 3;
		touch-action: none;
	}

	#modal {
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
	}

	.contents {
		padding: 1.6rem 1.9rem 1.9rem 1.9rem;
		background-color: var(--theme-modal-background-color-modal);
		display: block;
		flex-direction: column;
		pointer-events: auto;
		max-height: 85vh;
		max-width: 85vw;
		border-radius: 1.2rem;
		position: relative;
		box-shadow: rgba(0, 0, 0, 0.56) 0 22px 70px 4px;
		outline: 1px solid rgba(255, 255, 255, 0.25);
		overflow-y: auto;
	}

	button {
		background: none;
		color: inherit;
		cursor: pointer;
		width: 3rem;
		border: none;
		border-radius: 50%;
		position: absolute !important;
		right: 0;
		top: 1rem;
	}

	button:focus {
		color: inherit;
	}

	/*ref: https://gist.github.com/flekschas/a817fd1a67aaca511964*/
	.contents::-webkit-scrollbar {
		width: 1em; /* Total width including `border-width` of scrollbar thumb */
		height: 0;
	}
	.contents::-webkit-scrollbar-thumb {
		height: 0.3em;
		border: 0.3em solid rgba(0, 0, 0, 0); /* Transparent border together with `background-clip: padding-box` does the trick */
		background-clip: padding-box;
		-webkit-border-radius: 1em;
		background-color: rgba(0, 0, 0, 0.15);
		-webkit-box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.025);
	}
	.contents::-webkit-scrollbar-button {
		width: 0;
		height: 0;
		display: none;
	}
	.contents::-webkit-scrollbar-corner {
		background-color: transparent;
	}

	@media all and (max-width: 768px) {
		.contents {
			width: 100% !important;
			padding: 1rem;
			max-height: 99%;
			max-width: 99%;
		}
	}
</style>
