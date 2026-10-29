<script lang="ts">
    type Props = { size?: string | number; user: App.User | { name: string, image: string | null }, style?: string };
	let { size, user, style }: Props = $props();

	let image = $derived(user.image || "");
	let username = $derived(user.name || "");
	let src = $derived(image || `https://api.dicebear.com/10.x/initials/svg?seed=${username}`);
</script>
<img height={size || 40} alt="{username} profile picture" {src} {style} >
<style>
	img{
		border-radius: 50%;
	}
</style>