import { NextResponse, type NextRequest } from "next/server";
import { PERSONA_COOKIE, personaFromCampaign } from "@/utils/personaTargeting";
import {
  TAGS_COOKIE,
  accrueArticle,
  articleSlug,
  parseAccruedTags,
  personaFromTags,
  serializeAccruedTags,
} from "@/utils/tagAccrual";
import {
  DEFAULT_LOCALE,
  LANGUAGE_ID_HEADER,
  LOCALE_HEADER,
  PATH_HEADER,
  countrySiteFor,
  splitLocale,
} from "@/utils/i18n";

/**
 * Two jobs, for every page request:
 *
 * 1. Language (see src/utils/i18n.ts). /es/about-us is served by the same
 *    route as /about-us, with the language passed down in request headers;
 *    the browser keeps the /es/ URL. /en/… redirects to the unprefixed URL,
 *    and a prefix in front of a country site (/es/de) is dropped, because a
 *    country site's language is fixed.
 *
 * 2. Persona, on the homepage, About Us and the blog only (see applyPersona).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { locale, path } = splitLocale(pathname);

  const isEnglishPrefix = pathname === "/en" || pathname.startsWith("/en/");
  if (isEnglishPrefix || (locale !== DEFAULT_LOCALE && countrySiteFor(path))) {
    const url = request.nextUrl.clone();
    url.pathname = isEnglishPrefix ? pathname.slice(3) || "/" : path;
    return NextResponse.redirect(url, 308);
  }

  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, locale);
  headers.set(PATH_HEADER, path);
  // The Universal Visual Editor loads pages with ?language_id= when an editor
  // switches language; that wins over the URL prefix.
  const languageId = request.nextUrl.searchParams.get("language_id");
  if (languageId && /^\d+$/.test(languageId)) {
    headers.set(LANGUAGE_ID_HEADER, languageId);
  } else {
    headers.delete(LANGUAGE_ID_HEADER);
  }

  let response: NextResponse;
  if (path === pathname) {
    response = NextResponse.next({ request: { headers } });
  } else {
    const url = request.nextUrl.clone();
    url.pathname = path;
    response = NextResponse.rewrite(url, { request: { headers } });
  }

  if (path === "/" || path === "/about-us" || path === "/blog" || path.startsWith("/blog/")) {
    applyPersona(request, response, path);
  }
  return response;
}

/**
 * Persists a visitor's persona for the rest of the session.
 *
 * Two things can assign one. A campaign parameter is explicit and immediate —
 * the visitor arrived from a mortgage ad, so they are a Mortgage Seeker. Tag
 * accrual is behavioural: every tagged article they read adds its tags to a
 * weighted profile, and once that profile leans clearly enough towards one
 * persona they are assigned to it, the way dotCMS assigns a persona from a
 * visitor's accrued tags when it serves the pages itself.
 *
 * The page itself resolves the persona per request, but a Server Component
 * cannot set cookies — so both writes happen here.
 */
function applyPersona(request: NextRequest, response: NextResponse, path: string) {
  const params = request.nextUrl.searchParams;

  // An explicit ?persona= override wins, then the campaign keywords.
  const override = params.get("persona") ?? undefined;
  const campaignPersona =
    override ?? personaFromCampaign(params.get("utm_campaign") ?? undefined);

  if (campaignPersona) {
    response.cookies.set(PERSONA_COOKIE, campaignPersona, {
      path: "/",
      sameSite: "lax",
      httpOnly: false, // readable in the browser so the demo can show it
    });
    return;
  }

  // No campaign signal: accrue tags from the article being read, and assign a
  // persona once the accrued profile is decisive.
  const slug = articleSlug(path);
  if (!slug) return;

  const accrued = accrueArticle(
    parseAccruedTags(request.cookies.get(TAGS_COOKIE)?.value),
    slug
  );

  response.cookies.set(TAGS_COOKIE, serializeAccruedTags(accrued), {
    path: "/",
    sameSite: "lax",
    httpOnly: false, // readable in the browser so the demo can show the profile
  });

  // An existing assignment stands: a visitor who arrived on a campaign should
  // not be re-bucketed by one incidental article.
  if (request.cookies.get(PERSONA_COOKIE)?.value) return;

  const persona = personaFromTags(accrued);
  if (persona) {
    response.cookies.set(PERSONA_COOKIE, persona, {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
    });
  }
}

export const config = {
  // Every page, but not Next.js assets, dotCMS images (/dA, proxied by
  // next.config.ts), API routes or files with an extension. An earlier
  // match-everything matcher broke every route, so assets stay excluded.
  matcher: ["/((?!_next/|dA/|api/|.*\\.[a-zA-Z0-9]+$).*)"],
};
