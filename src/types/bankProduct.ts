import type { DotCMSURLContentMap } from "@dotcms/types";

/**
 * The BankProduct contentlet as it arrives on a urlmap detail page.
 *
 * `body` is a plain Textarea on this type (not a Block Editor), so unlike
 * BlogURLContentMap it stays a string and needs no Omit override.
 */
export type BankProductURLContentMap = DotCMSURLContentMap & {
  urlTitle?: string;
  family?: string;
  summary?: string;
  rateLabel?: string;
  rateValue?: string;
  benefits?: string;
  legalNote?: string;
  ctaText?: string;
  ctaLink?: string;
};
