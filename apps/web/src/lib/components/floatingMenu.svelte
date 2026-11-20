<script lang="ts">
    import type { Snippet } from "svelte";

	let { children, class: classes, style }: { children?: Snippet, class?: string, style?: string } = $props();
</script>
{#if children}
	<div class="floatingMenu {classes ?? ""}" {style}>
		{@render children?.()}
	</div>
{/if}>