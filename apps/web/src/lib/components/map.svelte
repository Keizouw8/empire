<script lang="ts">
    import type { MapTerritory } from "@empire/shared";
    import * as d3 from "d3-selection";
    import { zoom } from "d3-zoom";

	interface Props {
		focused: MapTerritory | null;
		hovering: MapTerritory | null;
		territories: MapTerritory[];
	}
	
	let { focused = $bindable(null), hovering = $bindable(null), territories }: Props = $props();

	let territoriesMap = $derived(new Map(territories.map(t => [t.id, t])));
	let panning = $state(false);
	let group: SVGGElement | null = $state(null);

	function zoomAction(node: SVGSVGElement){
		let zoomBehavior = zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.002, 500])
			.on("start", () => panning = true)
			.on("end", () => panning = false)
			.on("zoom", e => d3.select(group).attr("transform", e.transform));
		d3.select(node).call(zoomBehavior);
	}

	function onclick(e: MouseEvent){
		// if(e.defaultPrevented) return;
		// let target = (e.target as SVGElement).closest<SVGPathElement>("path.territory");
		// if(!target) return;
		// focused = territoriesMap.get(target.dataset.id as string)!;
		focused = hovering;
	}

	function onpointermove(e: PointerEvent){
		if(panning) return;
		let target = (e.target as SVGElement).closest<SVGPathElement>("path.territory");
		if(!target) return hovering = null;
		if(hovering?.id == target.dataset.id) return;
		hovering = territoriesMap.get(target.dataset.id as string)!;
	}
</script>
<div class="background">
	{#if territories.length }
		<!-- svelte-ignore a11y_click_events_have_key_events,a11y_no_static_element_interactions -->
		<svg use:zoomAction viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" {onclick} {onpointermove}>
			<g bind:this={group}>
				{#each territories as territory}
					<!-- svelte-ignore  a11y_click_events_have_key_events,a11y_mouse_events_have_key_events,a11y_no_static_element_interactions -->
					<path
						data-id={territory.id} class="territory" d={territory.path}
						data-focused={focused?.id == territory.id}
					></path>
				{/each}
			</g>
		</svg>
	{/if}
</div>
<style>
	svg{
		width: 100vw;
		height: 100vh;
	}
	
	.territory{
		fill: white;
		stroke: gray;
		stroke-width: 1;
		fill-rule: evenodd;
		vector-effect: non-scaling-stroke;
	}

	.territory:hover{
		fill: green;
	}

	.territory[data-focused=true]{
		fill: blue;
	}
	
	.background{
		position: fixed;
		inset: 0;
		background: rgb(220, 220, 220);
	}
</style>