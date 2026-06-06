<script lang="ts">
	import { setupOAuth, oac, agent, hasSession, logout } from '$lib/auth/oauth.svelte';

	setupOAuth();

	async function doLogin(e) {
		e.preventDefault();
		const identifier = e.target.username.value;
		console.log('Jim doLogin', identifier);
		// const loginButton = document.getElementById('login-button');
		// loginButton.setAttribute('aria-busy', 'true');
		try {
			if (!oac) {
				throw new Error('OAuth client not initialized');
			}
			await oac.signIn(identifier, {
				state: 'some value needed later',
				signal: new AbortController().signal, // Optional, allows to cancel the sign in (and destroy the pending authorization, for better security)
			});
			console.log('Never executed');
		} catch (err) {
			console.error('jim err', err);
			// document.getElementById('login-form-error').innerText = `Login error: ${err}`;
		}
		// loginButton.removeAttribute('aria-busy');
	}

	async function doLogout() {
		logout();
	}
</script>

<h1>Login</h1>

{#if hasSession()}
	<p>Logged in.</p>
	<p>Try to <a href="/post">post</a> something.</p>
	<p><button on:click={doLogout}>Logout</button></p>
{:else}
	<article id="login-container">
		<h3>Login with the Atmosphere</h3>
		<form id="login-form" on:submit={doLogin}>
			<p>Enter your handle to continue</p>
			<fieldset role="group">
				<input
					name="username"
					id="username"
					placeholder="@alice.example.com"
					style="font-family: monospace;"
					required
				/>
				<button id="login-button">Login</button>
			</fieldset>
		</form>
		<p>If you're a Bluesky user, you already have an Atmosphere account.</p>
		<button id="bsky-button" class="secondary" style="width: 100%">Create Account with Bluesky Social</button>
		<p></p>
		<a href="https://atproto.com/guides/self-hosting"
			><button class="secondary outline" style="width: 100%">Other options</button></a
		>
		<p id="login-form-error" style="color: #E37474;"></p>
	</article>
{/if}

<style>
	input {
		width: 80%;
	}
</style>
