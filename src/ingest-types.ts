import type { Chain, City, Movie, Showtime, Theater } from "./types";

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
  /** Operator marks the session sold out (still a real session — keep it). */
  soldOut?: boolean;
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

/** Per-source merge outcome — how much of the board a direct source replaced. */
export interface SourceMergeStats {
  /** Raw rows the source returned for the window. */
  rowsFetched: number;
  /** Distinct catalog theaters the source's branches matched. */
  theatersMatched: number;
  /** (theater × movie) pairs whose CTC rows were replaced by direct rows. */
  pairsReplaced: number;
  /** Direct showtime rows written into the dataset. */
  directRowsAdded: number;
  /** CTC rows dropped in favor of direct rows. */
  ctcRowsRemoved: number;
  /** Source branch keys we couldn't match to a catalog theater (truncated). */
  unmatchedBranches?: string[];
}

/** Per-source provenance entry recorded on every run. */
export interface SourceProvenance {
  id: string;
  chainId: string;
  /** aggregator = ClickTheCity spine; direct = a chain's own first-party feed. */
  kind?: "aggregator" | "direct";
  ok: boolean;
  count: number;
  fetchedAt: string;
  note?: string;
  stats?: SourceMergeStats;
  /** True when a direct source that previously landed rows now lands none. */
  degraded?: boolean;
  /** Direct rows this source landed on the previous run (for regression checks). */
  prevDirectRows?: number;
}

/** How much of the final board is first-party vs aggregator, overall + per chain. */
export interface CoverageSummary {
  total: number;
  direct: number;
  ctc: number;
  priced: number;
  byChain: {
    chainId: string;
    name: string;
    total: number;
    direct: number;
    /** direct = fully first-party, ctc = still on the aggregator, mixed = partial. */
    source: "direct" | "ctc" | "mixed";
  }[];
}

/** Persisted provenance for the whole run — powers freshness + coverage UI. */
export interface IngestMeta {
  generatedAt: string; // ISO
  window: string[]; // date strings covered
  sources: SourceProvenance[];
  totals: { showtimes: number; movies: number };
  /** Direct-vs-aggregator coverage of the assembled board (added by run-ctc). */
  coverage?: CoverageSummary;
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
