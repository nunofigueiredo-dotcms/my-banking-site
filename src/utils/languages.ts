import { cache } from "react";
import { headers } from "next/headers";
import { dotCMSClient, dotCMSLanguageId } from "./dotCMSClient";
import {
  DEFAULT_LOCALE,
  LANGUAGE_ID_HEADER,
  LOCALES,
  LOCALE_HEADER,
  PATH_HEADER,
  countrySiteFor,
  isLocale,
  type CountrySite,
  type Locale,
  type UiLanguage,
} from "./i18n";

const DOTCMS_HOST = process.env.NEXT_PUBLIC_DOTCMS_HOST || "http://localhost:8082";

/** The default language's ID: NEXT_PUBLIC_DOTCMS_LANGUAGE_ID, else 1. */
const DEFAULT_LANGUAGE_ID = Number(dotCMSLanguageId) || 1;

interface DotCMSLanguage {
  id: number;
  isoCode: string;
  language: string;
  countryCode?: string;
}

/**
 * The instance's languages by ISO code ("es-es"). IDs differ between
 * instances, so they are read from dotCMS (and cached for an hour).
 */
const dotCMSLanguages = cache(async (): Promise<Record<string, DotCMSLanguage>> => {
  try {
    const res = await fetch(`${DOTCMS_HOST}/api/v2/languages`, {
      headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_DOTCMS_AUTH_TOKEN}` },
      next: { revalidate: 3600 },
    });
    const { entity } = (await res.json()) as { entity: DotCMSLanguage[] };
    return Object.fromEntries(entity.map((l) => [l.isoCode.toLowerCase(), l]));
  } catch {
    return {};
  }
});

/** dotCMS language IDs by ISO code ("es-es" → 2). */
async function languageIds(): Promise<Record<string, number>> {
  const languages = await dotCMSLanguages();
  return Object.fromEntries(Object.entries(languages).map(([iso, l]) => [iso, l.id]));
}

/**
 * A country site's language: its dotCMS ID, and its name as the visual
 * editor's language menu shows it ("German - DE").
 */
export async function countryLanguage(country: CountrySite): Promise<{ id: number; editorName: string }> {
  const language = (await dotCMSLanguages())[country.iso];
  if (!language) return { id: DEFAULT_LANGUAGE_ID, editorName: country.label };
  const editorName = language.countryCode
    ? `${language.language} - ${language.countryCode}`
    : language.language;
  return { id: language.id, editorName };
}

/** The dotCMS language ID for a locale; the default language if the instance lacks it. */
export async function localeLanguageId(locale: Locale): Promise<number> {
  if (locale === DEFAULT_LOCALE) return DEFAULT_LANGUAGE_ID;
  const iso = LOCALES.find((l) => l.code === locale)?.iso ?? "";
  return (await languageIds())[iso] ?? DEFAULT_LANGUAGE_ID;
}

export interface RequestLanguage {
  /** The visitor's choice on the main site (from the URL prefix). */
  locale: Locale;
  /** The path without the language prefix: "/es/about-us" → "/about-us". */
  path: string;
  /** Set on a country site, whose language is fixed. */
  country?: CountrySite;
  /** The dotCMS language to request content in. */
  languageId: number;
  /** The language of the interface labels, and of <html lang>. */
  uiLanguage: UiLanguage;
}

/** The language of the current request (see src/middleware.ts). Server only. */
export const getRequestLanguage = cache(async (): Promise<RequestLanguage> => {
  const h = await headers();
  const headerLocale = h.get(LOCALE_HEADER);
  const locale = isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE;
  const path = h.get(PATH_HEADER) || "/";

  // A country site's language is fixed by its URL.
  const country = countrySiteFor(path);
  if (country) {
    const { id } = await countryLanguage(country);
    return { locale, path, country, languageId: id, uiLanguage: country.lang };
  }

  // The Universal Visual Editor asks for a language with ?language_id=.
  const requested = Number(h.get(LANGUAGE_ID_HEADER));
  if (requested) {
    const ids = await languageIds();
    const match = LOCALES.find((l) => ids[l.iso] === requested);
    return { locale, path, languageId: requested, uiLanguage: match?.code ?? DEFAULT_LOCALE };
  }

  return { locale, path, languageId: await localeLanguageId(locale), uiLanguage: locale };
});

// ---------------------------------------------------------------------------
// Interface labels
// ---------------------------------------------------------------------------

/**
 * Defaults for the interface labels. Editors override any of them in dotCMS
 * with a Language Variable (Settings → Languages) named "bank." + the key,
 * so menus and buttons are translated without a code change.
 */
const DEFAULT_LABELS: Record<string, Partial<Record<UiLanguage, string>>> = {
  "header.cta": { en: "Try for Free", es: "Pruébalo gratis", de: "Kostenlos testen" },
  "header.menu": { en: "Navigation", es: "Navegación", de: "Navigation" },
  "header.language": { en: "Language", es: "Idioma", de: "Sprache" },
  "header.countries": { en: "Country sites", es: "Sitios por país", de: "Länderseiten" },
  "header.international": {
    en: "International site",
    es: "Sitio internacional",
    de: "Internationale Website",
  },
  // Shown in the visual editor only; {country} and {language} are filled in.
  "editor.countryLanguage": {
    en: "{country} is edited in its own language. Switch the editor's language (top right) to {language}, then click {country} again.",
    es: "{country} se edita en su propio idioma. Cambia el idioma del editor (arriba a la derecha) a {language} y vuelve a hacer clic en {country}.",
    de: "{country} wird in der eigenen Sprache bearbeitet. Stellen Sie die Sprache des Editors (oben rechts) auf {language} um und klicken Sie erneut auf {country}.",
  },
  "notice.untranslated": {
    en: "This page isn't available in your language yet, so it's shown in English.",
    es: "Esta página aún no está disponible en español, así que se muestra en inglés.",
    de: "Diese Seite ist noch nicht auf Deutsch verfügbar und wird auf Englisch angezeigt.",
  },
};

const LABEL_PREFIX = "bank.";

interface LanguageVariable {
  key: string;
  value: string;
}

/**
 * The site's Language Variables in one language, by key. They live on the
 * System Host; the SDK limits a collection to the client's site unless
 * includeSystemHost() is called.
 */
const languageVariables = cache(async (languageId: number): Promise<Record<string, string>> => {
  try {
    const result = await dotCMSClient.content
      .getCollection<LanguageVariable>("Languagevariable")
      .query(`+Languagevariable.key:${LABEL_PREFIX}*`)
      .includeSystemHost()
      .language(languageId)
      .limit(200);
    return Object.fromEntries(result.contentlets.map((v) => [v.key, v.value]));
  } catch {
    return {};
  }
});

export type Translate = (key: string, fallback?: string) => string;

/**
 * A translate function for the current request's language: the dotCMS
 * Language Variable if an editor set one, else the default above, else the
 * fallback (e.g. a menu item's own title), else English.
 */
export async function getTranslator(): Promise<Translate> {
  const { languageId, uiLanguage } = await getRequestLanguage();
  const variables = await languageVariables(languageId);
  return (key, fallback) =>
    variables[LABEL_PREFIX + key] ??
    DEFAULT_LABELS[key]?.[uiLanguage] ??
    fallback ??
    DEFAULT_LABELS[key]?.en ??
    key;
}
