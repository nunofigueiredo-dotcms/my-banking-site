import { getPageMeta } from "./getDotCMSPage";
import { DEFAULT_LOCALE, LOCALES, localizeHref } from "./i18n";
import { getRequestLanguage, localeLanguageId } from "./languages";

export interface LanguageAlternates {
  /** The URL search engines should index for this page. */
  canonicalPath: string;
  /** hreflang → path, for <link rel="alternate" hreflang>. */
  languages: Record<string, string>;
}

/**
 * hreflang alternates for a page.
 *
 * A main-site page lists the languages it is actually translated into: with
 * fallback on, dotCMS answers /es/blog with the English page, and that must
 * not be announced as Spanish. An untranslated /es/… URL is canonicalised to
 * the English one, so search engines don't index a duplicate.
 *
 * A country-site page has one language, its own.
 *
 * `languageOf` says which language dotCMS answers in when asked for one. It
 * defaults to the page's; a URL-mapped page (a blog post) passes the
 * content's instead, since its detail page exists in English only.
 */
export async function languageAlternates(
  path: string,
  languageOf: (languageId: number) => Promise<number | undefined> = async (id) =>
    (await getPageMeta(path, id)).languageId
): Promise<LanguageAlternates> {
  const { locale, country } = await getRequestLanguage();
  if (country) {
    return { canonicalPath: path, languages: { [country.hreflang]: path } };
  }

  const defaultId = await localeLanguageId(DEFAULT_LOCALE);
  const translated = await Promise.all(
    LOCALES.map(async (l) => {
      if (l.code === DEFAULT_LOCALE) return true;
      const id = await localeLanguageId(l.code);
      if (id === defaultId) return false; // the instance doesn't have this language
      return (await languageOf(id)) === id;
    })
  );

  const languages: Record<string, string> = {};
  LOCALES.forEach((l, i) => {
    if (translated[i]) languages[l.code] = localizeHref(path, l.code);
  });
  languages["x-default"] = path;

  const isTranslated = translated[LOCALES.findIndex((l) => l.code === locale)];
  return { canonicalPath: isTranslated ? localizeHref(path, locale) : path, languages };
}
