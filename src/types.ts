// ─────────────────────────────────────────────────────────────
// Core domain model for Last Full Show.
// Designed so a live ingestion pipeline (scrapers / partner feeds)
// can populate the same shapes the UI already reads.
// ─────────────────────────────────────────────────────────────

/**
 * How the picture and sound are DELIVERED — the technical taxonomy, and
 * nothing else. Exactly these ten values.
 *
 * The operator's branded room (Director's Club, A-Luxe, VIP Cinema, Gold
 * Class, Wolfgang's Premier, Family Cinema, …) is NOT a format: it lives in
 * `Showtime.experience`. Mixing the two collapsed real distinctions — a 3D
 * session in an A-Luxe house came through as format "A-Luxe" with the 3D gone,
 * and then priced as a 2D A-Luxe seat.
 *
 * The two large-screen values are DISTINCT, never one generic "Large Format":
 * SM's Large Screen Format and Ayala's A-Giant are different installations in
 * different chains, and a moviegoer choosing one is not choosing the other.
 */
export type CinemaFormat =
  | "2D"
  | "3D"
  | "IMAX"
  | "IMAX 3D"
  | "4DX"
  | "4DX 3D"
  | "Dolby Atmos"
  | "ScreenX"
  | "Large Screen Format"
  | "A-Giant";

export type MtrcbRating = "G" | "PG" | "R-13" | "R-16" | "R-18" | "NYR";

export interface Chain {
  /** Stable slug, e.g. "sm-cinema" */
  id: string;
  name: string;
  /** Short label for chips */
  shortName: string;
  /** Booking domain used for deep links */
  bookingDomain: string;
  /** Base URL of the chain's booking/showtime site */
  bookingBaseUrl: string;
  brandColor: string;
  /** Real brand logo image URL (from ingestion); falls back to a monogram. */
  logoUrl?: string;
}

export interface City {
  id: string; // slug e.g. "quezon-city"
  name: string;
  region: string; // e.g. "Metro Manila"
}

/** A crowd sentiment tag surfaced from reviews, e.g. "Cold", "Great sound". */
export interface ReviewTag {
  label: string;
  /** Emoji shown alongside the label. */
  icon?: string;
  sentiment: "pos" | "neg" | "neutral";
  /** How many reviewers this represents (when derived from real reviews). */
  count?: number;
}

export interface TheaterReview {
  author: string;
  /** 1–5. */
  rating: number;
  text: string;
  /** e.g. "2 weeks ago". */
  relativeTime?: string;
}

/** One seat in a scraped auditorium layout. */
export interface Seat {
  /** Grid column (gaps between columns are physical aisles). */
  col: number;
  /** Seat label, e.g. "A-17". */
  label: string;
  type?: "standard" | "accessible" | "companion" | "recliner";
}
export interface SeatRow {
  /** Row letter, e.g. "A". */
  row: string;
  seats: Seat[];
}
/** A real auditorium layout scraped from the ticketing seat-selection step. */
export interface HallLayout {
  /** Screen/hall name as shown by the operator, e.g. "MOA Cinema 3". */
  screen: string;
  /** Seat-area category, e.g. "Standard", "Director's Club". */
  category?: string;
  rows: SeatRow[];
  capacity: number;
}

/** Enrichment about the venue itself — what makes each theater worth choosing. */
export interface TheaterEnrichment {
  /** Aggregate rating, 0–5 (from Google Places when enriched). */
  rating?: number;
  ratingCount?: number;
  /** Real venue photos (locally stored under /theaters). Populated either by
   *  the Google Places ingest (live) or the curated open-web scrape (editorial,
   *  see data/generated/theater-photos.json). */
  photos?: string[];
  /** Per-photo attribution for the editorial (open-web) photos, aligned by index
   *  with `photos`. e.g. "Photo: Juan Dela Cruz · Google Maps". */
  photoCredits?: { credit?: string; sourcePage?: string }[];
  /** Locally-hosted static map image for this venue (baked at build time). */
  map?: string;
  /** Link to the venue's Google Maps place (free interactive map). */
  googleMapsUri?: string;
  /**
   * Opening hours exactly as Google phrases them, one entry per weekday, e.g.
   * "Monday: 10:00 AM – 12:00 AM". Feeds schema.org
   * `openingHoursSpecification` on the cinema page — a local-search signal, and
   * the thing a person actually wants to know before leaving the house.
   */
  openingHours?: string[];
  /** The cinema's official page — schema.org `sameAs`. */
  website?: string;
  /** Amenities/facilities, e.g. "Recliner seats", "In-seat dining". */
  amenities?: string[];
  /** Signature premium experience, e.g. Mamou at the Movies. */
  premium?: { name: string; blurb: string };
  /** Ticket price range (₱) across this theater's showtimes. */
  priceRange?: { min: number; max: number };
  /** Crowd sentiment tags. */
  tags?: ReviewTag[];
  /** A few representative reviews. */
  reviews?: TheaterReview[];
}

