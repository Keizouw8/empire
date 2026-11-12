<script lang="ts">
	import ProfilePicture from "#lib/components/profilePicture.svelte";
    let { data } = $props();
    let isOwner = $derived(data.room.ownerId == data.user.id);

    let socket: WebSocket | null = $state(null);
    let isConnected = $state(false);

	$effect(function(){
		let ws = new WebSocket(`/room/${data.room.id}/ws`);

		ws.onmessage = function(event){
			console.log(event.data);
		}
		
		ws.onopen = function(){
			isConnected = true;
			socket = ws;
		}
		
		ws.onclose = function(){
			isConnected = false;
			socket = null;
		}
		
		return ws.close;
	});

    async function addMember(){
   		let email = prompt("User email")
		if (!email) return;
		try{
			let res = await fetch(`/api/room/${data.room.id}/addmember`, {
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
</script>
<h1>{data.room.name}</h1>
<h2>members</h2>
{#if isOwner}
	<button onclick={addMember}>add member</button>
	<button>kick member</button>
{/if}
{#each data.room.members as member}
	<div style="display: flex; align-items: center;">
		<ProfilePicture user={member} />
		<span>
			{member.name}
			{#if member.id == data.user.id}
				(you)
			{/if}
			{#if member.id == data.room.ownerId}
				👑
			{/if}
		</span>
	</div>
{/each}
