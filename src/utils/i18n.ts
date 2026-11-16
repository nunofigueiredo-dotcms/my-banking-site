/**
 * How the site picks a language. There are two ways, and they coexist:
 *
 * - Main site, chosen by the visitor. English is served at the root and the
 *   other languages under a prefix (/es/about-us). The same dotCMS page is
 *   requested in the chosen language; anything not translated yet falls back
 *   to English (dotCMS's fallback to the default language).
 *
 * - Country sites, chosen by the URL. Everything under /de is German, whatever
 *   the visitor picked in the selector, because those pages exist in German
 *   only. In dotCMS a country site is a folder ("Show on Menu"), so it appears
 *   as an item in the main menu of every language.
 *
 * dotCMS language IDs differ per instance, so languages are matched by ISO
 * code and their IDs looked up at runtime (utils/languages.ts).
 */
export const LOCALES = [
  { code: "en", iso: "en-us", label: "English", short: "EN" },
  { code: "es", iso: "es-es", label: "Español", short: "ES" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: Locale = "en";

export const COUNTRY_SITES = [
  { path: "/de", iso: "de-de", lang: "de", hreflang: "de-DE", label: "Deutschland" },
] as const;

export type CountrySite = (typeof COUNTRY_SITES)[number];

/** Languages the interface labels are written in: the locales plus each country's. */
export type UiLanguage = Locale | CountrySite["lang"];

/** Request headers set by src/middleware.ts. */
export const LOCALE_HEADER = "x-bank-locale";
export const PATH_HEADER = "x-bank-path";
/** A dotCMS language ID from ?language_id=, which the Universal Visual Editor sends. */
export const LANGUAGE_ID_HEADER = "x-bank-language-id";

export function isLocale(value: string | undefined | null): value is Locale {
  return LOCALES.some((l) => l.code === value);
}

/** "/es/about-us" → { locale: "es", path: "/about-us" }. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const [, first, ...rest] = pathname.split("/");
  if (isLocale(first) && first !== DEFAULT_LOCALE) {
    return { locale: first, path: `/${rest.join("/")}` };
  }
  return { locale: DEFAULT_LOCALE, path: pathname };
}

/** The country site a path belongs to, if any: "/de/ueber-uns" → Deutschland. */
export function countrySiteFor(path: string): CountrySite | undefined {
  return COUNTRY_SITES.find((c) => path === c.path || path.startsWith(`${c.path}/`));
}

/**
 * Prefix an internal link with the visitor's language. External links,
 * country-site links (their language is fixed) and already-prefixed links
 * pass through unchanged.
 */
export function localizeHref(href: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE || !href.startsWith("/") || href.startsWith("//")) return href;
  if (countrySiteFor(href) || splitLocale(href).locale !== DEFAULT_LOCALE) return href;
  return href === "/" ? `/${locale}` : `/${locale}${href}`;
}
