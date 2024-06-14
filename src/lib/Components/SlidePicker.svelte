<script lang="ts">
	import { createEventDispatcher, onMount, tick } from 'svelte';
	import Icon from '@iconify/svelte';

	export let minValue: number = 0;
	export let maxValue: number;
	export let defaultValue: number = 0;
	export let revers: boolean = false;
	export let markValues: number[] = [];
	export let postfix = '';

	const dispatch = createEventDispatcher();

	let index: number;
	let values: number[] = [];
	let touch: boolean;
	let touchScrolling = false;
	let pointerDown = false;
	let container: HTMLDivElement;
	let isMounted = false;
	let timeout: ReturnType<typeof setTimeout> | undefined;
	let startX: number;
	let scrollX: number;
	let scrolledValue = Math.round(defaultValue);
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

	$: markValues = markValues.map((v) => Math.round(v));

	$: onChange(defaultValue); // on change input property
	function onChange(v: number) {
		if (isMounted) {
			scrolledValue = Math.round(v);
			const children = container.children[values.indexOf(scrolledValue)] as HTMLElement;
			if (children) {
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
			markCurrentValue(children);
			await tick();
			if (children) {
				scrollToCurrent(children, 'auto');
			}
		}

		isMounted = true;
	});

	// add class to element with current value
	function markCurrentValue(children: HTMLElement) {
		for (let i = 0; i < container.children.length; ++i) {
			container.children[i].classList.remove('current');
		}
		children.classList.add('current');
	}

	function scrollToCurrent(children: HTMLElement, behavior: 'auto' | 'smooth') {
		container.scrollTo({
			left:
				children.offsetLeft +
				container.offsetLeft -
				container.clientWidth / 2 +
				children.clientWidth / 2,
			behavior: behavior
		});
	}

	function handleMouseDown(event: MouseEvent) {
		if (!container.contains(event.target as Node)) {
			return;
		}
		pointerDown = true;
		startX = event.pageX - container.getBoundingClientRect().left;
		scrollX = container.scrollLeft;
	}

	function handleMouseUp() {
		pointerDown = false;
		const closestChild = getClosestChild() as HTMLDivElement;
		markCurrentValue(closestChild);
		if (closestChild) {
			index = Array.from(container.children).indexOf(closestChild);
			scrollToCurrent(closestChild, 'smooth');
		}
	}

	async function handleMouseMove(event: { pageX: number }) {
		if (!pointerDown) {
			return;
		}
		await tick();
		const x = event.pageX - container.getBoundingClientRect().left;
		const walk = x - startX;
		container.scrollLeft = scrollX - walk;

		const closestChild = getClosestChild() as HTMLDivElement | null;
		if (closestChild) {
			markCurrentValue(closestChild);
			scrolledValue = values[Array.from(container.children).indexOf(closestChild)];
		}
	}

	function getClosestChild() {
		const containerMiddleX = container.getBoundingClientRect().left + container.clientWidth / 2;
		return Array.from(container.children).reduce((closestChild: any, child) => {
			const childRect = child.getBoundingClientRect();
			const childMiddleX = childRect.left + childRect.width / 2;
			const distance = Math.abs(childMiddleX - containerMiddleX);

			if (!closestChild || distance < closestChild.distance) {
				return { distance, child };
			}
			return closestChild;
		}, null)?.child;
	}

	function handleTouchScroll() {
		if (touchScrolling) {
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				handleMouseUp();
				touchScrolling = false;
			}, 100);
		}
		const closestChild = getClosestChild() as HTMLDivElement;
		scrolledValue = values[Array.from(container.children).indexOf(closestChild)];
		markCurrentValue(closestChild);
	}
</script>

<div
	class="slider"
	on:pointerdown={handleMouseDown}
	on:pointerup={handleMouseUp}
	on:pointermove={handleMouseMove}
	on:touchend={() => (touchScrolling = true)}
>
	<div
		class="container"
		bind:this={container}
		on:wheel|preventDefault
		on:scroll={handleTouchScroll}
		style:cursor={pointerDown ? 'grabbing' : 'grab'}
		style:scroll-snap-type={touch ? 'x mandatory' : 'unset'}
	>
		{#each values as v}
			<div
				class="item"
				class:mark={markValues.includes(v)}
				data-exclude-drag-modal
				style:scroll-snap-align={touch ? 'center' : 'unset'}
			>
				<div class="value">{v}</div>
				<div class="space">&nbsp;</div>
				<div class="indicator">&nbsp;</div>
			</div>
		{/each}
	</div>
	<div class="selected">
		{scrolledValue}{postfix}<Icon icon="mdi:arrow-down-drop" height="auto" />
	</div>
</div>

<style>
	.slider {
		position: relative;
		padding-top: 1rem;
	}

	.container {
		width: 100%;
		height: 5rem;
		overflow: auto;
		cursor: grab;
		border-radius: 0.8rem;
		scrollbar-width: none;
		display: inline-flex;
		align-items: center;
		padding-left: 50%;
		padding-right: 50%;
	}

	.container::-webkit-scrollbar {
		display: none;
	}

	.selected {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		font-size: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.item {
		text-align: center;
		height: 100%;
		min-width: 4rem;
		display: flex;
		flex-direction: column;
	}

	:global(.current .value) {
		opacity: 0 !important;
	}

	:global(.mark .value) {
		color: #c4c4d7 !important;
	}

	:global(.current .indicator) {
		background-color: white !important;
		opacity: 0.8 !important;
		width: 0.3rem !important;
		height: 3rem !important;
	}

	:global(.mark .indicator) {
		background-color: #c4c4d7 !important;
		opacity: 1 !important;
		width: 0.3rem !important;
		height: 3rem !important;
	}

	.value {
		transition: all 0.2s ease-out;
		color: gray;
		font-size: 1rem;
	}

	.space {
		height: 0.5rem;
	}

	.indicator {
		transition: all 0.3s ease-out;
		background-color: #6c6c6c;
		opacity: 0.6;
		border-radius: 0.2rem;
		width: 0.2rem;
		height: 2rem;
		margin-left: auto;
		margin-right: auto;
		margin-top: 0.5rem;
	}

	/* Phone */
	@media all and (max-width: 768px) {
		.item {
			min-width: 2.5rem;
		}
	}
</style>
