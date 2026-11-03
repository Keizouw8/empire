<script lang="ts">
    type Props = { size?: string | number; override?: string, user: App.User | { name: string, image: string | null }, style?: string };
	let { size, user, style, override }: Props = $props();

	let image = $derived(user.image || "");
	let username = $derived(user.name || "");
	let src = $derived(override || image || `https://api.dicebear.com/10.x/initials/svg?seed=${username}`);
</script>
<img height={size || 40} alt="{username} profile picture" {src} {style} >
<style>
	img{
		aspect-ratio: 1;
		border-radius: 50%;
	}
</style>