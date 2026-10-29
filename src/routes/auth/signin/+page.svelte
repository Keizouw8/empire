<script lang="ts">
	import { signIn, client } from "#lib/auth-client.ts";
    import { goto } from "$app/navigation";

	let auth = $state({
		email: "",
		password: ""
	});

	async function resetPassword(){
		let email = prompt("email to send password reset link:")
		if(!email) return;			
		let { data, error } = await client.requestPasswordReset({ email, redirectTo: "/auth/resetpassword" });
		alert((error || data)!.message);
	}

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
							alert("email is unverified. we've sent a verification link to your email.");
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
<label for="email">email</label><br>
<input type="email" id="email" bind:value={auth.email}><br>
<label for="password">password</label><br>
<input type="password" id="password" bind:value={auth.password}><br>
<button onclick={signup}>submit</button><button onclick={resetPassword}>reset password</button>
<br>
<a href="/auth/signup">sign up</a>