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
<h1>edit profile</h1>
<a href="/editprofile">{data.user.name} <i>{data.user.email}</i></a>
<button onclick={signout}>sign out</button>