import { DotCMSBasicContentlet } from "@dotcms/types";
import DotCMSImage, { type DotCMSImageSrc } from "@/components/DotCMSImage";

// `body` is a plain TextArea field on this content type, not a Block Editor
// field, so it renders as text rather than through DotCMSBlockEditorRenderer.
type ArticleAdviseProps = DotCMSBasicContentlet & {
  title: string;
  body?: string;
  // The REST payload returns `image` as a bare asset identifier string, but
  // GraphQL and related-content queries return an object. DotCMSImage's
  // resolveSrc handles both, so the prop keeps the union.
  image?: DotCMSImageSrc;
};

export default function ArticleAdvise({ title, body, image }: ArticleAdviseProps) {
  return (
    <article className="article-advise">
      <h2 className="article-advise__title">{title}</h2>
      {body && <p className="article-advise__body">{body}</p>}
      {image && (
        <div className="article-advise__image">
          <DotCMSImage src={image} width={800} height={450} alt={title || "Article"} />
        </div>
      )}
    </article>
  );
}
