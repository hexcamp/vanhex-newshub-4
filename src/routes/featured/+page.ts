import { Client, simpleFetchHandler } from '@atcute/client';
import { isDid, type Did } from '@atcute/lexicons/syntax';

import { PUBLIC_APPVIEW_URL } from '$env/static/public';
import type { PageLoad } from './$types';

import { fetchTimeline, TimelineType } from '$lib/queries/timeline';
import type { TimelinePage } from '$lib/queries/timeline';
import { makeAtUri } from '$lib/types/at-uri';
import { actor, rkey } from '../config';

import { recentRecords } from '$lib/microcosm';

import { getPosts } from '$lib/queries/posts';

export const load: PageLoad = async ({ url, params, fetch, parent }) => {
	const client = new Client({ handler: simpleFetchHandler({ service: PUBLIC_APPVIEW_URL }) });

	const records = await recentRecords('ca.vanhex.6kg6ryiaaaaa.feed.featured');

	console.log('Jim recentRecords', records);

	// const actor = params.actor;
	// const rkey = params.rkey;
	// const actor = 'did:plc:jaa4ygmm55ban3yhsibc3n4m';
	// const rkey = 'van-bc-news';

	/*
	let did: Did;
	if (isDid(actor)) {
		did = actor;
	} else {
		const parentData = await parent();
		did = parentData.feed.creator.did as Did;
	}
	*/

	/*
	const timeline = await fetchTimeline({
		client: client,
		params: {
			type: TimelineType.CUSTOM_FEED,
			feed: makeAtUri(did, 'app.bsky.feed.generator', rkey),
			cursor: url.searchParams.get('cursor') || undefined,
		},
		pageLimit: 100,
	});
	*/

	const uris = records
		.map(
			({
				record: {
					subject: { uri },
				},
			}) => uri,
		)
		.slice(0, 40);

	const posts = await getPosts({ client, uris });

	const items = posts.posts.posts.map((post) => ({ post }));

	return { items };
};
