<script lang="ts">
	// This is the UniversalSelect component.
	// Display a list of buttons or select if there are many elements (items >= maxButtons)
	import { lang, ripple } from '$lib/Stores';
	import Icon from '@iconify/svelte';
	import Ripple from 'svelte-ripple';
	import { createEventDispatcher } from 'svelte';
	import Select from '$lib/Components/Select.svelte';
	const dispatch = createEventDispatcher();

	export let items: {
		id: string;
		label: string;
		icon?: string;
	}[];
	export let selected: string | undefined = undefined;
	export let maxButtons: number = 6;

	function handleChange(id: string) {
		dispatch('change', id);
	}
</script>

{#if items.length <= maxButtons}
	<div class="button-container">
		{#each items as i}
			<button
				title={$lang(i.label)}
				class:selected={i.id === selected}
				on:click={() => handleChange(i.id)}
				use:Ripple={$ripple}
			>
				{#if i.icon}
					<span class="icon">
						<Icon icon={i.icon} height="auto" />
					</span>
				{/if}
			</button>
		{/each}
	</div>
{:else}
	<Select
		options={items}
		placeholder={$lang('options')}
		value={selected}
		on:change={(event) => handleChange(event?.detail)}
	/>
{/if}

<style>
	.button-container > button {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.icon {
		width: 1.6rem;
		height: 1.6rem;
	}
</style>
