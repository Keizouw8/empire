<script lang="ts">
	import { signUp } from "#lib/auth-client.ts";
    import { goto } from "$app/navigation";

	let auth = $state({
		email: "",
		name: "",
		password: ""
	});

	let confirmPassword = $state("");

	async function signup(){
		if (auth.password != confirmPassword) alert("confirm password doesn't match password");
		await signUp.email({
			fetchOptions: {
				onSuccess(_){
					alert("check your email to verify your account");
					goto("/auth/signin");
				},
				onError(context: any){
					alert(context.error.message);
				}
			},
			...auth
		});
	}
</script>
<h1>sign up</h1>
<label for="name">name</label><br>
<input type="text" id="name" bind:value={auth.name}><br>
<label for="email">email</label><br>
<input type="email" id="email" bind:value={auth.email}><br>
<label for="password">password</label><br>
<input type="password" id="password" bind:value={auth.password}><br>
<label for="password">confirm password</label><br>
<input type="password" id="confirmpassword" bind:value={confirmPassword}><br>
<button onclick={signup}>submit</button><br>
<a href="/auth/signin">sign in</a>