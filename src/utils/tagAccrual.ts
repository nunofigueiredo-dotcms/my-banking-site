/**
 * Behavioural persona assignment from article reads.
 *
 * This mirrors, in the frontend, what dotCMS does natively when it serves the
 * pages itself: every tagged page a visitor reads accrues its tags onto them,
 * and once the accrued profile leans clearly towards one persona they are
 * assigned to it.
 *
 * It lives here rather than in dotCMS because the rules engine cannot see
 * these visits. dotCMS accrues tags per *visitor session*, keyed on the
 * JSESSIONID it sets when it serves a page — but bank.com's pages are served
 * by this app, and the page API is called server-side with a token, so dotCMS
 * only ever sees an anonymous machine request. There is also no conditionlet
 * that reads accrued tags, so even with the visits visible no rule could act
 * on them (dotCMS rules fire on request and behaviour signals — see
 * dev.dotcms.com/docs/author/personalization/rule-conditions/condition-types).
 *
 * Keep ARTICLE_TAGS in sync with the `tags` field on the Blog items in dotCMS,
 * and PERSONA_TAGS with the `tags` field on the Persona items.
 */

import { PERSONAS, type PersonaKey } from "./personaTargeting";

/** Tags on each blog article, as authored in dotCMS. */
const ARTICLE_TAGS: Record<string, readonly string[]> = {
  "rate-locks-explained": ["mortgage", "rates", "home buying"],
  "down-payment-how-much": ["mortgage", "down payment", "first-time buyer"],
  "cash-flow-gaps": ["business", "cash flow", "lending"],
  "same-day-ach-payroll": ["business", "payments", "payroll"],
  "cd-ladder-basics": ["savings", "cd", "strategy"],
  "apy-vs-interest-rate": ["savings", "apy", "rates"],
  "chequing-vs-savings-key-differences": [
    "account types",
    "banking",
    "savings account",
  ],
  "5-ways-to-save-more-each-month": ["savings", "strategy", "savings account"],
  "what-is-digital-banking": ["banking", "account types"],
};

/** The "Other Tags" field on each persona in dotCMS. */
const PERSONA_TAGS: Record<PersonaKey, readonly string[]> = {
  MortgageSeeker: [
    "mortgage",
    "home buying",
    "first-time buyer",
    "down payment",
    "rates",
    "lending",
  ],
  BusinessOwner: [
    "business",
    "cash flow",
    "payroll",
    "payments",
    "lending",
    "strategy",
  ],
  SavingsShopper: [
    "savings",
    "apy",
    "rates",
    "cd",
    "savings account",
    "account types",
  ],
};

/** Cookie holding the accrued tag counts, as `tag:count` pairs. */
export const TAGS_COOKIE = "bank_tags";

/**
 * How many tag matches a persona needs before the visitor is assigned to it.
 * One article is usually enough — a reader of "Rate Locks Explained" picks up
 * three Mortgage Seeker tags — while a single incidental tag (a savings
 * article mentioning "rates") is not, which keeps a passing click from
 * rewriting the homepage.
 */
const ASSIGNMENT_THRESHOLD = 3;

export type AccruedTags = Record<string, number>;

/** Reads the weighted tag cloud out of its cookie. */
export function parseAccruedTags(cookieValue?: string): AccruedTags {
  if (!cookieValue) return {};
  const tags: AccruedTags = {};
  for (const pair of cookieValue.split("|")) {
    const idx = pair.lastIndexOf(":");
    if (idx <= 0) continue;
    const tag = decodeURIComponent(pair.slice(0, idx));
    const count = Number.parseInt(pair.slice(idx + 1), 10);
    if (tag && Number.isFinite(count) && count > 0) tags[tag] = count;
  }
  return tags;
}

/**
 * Serialises the tag cloud back into a cookie value. Tags are not encoded
 * here: Next encodes the cookie value on write, so encoding first would
 * double-encode a tag containing a space ("home buying" -> "home%2520buying").
 */
export function serializeAccruedTags(tags: AccruedTags): string {
  return Object.entries(tags)
    .map(([tag, count]) => `${tag}:${count}`)
    .join("|");
}

/** The article slug for a blog path, or undefined if it is not an article. */
export function articleSlug(pathname: string): string | undefined {
  const match = pathname.match(/^\/blog\/post\/([^/]+)\/?$/);
  const slug = match?.[1];
  return slug && slug in ARTICLE_TAGS ? slug : undefined;
}

/** Adds an article's tags to the cloud, incrementing counts like dotCMS does. */
export function accrueArticle(
  tags: AccruedTags,
  slug: string
): AccruedTags {
  const accrued = { ...tags };
  for (const tag of ARTICLE_TAGS[slug] ?? []) {
    accrued[tag] = (accrued[tag] ?? 0) + 1;
  }
  return accrued;
}

/**
 * Picks the persona whose tags best match the accrued cloud, weighted by how
 * often each tag was accrued. Returns undefined below the threshold, and on a
 * tie — an ambiguous profile should leave the visitor on default content
 * rather than guess.
 */
export function personaFromTags(tags: AccruedTags): PersonaKey | undefined {
  const scores = (Object.keys(PERSONA_TAGS) as PersonaKey[]).map((persona) => {
    const score = PERSONA_TAGS[persona].reduce(
      (total, tag) => total + (tags[tag] ?? 0),
      0
    );
    return { persona, score };
  });

  scores.sort((a, b) => b.score - a.score);
  const [best, runnerUp] = scores;

  if (!best || best.score < ASSIGNMENT_THRESHOLD) return undefined;
  if (runnerUp && runnerUp.score === best.score) return undefined;
  return best.persona;
}

/** True when the key names a persona that exists on bank.com. */
export function isPersonaKey(value: string): value is PersonaKey {
  return value in PERSONAS;
}
