"use client";

import { Button } from "@/components/Button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/Sheet";
import { Globe, Menu } from "lucide-react";
import Link from "next/link";
import { CountryLink } from "./CountryLink";

export interface HeaderLink {
  href: string;
  title: string;
  target?: string;
  hrefLang?: string;
  /** A country site's link: the language its pages exist in (see CountryLink). */
  languageId?: number;
  editorHint?: string;
}

export interface HeaderLanguage {
  code: string;
  label: string;
  short: string;
  href: string;
  active: boolean;
}

interface MobileNavProps {
  links: HeaderLink[];
  /** Country sites, or the way back to the main site when on one. */
  countryLinks: HeaderLink[];
  /** The language selector; empty on a country site, whose language is fixed. */
  languages: HeaderLanguage[];
  labels: { menu: string; cta: string; language: string; countries: string };
  ctaHref: string;
}

export function MobileNav({ links, countryLinks, languages, labels, ctaHref }: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon" className="text-foreground">
          <Menu className="h-7 w-7" />
          <span className="sr-only">{labels.menu}</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="bg-background border-t border-border text-foreground"
      >
        <SheetHeader>
          <SheetTitle className="text-left text-xl font-semibold text-foreground">
            {labels.menu}
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-6 px-4 pb-4">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.target}
              className="text-muted-foreground hover:text-foreground justify-start text-lg py-2"
            >
              {item.title}
            </Link>
          ))}
          {countryLinks.length > 0 && (
            <div className="border-t border-border pt-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                {labels.countries}
              </p>
              {countryLinks.map((item) => (
                <CountryLink
                  key={item.href}
                  href={item.href}
                  hrefLang={item.hrefLang}
                  languageId={item.languageId}
                  editorHint={item.editorHint}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-lg py-2"
                >
                  <Globe className="h-5 w-5" aria-hidden="true" />
                  {item.title}
                </CountryLink>
              ))}
            </div>
          )}
          {languages.length > 0 && (
            <div className="border-t border-border pt-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                {labels.language}
              </p>
              <div className="flex gap-2">
                {languages.map((l) => (
                  <Link
                    key={l.code}
                    href={l.href}
                    hrefLang={l.code}
                    lang={l.code}
                    aria-current={l.active ? "true" : undefined}
                    className={
                      l.active
                        ? "px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium"
                        : "px-4 py-2 rounded-full border border-border text-muted-foreground font-medium"
                    }
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <Link
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-4"
          >
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-full font-medium shadow-sm transition-colors">
              {labels.cta}
            </Button>
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
