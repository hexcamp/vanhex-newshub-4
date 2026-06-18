import type { AppBskyFeedDefs } from '@atcute/bluesky';
import { type Client, ClientResponseError, ok } from '@atcute/client';
import type { ResourceUri } from '@atcute/lexicons';

export interface GetPostsReturn {
	posts: AppBskyFeedDefs.PostView[];
}

export const getPosts = async ({
	client,
	uris,
}: {
	client: Client;
	uris: ResourceUri[];
}): Promise<GetPostsReturn> => {
	const uris1 = [...uris].slice(0, 20);
	const posts1 = await ok(
		client.get('app.bsky.feed.getPosts', {
			params: {
				uris: uris1,
			},
		}),
	);
	const uris2 = [...uris].slice(20, 40);
	let posts2 = [];
	if (uris2.length > 0) {
		posts2 = await ok(
			client.get('app.bsky.feed.getPosts', {
				params: {
					uris: uris2,
				},
			}),
		);
	}

	const posts = { posts: [...posts1.posts, ...posts2.posts] };

	return { posts };
};
