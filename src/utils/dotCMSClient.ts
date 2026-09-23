import { createDotCMSClient } from "@dotcms/client";
import type { DotCMSPageRendererMode } from "@dotcms/types";

// The client validates `dotcmsUrl` on construction, so a missing host would
// throw at import time and break the build wherever dotCMS isn't configured
// (CI, a preview deploy). Fall back to a placeholder: requests fail at runtime
// and getDotCMSPage's try/catch turns that into a 404 rather than a crash.
const DOTCMS_HOST =
  process.env.NEXT_PUBLIC_DOTCMS_HOST || "http://localhost:8082";

export const dotCMSClient = createDotCMSClient({
  dotcmsUrl: DOTCMS_HOST,
  authToken: process.env.NEXT_PUBLIC_DOTCMS_AUTH_TOKEN || "not-configured",
  siteId: process.env.NEXT_PUBLIC_DOTCMS_SITE_ID,
});

// Content authored in a non-default language is invisible without this: the
// page API falls back to language 1 and a pt-PT page 404s while the content is
// perfectly fine. Unset means language 1, which is what bank.com relies on.
export const dotCMSLanguageId = process.env.NEXT_PUBLIC_DOTCMS_LANGUAGE_ID;

// DotCMSLayoutBody defaults to "production" when no mode is passed, which
// skips the data-dot-* attributes UVE's edit overlay needs — so this must be
// threaded through explicitly rather than relying on the default.
export const dotCMSMode = (process.env.NEXT_PUBLIC_DOTCMS_MODE ??
  "production") as DotCMSPageRendererMode;
