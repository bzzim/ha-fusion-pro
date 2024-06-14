<script lang="ts">
	import { states, lang, connection } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import WheelPicker from '$lib/Components/WheelPicker.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import { getName, getSupport } from '$lib/Utils';
	import { callService } from 'home-assistant-js-websocket';
	import UniversalSelect from '$lib/Components/UniversalSelect.svelte';
	import SlidePicker from '$lib/Components/SlidePicker.svelte';

	export let isOpen: boolean;
	export let sel: any;

	const debug = false;

	const presetModeIcons: Record<string, string> = {
		none: 'mdi:power-off',
		boost: 'mdi:rocket-launch',
		eco: 'mdi:leaf',
		sleep: 'mdi:bed',
		energy: 'mdi:thunder-outline',
		comfortable: 'mdi:temperature-approve',
		dry: 'mdi:hair-dryer',
		program: 'mdi:calculator-variant',
		'freeze protection': 'mdi:snowflake-off'
	};

	const hvacModesIcons: Record<string, string> = {
		cool: 'mdi:snowflake',
		dry: 'mdi:water-percent',
		fan_only: 'mdi:fan',
		auto: 'mdi:thermostat-auto',
		heat: 'mdi:fire',
		off: 'mdi:power',
		heat_cool: 'mdi:sun-snowflake-variant'
	};

	const swingModeIcons: Record<string, string> = {
		on: 'mdi:arrow-oscillating',
		off: 'mdi:arrow-oscillating-off',
		vertical: 'mdi:arrow-up-down',
		horizontal: 'mdi:arrow-left-right',
		both: 'mdi:arrow-all'
	};

	const fanModeIcons: Record<string, string> = {
		on: 'mdi:fan',
		off: 'mdi:fan-off',
		auto: 'mdi:fan-auto',
		silent: 'mdi:sleep',
		low: 'mdi:speedometer-slow',
		medium: 'mdi:speedometer-medium',
		high: 'mdi:speedometer',
		turbo: 'mdi:rocket-launch',
		middle: 'mdi:speedometer-medium',
		focus: 'mdi:target',
		diffuse: 'mdi:weather-windy'
	};

	$: entity = $states[sel?.entity_id];
	$: entity_id = entity?.entity_id;
	$: attributes = entity?.attributes;
	$: supported_features = attributes?.supported_features;

	$: supports = getSupport(supported_features, {
		TARGET_TEMPERATURE: 1,
		TARGET_TEMPERATURE_RANGE: 2,
		TARGET_HUMIDITY: 4,
		FAN_MODE: 8,
		PRESET_MODE: 16,
		SWING_MODE: 32,
		AUX_HEAT: 64
	});

	$: optionsHvacModes =
		attributes?.hvac_modes?.map((option: string) => ({
			id: option,
			label: $lang(option),
			icon: hvacModesIcons?.[option] || 'mdi:fan'
		})) ?? [];

	$: optionsFanModes =
		attributes?.fan_modes?.map((option: string) => ({
			id: option,
			label: $lang(option),
			icon: fanModeIcons?.[option] || 'mdi:fan'
		})) ?? [];

	$: optionsSwingModes =
		attributes?.swing_modes?.map((option: string) => ({
			id: option,
			label: $lang(option),
			icon: swingModeIcons?.[option] || 'mdi:fan'
		})) ?? [];

	$: optionsPresetModes =
		attributes?.preset_modes?.map((option: string) => ({
			id: option,
			label: $lang(option),
			icon: presetModeIcons?.[option] || 'mdi:fan'
		})) ?? [];

	// TODO: check is it possible to null
	function handleClick(service: string, to_state?: string | undefined | null) {
		if (to_state === undefined || to_state === null) {
			return;
		}
		callService($connection, 'climate', 'set_' + service, {
			entity_id,
			[service]: to_state
		});
		if (debug) {
			console.debug('climate.set_' + service, '->', to_state);
		}
	}

	// TODO: check range. how pass temp?
	function handleChange() {
		callService($connection, 'climate', 'set_temperature', {
			entity_id,
			target_temp_low: attributes?.target_temp_low,
			target_temp_high: attributes?.target_temp_high
		});
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(sel, entity)}</h1>
		{#if supports?.TARGET_TEMPERATURE}
			<div style="margin-bottom: 2rem; margin-top: 2rem;">
				<SlidePicker
					minValue={entity.attributes?.min_temp}
					maxValue={entity.attributes?.max_temp}
					defaultValue={entity.attributes?.temperature}
					markValues={[entity.attributes?.current_temperature]}
					postfix={'°'}
					on:change={(e) => handleClick('temperature', e?.detail)}
				/>
			</div>
		{/if}
		<!--		TODO: check range-->
		{#if supports?.TARGET_TEMPERATURE_RANGE}
			<h2>{$lang('target_temperature')}</h2>

			<div>
				<div class="slider-title">{$lang('target_temp_low')}</div>
				<div class="slider-row">
					<input
						class="slider-input"
						type="range"
						min={attributes?.min_temp}
						max={attributes?.max_temp}
						bind:value={attributes.target_temp_low}
						on:change={handleChange}
					/>
					<div class="slider-value">{attributes?.target_temp_low}°</div>
				</div>
			</div>

			<div>
				<div class="slider-title">{$lang('target_temp_high')}</div>
				<div class="slider-row">
					<input
						class="slider-input"
						type="range"
						min={attributes?.min_temp}
						max={attributes?.max_temp}
						bind:value={attributes.target_temp_high}
						on:change={handleChange}
					/>
					<div class="slider-value">{attributes?.target_temp_high}°</div>
				</div>
			</div>
		{/if}

		{#if optionsHvacModes.length !== 0}
			<h2>{$lang('hvac_modes')}</h2>
			<UniversalSelect
				items={optionsHvacModes}
				selected={entity?.state}
				on:change={(e) => handleClick('hvac_mode', e?.detail)}
			/>
		{/if}

		{#if optionsFanModes.length !== 0}
			<h2>{$lang('fan_modes')}</h2>
			<UniversalSelect
				items={optionsFanModes}
				selected={attributes?.fan_mode}
				on:change={(e) => handleClick('fan_mode', e?.detail)}
			/>
		{/if}

		{#if optionsSwingModes.length !== 0}
			<h2>{$lang('swing_modes')}</h2>
			<UniversalSelect
				items={optionsSwingModes}
				selected={attributes?.swing_mode}
				on:change={(e) => handleClick('swing_mode', e?.detail)}
			/>
		{/if}

		{#if optionsPresetModes.length !== 0}
			<h2>{$lang('preset_modes')}</h2>
			<UniversalSelect
				items={optionsPresetModes}
				selected={attributes?.preset_mode}
				on:change={(e) => handleClick('preset_mode', e?.detail)}
			/>
		{/if}

		<ConfigButtons />
		{#if debug}
			<h2>Debug</h2>
			<pre><code>{JSON.stringify(entity, null, 2)}</code></pre>
			<h2>Supports</h2>
			{#each Object.entries(supports) as [feature, supported]}
				<div>{feature}: {supported}</div>
			{/each}
		{/if}
	</Modal>
{/if}

<style>
	.slider-row {
		display: flex;
		align-items: center;
	}

	.slider-input {
		flex-grow: 1;
	}

	.slider-value {
		text-align: right;
		width: 3rem;
	}

	.slider-title {
		margin-top: 0.3rem;
		margin-bottom: 0.3rem;
	}
</style>
