<script lang="ts">
	import { signUp } from "#lib/auth-client.ts";
    import { goto } from "$app/navigation";

	let auth = $state({
		email: "",
		name: "",
		password: ""
	});

	async function signup(){
		await signUp.email({
			fetchOptions: {
				onSuccess(_){
					alert("Check your email to verify your account.");
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
<label for="name">name</label><input type="text" placeholder="name" id="name" bind:value={auth.name}>
<label for="email">email</label><input type="email" placeholder="email" id="email" bind:value={auth.email}>
<label for="password">password</label><input type="password" placeholder="password" id="password" bind:value={auth.password}>
<button onclick={signup}>submit</button>
<br>
<a href="/auth/signin">sign in</a>