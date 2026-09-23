import { getLatestBlogPosts } from "@/utils/blogPosts";
import BlogListView from "@/components/BlogListView";
import type { DotCMSBasicContentlet } from "@dotcms/types";

export interface BlogCardShow {
  image: boolean;
  date: boolean;
  description: boolean;
}

type BlogListProps = DotCMSBasicContentlet & {
  quantity?: number;
  show?: string;
};

export default async function BlogList(props: BlogListProps) {
  const blogs = await getLatestBlogPosts(props.quantity ?? 0);

  const show: BlogCardShow = {
    image: props.show?.includes("image") ?? true,
    date: props.show?.includes("date") ?? true,
    description: props.show?.includes("description") ?? true,
  };

  return <BlogListView blogs={blogs} show={show} />;
}
