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
	const posts = await ok(
		client.get('app.bsky.feed.getPosts', {
			params: {
				uris: uris,
			},
		}),
	);

	return { posts };
};
