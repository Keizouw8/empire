<script lang="ts">
    import { page } from '$app/state';
	import type { LayoutProps } from './$types';
	let { children }: LayoutProps = $props();
</script>
{#if page.url.pathname != "/" }
	<a href="/" data-sveltekit-reload>dashboard</a>
{/if}
{@render children()}