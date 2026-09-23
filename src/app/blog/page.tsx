import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildSlots } from "@dotcms/react";
import { getDotCMSPage, getPageSeoDescription } from "@/utils/getDotCMSPage";
import { navigationQuery } from "@/utils/queries";
import { buildPageMetadata } from "@/utils/seo";
import { webPageJsonLd } from "@/utils/structuredData";
import JsonLd from "@/components/JsonLd";
import { BlogListingPage } from "@/views/BlogListingPage";
import BlogList from "@/components/content-types/BlogList";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PATH = "/blog";
const FALLBACK_DESCRIPTION = "Read our latest articles.";

function getBlogTitle(page?: { friendlyName?: string; title?: string }): string {
  const pageTitle = page?.friendlyName || page?.title;
  return pageTitle ? `${pageTitle} - Blog` : "Blog";
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [pageData, seoDescription] = await Promise.all([
      getDotCMSPage(PATH, { content: { navigation: navigationQuery } }),
      getPageSeoDescription(PATH),
    ]);
    if (!pageData) return { title: "Not found" };

    const page = pageData.pageAsset?.page;
    return buildPageMetadata({
      title: getBlogTitle(page),
      description: seoDescription || FALLBACK_DESCRIPTION,
      path: PATH,
    });
  } catch {
    return { title: "Not found" };
  }
}

export default async function BlogPage() {
  const [pageContent, seoDescription] = await Promise.all([
    getDotCMSPage(PATH, { content: { navigation: navigationQuery } }),
    getPageSeoDescription(PATH),
  ]);
  if (!pageContent) return notFound();

  const layout = pageContent.pageAsset?.layout;
  const navItems = pageContent.content?.navigation?.children ?? [];

  const slots = await buildSlots(pageContent.pageAsset.containers, {
    BlogList,
  });

  const page = pageContent.pageAsset?.page;

  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          path: PATH,
          title: getBlogTitle(page),
          description: seoDescription || FALLBACK_DESCRIPTION,
          type: "CollectionPage",
        })}
      />
      {layout?.header && <Header navItems={navItems} />}
      <BlogListingPage pageContent={pageContent} slots={slots} />
      {layout?.footer && <Footer />}
    </>
  );
}
