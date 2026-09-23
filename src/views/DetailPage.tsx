"use client";

import DotCMSImage from "@/components/DotCMSImage";
import { DotCMSBlockEditorRenderer, useEditableDotCMSPage } from "@dotcms/react";
import type { DotCMSComposedPageResponse, DotCMSPageResponse } from "@dotcms/types";
import type { BlogURLContentMap } from "@/types/blog";
import Link from "next/link";
import { SITE_NAME } from "@/utils/structuredData";
import type { RelatedPost } from "@/utils/blogPosts";

interface DetailPageProps {
  pageContent: DotCMSComposedPageResponse<DotCMSPageResponse>;
  related?: RelatedPost[];
}

export function DetailPage({ pageContent, related = [] }: DetailPageProps) {
  const editablePage = useEditableDotCMSPage(pageContent);
  const pageAsset = editablePage?.pageAsset;
  const { title, image, body, publishDate } =
    (pageAsset?.urlContentMap as BlogURLContentMap) ?? {};

  return (
    <main className="detail-page">
      <article>
        {title && <h1>{title}</h1>}

        {publishDate && (
          <time className="detail-page__date">
            {new Date(publishDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        )}

        <span className="detail-page__byline">By the {SITE_NAME} Editorial Team</span>

        {image && (
          <div className="detail-page__image">
            <DotCMSImage src={image} width={800} height={400} alt={title || ""} />
          </div>
        )}

        {body?.json && (
          <DotCMSBlockEditorRenderer blocks={body.json} className="detail-page__body" />
        )}

        {related.length > 0 && (
          <section className="detail-page__related" aria-labelledby="related-heading">
            <h2 id="related-heading">Related articles</h2>
            <ul>
              {related.map((post) => (
                <li key={post.href}>
                  <Link href={post.href}>{post.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="detail-page__more">
          Keep reading: <Link href="/blog">more money guides</Link> ·{" "}
          <Link href="/">compare our accounts</Link>
        </p>
      </article>
    </main>
  );
}
