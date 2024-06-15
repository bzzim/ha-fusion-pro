<script lang="ts">
	import { states, lang, connection, selectedLanguage, isDebug } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import { getName } from '$lib/Utils';
	import { callService } from 'home-assistant-js-websocket';
	import RangeSlider from '$lib/Components/RangeSlider.svelte';
	import UniversalSelect from '$lib/Components/UniversalSelect.svelte';

	export let isOpen: boolean;
	export let sel: any;

	$: entity = $states?.[sel?.entity_id];
	$: attr = entity?.attributes;

	$: optionsToggle = [
		{
			id: 'off',
			label: $lang('off'),
			icon: 'mdi:power-off'
		},
		{
			id: 'on',
			label: $lang('on'),
			icon: 'mdi:power-on'
		}
	];

	$: optionsModes =
		attr?.available_modes?.map((option: string) => ({
			id: option,
			icon: icons?.[option.toLocaleLowerCase()] || 'mdi:water-percent',
			label:
				$lang(`humidifier_mode_${option}`) !== `humidifier_mode_${option}`
					? $lang(`humidifier_mode_${option}`)
					: option
		})) ?? [];

	const icons: Record<string, string> = {
		off: 'mdi:drop-off-outline',
		auto: 'mdi:refresh-auto',
		away: 'mdi:account-arrow-right',
		baby: 'mdi:baby-carriage',
		boost: 'mdi:rocket-launch',
		comfort: 'mdi:sofa',
		eco: 'mdi:leaf',
		home: 'mdi:home',
		normal: 'mdi:water-percent',
		sleep: 'mdi:power-sleep',
		level1: 'mdi:fan-speed-1',
		level2: 'mdi:fan-speed-2',
		level3: 'mdi:fan-speed-3',
		humidity: 'mdi:drop'
	};

	/**
	 * Handle service calls
	 * 'toggle' | 'set_humidity' | 'set_mode'
	 */
	function handleEvent(service: string, payload: number | string | undefined = undefined) {
		if (!entity?.entity_id) return;

		let data: any = {
			entity_id: entity?.entity_id
		};

		if (service === 'set_humidity') {
			data.humidity = payload;
		} else if (service === 'set_mode') {
			data.mode = payload;
		}

		callService($connection, 'humidifier', service, data);
	}

	/**
	 * Formats percent to locale
	 */
	function format(value: number) {
		if (!value) return;

		return Intl.NumberFormat($selectedLanguage, {
			style: 'percent'
		}).format(value / 100);
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(sel, entity)}</h1>
		<!-- STATE -->
		<h2>{$lang('state')}</h2>
		<UniversalSelect
			items={optionsToggle}
			selected={entity?.state}
			on:change={() => handleEvent('toggle')}
		/>

		<!--		TODO: check what the action?-->
		{#if entity?.state === 'on' && attr?.action}
			{$lang('humidifier_' + attr?.action)}
		{/if}

		<!-- HUMIDITY -->
		<h2>
			{$lang('target_humidity')}

			<span class="align-right">
				{#if attr?.current_humidity}
					{format(attr?.current_humidity)} ->
				{/if}

				{format(attr?.humidity)}
			</span>
		</h2>

		<RangeSlider
			bind:value={attr.humidity}
			min={attr?.min_humidity}
			max={attr?.max_humidity}
			on:change={(event) => {
				handleEvent('set_humidity', event?.detail);
			}}
		/>

		{#if optionsModes}
			<h2>
				{$lang('mode')}
			</h2>
			<UniversalSelect
				items={optionsModes}
				selected={attr?.mode}
				on:change={(e) => handleEvent('set_mode', e.detail)}
			/>
		{/if}

		{#if $isDebug}
			<h2>Debug</h2>
			<small>component: Humidifier.svelte</small>
			<h4>sel</h4>
			<pre><code>{JSON.stringify(sel, null, 2)}</code></pre>
			<h4>entity</h4>
			<pre><code>{JSON.stringify(entity, null, 2)}</code></pre>
		{/if}
	</Modal>
{/if}
