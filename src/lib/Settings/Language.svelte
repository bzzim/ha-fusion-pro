<script lang="ts">
	import { base } from '$app/paths';
	import { translation, selectedLanguage, lang } from '$lib/Stores';
	import Select from '$lib/Components/Select.svelte';
	import Icon from '@iconify/svelte';

	export let languages: {
		id: string;
		label: string;
	}[];

	async function loadSelectedLang(value: string) {
		$selectedLanguage = value;

		try {
			const response = await fetch(`${base}/_api/get_translation`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ locale: value })
			});

			const data = await response.json();

			document.documentElement.lang = $selectedLanguage || 'en';

			if (response.ok) {
				$translation = data;
			} else {
				throw new Error(data.message);
			}
		} catch (error) {
			console.error(error);
		}
	}

	const href = 'https://www.home-assistant.io/docs/configuration/basic/#language';
</script>

<div class="header">
	<h2>{$lang('language')}</h2>
	<a target="blank" {href}><Icon icon="uit:question-circle" height="1.2rem" /></a>
</div>

{#if languages.length !== 0}
	<Select
		options={languages}
		placeholder={$lang('language')}
		value={$selectedLanguage}
		on:change={(event) => {
			loadSelectedLang(event?.detail || 'en');
		}}
	/>
{/if}

<style>
	.header {
		display: inline-flex;
		align-items: baseline;
		justify-content: center;
	}
	.header a {
		margin-left: 0.5rem;
		color: var(--theme-colors-text);
	}
</style>
