<script lang="ts">
    let { data } = $props();
	$inspect(data.user);
</script>
<h1>empire</h1>
<a href="/editprofile">{data.user.name}</a>
<h2>rooms</h2>
{#each data.user.rooms as room}
	<p>{room.name}</p>
{/each}