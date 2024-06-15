<script lang="ts">
	import { states, lang, isDebug } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import StateLogic from '$lib/Components/StateLogic.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import { getName } from '$lib/Utils';

	export let isOpen: boolean;
	export let sel: any;

	$: entity = $states[sel?.entity_id];
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(sel, entity)}</h1>

		<h2>{$lang('state')}</h2>

		<StateLogic entity_id={sel?.entity_id} selected={sel} />

		<ConfigButtons />

		{#if $isDebug}
			<h2>Debug</h2>
			<small>component: LightModal.svelte</small>
			<h4>sel</h4>
			<pre><code>{JSON.stringify(sel, null, 2)}</code></pre>
			<h4>entity</h4>
			<pre><code>{JSON.stringify(entity, null, 2)}</code></pre>
		{/if}
	</Modal>
{/if}
