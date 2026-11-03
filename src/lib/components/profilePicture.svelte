<script lang="ts">
    type Props = { size?: string | number; override?: string, user: App.User | { name: string, image: string | null }, style?: string };
	let { size, user, style, override }: Props = $props();

	let image = $derived(user.image || "");
	let username = $derived(user.name || "");
	let fallbackSrc = $derived(`https://api.dicebear.com/10.x/initials/svg?seed=${username}`);
	let src = $derived(override || image || fallbackSrc);
</script>
<img
	height={size || 40}
	alt="{username} profile picture"
	{src}
	{style}
	referrerpolicy="no-referrer"
	onerror={(e) => {
		const target = e.currentTarget as HTMLImageElement;
		if (target.src !== fallbackSrc) {
			target.src = fallbackSrc;
		}
	}}
>
<style>
	img{
		aspect-ratio: 1;
		border-radius: 50%;
	}
</style>
