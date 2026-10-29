<script lang="ts">
	import { client } from "#lib/auth-client.ts";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";

	let token = $derived(page.url.searchParams.get("token") ?? "");
	let newPassword = $state("");
	let confirmPassword = $state("");

	async function resetPassword(){
		if(newPassword != confirmPassword) return alert("confirm password doesn't match password");
		let { error } = await client.resetPassword({ newPassword, token });
		if (error) return alert(error.message ?? "failed to reset password");
		goto("/auth/signin");
	}
</script>
<h1>reset password</h1>
<label for="newpassword">new password</label><br>
<input type="text" id="newpassword" bind:value={newPassword}><br>
<label for="confirmpassword">confirm password</label><br>
<input type="text" id="confirmpassword" bind:value={confirmPassword}><br>
<button onclick={resetPassword}>reset</button>