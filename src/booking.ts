// ─────────────────────────────────────────────────────────────
// One rule for "is this link actually worth showing?".
//
// An aggregator's promise is that a ticket link takes you somewhere useful.
// A web search, a chain homepage or a generic "now showing" index does not —
// it dumps the user back at square one, and it reads as a broken promise. So
// when we can't identify a specific session, movie, branch or event in the
// URL, we ship NO link and the UI renders the row without a CTA.
//
// SHARED so it cannot drift: the pipeline strips low-confidence links at
// assembly, and the web re-applies the SAME predicate after its own link
// reconstruction (which can itself produce a homepage). Two copies had already
// diverged once — the web was stripping operator portals the pipeline allowed.
// ─────────────────────────────────────────────────────────────

/**
 * Origins that ARE the booking surface, not a marketing page. Megaworld's
 * BlockbusterSeats portal has no routable per-movie URL for its BBS branches
 * (Festive Walk, Lucky Chinatown, Southwoods), but the site itself is where
 * you pick the branch and buy — so it beats showing no link at all. Kept
 * deliberately tiny: every entry is a judgement that the bare origin is useful.
 */
const BOOKING_HOMES = /^(?:www\.)?(?:megaworldcinemas\.com|fisherboxoffice\.fishermall\.com\.ph|robinsonsmovieworld\.com)$/i;

/** Search engines: discovery, never booking. */
const SEARCH = /(^|\.)(google|bing|duckduckgo|yahoo)\.[a-z.]+$/i;

/** Paths that are just a landing/index — no specific thing is identified. */
const GENERIC_PATH =
  /^\/(?:cinema|cinemas|movies?|films?|shows?|events?|schedules?|nowshowing|now-showing|whats-on|home|index|tickets?|booking|buy)?$|^\/cinema\/(?:nowshowing|now-showing|schedules?)$|^\/home\/?$/i;

/**
 * True when the URL lands the user in a booking flow for something specific.
 * False for searches, bare homepages and generic listing pages.
 */
export function isConfidentBookingUrl(url?: string): boolean {
  if (!url) return false;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return false;
  if (SEARCH.test(u.hostname)) return false;

  // A query string that names the thing (?sh=, ?moviename=, ?group=, ?mn=,
  // txtSessionId=) is enough on its own — several operators book from the root.
  const hasIdentifyingQuery = /[?&](sh|mn|moviename|branchname|branchkey|group|txtSessionId|eventid|id)=[^&]+/i.test(u.search);
  if (hasIdentifyingQuery) return true;

  const path = u.pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return BOOKING_HOMES.test(u.hostname); // bare origin — only the booking portals
  if (GENERIC_PATH.test(path)) return false; // /films, /cinema/nowshowing, …
  return true;
}

/**
 * Theaters that must NOT inherit their chain's fallback link. The portal still
 * lists Uptown among its malls, but it doesn't actually sell for that branch
 * (its only portal record was a 2024 test event), so the link would be a dead
 * end dressed as a booking flow — worse than showing nothing.
 */
export const NO_CHAIN_FALLBACK = new Set(["uptown-place-mall"]);

/** The URL when we're confident in it, otherwise undefined (ship no link). */
export function confidentBookingUrl(url?: string): string | undefined {
  return isConfidentBookingUrl(url) ? url : undefined;
}
