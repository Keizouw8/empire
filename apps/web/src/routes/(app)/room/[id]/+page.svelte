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
		leave() { window.location.href = "/" },
		info({ info }) { roomInfo = info; },
		echo({ message }) { console.log(message) },
		pong() { console.log("pong") }
	};

	async function leaveRoom(){
		await fetch(`/api/room/${roomInfo.id}/leave`, { method: "POST" });
		try {
			let res = await fetch(`/api/room/${roomInfo.id}/leave`, { method: "POST" });
			if(!res.ok) throw new Error((await res.json() as { message: string })?.message ?? `Request failed with status ${res.status}`);
		} catch (error) {
			alert(error instanceof Error ? error.message : "Failed to leave room");
		}
	}

	async function deleteRoom(){
		if(prompt(`Write "${roomInfo.name}" to confirm deletion`) != roomInfo.name) return;
		await fetch(`/api/room/${roomInfo.id}/delete`, { method: "POST" });
	}

	async function changeRoomName(name: string){
		await fetch(`/api/room/${roomInfo.id}/set-name`, {
			method: "POST",
			body: JSON.stringify({ name }),
			headers: { "Content-Type": "application/json" }
		});
	}

	async function transferOwnership(){
   		let email = prompt("User email")
		if (!email) return;
		try {
			let res = await fetch(`/api/room/${roomInfo.id}/transfer-ownership`, {
				method: "POST",
				body: JSON.stringify({ email }),
				headers: { "Content-Type": "application/json" }
			});
			if(!res.ok) throw new Error((await res.json() as { message: string })?.message ?? `Request failed with status ${res.status}`);
			let { success, email: e, username }: { success: boolean, email: string, username: string } = await res.json();
			if(!success) throw new Error("Failed to transfer ownership");
			alert(`Transfered room to ${e}: ${username}`);
		} catch (error) {
			alert(error instanceof Error ? error.message : "Failed to transfer ownership");
		}
	}

    async function kickMember(){
  		let email = prompt("User email")
		if (!email) return;
		try {
			let res = await fetch(`/api/room/${roomInfo.id}/kick-member`, {
				method: "POST",
				body: JSON.stringify({ email }),
				headers: { "Content-Type": "application/json" }
			});
			if(!res.ok) throw new Error((await res.json() as { message: string })?.message ?? `Request failed with status ${res.status}`);
			let { success, email: e, username }: { success: boolean, email: string, username: string } = await res.json();
			if(!success) throw new Error("Failed to kick member");
			alert(`Kicked ${e}: ${username}`);
		} catch (error) {
			alert(error instanceof Error ? error.message : "Failed to kick member");
		}
	}

	async function addMember(){
   		let email = prompt("User email")
		if (!email) return;
		try {
			let res = await fetch(`/api/room/${roomInfo.id}/add-member`, {
				method: "POST",
				body: JSON.stringify({ email }),
				headers: { "Content-Type": "application/json" }
			});
			if(!res.ok) throw new Error((await res.json() as { message: string })?.message ?? `Request failed with status ${res.status}`);
			let { success, email: e, username }: { success: boolean, email: string, username: string } = await res.json();
			if(!success) throw new Error("Failed to add member");
			alert(`Added ${e}: ${username}`);
		} catch (error) {
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
		return () => document.body.inert = false;
	});

	function send<E extends keyof ClientPayloads>(event: E, ...[payload]: ClientPayloads[E] extends void ? [payload?: undefined] : [payload: ClientPayloads[E]]){
		socket?.send(JSON.stringify({ event, payload }));
	}
</script>
{#if isOwner}
	<h1 onblur={e => changeRoomName(e.currentTarget.innerText)} onkeydown={e => e.key == "Enter" && e.currentTarget.blur()} bind:innerText={roomInfo.name} contenteditable></h1>
	<button onclick={transferOwnership}>transfer ownership</button>
	<button onclick={deleteRoom}>delete room</button>
	<h2>members</h2>
	<button onclick={addMember}>add member</button>
	<button onclick={kickMember}>kick member</button>
{:else}
	<h1>{roomInfo.name}</h1>
	<button onclick={leaveRoom}>leave room</button>
	<h2>members</h2>
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