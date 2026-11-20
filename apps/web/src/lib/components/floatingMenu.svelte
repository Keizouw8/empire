<script lang="ts">
	import "#lib/styles/global.css";
    import type { Snippet } from "svelte";

	interface Props{
		children?: Snippet;
		collapsed?: boolean;
		collapsable?: boolean;
		hidden?: boolean;
		globalClasses?: string;
		menuClasses?: string;
		buttonClasses?: string;
		globalStyles?: string;
		menuStyles?: string;
		buttonStyles?: string;
	}
	
	let {
			children,
			collapsable=false,
			collapsed=$bindable(false),
			hidden: globalHidden,
			globalClasses="",
			menuClasses="",
			buttonClasses="",
			globalStyles="",
			menuStyles="",
			buttonStyles=""
	}: Props = $props();
</script>
{#if children}
	<div
		class={["floating-menu", ...globalClasses?.split(" "), ...menuClasses?.split(" ")].join(" ")}
		style={globalStyles + menuStyles}
		hidden={globalHidden || collapsed}>
		{#if collapsable}
			<div class="split-children">
				<a href="/">dashboard</a>
				<button onclick={() => collapsed = true}>collapse</button>
			</div>
		{/if}
		{@render children?.()}
	</div>
	{#if !globalHidden && collapsable && collapsed}
		<button
			class={[...globalClasses?.split(" "), ...buttonClasses?.split(" ")].join(" ")}
			style={globalStyles + buttonStyles}
			onclick={() => collapsed = false}>
			menu
		</button>
	{/if}
{/if}>
<style>	
	.floating-menu{
		display: inline-block;
		background: white;
		outline: black solid 2px;
		padding: 10px;
		max-width: 400px;
	}
</style>