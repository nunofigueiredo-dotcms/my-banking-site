import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDotCMSPage } from "@/utils/getDotCMSPage";
import { navigationQuery } from "@/utils/queries";
import { buildPageMetadata } from "@/utils/seo";
import { BankProductDetailPage } from "@/views/BankProductDetailPage";
import type { BankProductURLContentMap } from "@/types/bankProduct";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = `/produtos/${slug.join("/")}`;

  try {
    const pageData = await getDotCMSPage(path);
    if (!pageData) return { title: "Not found" };

    const item = pageData.pageAsset?.urlContentMap as
      | BankProductURLContentMap
      | undefined;
    return buildPageMetadata({
      title: item?.title ? `${item.title} — Evergreen Contact` : "Produtos",
      description: item?.summary,
      path,
      type: "article",
    });
  } catch {
    return { title: "Not found" };
  }
}

export default async function ProductDetailRoute({ params }: PageProps) {
  const { slug } = await params;
  const path = `/produtos/${slug.join("/")}`;

  const pageContent = await getDotCMSPage(path, {
    content: { navigation: navigationQuery },
  });
  if (!pageContent) return notFound();

  const layout = pageContent.pageAsset?.layout;
  const navItems = pageContent.content?.navigation?.children ?? [];

  return (
    <>
      {layout?.header && <Header navItems={navItems} />}
      <BankProductDetailPage pageContent={pageContent} />
      {layout?.footer && <Footer />}
    </>
  );
}
