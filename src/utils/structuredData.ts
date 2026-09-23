import { toAbsoluteUrl } from "@/utils/seo";

/**
 * schema.org JSON-LD for every page, so search and AI engines can tell what the
 * site is (a bank), what each page is, and who published it.
 *
 * Each page emits one `@graph`: the bank, the website, the page itself and its
 * breadcrumb trail. Nodes reference each other by `@id` rather than repeating.
 */

type JsonLdNode = Record<string, unknown>;

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "World Demo Bank";

const siteUrl = () => toAbsoluteUrl("/");
const organizationId = () => `${siteUrl()}/#organization`;
const websiteId = () => `${siteUrl()}/#website`;

function organization(): JsonLdNode {
  return {
    "@type": "BankOrCreditUnion",
    "@id": organizationId(),
    name: SITE_NAME,
    url: siteUrl(),
  };
}

function website(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": websiteId(),
    name: SITE_NAME,
    url: siteUrl(),
    inLanguage: "en-US",
    publisher: { "@id": organizationId() },
  };
}

/** Home → each path segment, titled from the segment unless a title is given. */
function breadcrumbs(path: string, title?: string): JsonLdNode {
  const segments = path.split("/").filter(Boolean);
  const items = [{ name: "Home", url: siteUrl() }];
  segments.forEach((segment, i) => {
    const isLast = i === segments.length - 1;
    const name = isLast && title ? title : segment.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
    items.push({ name, url: toAbsoluteUrl(`/${segments.slice(0, i + 1).join("/")}`) });
  });

  return {
    "@type": "BreadcrumbList",
    "@id": `${toAbsoluteUrl(path)}#breadcrumb`,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function graph(...nodes: JsonLdNode[]): JsonLdNode {
  return { "@context": "https://schema.org", "@graph": [organization(), website(), ...nodes] };
}

export function webPageJsonLd({
  path,
  title,
  description,
  type = "WebPage",
}: {
  path: string;
  title?: string;
  description?: string;
  type?: "WebPage" | "CollectionPage" | "AboutPage";
}): JsonLdNode {
  const url = toAbsoluteUrl(path);
  const name = title || SITE_NAME;
  return graph(
    {
      "@type": type,
      "@id": `${url}#webpage`,
      url,
      name,
      ...(description && { description }),
      inLanguage: "en-US",
      isPartOf: { "@id": websiteId() },
      about: { "@id": organizationId() },
      breadcrumb: { "@id": `${url}#breadcrumb` },
    },
    breadcrumbs(path, path === "/" ? undefined : name)
  );
}

export function blogPostingJsonLd({
  path,
  title,
  description,
  imageUrl,
  datePublished,
  dateModified,
}: {
  path: string;
  title: string;
  description?: string;
  imageUrl?: string;
  datePublished?: string;
  dateModified?: string;
}): JsonLdNode {
  const url = toAbsoluteUrl(path);
  return graph(
    {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      url,
      headline: title,
      ...(description && { description }),
      ...(imageUrl && { image: /^https?:\/\//.test(imageUrl) ? imageUrl : toAbsoluteUrl(imageUrl) }),
      ...(datePublished && { datePublished }),
      ...((dateModified || datePublished) && { dateModified: dateModified || datePublished }),
      inLanguage: "en-US",
      author: { "@id": organizationId() },
      publisher: { "@id": organizationId() },
      mainEntityOfPage: url,
      isPartOf: { "@id": websiteId() },
      breadcrumb: { "@id": `${url}#breadcrumb` },
    },
    breadcrumbs(path, title)
  );
}
