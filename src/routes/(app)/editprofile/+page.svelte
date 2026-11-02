<script lang="ts">
    
	import { client, signOut } from "#lib/auth-client.ts";
    import ProfilePicture from "#lib/components/profilePicture.svelte";

    let { data } = $props();
    
    let user = $state(data.user);
    $inspect(user);

	let saving = $state(false);
	let tempPfp: string | undefined = $state();
	let currentPassword = $state("");
	let newPassword = $state("");
	let confirmPassword = $state("");

	function setImage(e: Event){
		let image = (e.target as HTMLInputElement)?.files?.[0];
		if (image) tempPfp = URL.createObjectURL(image);
	}
	
	async function saveInfo(event: SubmitEvent){
		event.preventDefault();
		saving = true;
		try{
			let res = await fetch("/api/user/edit", {
				method: "POST",
				body: new FormData(event.target as HTMLFormElement)
			});
			if (!res.ok) throw new Error(await res.text().catch(() => "") || `Request failed with status ${res.status}`);
			user = await res.json();
			if(tempPfp) URL.revokeObjectURL(tempPfp);
			tempPfp = undefined;
		} catch (error) {
			console.error(error);
			alert(error instanceof Error ? error.message : "Failed to save profile");
		} finally {
			saving = false;
		}
	}

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
					window.location.href = "/auth/signup";
				}
			}
		});
	}
</script>
<h1>edit profile</h1>
<button onclick={signout}>sign out</button>
<h2>edit info</h2>
<form onsubmit={saveInfo}>
	<label for="pfp">profile picture</label><br>
	<input id="pfp" type="file" name="pfp" accept="image/*" onchange={setImage}><br>
	<ProfilePicture user={user} override={tempPfp} size=80 /><br>
	<label for="name">name</label><br>
	<input id="name" type="text" name="name" bind:value={data.user.name}><br>
	<button type="submit" disabled={saving}>save</button>
</form>
<h2>reset password</h2>
<label for="currentpassword">current password</label><br>
<input type="password" id="currentpassword" bind:value={currentPassword}><br>
<label for="newpassword">new password</label><br>
<input type="password" id="newpassword" bind:value={newPassword}><br>
<label for="confirmpassword">confirm password</label><br>
<input type="password" id="confirmpassword" bind:value={confirmPassword}><br>
<button onclick={resetPassword}>reset</button>