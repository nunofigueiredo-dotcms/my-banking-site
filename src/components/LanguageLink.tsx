"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { getUVEState } from "@dotcms/uve";

interface LanguageLinkProps {
  href: string;
  hrefLang?: string;
  lang?: string;
  title?: string;
  "aria-current"?: "true";
  /** The dotCMS language the link leads to. */
  languageId?: number;
  /** What to tell an editor whose editor language isn't that one. */
  editorHint?: string;
  className?: string;
  children: ReactNode;
}

/**
 * A link that changes language: a language selector pill, or a country site
 * (whose pages exist in its own language only). For visitors it's an
 * ordinary link.
 *
 * Inside the Universal Visual Editor, the editor decides the language: it
 * keeps its own when a link is followed, and the page runs in a sandboxed
 * frame that can't change it. Following the link would show the wrong
 * language (or, for a country site, the editor's "error occurred while
 * loading the page" screen). So there, unless the editor is already in that
 * language, the link stays put and says to switch the editor's language.
 */
export function LanguageLink({ languageId, editorHint, children, ...linkProps }: LanguageLinkProps) {
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
      <Link {...linkProps} onClick={handleClick}>
        {children}
      </Link>
      {showHint && (
        <span
          role="status"
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-border bg-background p-3 text-sm font-normal text-foreground shadow-lg"
        >
          {editorHint}
        </span>
      )}
    </span>
  );
}
