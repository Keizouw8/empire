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
					switch (context.error.code) {
						case ("EMAIL_NOT_VERIFIED"):
							alert("Email is unverified. We've sent a verification link to your email.");
							break;
						default: alert(context.error.message);
					}
				}
			},
			...auth
		});
	}
</script>
<h1>sign in</h1>
<label for="email">email</label><input type="email" placeholder="email" id="email" bind:value={auth.email}>
<label for="password">password</label><input type="password" placeholder="password" id="password" bind:value={auth.password}>
<button onclick={signup}>submit</button>
<br>
<a href="/auth/signup">sign up</a>