"use client";

import { useEffect } from "react";
import { useEditableDotCMSPage } from "@dotcms/react";
import { getUVEState } from "@dotcms/uve";
import type { DotCMSComposedPageResponse, DotCMSPageResponse } from "@dotcms/types";

type PageContent = DotCMSComposedPageResponse<DotCMSPageResponse>;
type EditablePage = ReturnType<typeof useEditableDotCMSPage>;

/**
 * The language a page response is in: a URL-mapped item's (a blog post's)
 * own language, else the page's.
 */
function languageOf(pageContent: EditablePage | PageContent): number | undefined {
  const asset = pageContent?.pageAsset as
    | {
        page?: { conLanguage?: { id?: number } };
        urlContentMap?: { languageId?: number; conLanguage?: { id?: number } };
      }
    | undefined;
  return (
    asset?.urlContentMap?.languageId ??
    asset?.urlContentMap?.conLanguage?.id ??
    asset?.page?.conLanguage?.id
  );
}

/**
 * useEditableDotCMSPage, plus: when an editor switches language in the
 * Universal Visual Editor, reload the page in that language.
 *
 * The editor doesn't reload the page on a language switch. It sends the page
 * in the new language, which updates the content but not the parts rendered
 * on the server (the header's menu, labels and language selector), so they
 * would stay in the old language. Reloading with ?language_id= re-renders
 * them in the new one (see getRequestLanguage).
 */
export function useEditablePage(pageContent: PageContent): EditablePage {
  const editablePage = useEditableDotCMSPage(pageContent);
  const rendered = languageOf(pageContent);
  const shown = languageOf(editablePage);

  useEffect(() => {
    if (!getUVEState() || !shown || !rendered || shown === rendered) return;
    const url = new URL(window.location.href);
    url.searchParams.set("language_id", String(shown));
    window.location.replace(url);
  }, [rendered, shown]);

  return editablePage;
}
