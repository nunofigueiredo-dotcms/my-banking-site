import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDotCMSPage } from "@/utils/getDotCMSPage";
import { blogDetailGraphQL } from "@/utils/queries";
import { buildPageMetadata } from "@/utils/seo";
import { languageAlternates } from "@/utils/hreflang";
import { blogPostingJsonLd, toIsoDate } from "@/utils/structuredData";
import { getRelatedPosts } from "@/utils/blogPosts";
import JsonLd from "@/components/JsonLd";
import { DetailPage } from "@/views/DetailPage";
import type { BlogURLContentMap } from "@/types/blog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UntranslatedNotice from "@/components/UntranslatedNotice";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

/** The blog post a detail page shows. */
function postOf(pageData: Awaited<ReturnType<typeof getDotCMSPage>>): BlogURLContentMap | undefined {
  return pageData?.pageAsset?.urlContentMap as BlogURLContentMap | undefined;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = `/blog/${slug.join("/")}`;

  try {
    const [pageData, alternates] = await Promise.all([
      getDotCMSPage(path, blogDetailGraphQL),
      // Translated or not is the post's language, not the detail page's.
      languageAlternates(path, async (id) => postOf(await getDotCMSPage(path, blogDetailGraphQL, undefined, id))
        ?.conLanguage?.id),
    ]);
    if (!pageData) return { title: "Not found" };

    const urlContentMap = postOf(pageData);
    const title = urlContentMap?.title || "Blog";
    const metadata = buildPageMetadata({
      title,
      description: urlContentMap?.description,
      path: alternates.canonicalPath,
      languages: alternates.languages,
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
  const post = postOf(pageContent);
  const related = await getRelatedPosts(post?.urlTitle);

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
      <UntranslatedNotice path={path} shownLanguageId={post?.conLanguage?.id} />
      <DetailPage pageContent={pageContent} related={related} />
      {layout?.footer && <Footer />}
    </>
  );
}