export interface Theater {
  id: string; // slug e.g. "sm-megamall"
  name: string;
  chainId: string;
  cityId: string;
  /** Human-readable location, e.g. "Mandaluyong, Metro Manila" */
  area: string;
  /** Screens / cinema count, informational */
  screens: number;
  /** Directly bookable at this branch */
  bookingUrl: string;
  lat?: number;
  lng?: number;
  address?: string;
  phone?: string;
  /** Venue enrichment from the ingest pipeline (Google Places). Editorial
   *  defaults (amenities, premium concepts, tags) are layered on at read time
   *  via lib/theater-enrichment.ts. */
  enrichment?: TheaterEnrichment;
}

export interface Movie {
  id: string; // slug e.g. "dune-part-two"
  title: string;
  /** Localized/original alt title if relevant */
  altTitle?: string;
  synopsis: string;
  runtimeMins: number;
  rating: MtrcbRating;
  genres: string[];
  language: string;
  /** ISO date string YYYY-MM-DD (PH release) */
  releaseDate: string;
  director: string;
  cast: string[];
  /** Whether currently in cinemas */
  status: "now-showing" | "coming-soon";
  /** Poster gradient tokens for the placeholder poster art (fallback) */
  posterFrom: string;
  posterTo: string;
  /** Real poster image URL (e.g. TMDB) once enriched by ingestion. */
  posterUrl?: string;
  /** External source id (e.g. TMDB id) attached during ingestion. */
  tmdbId?: number;
  /** IMDb id (e.g. "tt1234567") — enables a direct IMDb title link. */
  imdbId?: string;
  /** YouTube video id for the trailer. */
  trailerId?: string;
  /**
   * When the trailer was published, ISO 8601, as reported by TMDB.
   *
   * Exists for one reason: schema.org VideoObject requires `uploadDate`, and
   * without it Google rejects the trailer markup outright ("Missing field
   * uploadDate"). It is carried rather than guessed — a plausible-looking date
   * invented to satisfy a validator is a claim the site would be making without
   * evidence, and the whole point of this field is that TMDB actually knows.
   *
   * Only set when the trailer came from TMDB's videos list. A trailer sourced
   * elsewhere has no date, and then the markup correctly omits uploadDate rather
   * than fabricating one.
   */
  trailerPublishedAt?: string;
  /** Cast with optional headshots (from ingestion). */
  castMembers?: { name: string; image?: string }[];
  /** A critic review reference (rating out of 5, links to the full article). */
  critic?: { title: string; author: string; url: string; rating: number };
  /** Aggregate user rating (average out of 5, count). */
  userScore?: { average: number; total: number };
  /** Audience score 0-100 (from TMDB when enriched) — Fandango-style. */
  score?: number;
  /** External critic/audience ratings (from OMDb when enriched). */
  ratings?: {
    /** IMDb rating, 0–10. */
    imdb?: number;
    /** IMDb vote count. */
    imdbVotes?: number;
    /** Rotten Tomatoes Tomatometer, 0–100 (critics). */
    rtCritic?: number;
    /** Metacritic Metascore, 0–100. */
    metacritic?: number;
  };
  /** Wide backdrop image for a cinematic header (from TMDB when enriched). */
  backdropUrl?: string;
  /** Optional critic-ish score 0-100 for UI flavor */
  buzz?: number;
  isLocal?: boolean;
}

export interface Showtime {
  id: string;
  movieId: string;
  theaterId: string;
  /** YYYY-MM-DD */
  date: string;
  /** 24h HH:MM */
  time: string;
  format: CinemaFormat;
  /** The operator's OWN name for a premium room/experience, verbatim-ish
   *  ("Family Cinema", "VIP Cinema", "Wolfgang's Premier", "Director's Club",
   *  "A-Luxe"). `format` is our technical taxonomy; this is their product
   *  name — show it to users instead of flattening everything to "Premiere".
   *
   *  Format and experience are INDEPENDENT: a Director's Club session is
   *  format "Dolby Atmos" + experience "Director's Club"; a 3D session in an
   *  A-Luxe house is format "3D" + experience "A-Luxe". Filters compose the
   *  two with AND, and prices are booked per (format, experience) pair. */
  experience?: string;
  /** PHP price; optional — not all sources expose pricing (e.g. ClickTheCity). */
  price?: number;
  /** True when `price` came from the reference price-book (stable per-theater×
   *  format pricing) rather than the showtime's own source. Lets the UI tell an
   *  exact fare from a reference one. */
  priceEstimated?: boolean;
  /** Deep link to the specific booking flow. Absent when we have no link we're
   *  confident in — a search or chain homepage is worse than no link at all,
   *  so UIs render the showtime without a CTA rather than a dead end. */
  bookingUrl?: string;
  /** e.g. "Cinema 4" */
  screen?: string;
  /** True when the operator marks the session sold out. The session still
   *  EXISTS (accuracy: our board should match the operator's), it just can't
   *  be booked — UIs should render it disabled rather than omit it. */
  soldOut?: boolean;
}
