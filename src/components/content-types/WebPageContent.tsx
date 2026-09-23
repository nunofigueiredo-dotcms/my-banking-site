import { DotCMSBlockEditorRenderer } from "@dotcms/react";
import { DotCMSBasicContentlet } from "@dotcms/types";

import type { BlockEditorNode } from "@dotcms/types";
import { toBlocks } from "@/utils/blockEditor";

type WebPageContentProps = DotCMSBasicContentlet & {
  body?: BlockEditorNode | string;
};

function WebPageContent({ body }: WebPageContentProps) {
  const blocks = toBlocks(body);
  return blocks ? (
    <div className="web-page-content">
      <DotCMSBlockEditorRenderer blocks={blocks} />
    </div>
  ) : null;
}

export default WebPageContent;
