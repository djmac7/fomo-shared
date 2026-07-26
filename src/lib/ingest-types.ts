import type { Chain, City, Movie, Showtime, Theater } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// Contracts shared between the ingestion pipeline (src/ingest)
// and the runtime store reader (src/lib/store). Kept separate from
// UI types so the app compiles even before any ingest has run.
// ─────────────────────────────────────────────────────────────

/** Raw, un-normalized showtime as pulled from a source adapter. */
export interface RawShowtime {
  /** Source's own movie title (pre-matching to our catalog). */
  movieTitle: string;
  /** Source's theater identifier or name. */
  theaterKey: string;
  date: string; // YYYY-MM-DD (Asia/Manila)
  time: string; // HH:MM 24h
  format?: string;
  price?: number;
  bookingUrl: string;
  screen?: string;
}

/** Result of running one source adapter for a date window. */
export interface SourceResult {
  sourceId: string;
  chainId: string;
  ok: boolean;
  fetchedAt: string; // ISO
  rows: RawShowtime[];
  note?: string;
}

/** Persisted provenance for the whole run — powers freshness UI. */
export interface IngestMeta {
  generatedAt: string; // ISO
  window: string[]; // date strings covered
  sources: {
    id: string;
    chainId: string;
    ok: boolean;
    count: number;
    fetchedAt: string;
    note?: string;
  }[];
  totals: { showtimes: number; movies: number };
}

export interface GeneratedShowtimes {
  generatedAt: string;
  window: string[];
  showtimes: Showtime[];
}

/** Partial movie enrichment (posters, ids) keyed by our movie id. */
export type MovieEnrichment = (Partial<Movie> & { id: string })[];

/**
 * A complete ingested dataset that REPLACES the seed catalog. Written by the
 * ClickTheCity pipeline. When present, the app is fully data-driven; when
 * absent, it falls back to the hand-authored seed.
 */
export interface GeneratedDataset {
  generatedAt: string;
  source: string; // e.g. "clickthecity"
  region: string; // e.g. "Metro Manila"
  window: string[];
  chains: Chain[];
  cities: City[];
  theaters: Theater[];
  movies: Movie[];
  showtimes: Showtime[];
  meta: IngestMeta;
}
