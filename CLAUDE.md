# CLAUDE.md

This project is a dotCMS frontend render with Next.js, for the `bank.com` site
(a personalization demo — see `docs/BANK-PERSONALIZATION-DEMO.md` at the
workspace root for the full persona/content/rules writeup).

## Commands

```bash
npm run dev      # Development server (port 3000)
npm run build    # Production build
npm run lint     # ESLint
```

Run from the `generaldemos` workspace root as `npm run dev:bank` to use the shared
node_modules; see that root's `package.json` for the sibling sites' scripts.

No test suite is configured.

## Environment Variables

Required in `.env.local` (see `.env.local.example`):
```
NEXT_PUBLIC_DOTCMS_HOST=http://localhost:8082
NEXT_PUBLIC_DOTCMS_AUTH_TOKEN=<read-only token, scoped to Pages/Folders/Assets/Content>
NEXT_PUBLIC_DOTCMS_SITE_ID=4afebb3f5a60baed95fa8e55e1038087
NEXT_PUBLIC_DOTCMS_MODE=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

The same site also runs as `worlddemobank.com` on awesomedemo-dev
(`https://awesomedemo-dev.dotcms.dev`, site id `746fd4eddfb0a5a9e9769850b05f0dea`,
language 1). Point `.env.local` there and add `NEXT_PUBLIC_DOTCMS_BLOG_TYPE=BankBlog`.
That instance already had unrelated `Banner`, `Blog` and `Product` types, so bank.com's
versions live there as `BankBanner`, `BankBlog` and `BankProductCard`; the component
registry maps both names. It also returns Block Editor fields as JSON strings, which
`src/utils/blockEditor.ts` normalizes.

## Key Patterns

- All dotCMS types come from `@dotcms/types`; no `any` types
- Path alias `@/*` → `src/*`
- Tailwind CSS 4 + Radix UI/Shadcn components
- `generateMetadata()` builds per-page metadata; JSON-LD (`src/utils/structuredData.ts`,
  rendered by `src/components/JsonLd.tsx`) is emitted by the catch-all, blog listing and
  blog post routes — `BankOrCreditUnion` + `WebSite` + the page (`WebPage`/`AboutPage`/
  `CollectionPage`/`BlogPosting`) + `BreadcrumbList`. The bank name comes from
  `NEXT_PUBLIC_SITE_NAME` (default "World Demo Bank")

## Content-type components

Registered in `src/components/content-types/index.tsx`, keyed by dotCMS content-type
variable:

- `Banner` — full-width hero/CTA band (title, caption, image, link)
- `BankCard` — visual product/solution/simulator card: image, icon (12-option inline
  SVG set), a headline `figure`/`figureLabel` (a bank leads with the rate, so this
  renders larger than the title), description, CTA
- `SectionHeading` — eyebrow + title + subtitle for a row
- `Blog` → `BlogCard`, `Product` → `ProductCard`, `webPageContent` → `WebPageContent`
  (renders a Block Editor doc), `ArticleAdvise`

**A file-based container only accepts the content types that have a matching
`<type>.vtl` file in its folder** (e.g. `//bank.com/application/containers/default/`
needed `bankcard.vtl` and `sectionheading.vtl` published alongside `webpagecontent.vtl`
before `BankCard`/`SectionHeading` could be placed there — otherwise dotCMS 400s with
"Content type 'X' is not allowed in this container"). Since the site is headless,
those VTL files only need to be valid for the Velocity fallback and UVE; the real
rendering happens in the React components above.

## Personalization

The homepage (`/`) is personalized by dotCMS content-type `persona`: Mortgage Seeker,
Business Owner, Savings Shopper, plus an unpersonalized default. Same page, same
containers — each persona swaps in different `Banner`/`BankCard`/`SectionHeading`
contentlets via dotCMS's multi-tree personalization.

**dotCMS's own site rules do not personalize this app.** The `@dotcms/client` SDK
calls the page API server-side with an API token and no visitor cookie, so dotCMS
sees a fresh anonymous request every time and its `PersonaActionlet` rules never
attach a persona to anyone. The rules exist on bank.com and work against dotCMS's
own Velocity site (`:8082`), but not through this app.

Targeting is therefore resolved locally, mirroring those rules' campaign keywords:

- `src/utils/personaTargeting.ts` — `utm_campaign` keyword → persona keyTag map
  (the page API accepts a keyTag in place of the persona id, and keyTags are the
  same on every instance). **Keep
  these keywords in sync with the dotCMS rules** ("Persona: `<name>` — campaign &
  intent" on bank.com); they're intentionally duplicated so the site personalizes
  headlessly while the rules stay the documented source of truth.
- `src/middleware.ts` — resolves the persona per request and writes it to a
  `bank_persona` cookie so the assignment survives the rest of the session (a
  Server Component can't set cookies). The persona part only runs for `/`,
  `/about-us` and `/blog/*`. The matcher itself covers every page (for the
  language prefix, below) but excludes `_next/`, `dA/`, `api/` and files with
  an extension: an earlier match-everything matcher returned an empty 200 for
  every route, so keep assets excluded.
- `src/app/[[...slug]]/page.tsx` resolves precedence (UVE's
  `com.dotmarketing.persona.id` → `?persona=` override → `?utm_campaign=` → the
  cookie) and passes the result to `getDotCMSPage(path, graphql, personaId)`.

Test a persona end to end:
```
curl -c jar.txt "http://localhost:3000/?utm_campaign=mortgage" -o /dev/null
curl -b jar.txt "http://localhost:3000/"   # persona persists, no parameter needed
```

## Languages and country sites (worlddemobank.com)

Two ways of choosing a language coexist (`src/utils/i18n.ts`):

- **Main site, chosen by the visitor.** English at the root, Spanish under
  `/es/…`. The middleware strips the prefix and passes the language in request
  headers; `getRequestLanguage()` (`src/utils/languages.ts`) turns it into a
  dotCMS language ID, looked up by ISO code because IDs differ per instance.
  The same dotCMS page is requested in that language. The instance falls back
  to English for anything untranslated; `UntranslatedNotice` says so, and
  `utils/hreflang.ts` only announces languages a page really has (an
  untranslated `/es/…` URL is canonicalised to the English one).
- **Country sites, chosen by the URL.** `/de` is a dotCMS folder of
  German-only pages and content. Everything under it is requested in German
  whatever the selector says, and `/es/de/…` redirects to `/de/…`. The folder
  is "Show on Menu" (title "Deutschland"), so it appears in the main menu of
  every language; the header shows those items apart, with a globe icon. On a
  country site the header shows that folder's own menu (Navigation REST API)
  and a link back to the international site, and no language selector.

The Universal Visual Editor's `?language_id=` wins over the URL prefix on the
main site. Header labels are dotCMS Language Variables (`bank.*` keys, System
Host), with defaults in `languages.ts`; menu items use `bank.nav.<path>`.

Content is provisioned by `docs/bank-languages.py` in the generaldemos
workspace (Spanish versions of the home and About Us pages, the `/de` folder,
its pages and content, and the language variables). To add a country, add it
to `COUNTRY_SITES` and create its folder and pages in its language.
