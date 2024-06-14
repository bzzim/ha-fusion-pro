<script lang="ts">
	import { motion, ripple } from '$lib/Stores';
	import { onMount, tick } from 'svelte';
	import Ripple from 'svelte-ripple';
	import Icon from '@iconify/svelte';
	import { createEventDispatcher } from 'svelte';
	import Timer from '$lib/Sidebar/Timer.svelte';
	const dispatch = createEventDispatcher();

	export let minValue: number = 0;
	export let maxValue: number;
	export let defaultValue: number = 0;
	export let revers: boolean = false;
	export let postfix = '';

	let index: number;
	let values: number[] = [];
	let touch: boolean;
	let touchScrolling = false;
	let pointerDown = false;
	let container: HTMLDivElement;
	let isMounted = false;
	let timeout: ReturnType<typeof setTimeout> | undefined;
	let startY: number;
	let scrollY: number;

	if (minValue != undefined && maxValue != undefined) {
		if (revers) {
			for (let i = maxValue; i >= minValue; i--) {
				values.push(i);
			}
		} else {
			for (let i = minValue; i <= maxValue; i++) {
				values.push(i);
			}
		}
	}

	$: start = index === values.length - 1;
	$: end = index === 0;

	$: onChange(defaultValue); // on change input property
	function onChange(v: number) {
		if (isMounted) {
			let scrolledValue = Math.round(v);
			const children = container.children[values.indexOf(scrolledValue)] as HTMLElement;
			if (children) {
				markCurrentValue(children);
				scrollToCurrent(children, 'smooth');
			}
		}
	}

	$: if (mountFix()) {
		dispatch('change', values[index]);
	}

	// don't set temperature on mount
	// rewrite component later...
	// TODO: check ??
	function mountFix() {
		return isMounted === true;
	}

	onMount(async () => {
		touch = 'ontouchstart' in window;
		if (container.children.length > 0) {
			let rounded = Math.round(defaultValue);
			if (minValue != undefined && maxValue != undefined) {
				rounded = Math.max(minValue, Math.min(maxValue, rounded));
			}

			index = values.indexOf(rounded);

			// fallback
			if (index === -1) {
				index = 0;
			}

			// set initial value
			const children = container.children[index] as HTMLElement;
			await tick();
			if (children) {
				scrollToCurrent(children, 'auto');
				markCurrentValue(getClosestChild());
			}
		}

		isMounted = true;
	});

	function handleClick(direction: 'left' | 'right') {
		let offset = direction === 'left' ? 1 : -1;
		offset = revers ? -offset : offset;
		let nextIndex = revers ? index - offset : index + offset;
		if (nextIndex < container.children.length && nextIndex >= 0) {
			index = nextIndex;
			let child = container.children[nextIndex] as HTMLElement;
			if (child) {
				markCurrentValue(child);
				container.scrollTo({
					top: child.offsetTop - container.offsetTop,
					behavior: 'smooth'
				});
			}
		}
	}

	function scrollToCurrent(children: HTMLElement, behavior: 'auto' | 'smooth') {
		container.scrollTo({
			top: children.offsetTop - container.offsetTop,
			behavior: behavior
		});
	}

	function handleMouseDown(event: MouseEvent) {
		if (!container.contains(event.target as Node)) return;
		pointerDown = true;
		startY = event.pageY - container.getBoundingClientRect().top;
		scrollY = container.scrollTop;
	}

	function handleMouseUp() {
		pointerDown = false;
		const closestChild = getClosestChild() as HTMLDivElement | null;
		if (closestChild) {
			index = Array.from(container.children).indexOf(closestChild);
			scrollToCurrent(closestChild, 'smooth');
		}
	}

	async function handleMouseMove(event: { pageY: number }) {
		if (!pointerDown) return;

		markCurrentValue(getClosestChild());

		await tick();
		const y = event.pageY - container.getBoundingClientRect().top;
		const walk = y - startY;
		container.scrollTop = scrollY - walk;
	}

	function getClosestChild() {
		const containerMiddleY = container.getBoundingClientRect().top + container.clientHeight / 2;
		return Array.from(container.children).reduce((closestChild: any, child) => {
			const childRect = child.getBoundingClientRect();
			const childMiddleY = childRect.top + childRect.height / 2;
			const distance = Math.abs(childMiddleY - containerMiddleY);

			if (!closestChild || distance < closestChild.distance) return { distance, child };
			return closestChild;
		}, null)?.child;
	}

	function handleTouchScroll() {
		if (touchScrolling) {
			markCurrentValue(getClosestChild());
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				handleMouseUp();
				touchScrolling = false;
			}, 100);
		}
	}

	function markCurrentValue(children: HTMLElement) {
		for (let i = 0; i < container.children.length; ++i) {
			container.children[i].classList.remove('current');
		}
		children.classList.add('current');
	}
</script>

<svelte:document
	on:pointerdown={handleMouseDown}
	on:pointerup={handleMouseUp}
	on:pointermove={handleMouseMove}
	on:touchend={() => (touchScrolling = true)}
/>

<div class="wheel">
	<button
		on:click={() => handleClick('left')}
		style:cursor={start ? 'unset' : 'pointer'}
		style:color={start ? 'rgba(255, 255, 255, 0.1)' : 'white'}
		style:transition="color {$motion}ms ease"
		use:Ripple={{
			...$ripple,
			opacity: start ? '0' : $ripple.opacity
		}}
	>
		<Icon icon="mingcute:down-fill" height="3rem" />
	</button>

	<div
		class="container"
		bind:this={container}
		on:wheel|preventDefault
		on:scroll={handleTouchScroll}
		style:cursor={pointerDown ? 'grabbing' : 'grab'}
		style:scroll-snap-type={touch ? 'y mandatory' : 'unset'}
	>
		{#each values as v, i}
			<div
				class="item"
				data-exclude-drag-modal
				style:margin-top={i === 0 ? '1rem' : 'none'}
				style:margin-bottom={i === values.length - 1 ? '1rem' : 'none'}
				style:scroll-snap-align={touch ? 'center' : 'unset'}
			>
				{v}{postfix}
			</div>
		{/each}
	</div>

	<button
		on:click={() => handleClick('right')}
		style:cursor={end ? 'unset' : 'pointer'}
		style:color={end ? 'rgba(255, 255, 255, 0.1)' : 'white'}
		style:transition="color {$motion}ms ease"
		use:Ripple={{
			...$ripple,
			opacity: end ? '0' : $ripple.opacity
		}}
	>
		<Icon icon="mingcute:up-fill" height="3rem" />
	</button>
</div>

<style>
	:root {
		--width: 7.2rem;
		--height: 4.9rem;
	}

	.container {
		width: var(--width);
		height: var(--height);
		overflow: auto;
		cursor: grab;
		border-radius: 0.8rem;
		scrollbar-width: none;
		color: white;
		background-color: rgba(0, 0, 0, 0.2);
		text-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
		margin: 0.4rem;
		border: var(--border-color-button);
	}

	.container::-webkit-scrollbar {
		display: none;
	}

	:global(.current) {
		color: white !important;
	}

	.item {
		text-align: center;
		line-height: var(--height);
		font-size: 3rem;
		width: var(--width);
		height: 3rem;
		color: gray;
		transition: all 0.2s ease-out;
	}

	button {
		width: 4rem;
		height: 4rem;
		border: none;
		padding-top: 0.4rem;
		padding-left: 0;
		padding-right: 0;
		color: white;
		background: transparent;
		margin: 0;
		border-radius: 1rem;
		-webkit-tap-highlight-color: transparent;
	}

	.wheel {
		margin-top: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
