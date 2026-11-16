import { cache } from "react";
import { headers } from "next/headers";
import { dotCMSClient } from "./dotCMSClient";
import { UVE_MODE_HEADER } from "./i18n";
import { getRequestLanguage } from "./languages";
import type { DotCMSGraphQLParams, DotCMSPageRequestParams } from "@dotcms/types";
import type { DotCMSPageContent } from "@/types/page";

/**
 * The page version to request: the working version inside the Universal
 * Visual Editor (set by src/middleware.ts from its ?mode=), so editors see
 * drafts and unpublished changes; otherwise dotCMS's default, the live
 * version.
 */
async function requestMode(): Promise<Pick<DotCMSPageRequestParams, "mode">> {
  const mode = (await headers()).get(UVE_MODE_HEADER);
  return mode === "EDIT" || mode === "PREVIEW" ? { mode } : {};
}

/**
 * A dotCMS page in the current request's language (see utils/languages.ts),
 * or in `languageId` when given. Without a language the page API answers in
 * the default language, so a page that exists only in German 404s.
 */
export const getDotCMSPage = cache(
  async (
    path: string,
    graphql?: DotCMSGraphQLParams,
    personaId?: string,
    languageId?: number
  ) => {
    // Outside the try: reading the request headers is how Next.js learns the
    // route is dynamic, and that signal must not be caught below.
    const language = languageId ?? (await getRequestLanguage()).languageId;
    const mode = await requestMode();
    try {
      const pageData = await dotCMSClient.page.get<{
        content: DotCMSPageContent;
      }>(path, {
        ...(graphql ? { graphql } : {}),
        // dotCMS resolves persona-specific content from the page's multi-tree.
        // Without this the UVE persona dropdown proxies here and the preview
        // silently renders the default variant for every persona.
        ...(personaId ? { personaId } : {}),
        languageId: language,
        ...mode,
      });
      return pageData;
    } catch (e) {
      console.error("ERROR FETCHING PAGE: ", (e as Error).message);
      return null;
    }
  }
);

export interface PageMeta {
  seoDescription?: string;
  /**
   * The language of the version dotCMS returned. With fallback to the default
   * language switched on, asking for Spanish returns the English page when
   * there is no Spanish one, and this is how to tell.
   */
  languageId?: number;
}

/**
 * The page's SEO description and language. The SDK's default page query
 * selects neither, and adding a `page` GraphQL fragment to the main request
 * switches container content to GraphQL too (dropping Block Editor bodies),
 * so they're fetched apart.
 */
export const getPageMeta = cache(async (path: string, languageId?: number): Promise<PageMeta> => {
  const language = languageId ?? (await getRequestLanguage()).languageId;
  const mode = await requestMode();
  try {
    const pageData = await dotCMSClient.page.get(path, {
      graphql: { page: "seodescription conLanguage { id }" },
      languageId: language,
      ...mode,
    });
    const page = pageData.pageAsset?.page as
      | { seodescription?: string; conLanguage?: { id?: number } }
      | undefined;
    return { seoDescription: page?.seodescription || undefined, languageId: page?.conLanguage?.id };
  } catch {
    return {};
  }
});

export async function getPageSeoDescription(path: string): Promise<string | undefined> {
  return (await getPageMeta(path)).seoDescription;
}
