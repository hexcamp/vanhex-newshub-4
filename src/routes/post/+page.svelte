<script lang="ts">
	import { setupOAuth, hasSession, agent, handle } from '$lib/auth/oauth.svelte';
	import { RichText } from '@atproto/api';

	setupOAuth();

	async function doPost(e) {
		console.log('Jim1');
		if (!agent) {
			console.log('Jim2');
			return;
		}
		e.preventDefault();
		const message = document.getElementById('post-text').value.trim();

		const rt = new RichText({ text: message });
		await rt.detectFacets(agent);

		let res;
		try {
			console.log('Jim3');
			res = await agent.com.atproto.repo.createRecord({
				repo: agent.did,
				collection: 'app.bsky.feed.post',
				record: {
					$type: 'app.bsky.feed.post',
					text: message,
					facets: rt.facets,
					createdAt: new Date().toISOString(),
				},
			});

			console.log('Jim4');
			if (!res.success) {
				throw new Error(JSON.stringify(res));
			}
		} catch (err) {
			console.log('Jim5');
			// document.getElementById('post-form-error').innerText = `${err}`;
			// postButton.removeAttribute('aria-busy');
			return;
		}

		/*
		const atUri = res.data.uri;
		const [uriRepo, uriCollection, uriRkey] = atUri.split('/').slice(2);
		const pdsHost = (await agent.sessionManager.getTokenInfo()).aud;

		// hide the "post" screen
		postButton.removeAttribute('aria-busy');
		document.getElementById('post-container').style.display = 'none';

		// show the "success" screen
		document.getElementById('success-pds').href =
			`${pdsHost}xrpc/com.atproto.repo.getRecord?repo=${uriRepo}&collection=app.bsky.feed.post&rkey=${uriRkey}`;
		document.getElementById('success-bsky').href = `https://bsky.app/profile/${uriRepo}/post/${uriRkey}`;
		document.getElementById('success-blacksky').href =
			`https://blacksky.community/profile/${uriRepo}/post/${uriRkey}`;
		document.getElementById('success-pdsls').href = `https://pdsls.dev/${atUri}`;
		document.getElementById('success-container').style.display = 'inherit'; // unhide
		*/
	}
</script>

<h1>Post</h1>

{#if hasSession()}
	<article id="post-container">
		<p>Welcome, <code id="welcome-message">{handle()}</code></p>
		<h3>Compose Post</h3>
		<form id="post-form" on:submit={doPost}>
			<textarea name="post_text" placeholder="What's up?" id="post-text" required autofocus
				>I'm testing the Vanilla JS #ExampleOAuthClient</textarea
			>
			<button id="post-button">Poast!</button>
		</form>
		<br />
		<p id="post-form-error" style="color: #E37474;"></p>
	</article>

	<!-- hidden by default, will be shown if a post has been created -->
	<article id="success-container" style="display: none;">
		<h2>Success!</h2>
		<p>The post record has been created on your PDS. It should be visible at:</p>
		<ul>
			<li>Your PDS's <a id="success-pds" href="#"><code>com.atproto.repo.getRecord</code> API</a></li>
			<li><a id="success-bsky" href="#">The Bluesky web app</a></li>
			<li>Independent Bluesky apps like <a id="success-blacksky" href="#">Blacksky</a></li>
			<li>The <a id="success-pdsls" href="#">PDSls</a> AT Protocol Explorer tool</li>
			<li>...and many other places that speak AT Protocol!</li>
		</ul>
	</article>
{:else}
	<p>You must be logged in to post.</p>
	<p><a href="/login">Go to login page</a></p>
{/if}
