"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { getUVEState } from "@dotcms/uve";

interface CountryLinkProps {
  href: string;
  hrefLang?: string;
  /** The dotCMS language the country's pages exist in. */
  languageId?: number;
  /** What to tell an editor whose editor language isn't the country's. */
  editorHint?: string;
  className?: string;
  children: ReactNode;
}

/**
 * A link to a country site. For visitors it's an ordinary link.
 *
 * Inside the Universal Visual Editor, navigating keeps the editor's language,
 * and a country's pages exist in its own language only, so following the
 * link in any other language ends on the editor's "error occurred while
 * loading the page" screen. The editor also won't switch to a language the
 * current page doesn't have, and the page runs in a sandboxed frame that
 * can't open the editor anywhere else. So there the link stays put and says
 * where to open the country site instead.
 */
export function CountryLink({ href, hrefLang, languageId, editorHint, className, children }: CountryLinkProps) {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!showHint) return;
    const timer = setTimeout(() => setShowHint(false), 8000);
    return () => clearTimeout(timer);
  }, [showHint]);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const editor = getUVEState();
    if (!editor || !languageId || !editorHint) return;
    if (Number(editor.languageId) === languageId) return;
    event.preventDefault();
    setShowHint(true);
  }

  return (
    <span className="relative inline-flex">
      <Link href={href} hrefLang={hrefLang} className={className} onClick={handleClick}>
        {children}
      </Link>
      {showHint && (
        <span
          role="status"
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-border bg-background p-3 text-sm text-foreground shadow-lg"
        >
          {editorHint}
        </span>
      )}
    </span>
  );
}
