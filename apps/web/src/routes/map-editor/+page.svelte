<script lang="ts">
	import * as topojson from "topojson-client";
	import type { Topology, GeometryCollection, Properties } from "topojson-specification";
	import type { FeatureCollection, Feature, Polygon, MultiPolygon } from "geojson";
	
	import Map from "#lib/components/map.svelte";
	import type { MapTerritory } from "@empire/shared";

	let territories: MapTerritory[] = $state([]);
	let focused: MapTerritory | null = $state(null);
	let hovering: MapTerritory | null = $state(null);

	let UIState = $state({ leftbar: true });
	let mode = $state(0); // 0: idle, 1: topojson, 2: map;

	// mode 1
	let topology = $state<Topology | null>(null);
	let availableGroups = $derived(topology?.objects ? Object.keys(topology.objects) : []);
	let territoriesGroup = $state("");
	
	let geojson = $derived.by((): FeatureCollection<Polygon | MultiPolygon> | null => {
		if (!topology || !territoriesGroup || !topology.objects[territoriesGroup]) return null;
		const res = topojson.feature(topology, topology.objects[territoriesGroup] as GeometryCollection) as | Feature<Polygon | MultiPolygon> | FeatureCollection<Polygon | MultiPolygon>;
		if (!res) return null;
		return res.type == "FeatureCollection" ? res : {
			type: "FeatureCollection",
			features: [res]
		};
	});
	
	let columns = $derived(geojson?.features?.length ? Object.keys(geojson.features[0].properties ?? {}) : []);
	let idColumn = $state("");
	let nameColumn = $state("");
	let populationColumn = $state("");

	async function importTopoJSON(){
		let file = (document.getElementById("topojson") as HTMLInputElement).files?.[0];
		if(!file) return;
		try {
			const parsed = JSON.parse(await file.text()) as Topology;
			if (parsed.type != "Topology" || !parsed.objects) return alert("Uploaded JSON is not a valid TopoJSON Topology.");
			topology = parsed;
			territoriesGroup = Object.keys(parsed.objects)?.[0] ?? "";
			mode = 1;
		} catch (e) {
			console.error(e);
			alert("error importing topojson");
		}
	}

	// mode 2
	async function importMap(){
		
	}

	$effect(function(){
		if(mode == 0) territories = [];
		if(mode == 1){
			if (!geojson || !topology) return void (territories = []);
			let neighbors: number[][] = [];
			const obj = topology.objects?.[territoriesGroup];
			if (obj?.type == "GeometryCollection") neighbors = topojson.neighbors(obj.geometries as any);
			territories = geojson.features.flatMap(function(feature, i) {
				let { geometry, properties } = feature;
				if (!geometry) return [];
				let polys = geometry.type == "Polygon" ? [geometry.coordinates] : geometry.coordinates;
				let path = polys.map(poly => poly.map(ring => "M" + ring.map(pt => `${pt[0]},${pt[1]}`).join("L") + "Z").join(" ")).join(" ");
				return [{
					path,
					id: properties?.[idColumn] ?? feature?.id ?? `${i}`,
					name: properties?.[nameColumn] ?? `Territory ${i}`,
					population: properties?.[populationColumn] ?? 1,
					neighbors: neighbors[i] ? neighbors[i].map(n => geojson.features[n].properties?.[idColumn] ?? geojson.features[n]?.id ?? `${n}`) : []
				}];
			});
		}
		if(mode == 2){
			territories = [];
		}
	});

	function reset(){
		focused = null;
		hovering = null;
		topology = null;
		territoriesGroup = "";
		mode = 0;
	}
</script>
<Map bind:focused={focused} bind:hovering={hovering} {territories} />
<div class="sidebar top left" hidden={!UIState.leftbar}>
	<div class="split-children">
		<a href="/">dashboard</a>
		<button onclick={() => UIState.leftbar = false}>collapse</button>
	</div>
	<h1>map editor</h1>
	{#if mode == 0}
		<label for="csv">upload map csv</label><br>
		<input type="file" accept=".csv,text/csv" name="csv" id="csv">
		<button onclick={importMap}>import map</button><br><br>
		<label for="topojson">upload topojson file</label><br>
		<input type="file" accept=".json,application/json" name="topojson" id="topojson">
		<button onclick={importTopoJSON}>import topojson</button>
	{:else if mode == 1}
		{#if availableGroups.length > 1}
			<label for="layer-select">Layer: </label>
			<select name="layer-select" id="layer-select" bind:value={territoriesGroup}>
				{#each availableGroups as group}
					<option value={group}>{group}</option>
				{/each}
			</select><br>
		{/if}
		<label for="id-column">ID Column: </label>
		<select name="id-column" id="id-column" bind:value={idColumn} >
			<option value="">(Feature ID / Index)</option>
			{#each columns as column}
				<option value="{column}">{column}</option>
			{/each}
		</select><br>
		<label for="name-column">Name Column: </label>
		<select name="name-column" id="name-column" bind:value={nameColumn} >
			<option value="">(Default: Territory N)</option>
			{#each columns as column}
				<option value="{column}">{column}</option>
			{/each}
		</select><br>
		<label for="population-column">Population Column: </label>
		<select name="population-column" id="population-column" bind:value={populationColumn} >
			<option value="">(Default: 1)</option>
			{#each columns as column}
				<option value="{column}">{column}</option>
			{/each}
		</select><br>
		<button onclick={reset}>cancel</button>
	{/if}
</div>
<button class="top left" onclick={() => UIState.leftbar = true} hidden={UIState.leftbar}>sidebar</button>
{#if focused}
	<div class="sidebar top right">
		<h2>{focused.name}</h2>
		<i>{focused.id}</i>
		<h3>Population</h3>
		<p>{focused.population}</p>
		<h3>neighbors</h3>
		<span>{focused.neighbors.map(n => territories.find(t => t.id == n)?.name).join(", ")}</span>
	</div>
{/if}
{#if hovering}
	<div class="sidebar bottom right">
		<h2>{hovering.name}</h2>
		<i>{hovering.id}</i>
		<h3>Population</h3>
		<p>{hovering.population}</p>
		<h3>neighbors</h3>
		<span>{hovering.neighbors.map(n => territories.find(t => t.id == n)?.name).join(", ")}</span>
	</div>
{/if}
<style>
	.top{
		position: fixed;
		top: 10px;
	}

	.bottom{
		position: fixed;
		bottom: 10px;
	}

	.left{
		position: fixed;
		left: 10px;
	}

	.right{
		position: fixed;
		right: 10px;
	}
	
	.split-children{
		display: flex;
		justify-content: space-between;
	}
	
	.sidebar{
		display: inline-block;
		background: white;
		outline: black solid 2px;
		padding: 10px;
		max-width: 400px;
	}

	[hidden]{
		display: none !important;
	}
</style>
