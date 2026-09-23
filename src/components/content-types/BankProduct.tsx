import Link from "next/link";
import { DotCMSBasicContentlet } from "@dotcms/types";
import DotCMSImage, { type DotCMSImageSrc } from "@/components/DotCMSImage";

/**
 * A retail banking product — account, card, loan, deposit or insurance.
 *
 * The rate is the element a bank leads with, so `rateValue` renders above the
 * product name rather than inside the body copy. `legalNote` is deliberately
 * rendered as a visible TODO while it still carries a [PLACEHOLDER] marker:
 * regulatory fine print must come from a human, and a silently dropped field
 * would let the page ship looking complete.
 */

type BankProductProps = DotCMSBasicContentlet & {
  title: string;
  urlTitle?: string;
  family?: string;
  summary?: string;
  image?: DotCMSImageSrc;
  rateLabel?: string;
  rateValue?: string;
  benefits?: string;
  legalNote?: string;
  ctaText?: string;
  ctaLink?: string;
};

export default function BankProduct({
  title,
  urlTitle,
  summary,
  image,
  rateLabel,
  rateValue,
  benefits,
  legalNote,
  ctaText,
  ctaLink,
}: BankProductProps) {
  const items = benefits
    ? benefits.split("\n").map((b) => b.trim()).filter(Boolean)
    : [];
  const href = ctaLink || (urlTitle ? `/produtos/${urlTitle}` : "#");
  const pendingLegal = legalNote?.includes("[PLACEHOLDER]");

  return (
    <article className="bank-product">
      {image && (
        <div className="bank-product__media">
          <DotCMSImage src={image} width={640} height={360} alt={title || ""} />
        </div>
      )}

      {rateValue && (
        <p className="bank-product__rate">
          <span className="bank-product__rate-value">{rateValue}</span>
          {rateLabel && (
            <span className="bank-product__rate-label">{rateLabel}</span>
          )}
        </p>
      )}

      <h3 className="bank-product__title">{title}</h3>
      {summary && <p className="bank-product__summary">{summary}</p>}

      {items.length > 0 && (
        <ul className="bank-product__benefits">
          {items.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
      )}

      {ctaText && (
        <Link className="bank-product__cta" href={href}>
          {ctaText}
          <span aria-hidden="true">→</span>
        </Link>
      )}

      {pendingLegal && (
        <p className="bank-product__legal bank-product__legal--todo">
          TODO — informação legal por preencher
        </p>
      )}
    </article>
  );
}
