import { cache } from "react";
import { dotCMSClient, dotCMSLanguageId } from "./dotCMSClient";
import type { DotCMSGraphQLParams } from "@dotcms/types";
import type { DotCMSPageContent } from "@/types/page";

export const getDotCMSPage = cache(
  async (path: string, graphql?: DotCMSGraphQLParams, personaId?: string) => {
    try {
      const pageData = await dotCMSClient.page.get<{
        content: DotCMSPageContent;
      }>(path, {
        ...(graphql ? { graphql } : {}),
        // dotCMS resolves persona-specific content from the page's multi-tree.
        // Without this the UVE persona dropdown proxies here and the preview
        // silently renders the default variant for every persona.
        ...(personaId ? { personaId } : {}),
        ...(dotCMSLanguageId ? { languageId: dotCMSLanguageId } : {}),
      });
      return pageData;
    } catch (e) {
      console.error("ERROR FETCHING PAGE: ", (e as Error).message);
      return null;
    }
  }
);
