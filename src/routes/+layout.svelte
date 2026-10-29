<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
    import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>empire</title>
</svelte:head>
{#if page.url.pathname != "/" && !page.url.pathname.startsWith("/auth/")}
	<a href="/">dashboard</a>
{/if}
{@render children()}
