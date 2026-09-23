import type { Metadata } from "next";

/**
 * The public origin, used for canonical URLs, Open Graph and JSON-LD.
 * Falls back to Vercel's production domain when NEXT_PUBLIC_SITE_URL isn't set.
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "";
}

export function toAbsoluteUrl(path: string): string {
  const base = getBaseUrl().replace(/\/$/, "");
  const pathStr = path.startsWith("/") ? path : `/${path}`;
  return pathStr === "/" ? base : `${base}${pathStr}`;
}

/** Shown in social previews when a page has no image of its own. */
const DEFAULT_OG_IMAGE = "/og-default.jpg";

export function buildPageMetadata({
  title,
  description,
  path,
  imageUrl,
  type = "website",
}: {
  title?: string;
  description?: string;
  path?: string;
  imageUrl?: string;
  type?: "website" | "article";
}): Metadata {
  const url = toAbsoluteUrl(path || "/") || undefined;
  const image = toAbsoluteUrl(imageUrl || DEFAULT_OG_IMAGE);
  return {
    title: title || "Page",
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
