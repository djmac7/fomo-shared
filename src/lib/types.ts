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
}

export interface City {
  id: string; // slug e.g. "quezon-city"
  name: string;
  region: string; // e.g. "Metro Manila"
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
