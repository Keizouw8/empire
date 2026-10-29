<script lang="ts">
	import ProfilePicture from "#lib/components/profilePicture.svelte";
    let { data } = $props();
	$inspect(data.user);
</script>
<h1>empire</h1>
<a href="/editprofile" style="display: flex; align-items: center;">
	<ProfilePicture user={data.user} />
	{data.user.name}
</a>
<h2>rooms</h2>
{#each data.user.rooms as room}
	<p>{room.name}</p>
{/each}