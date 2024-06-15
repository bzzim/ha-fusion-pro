<script lang="ts">
	import { connection, isDebug, lang, states } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import { getName, getSupport } from '$lib/Utils';
	import { callService } from 'home-assistant-js-websocket';
	import UniversalSelect from '$lib/Components/UniversalSelect.svelte';
	import Icon from '@iconify/svelte';

	export let isOpen: boolean;
	export let sel: any;

	const speedIcons: Record<string, string> = {
		low: 'mdi:fan-minus',
		silent: 'mdi:fan-minus',
		default: 'mdi:fan-speed-1',
		basic: 'mdi:fan-speed-1',
		medium: 'mdi:fan-speed-2',
		normal: 'mdi:fan-speed-2',
		strong: 'mdi:fan-speed-3',
		high: 'mdi:fan-speed-3'
	};

	const supportedCommands: { [key: string]: any } = {
		TURN_ON: {
			id: 'turn_on',
			label: $lang('on'),
			state: 'on',
			icon: 'mdi:power-on'
		},
		TURN_OFF: {
			id: 'turn_off',
			label: $lang('off'),
			state: 'off',
			icon: 'mdi:power-off'
		},
		START: {
			id: 'start',
			label: $lang('start'),
			state: 'cleaning',
			icon: 'ic:round-play-arrow'
		},
		PAUSE: {
			id: 'pause',
			label: $lang('pause'),
			state: 'paused',
			icon: 'ic:round-pause'
		},
		STOP: {
			id: 'stop',
			label: $lang('stop'),
			state: 'idle',
			icon: 'ic:round-stop'
		},
		LOCATE: {
			id: 'locate',
			label: $lang('locate'),
			state: 'locate',
			icon: 'mdi:search'
		},
		RETURN_HOME: {
			id: 'return_to_base',
			label: $lang('return_home'),
			state: 'returning',
			icon: 'ic:round-home'
		}
	};

	$: entity = $states[sel?.entity_id];
	$: state = entity?.state;
	$: attributes = entity?.attributes;
	$: supportedFeatures = attributes?.supported_features;
	$: statusDescription =
		attributes !== undefined &&
		attributes['vacuum.status_desc'] &&
		state !== attributes['vacuum.status_desc']
			? attributes['vacuum.status_desc']
			: '';

	$: supports = getSupport(supportedFeatures, {
		TURN_ON: 1,
		TURN_OFF: 2,
		START: 8192,
		PAUSE: 4,
		STOP: 8,
		LOCATE: 512,
		RETURN_HOME: 16,
		FAN_SPEED: 32,
		BATTERY: 64,
		STATUS: 128,
		SEND_COMMAND: 256,
		CLEAN_SPOT: 1024,
		MAP: 2048,
		STATE: 4096
	});

	$: optionsFanSpeeds =
		attributes?.fan_speed_list?.map((option: string) => ({
			id: option,
			label: $lang(option?.toLowerCase()),
			icon: speedIcons?.[option.toLowerCase()] || 'mdi:fan'
		})) ?? [];

	$: selectedCommand = Object.entries(supportedCommands).find(
		([, value]) => value.state === entity?.state
	)?.[1];

	$: commands = Object.entries(supports)
		.filter(([option, support]) => support && supportedCommands[option] !== undefined)
		.map(([option]) => supportedCommands[option]);

	function handleCommand(service: string) {
		callService($connection, 'vacuum', service, {
			entity_id: entity?.entity_id
		});
	}

	function handleSpeed(speed: string) {
		callService($connection, 'vacuum', 'set_fan_speed', {
			entity_id: entity?.entity_id,
			fan_speed: speed
		});
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(sel, entity)}</h1>

		<div class="state-container">
			<div>
				<h2>{$lang('state')}</h2>
				{$lang(state)}
				{#if statusDescription}
					{statusDescription}
				{/if}
			</div>
			<div>
				{#if supports?.BATTERY}
					<h2>{$lang('battery')}</h2>
					<div class="battery">
						{#if attributes?.battery_icon}
							<Icon icon={attributes?.battery_icon} height="auto" />&nbsp;
						{/if}
						{attributes?.battery_level + '%'}
					</div>
				{/if}
			</div>
		</div>

		{#if supports?.FAN_SPEED && optionsFanSpeeds}
			<h2>{$lang('fan_speed')}</h2>
			<UniversalSelect
				items={optionsFanSpeeds}
				selected={attributes?.fan_speed}
				on:change={(e) => handleSpeed(e.detail)}
			/>
		{/if}

		{#if commands.length !== 0}
			<!--			TODO: check current state if select as list -->
			<h2>{$lang('vacuum_commands')?.replace(':', '')}</h2>
			<UniversalSelect
				items={commands}
				selected={selectedCommand?.id}
				on:change={(e) => handleCommand(e.detail)}
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

<style>
	.state-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.state-container .battery {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
