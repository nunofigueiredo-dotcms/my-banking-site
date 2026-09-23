/**
 * Campaign-to-persona targeting for the bank.com personalization demo.
 *
 * dotCMS site rules already map `utm_campaign` to a persona, but those rules
 * only fire for requests dotCMS serves itself. This app calls the page API
 * server-side with an API token and no visitor cookie, so dotCMS sees a fresh
 * anonymous request every time and never assigns a persona. We therefore
 * resolve the campaign here and pass the persona explicitly to the page API.
 *
 * Keep the campaign keywords in sync with the dotCMS rules
 * ("Persona: <name> — campaign & intent" on bank.com).
 */

export const PERSONA_COOKIE = "bank_persona";

/** Persona identifiers as created on bank.com. */
export const PERSONAS = {
  MortgageSeeker: "0011c4e777742403b4c74f1ebf36599c",
  BusinessOwner: "c03b0053a91ea923e81587cfe9aa8381",
  SavingsShopper: "a67976af3737b32008defbdd3d17ee23",
} as const;

export type PersonaKey = keyof typeof PERSONAS;

/**
 * Keywords are deliberately specific enough that none is a substring of
 * another: a bare "business" and a bare "savings" both matched
 * "business-savings-account", and because every rule fires on every page the
 * last one to run won the assignment. Keep new keywords non-overlapping, and
 * keep this list identical to the conditions on the bank.com rules.
 */
const CAMPAIGN_KEYWORDS: Record<PersonaKey, readonly string[]> = {
  MortgageSeeker: ["mortgage", "home-loan", "preapproval", "refinance"],
  BusinessOwner: ["business-banking", "merchant", "sba", "payroll"],
  SavingsShopper: ["savings-account", "apy", "high-yield", "cd-rates"],
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Maps a utm_campaign value to a persona key, or undefined if none match. */
export function personaFromCampaign(campaign?: string): PersonaKey | undefined {
  if (!campaign) return undefined;
  const needle = campaign.toLowerCase();
  for (const [persona, keywords] of Object.entries(CAMPAIGN_KEYWORDS) as [
    PersonaKey,
    readonly string[],
  ][]) {
    if (keywords.some((k) => needle.includes(k))) return persona;
  }
  return undefined;
}

/**
 * Resolves the persona for a request, in precedence order:
 *   1. `com.dotmarketing.persona.id` — what UVE appends when previewing a persona
 *   2. `?persona=MortgageSeeker` — explicit override, for QA and driving demos
 *   3. `?utm_campaign=...` — the campaign rules
 *   4. the persona cookie — so the assignment survives the rest of the session
 */
export function resolvePersona(
  searchParams: Record<string, string | string[] | undefined>,
  cookiePersona?: string
): { personaId?: string; personaKey?: PersonaKey } {
  const explicitId = first(searchParams["com.dotmarketing.persona.id"]);
  if (explicitId) return { personaId: explicitId };

  const override = first(searchParams.persona) as PersonaKey | undefined;
  if (override && override in PERSONAS) {
    return { personaId: PERSONAS[override], personaKey: override };
  }

  const fromCampaign = personaFromCampaign(first(searchParams.utm_campaign));
  if (fromCampaign) {
    return { personaId: PERSONAS[fromCampaign], personaKey: fromCampaign };
  }

  if (cookiePersona && cookiePersona in PERSONAS) {
    const key = cookiePersona as PersonaKey;
    return { personaId: PERSONAS[key], personaKey: key };
  }

  return {};
}
