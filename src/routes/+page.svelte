<script lang="ts">
	import { signOut } from "#lib/auth-client.ts";
    import { goto } from "$app/navigation";

    let { data } = $props();
    
	async function signout(){
		await signOut({
			fetchOptions: {
				onSuccess(){
					goto("/auth/signup");
				}
			}
		});
	}

	$inspect(data.user);
</script>
<h1>empire</h1>
<span>{data.user.name}</span>
<i>{data.user.email}</i>
<button onclick={signout}>sign out</button>