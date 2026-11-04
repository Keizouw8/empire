<script lang="ts">
	import ProfilePicture from "#lib/components/profilePicture.svelte";
    let { data } = $props();
</script>
<h1>{data.room.name}</h1>
<h2>members</h2>
{#each data.room.members as member}
	<ProfilePicture user={member} />
	<p>
		{#if member.id == data.room.ownerId}
			👑
		{/if}
		{member.name}
		{#if member.id == data.user.id}
			(you)
		{/if}
	</p>
{/each}