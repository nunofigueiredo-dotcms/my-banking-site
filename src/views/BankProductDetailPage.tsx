"use client";

import DotCMSImage from "@/components/DotCMSImage";
import { useEditableDotCMSPage } from "@dotcms/react";
import type { DotCMSComposedPageResponse, DotCMSPageResponse } from "@dotcms/types";
import type { BankProductURLContentMap } from "@/types/bankProduct";

interface BankProductDetailPageProps {
  pageContent: DotCMSComposedPageResponse<DotCMSPageResponse>;
}

export function BankProductDetailPage({ pageContent }: BankProductDetailPageProps) {
  const editablePage = useEditableDotCMSPage(pageContent);
  const pageAsset = editablePage?.pageAsset;
  const item = pageAsset?.urlContentMap as BankProductURLContentMap | undefined;

  // urlContentMap is absent when the URL didn't resolve to a contentlet — a bad
  // slug, or an editor opening the renderer page directly inside UVE. Render a
  // placeholder rather than 404ing, which would make the page uneditable.
  if (!item) {
    return (
      <main className="detail-page">
        <p>Selecione um produto para pré-visualizar esta página.</p>
      </main>
    );
  }

  const { title, image, summary, body, rateLabel, rateValue, benefits, legalNote } = item;
  const items = benefits
    ? benefits.split("\n").map((b) => b.trim()).filter(Boolean)
    : [];
  const pendingLegal = legalNote?.includes("[PLACEHOLDER]");

  return (
    <main className="detail-page">
      <article>
        {title && <h1>{title}</h1>}

        {rateValue && (
          <p className="bank-product__rate">
            <span className="bank-product__rate-value">{rateValue}</span>
            {rateLabel && <span className="bank-product__rate-label">{rateLabel}</span>}
          </p>
        )}

        {image && (
          <div className="detail-page__image">
            <DotCMSImage src={image} width={800} height={400} alt={title || ""} />
          </div>
        )}

        {summary && <p className="detail-page__lead">{summary}</p>}
        {typeof body === "string" && body && <p>{body}</p>}

        {items.length > 0 && (
          <ul className="bank-product__benefits">
            {items.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
        )}

        {pendingLegal && (
          <p className="bank-product__legal bank-product__legal--todo">
            TODO — informação legal por preencher
          </p>
        )}
      </article>
    </main>
  );
}
