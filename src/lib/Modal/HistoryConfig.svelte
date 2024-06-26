<script lang="ts">
	import {
		dashboard,
		lang,
		record,
		history,
		historyIndex,
		ripple,
		entityList,
		isDebug
	} from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import History from '$lib/Sidebar/History.svelte';
	import Select from '$lib/Components/Select.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { updateObj } from '$lib/Utils';
	import type { HistoryItem } from '$lib/Types';
	import Ripple from 'svelte-ripple';
	import UniversalSelect from '$lib/Components/UniversalSelect.svelte';

	export let isOpen: boolean;
	export let sel: HistoryItem;

	export let demo: string | undefined = undefined;

	if (demo) {
		// replace history entry with demo
		$history.splice($historyIndex, 1);
		set('entity_id', demo);
	}

	$: options = $entityList('');

	const periodOptions = [
		{ id: '5minute', label: $lang('period_5minute') },
		{ id: 'hour', label: $lang('period_hour') },
		{ id: 'day', label: $lang('period_day') },
		{ id: 'week', label: $lang('period_week') },
		{ id: 'month', label: $lang('period_month') }
	];

	function set(key: string, event?: any) {
		sel = updateObj(sel, key, event);
		$dashboard = $dashboard;
	}

	onDestroy(() => $record());
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('history')}</h1>

		<h2>{$lang('preview')}</h2>

		{#if sel?.entity_id}
			<div class="preview">
				<History
					entity_id={sel.entity_id}
					period={sel?.period}
					hideIndicatorValue={sel?.hide_indicator_value}
				/>
			</div>
		{/if}

		<h2>{$lang('entity')}</h2>

		{#if sel}
			<Select
				computeIcons={true}
				{options}
				placeholder={$lang('entity')}
				value={sel.entity_id}
				on:change={(event) => set('entity_id', event)}
			/>
		{/if}

		<h2>{$lang('period')}</h2>

		{#if sel && periodOptions}
			<UniversalSelect
				items={periodOptions}
				selected={sel?.period || 'hour'}
				on:change={(event) => set('period', event)}
			/>
		{/if}

		<h2>{$lang('state_label')}</h2>

		<div class="button-container">
			<button
				class:selected={sel?.hide_indicator_value !== true}
				on:click={() => set('hide_indicator_value')}
				use:Ripple={$ripple}
			>
				{$lang('show')}
			</button>

			<button
				class:selected={sel?.hide_indicator_value === true}
				on:click={() => set('hide_indicator_value', true)}
				use:Ripple={$ripple}
			>
				{$lang('hide')}
			</button>
		</div>
		<h2>{$lang('mobile')}</h2>

		<div class="button-container">
			<button
				class:selected={sel?.hide_mobile !== true}
				on:click={() => set('hide_mobile')}
				use:Ripple={$ripple}
			>
				{$lang('visible')}
			</button>

			<button
				class:selected={sel?.hide_mobile === true}
				on:click={() => set('hide_mobile', true)}
				use:Ripple={$ripple}
			>
				{$lang('hidden')}
			</button>
		</div>

		<ConfigButtons {sel} />

		{#if $isDebug}
			<h2>Debug</h2>
			<small>component: HistoryConfig.svelte</small>
			<h4>sel</h4>
			<pre><code>{JSON.stringify(sel, null, 2)}</code></pre>
			<h4>op</h4>
			<pre><code>{JSON.stringify(options, null, 2)}</code></pre>
		{/if}
	</Modal>
{/if}
