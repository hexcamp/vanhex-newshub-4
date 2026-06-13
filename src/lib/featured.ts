import type { AppBskyFeedDefs, AppBskyFeedPost } from '@atcute/bluesky';
import { hasSession, getSession, agent } from '$lib/auth/oauth.svelte';
import { Client, type DatetimeString } from '@atproto/lex';
import * as ca from '../lexicons/ca';

export function makeFeaturedPost(post: AppBskyFeedDefs.PostView) {
	return async function doFeatured(e) {
		console.log('Jim doFeatured', post.uri, post, e);
		if (!agent) {
			console.log('Jim doFeatured no agent');
			return;
		}
		e.preventDefault();

		const oauthSession = getSession();

		const lexClient = new Client(oauthSession);

		const uri = post.uri;
		const cid = post.cid;

		const createdAt = new Date().toISOString() as DatetimeString;

		try {
			const res = await lexClient.create(ca.vanhex['6kg6ryiaaaaa'].feed.featured, {
				subject: { uri, cid },
				createdAt,
			});

			console.log('Jim4');
			if (!res.success) {
				throw new Error(JSON.stringify(res));
			}
		} catch (err) {
			console.error('Jim5', err);
			// document.getElementById('post-form-error').innerText = `${err}`;
			// postButton.removeAttribute('aria-busy');
			return;
		}
	};
}
