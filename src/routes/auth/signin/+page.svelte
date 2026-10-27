<script lang="ts">
	import { signIn } from "#lib/auth-client.ts";
    import { goto } from "$app/navigation";

	let auth = $state({
		email: "",
		password: ""
	});

	async function signup(){
		await signIn.email({
			callbackURL: "/",
			fetchOptions: {
				onSuccess(){
					goto("/");
				},
				onError(context: any){
					alert(context.error.message);
				}
			},
			...auth
		});
	}
</script>
<h1>signin</h1>
<label for="email">email</label><input type="email" placeholder="email" id="email" bind:value={auth.email}>
<label for="password">password</label><input type="password" placeholder="password" id="password" bind:value={auth.password}>
<button onclick={signup}>submit</button>
<br>
<a href="/auth/signup">signup</a>