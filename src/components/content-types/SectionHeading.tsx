import { DotCMSBasicContentlet } from "@dotcms/types";

/**
 * Section heading with an optional eyebrow label.
 *
 * Section titles used to be authored as Block Editor h2 + paragraph, which gave
 * the design nothing to hook onto. Splitting the eyebrow, title and subtitle
 * into fields lets each row announce itself the way a bank's site does.
 */

type SectionHeadingProps = DotCMSBasicContentlet & {
  title: string;
  eyebrow?: string;
  subtitle?: string;
};

export default function SectionHeading({
  title,
  eyebrow,
  subtitle,
}: SectionHeadingProps) {
  return (
    <header className="section-heading">
      {eyebrow && <p className="section-heading__eyebrow">{eyebrow}</p>}
      <h2 className="section-heading__title">{title}</h2>
      {subtitle && <p className="section-heading__subtitle">{subtitle}</p>}
    </header>
  );
}
