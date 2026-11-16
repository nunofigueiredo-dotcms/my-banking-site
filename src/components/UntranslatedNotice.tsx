import { getPageMeta } from "@/utils/getDotCMSPage";
import { getRequestLanguage, getTranslator } from "@/utils/languages";

interface UntranslatedNoticeProps {
  path: string;
  /**
   * The language of what the page shows, when it isn't the page's own: a
   * blog post's detail page exists in English only, but the post itself may
   * be translated.
   */
  shownLanguageId?: number;
}

/**
 * Shown when the visitor chose a language the page isn't translated into
 * yet, so dotCMS fell back to the English version. Country sites never show
 * it: their pages exist in their own language only.
 */
export default async function UntranslatedNotice({ path, shownLanguageId }: UntranslatedNoticeProps) {
  const { languageId, country } = await getRequestLanguage();
  if (country) return null;

  const shown = shownLanguageId ?? (await getPageMeta(path)).languageId;
  if (!shown || shown === languageId) return null;

  const t = await getTranslator();
  return (
    <div role="note" className="w-full bg-muted text-muted-foreground text-sm">
      <p className="max-w-6xl mx-auto px-4 py-2">{t("notice.untranslated")}</p>
    </div>
  );
}
