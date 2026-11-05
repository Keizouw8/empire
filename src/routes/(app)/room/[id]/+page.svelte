<script lang="ts">
	import ProfilePicture from "#lib/components/profilePicture.svelte";
    let { data } = $props();
    let isOwner = $derived(data.room.ownerId == data.user.id);
</script>
<h1>{data.room.name}</h1>
<h2>members</h2>
{#if isOwner}
	<button>add member</button>
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
