import Link from "next/link";
import { DotCMSBasicContentlet } from "@dotcms/types";
import DotCMSImage, { type DotCMSImageSrc } from "@/components/DotCMSImage";

/**
 * Visual product / solution / simulator card.
 *
 * Replaces the rich-text cards the homepage used to render through
 * WebPageContent, which had no structure to style: an icon, a headline figure
 * (the rate a bank actually leads with) and a CTA all have their own fields
 * here, so the design can treat them differently instead of rendering one
 * undifferentiated block of prose.
 */

type BankCardProps = DotCMSBasicContentlet & {
  title: string;
  image?: DotCMSImageSrc;
  icon?: string;
  figure?: string;
  figureLabel?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  accent?: string;
};

/** 24px stroke icons, inherit currentColor. Keyed by the `icon` select field. */
const ICONS: Record<string, React.ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5M5.25 9.75V21h13.5V9.75" />,
  shield: <path d="M12 3l7.5 3v5.25c0 4.5-3 8.25-7.5 9.75-4.5-1.5-7.5-5.25-7.5-9.75V6L12 3Z" />,
  piggy: (
    <>
      <path d="M15.75 8.25H18a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3h-.75V21h-3v-2.25h-4.5V21h-3v-3A6 6 0 0 1 9.75 6.75h6" />
      <circle cx="16.5" cy="12" r=".75" fill="currentColor" stroke="none" />
    </>
  ),
  chart: <path d="M3 21h18M6.75 17.25V10.5M12 17.25V4.5M17.25 17.25v-9" />,
  calculator: (
    <>
      <rect x="5.25" y="3" width="13.5" height="18" rx="2" />
      <path d="M8.25 7.5h7.5M8.25 12h.008M12 12h.008M15.75 12h.008M8.25 16.5h.008M12 16.5h.008M15.75 16.5h.008" />
    </>
  ),
  card: (
    <>
      <rect x="2.25" y="5.25" width="19.5" height="13.5" rx="2" />
      <path d="M2.25 9.75h19.5M6 14.25h3" />
    </>
  ),
  briefcase: (
    <>
      <rect x="2.25" y="7.5" width="19.5" height="12.75" rx="2" />
      <path d="M8.25 7.5V5.25a1.5 1.5 0 0 1 1.5-1.5h4.5a1.5 1.5 0 0 1 1.5 1.5V7.5M2.25 12.75h19.5" />
    </>
  ),
  phone: (
    <>
      <rect x="6.75" y="2.25" width="10.5" height="19.5" rx="2" />
      <path d="M11.25 18.75h1.5" />
    </>
  ),
  support: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.75 9.75a2.25 2.25 0 1 1 3 2.122V13.5M12 16.5h.008" />
    </>
  ),
  key: (
    <>
      <circle cx="8.25" cy="15.75" r="3.75" />
      <path d="M10.9 13.1 20.25 3.75M17.25 6.75l2.25 2.25M14.25 9.75l2.25 2.25" />
    </>
  ),
  coins: (
    <>
      <ellipse cx="12" cy="6.75" rx="7.5" ry="3" />
      <path d="M4.5 6.75v10.5c0 1.657 3.358 3 7.5 3s7.5-1.343 7.5-3V6.75M4.5 12c0 1.657 3.358 3 7.5 3s7.5-1.343 7.5-3" />
    </>
  ),
  building: (
    <>
      <path d="M3.75 21V5.25A2.25 2.25 0 0 1 6 3h7.5a2.25 2.25 0 0 1 2.25 2.25V21M15.75 9.75H18a2.25 2.25 0 0 1 2.25 2.25V21M2.25 21h19.5" />
      <path d="M7.5 7.5h.008M11.25 7.5h.008M7.5 11.25h.008M11.25 11.25h.008M7.5 15h.008M11.25 15h.008" />
    </>
  ),
};

function CardIcon({ name }: { name?: string }) {
  const glyph = name ? ICONS[name] : undefined;
  if (!glyph) return null;
  return (
    <span className="bank-card__icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {glyph}
      </svg>
    </span>
  );
}

export default function BankCard({
  title,
  image,
  icon,
  figure,
  figureLabel,
  description,
  ctaText,
  ctaLink,
  accent,
}: BankCardProps) {
  const isHighlight = accent === "highlight";

  return (
    <article
      className={`bank-card${isHighlight ? " bank-card--highlight" : ""}${
        image ? " bank-card--with-image" : ""
      }`}
    >
      {image ? (
        <div className="bank-card__media">
          <div className="bank-card__media__frame">
            <DotCMSImage src={image} width={640} height={360} alt={title || ""} />
          </div>
          <CardIcon name={icon} />
        </div>
      ) : (
        <CardIcon name={icon} />
      )}

      {figure && (
        <p className="bank-card__figure">
          <span className="bank-card__figure-value">{figure}</span>
          {figureLabel && (
            <span className="bank-card__figure-label">{figureLabel}</span>
          )}
        </p>
      )}

      <h3 className="bank-card__title">{title}</h3>
      {description && <p className="bank-card__body">{description}</p>}

      {ctaText && (
        <Link className="bank-card__cta" href={ctaLink || "#"}>
          {ctaText}
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </article>
  );
}
