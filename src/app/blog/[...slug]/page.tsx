import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDotCMSPage } from "@/utils/getDotCMSPage";
import { blogDetailGraphQL } from "@/utils/queries";
import { buildPageMetadata } from "@/utils/seo";
import { blogPostingJsonLd } from "@/utils/structuredData";
import JsonLd from "@/components/JsonLd";
import { DetailPage } from "@/views/DetailPage";
import type { BlogURLContentMap } from "@/types/blog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function toIsoDate(value?: number | string): string | undefined {
  if (value === undefined || value === "") return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = `/blog/${slug.join("/")}`;

  try {
    const pageData = await getDotCMSPage(path, blogDetailGraphQL);
    if (!pageData) return { title: "Not found" };

    const urlContentMap = pageData.pageAsset?.urlContentMap as BlogURLContentMap | undefined;
    const title = urlContentMap?.title || "Blog";
    const metadata = buildPageMetadata({
      title,
      description: urlContentMap?.description,
      path,
      type: "article",
    });
    // Post titles are long enough on their own; the "| World Demo Bank" template
    // would push most past the 60 characters search results show.
    return { ...metadata, title: { absolute: title } };
  } catch {
    return { title: "Not found" };
  }
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const path = `/blog/${slug.join("/")}`;

  const pageContent = await getDotCMSPage(path, blogDetailGraphQL);
  if (!pageContent) return notFound();

  const layout = pageContent.pageAsset?.layout;
  const navItems = pageContent.content?.navigation?.children ?? [];
  const post = pageContent.pageAsset?.urlContentMap as BlogURLContentMap | undefined;

  return (
    <>
      {post?.title && (
        <JsonLd
          data={blogPostingJsonLd({
            path,
            title: post.title,
            description: post.description,
            imageUrl: post.image?.idPath,
            datePublished: toIsoDate(post.publishDate),
            dateModified: toIsoDate(post.modDate),
          })}
        />
      )}
      {layout?.header && (
        <Header navItems={navItems} />
      )}
      <DetailPage pageContent={pageContent} />
      {layout?.footer && <Footer />}
    </>
  );
}
