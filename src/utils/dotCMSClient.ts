import { createDotCMSClient } from "@dotcms/client";

export const dotCMSClient = createDotCMSClient({
  dotcmsUrl: process.env.NEXT_PUBLIC_DOTCMS_HOST as string,
  authToken: process.env.NEXT_PUBLIC_DOTCMS_AUTH_TOKEN as string,
  siteId: process.env.NEXT_PUBLIC_DOTCMS_SITE_ID,
});
