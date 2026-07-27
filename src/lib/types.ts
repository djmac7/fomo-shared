// ─────────────────────────────────────────────────────────────
// Core domain model for Last Full Show.
// Designed so a live ingestion pipeline (scrapers / partner feeds)
// can populate the same shapes the UI already reads.
// ─────────────────────────────────────────────────────────────

export type CinemaFormat = "2D" | "3D" | "IMAX" | "IMAX 3D" | "Dolby Atmos" | "4DX" | "ScreenX" | "Director's Club" | "Premiere";

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
  /** Real venue photos (locally stored under /theaters after ingest). */
  photos?: string[];
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
  /** PHP price; optional — not all sources expose pricing (e.g. ClickTheCity). */
  price?: number;
  /** Deep link to the specific booking flow */
  bookingUrl: string;
  /** e.g. "Cinema 4" */
  screen?: string;
}
