<script lang="ts">
	import { BrowserOAuthClient } from '@atproto/oauth-client-browser';
	import { Agent } from '@atproto/api';

	function buildClientID() {
		const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
		if (isLocal) {
			// see https://atproto.com/specs/oauth#localhost-client-development
			return `http://localhost?${new URLSearchParams({
				scope: 'atproto repo:app.bsky.feed.post?action=create',
				redirect_uri: Object.assign(new URL(window.location.origin), {
					hostname: '127.0.0.1',
					pathname: '/login/',
				}).href,
			})}`;
		}
		return `https://${window.location.host}/oauth-client-metadata.json`;
	}
	const clientId = buildClientID();

	let oac; // undefined | BrowserOAuthClient
	let agent; // undefined | Agent   (gets assigned after successful auth)
	let hasSession = $state(false);

	async function setupOAuth() {
		/* Set up the OAuth client */
		try {
			oac = await BrowserOAuthClient.load({
				clientId, // Note: This involves fetching the metadata document. See https://github.com/bluesky-social/atproto/tree/main/packages/oauth/oauth-client-browser#client-metadata for how to avoid this extra round-trip.
				handleResolver: 'https://bsky.social',
			});
			const result = await oac.init();

			if (result) {
				const { session, state } = result;
				if (state != null) {
					console.log(`${session.sub} was successfully authenticated (state: ${state})`);
				} else {
					console.log(`${session.sub} was restored (last active session)`);
				}

				agent = new Agent(session);

				const res = await agent.com.atproto.server.getSession();
				if (!res.success) {
					console.log('getSession failed', res);
					throw new Error(JSON.stringify(res));
				}
				hasSession = true;

				// document.getElementById("welcome-message").innerText = `@${res.data.handle}`;
				// document.getElementById("post-container").style.display = "inherit"; // unhide
				// document.getElementById("logout-nav").style.display = "inherit"; // unhide
			} else {
				console.log('Jim no session');
				// there is no existing session
				// document.getElementById("login-container").style.display = "inherit"; // unhide
				hasSession = false;
			}
		} catch (error) {
			const msg = `An error occured: ${error}`;
			// document.getElementById("loading-error").innerText = msg;
			// document.getElementById("loading-error").style.display = "inherit"; // unhide
		}
	}
	setupOAuth();

	async function doLogin(e) {
		e.preventDefault();
		const identifier = e.target.username.value;
		console.log('Jim doLogin', identifier);
		// const loginButton = document.getElementById('login-button');
		// loginButton.setAttribute('aria-busy', 'true');
		try {
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
</script>

<h1>Login</h1>

{#if hasSession}
	<p>Logged in.</p>
	<p>Try to <a href="/post">post</a> something.</p>
{:else}
	<article id="login-container">
		<h3>Login with the Atmosphere</h3>
		<form id="login-form" onsubmit={doLogin}>
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
