<script lang="ts">
	import ProfilePicture from "#lib/components/profilePicture.svelte";
    import { goto } from "$app/navigation";
	let { data } = $props();

	async function createRoom(){
		let name = prompt("Room name")
		if (!name) return;
		try{
			let res = await fetch("/api/room/create", {
				method: "POST",
				body: JSON.stringify({ name }),
				headers: { "Content-Type": "application/json" }
			});
			if(!res.ok) throw new Error((await res.json() as { message: string })?.message ?? `Request failed with status ${res.status}`);
			let { success, id }: { success: boolean, id: string } = await res.json();
			if(!success) throw new Error("Failed to create room");
			goto(`/room/${id}`);
		}catch (error){
			console.error(error);
			alert(error instanceof Error ? error.message : "Failed to save profile");
		}
	}
</script>
<h1>empire</h1>
<a href="/editprofile" style="display: flex; align-items: center;">
	<ProfilePicture user={data.user} />
	{data.user.name}
</a>
<h2>rooms</h2>
<button onclick={createRoom}>create room</button>
{#each data.user.rooms as room}
	<div>
		<a href="/room/{room.id}">{room.name}</a>
	</div>
{/each}