<script lang="ts">
	import { lang, ripple } from '$lib/Stores';
	import Icon from '@iconify/svelte';
	import Ripple from 'svelte-ripple';
	import { createEventDispatcher } from 'svelte';
	export let isOn: boolean = false;

	const dispatch = createEventDispatcher();

	function handleChange(toggle: boolean) {
		dispatch('change', toggle);
	}
</script>

<div class="button-container">
	<button
		title={$lang('off')}
		class:selected={!isOn}
		on:click={() => handleChange(false)}
		use:Ripple={$ripple}
	>
		<span class="icon">
			<Icon icon="mdi:power-off" height="auto" />
		</span>
	</button>
	<button
		title={$lang('on')}
		class:selected={isOn}
		on:click={() => handleChange(true)}
		use:Ripple={$ripple}
	>
		<span class="icon">
			<Icon icon="mdi:power-on" height="auto" />
		</span>
	</button>
</div>
