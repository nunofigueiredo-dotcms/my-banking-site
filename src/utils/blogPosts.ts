import { blogContentType, dotCMSClient } from "@/utils/dotCMSClient";
import type { Blog } from "@/types/blog";

/**
 * Latest blog posts, newest first. Several posts share a publish date, so title
 * breaks the tie; without an explicit sort each dotCMS instance picks "latest"
 * in its own index order. The search index needs type-prefixed fields, and
 * `_dotraw` for exact text.
 */
export async function getLatestBlogPosts(limit: number): Promise<Blog[]> {
  const result = await dotCMSClient.content
    .getCollection<Blog>(blogContentType)
    .sortBy([
      { field: `${blogContentType}.publishDate`, order: "desc" },
      { field: `${blogContentType}.title_dotraw`, order: "asc" },
    ])
    .limit(limit);
  return result.contentlets;
}

export interface RelatedPost {
  title: string;
  href: string;
}

/** Up to `count` other recent posts, for cross-linking from a post page. */
export async function getRelatedPosts(currentUrlTitle: string | undefined, count = 3): Promise<RelatedPost[]> {
  try {
    const posts = await getLatestBlogPosts(count + 1);
    return posts
      .filter((post) => post.urlTitle !== currentUrlTitle)
      .slice(0, count)
      .map((post) => ({ title: post.title, href: post.urlMap || `/blog/post/${post.urlTitle}` }));
  } catch {
    return [];
  }
}
