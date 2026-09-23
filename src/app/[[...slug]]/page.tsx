import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDotCMSPage, getPageSeoDescription } from "@/utils/getDotCMSPage";
import { navigationQuery } from "@/utils/queries";
import { buildPageMetadata } from "@/utils/seo";
import { webPageJsonLd } from "@/utils/structuredData";
import JsonLd from "@/components/JsonLd";
import { Page } from "@/views/Page";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PERSONA_COOKIE, resolvePersona } from "@/utils/personaTargeting";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function resolvePath(slug?: string[]): string {
  return `/${(slug ?? []).join("/")}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = resolvePath(slug);

  try {
    const [pageData, seoDescription] = await Promise.all([
      getDotCMSPage(path),
      getPageSeoDescription(path),
    ]);
    if (!pageData) return { title: "Not found" };

    const page = pageData.pageAsset?.page;
    return buildPageMetadata({
      title: page?.friendlyName || page?.title,
      description: seoDescription,
      path,
    });
  } catch {
    return { title: "Not found" };
  }
}

export default async function CatchAllPage({ params, searchParams }: PageProps) {
  const [{ slug }, sp, cookieStore] = await Promise.all([
    params,
    searchParams,
    cookies(),
  ]);
  const path = resolvePath(slug);

  const { personaId } = resolvePersona(
    sp,
    cookieStore.get(PERSONA_COOKIE)?.value
  );

  const [pageContent, seoDescription] = await Promise.all([
    getDotCMSPage(path, { content: { navigation: navigationQuery } }, personaId),
    getPageSeoDescription(path),
  ]);
  if (!pageContent) return notFound();

  const layout = pageContent.pageAsset?.layout;
  const navItems = pageContent.content?.navigation?.children ?? [];
  const page = pageContent.pageAsset?.page;

  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          path,
          title: page?.friendlyName || page?.title,
          description: seoDescription,
          type: path.startsWith("/about") ? "AboutPage" : "WebPage",
        })}
      />
      {layout?.header && <Header navItems={navItems} />}
      <Page pageContent={pageContent} />
      {layout?.footer && <Footer />}
    </>
  );
}
