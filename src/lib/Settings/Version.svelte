<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { lang, ripple } from '$lib/Stores';
	import Ripple from 'svelte-ripple';
	import type { AppVersion } from '$lib/Types';
	let hasError: boolean;
	let isLoading = false;
	let data: AppVersion
	onMount(async () => {
		await fetchData()
	});

	async function fetchData() {
		isLoading = true
		hasError = false
		await fetch(`${base}/_api/version`, {headers: { 'Content-Type': 'application/json' }})
			.then<AppVersion>(response => {
				if (!response.ok) {
					hasError = true
				}
				return response.json()
			})
			.then((json) => data = json)
			.catch(() => hasError = true)
			.finally(() => isLoading = false);
	}
</script>

<div class="container">
	<div>
		<h2>{$lang('version_fmt').replace('{version}',data?.installed ?? '')}</h2>
		<p>
			{#if data && !hasError}
				{#if data.has_update}
					{$lang('update_available')} {data.latest}
				{:else}
					{$lang('update_up_to_date')}
				{/if}
				<br/>
				<a href="{data.url}" target="_blank">
					{$lang('update_release_notes')} {data.installed}
				</a>
			{:else if isLoading}
				{$lang('loading')}
			{/if}
			{#if hasError }
				{$lang('error')}
			{/if}
		</p>
	</div>

	<button
		class="action done"
		disabled={isLoading}
		on:click|preventDefault={() => {
			fetchData()
		}}
		use:Ripple={{
			...$ripple,
			color: 'rgba(0, 0, 0, 0.35)'
		}}
	>
		{$lang(isLoading ? 'checking_updates' : 'check_updates')}
	</button>
</div>

<style>
	.container {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 10px;
		align-items: center;
	}
	button {
		margin-top: 2rem;
		width: 100%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	p {
		margin-block-end: 0.6rem;
		font-size: 0.9rem;
		opacity: 0.75;
	}
	a {
		color: #00dbff;
	}
</style>
