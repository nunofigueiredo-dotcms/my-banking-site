"use client";

import { DotCMSLayoutBody } from "@dotcms/react";
import { useEditablePage } from "@/utils/useEditablePage";
import type { DotCMSComposedPageResponse, DotCMSPageResponse } from "@dotcms/types";
import { pageComponents } from "@/components/content-types";
import SiteDisclosures from "@/components/SiteDisclosures";
import { dotCMSMode } from "@/utils/dotCMSClient";

interface PageProps {
  pageContent: DotCMSComposedPageResponse<DotCMSPageResponse>;
}

export function Page({ pageContent }: PageProps) {
  const editablePage = useEditablePage(pageContent);
  const pageAsset = editablePage?.pageAsset;
  return (
    <main className="page-main">
      <DotCMSLayoutBody
        page={pageAsset}
        components={pageComponents}
        mode={dotCMSMode}
      />
      <SiteDisclosures />
    </main>
  );
}
