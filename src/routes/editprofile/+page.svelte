<script lang="ts">
	import { client, signOut } from "#lib/auth-client.ts";
    import { goto } from "$app/navigation";

    let { data } = $props();
	$inspect(data.user);
	
	let name = $state(data.user.name);
	let currentPassword = $state("");
	let newPassword = $state("");
	let confirmPassword = $state("");

	async function saveInfo(){}

	async function resetPassword(){
		if(newPassword != confirmPassword) return alert("confirm password doesn't match password");
		let { error } = await client.changePassword({ newPassword, currentPassword });
		if (error) return alert(error.message ?? "failed to reset password");
		alert("successfully reset password");
	}
	
	async function signout(){
		await signOut({
			fetchOptions: {
				onSuccess(){
					goto("/auth/signup");
				}
			}
		});
	}
</script>
<h1>edit profile</h1>
<button onclick={signout}>sign out</button>
<h2>edit info</h2>
<label for="name">name</label><br>
<input id="name" placeholder="name" type="text" bind:value={name}><br>
<button onclick={saveInfo}>save</button>
<h2>reset password</h2>
<label for="currentpassword">current password</label><br>
<input type="password" id="currentpassword" bind:value={currentPassword}><br>
<label for="newpassword">new password</label><br>
<input type="password" id="newpassword" bind:value={newPassword}><br>
<label for="confirmpassword">confirm password</label><br>
<input type="password" id="confirmpassword" bind:value={confirmPassword}><br>
<button onclick={resetPassword}>reset</button>