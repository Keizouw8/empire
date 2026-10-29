<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
    import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
{#if page.url.pathname != "/"}
	<a href="/">dashboard</a>
{/if}
{@render children()}
