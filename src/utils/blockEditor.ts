import type { BlockEditorNode } from "@dotcms/types";

/**
 * Normalizes a Block Editor field from the page API.
 *
 * Depending on the dotCMS build, the page API returns a Block Editor field
 * either as a parsed object or as its JSON string (awesomedemo-dev does the
 * latter). DotCMSBlockEditorRenderer only accepts the object.
 */
export function toBlocks(value?: BlockEditorNode | string): BlockEditorNode | undefined {
  if (!value) return undefined;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as BlockEditorNode;
  } catch {
    return undefined;
  }
}
