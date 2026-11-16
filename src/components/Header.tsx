import Image from "next/image";
import Link from "next/link";
import { Globe } from "lucide-react";
import type { DotCMSNavigationItem } from "@dotcms/types";
import { Button } from "@/components/Button";
import { LOCALES, countrySiteFor, localizeHref } from "@/utils/i18n";
import { getRequestLanguage, getTranslator } from "@/utils/languages";
import { MobileNav, type HeaderLanguage, type HeaderLink } from "./MobileNav";

const DOTCMS_HOST = process.env.NEXT_PUBLIC_DOTCMS_HOST || "http://localhost:8082";
const TRY_FREE_URL = "https://dev.dotcms.com/getting-started/setup/demo-instance";

interface HeaderProps {
  /** The main site's menu (DotNavigation of "/"). Country sites load their own. */
  navItems: DotCMSNavigationItem[];
  logo?: string;
  logoAlt?: string;
}

/** "/about-us" → "nav.about-us": the Language Variable key for a menu item's label. */
function labelKey(href: string): string {
  return `nav.${href.replace(/^\/|\/$/g, "").replace(/\//g, ".")}`;
}

/**
 * A country site's own menu: the pages and folders shown on the menu in its
 * folder, in its language. Called on the Navigation REST API directly: the
 * SDK's nav client sends neither the site nor a language this API reads.
 */
async function countryNavigation(path: string, languageId: number): Promise<HeaderLink[]> {
  const params = new URLSearchParams({ depth: "2", languageId: String(languageId) });
  if (process.env.NEXT_PUBLIC_DOTCMS_SITE_ID) params.set("host_id", process.env.NEXT_PUBLIC_DOTCMS_SITE_ID);
  try {
    const res = await fetch(`${DOTCMS_HOST}/api/v1/nav${path}?${params}`, {
      headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_DOTCMS_AUTH_TOKEN}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const { entity } = (await res.json()) as { entity?: DotCMSNavigationItem };
    return (entity?.children ?? []).map((item) => ({
      href: item.href,
      title: item.title,
      target: item.target || undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * On the main site: the menu in the visitor's language, the country sites
 * (folders in the same dotCMS menu, shown apart) and the language selector.
 * On a country site: that site's own menu and a way back to the main site.
 */
export default async function Header({ navItems, logo, logoAlt = "Logo" }: HeaderProps) {
  const [{ locale, path, country, languageId, uiLanguage }, t] = await Promise.all([
    getRequestLanguage(),
    getTranslator(),
  ]);

  let links: HeaderLink[];
  let countryLinks: HeaderLink[];
  let languages: HeaderLanguage[];

  if (country) {
    links = await countryNavigation(country.path, languageId);
    countryLinks = [{ href: "/", title: t("header.international") }];
    languages = [];
  } else {
    links = navItems
      .filter((item) => !countrySiteFor(item.href))
      .map((item) => ({
        href: localizeHref(item.href, locale),
        title: t(labelKey(item.href), item.title),
        target: item.target || undefined,
      }));
    // Country sites keep their own name ("Deutschland") in every language.
    countryLinks = navItems
      .filter((item) => countrySiteFor(item.href))
      .map((item) => ({ href: item.href, title: item.title, hrefLang: countrySiteFor(item.href)?.hreflang }));
    languages = LOCALES.map((l) => ({
      code: l.code,
      label: l.label,
      short: l.short,
      href: localizeHref(path, l.code),
      active: l.code === uiLanguage,
    }));
  }

  const homeHref = country ? country.path : localizeHref("/", locale);

  return (
    <header className="w-full py-4">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href={homeHref}
            className="flex items-center text-foreground text-xl font-semibold hover:text-primary-dark transition-colors"
          >
            {logo ? (
              <Image
                src={logo}
                alt={logoAlt}
                height={32}
                width={120}
                className="h-8 w-auto"
              />
            ) : (
              "dotCMS"
            )}
            {country && (
              <span className="ml-2 text-sm font-medium text-muted-foreground">{country.label}</span>
            )}
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target={item.target}
                className="text-muted-foreground hover:text-foreground px-4 py-2 rounded-full font-medium transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {countryLinks.length > 0 && (
            <nav
              aria-label={country ? undefined : t("header.countries")}
              className="hidden md:flex items-center gap-1"
            >
              {countryLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  hrefLang={item.hrefLang}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-full font-medium transition-colors"
                >
                  <Globe className="h-4 w-4" aria-hidden="true" />
                  {item.title}
                </Link>
              ))}
            </nav>
          )}
          {languages.length > 0 && (
            <nav
              aria-label={t("header.language")}
              className="hidden md:flex items-center rounded-full border border-border p-0.5 text-sm"
            >
              {languages.map((l) => (
                <Link
                  key={l.code}
                  href={l.href}
                  hrefLang={l.code}
                  lang={l.code}
                  title={l.label}
                  aria-current={l.active ? "true" : undefined}
                  className={
                    l.active
                      ? "px-3 py-1 rounded-full bg-primary text-primary-foreground font-medium"
                      : "px-3 py-1 rounded-full text-muted-foreground hover:text-foreground font-medium"
                  }
                >
                  {l.short}
                </Link>
              ))}
            </nav>
          )}
          <Link
            href={TRY_FREE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:block"
          >
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-full font-medium shadow-sm transition-colors">
              {t("header.cta")}
            </Button>
          </Link>
          <MobileNav
            links={links}
            countryLinks={countryLinks}
            languages={languages}
            labels={{
              menu: t("header.menu"),
              cta: t("header.cta"),
              language: t("header.language"),
              countries: country ? t("header.international") : t("header.countries"),
            }}
            ctaHref={TRY_FREE_URL}
          />
        </div>
      </div>
    </header>
  );
}
