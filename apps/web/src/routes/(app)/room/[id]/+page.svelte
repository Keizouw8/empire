<script lang="ts">
	import { dev } from "$app/env";
	import { type RoomInfo, type ClientPayloads, type ServerMessage, type ServerPayloads } from "@empire/shared";
	
	import ProfilePicture from "#lib/components/profilePicture.svelte";
	import Spinner from "#lib/components/spinner.svelte";

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	let roomInfo: RoomInfo = $state(data.room);
	let isOwner = $derived(roomInfo.ownerId == data.user.id);
	
	let socket: WebSocket | null = $state(null);
	let isConnected = $derived(socket != null);

	let handlers: { [K in keyof ServerPayloads]: (payload: ServerPayloads[K]) => any } = {
		info({ info }){ roomInfo = info; },
		echo({ message }){ console.log(message) },
		pong() { console.log("pong") }
	};

	async function addMember(){
   		let email = prompt("User email")
		if (!email) return;
		try{
		let res = await fetch(`/api/room/${roomInfo.id}/addmember`, {
			method: "POST",
			body: JSON.stringify({ email }),
			headers: { "Content-Type": "application/json" }
		});
		if(!res.ok) throw new Error((await res.json() as { message: string })?.message ?? `Request failed with status ${res.status}`);
		let { success, email: e, username }: { success: boolean, email: string, username: string } = await res.json();
		if(!success) throw new Error("Failed to add member");
		alert(`Added ${e}: ${username}`);
		}catch (error){
		alert(error instanceof Error ? error.message : "Failed to add member");
		}
    }

	$effect(function(){
		let ws = new WebSocket(dev ? `http://localhost:8787/${data.room.id}?userId=${data.user.id}` : `/room/${data.room.id}/ws`);
		ws.onmessage = function({ data }){
			let message: ServerMessage = JSON.parse(data);
			handlers[message.event](message.payload as any);
		};
		ws.onopen = () => socket = ws;
		ws.onclose = () => socket = null;
		return () => ws.close();
	});

	$effect(function(){
		document.body.inert = !isConnected;
		return () => document.body.inert = true;
	});

	function send<E extends keyof ClientPayloads>(event: E, ...[payload]: ClientPayloads[E] extends void ? [payload?: undefined] : [payload: ClientPayloads[E]]){
		socket?.send(JSON.stringify({ event, payload }));
    }
</script>
<h1>{roomInfo.name}</h1>
<h2>members</h2>
{#if isOwner}
	<button onclick={addMember}>add member</button>
	<button>kick member</button>
{/if}
{#each roomInfo.members as member}
	<div style="display: flex; align-items: center;">
		<ProfilePicture user={member} />
		<span>
			{member.name}
			{#if member.id == data.user.id}
				(you)
			{/if}
			{#if member.id == roomInfo.ownerId}
				👑
			{/if}
		</span>
	</div>
{/each}
{#if !isConnected}
	<Spinner />
{/if}