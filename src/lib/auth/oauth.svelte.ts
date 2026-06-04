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

export let oac: undefined | BrowserOAuthClient;
export let agent: undefined | Agent; //   (gets assigned after successful auth)
let hasSessionState = $state(false);
let handleState = $state('');

export async function setupOAuth() {
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
			hasSessionState = true;
			handleState = res.data.handle;

			// document.getElementById("welcome-message").innerText = `@${res.data.handle}`;
			// document.getElementById("post-container").style.display = "inherit"; // unhide
			// document.getElementById("logout-nav").style.display = "inherit"; // unhide
		} else {
			console.log('Jim no session');
			// there is no existing session
			// document.getElementById("login-container").style.display = "inherit"; // unhide
			hasSessionState = false;
		}
	} catch (error) {
		const msg = `An error occured: ${error}`;
		// document.getElementById("loading-error").innerText = msg;
		// document.getElementById("loading-error").style.display = "inherit"; // unhide
	}
}

export function hasSession(): boolean {
	return hasSessionState;
}

export function handle(): boolean {
	return handleState;
}

export function logout() {
	if (!oac) {
		throw new Error('OAuth client not initialized');
	}
	oac.revoke(agent.did).then(() => {
		agent = undefined;
		hasSessionState = false;
	});
}
