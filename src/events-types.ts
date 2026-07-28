// ─────────────────────────────────────────────────────────────
// Live-events domain model (concerts, theater, comedy, sports…).
//
// Deliberately parallel to the movie/showtime model so the app and
// the ingestion pipeline speak the same shapes:
//   Movie    ↔ LiveEvent          (the "what")
//   Showtime ↔ EventSession       (a dated occurrence: date + time + price)
//   Theater  ↔ EventVenue         (the "where")
//
// Populated by src/ingest/events/* and read via src/lib/events.ts.
// ─────────────────────────────────────────────────────────────

export type EventCategory =
  | "concert"
  | "theater"
  | "comedy"
  | "sports"
  | "festival"
  | "fan-meet"
  | "family"
  | "music"
  | "other";

/** Curated sub-genre within a category — currently only music/concert acts. */
export type EventSubgenre = "kpop" | "opm" | "international" | "classical";

/** Where an event happens. Premium marquee venues are curated (see venues.ts). */
export interface EventVenue {
  id: string; // slug, e.g. "sm-moa-arena"
  name: string;
  /** Human-readable area, e.g. "Pasay, Metro Manila". */
  area?: string;
  /** City slug (matches data/cities.ts) when known. */
  cityId?: string;
  city?: string; // display city, e.g. "Cebu City"
  province?: string; // e.g. "Cebu"
  /** Administrative region slug (see data/ph-geo.ts), e.g. "central-visayas". */
  regionId?: string;
  region?: string; // display region, e.g. "Central Visayas"
  lat?: number;
  lng?: number;
  /** A marquee premium venue (arena / major theater / resort venue). */
  premium: boolean;
}

/** One dated occurrence of an event (a show night / session). */
export interface EventSession {
  /** YYYY-MM-DD (Asia/Manila). */
  date: string;
  /** 24h HH:MM, when the source exposes a start time. */
  time?: string;
  endTime?: string;
}

export interface LiveEvent {
  id: string; // stable slug, e.g. "everglow-re-code-manila"
  title: string;
  slug: string;
  category: EventCategory;
  /** Curated sub-genre within a category — chiefly for the big concert bucket
   * (e.g. "kpop", "opm", "international", "classical"). See ingest/events/subgenre.ts. */
  subgenre?: EventSubgenre;
  description?: string;

  // Where
  venueId: string;
  venueName: string;
  /** Administrative region slug (data/ph-geo.ts) — denormalized for filtering. */
  regionId?: string;
  region?: string; // display region name

  // When — startDate/endDate frame the run; sessions are the individual nights.
  startDate: string; // ISO date YYYY-MM-DD (earliest)
  endDate?: string; // ISO date YYYY-MM-DD (latest)
  sessions: EventSession[];

  // Price — either a numeric range or a raw label (e.g. "FREE").
  priceMin?: number;
  priceMax?: number;
  priceText?: string;
  currency?: string; // "PHP"

  imageUrl?: string;
  organizer?: string;
  ageRange?: string;
  tags?: string[];

  // Buy — the deep-link out to the ticketing flow (aggregator monetization).
  bookingUrl?: string;
  bookingProvider?: string; // "SM Tickets" | "TicketWorld" | "ClickTheCity" | …

  /** Which source adapters contributed to this record (provenance). */
  sources: string[];
  /** Marquee premium event (premium venue and/or ticketed concert/theater). */
  premium: boolean;
  featured?: boolean;
}

/** Persisted provenance for one events ingest run — powers the freshness UI. */
export interface EventsIngestMeta {
  generatedAt: string; // ISO
  region: string; // e.g. "Metro Manila"
  sources: {
    id: string;
    label: string;
    ok: boolean;
    count: number;
    fetchedAt: string;
    note?: string;
  }[];
  totals: { events: number; premium: number; venues: number };
  /** Event counts per region slug, most-populous first. */
  regions: { id: string; name: string; count: number }[];
}

/** The generated events dataset written to src/data/generated/events.json. */
export interface GeneratedEvents {
  generatedAt: string;
  region: string;
  events: LiveEvent[];
  venues: EventVenue[];
  meta: EventsIngestMeta;
}
