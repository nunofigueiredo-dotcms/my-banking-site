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
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
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
    return response;
  }

  // No campaign signal: accrue tags from the article being read, and assign a
  // persona once the accrued profile is decisive.
  const slug = articleSlug(request.nextUrl.pathname);
  if (!slug) return response;

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
  if (request.cookies.get(PERSONA_COOKIE)?.value) return response;

  const persona = personaFromTags(accrued);
  if (persona) {
    response.cookies.set(PERSONA_COOKIE, persona, {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
    });
  }

  return response;
}

export const config = {
  // The homepage and top-level pages, where a campaign can arrive, plus the
  // blog, where reading an article accrues its tags.
  matcher: ["/", "/about-us", "/blog/:path*"],
};
