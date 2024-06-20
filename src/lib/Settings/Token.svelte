<script lang="ts">
	import { configuration, lang } from '$lib/Stores';
	import Icon from '@iconify/svelte';

	let token = $configuration?.token;

	function handleFocus(event: FocusEvent) {
		const target = event.target as HTMLInputElement;
		target.type = event.type === 'focus' ? 'text' : 'password';
	}

	const href = 'https://www.home-assistant.io/docs/authentication/#your-account-profile';
</script>

<div class="header">
	<h2>{$lang('token')}</h2>
	<a target="blank" {href}><Icon icon="uit:question-circle" height="1.2rem" /></a>
</div>

<input
	class="input"
	type="password"
	name="token"
	placeholder={$lang('token')}
	bind:value={token}
	on:focus={handleFocus}
	on:blur={handleFocus}
/>

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
