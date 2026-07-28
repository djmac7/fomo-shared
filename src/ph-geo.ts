// ─────────────────────────────────────────────────────────────
// Philippine geography engine.
//
// Two jobs:
//   1. Enumerate the 17 administrative regions (stable slug + display name).
//   2. Infer {region, province, city} from a free-text venue string — the
//      long tail of venues we don't (and can't) curate one-by-one. Ticketing
//      operators embed the locale in the venue name / address
//      ("Waterfront Cebu City Hotel", "SMX Convention Center DAVAO",
//      "…, Cagayan De Oro City"), so a token scan classifies most of them.
//
// Curated marquee venues (event-venues.ts) still win; this is the fallback.
// ─────────────────────────────────────────────────────────────

export interface PhRegion {
  id: string; // slug, e.g. "central-visayas"
  name: string; // display, e.g. "Central Visayas"
}

export const PH_REGIONS: PhRegion[] = [
  { id: "ncr", name: "Metro Manila" },
  { id: "car", name: "Cordillera (CAR)" },
  { id: "ilocos", name: "Ilocos Region" },
  { id: "cagayan-valley", name: "Cagayan Valley" },
  { id: "central-luzon", name: "Central Luzon" },
  { id: "calabarzon", name: "Calabarzon" },
  { id: "mimaropa", name: "Mimaropa" },
  { id: "bicol", name: "Bicol Region" },
  { id: "western-visayas", name: "Western Visayas" },
  { id: "central-visayas", name: "Central Visayas" },
  { id: "eastern-visayas", name: "Eastern Visayas" },
  { id: "zamboanga", name: "Zamboanga Peninsula" },
  { id: "northern-mindanao", name: "Northern Mindanao" },
  { id: "davao", name: "Davao Region" },
  { id: "soccsksargen", name: "Soccsksargen" },
  { id: "caraga", name: "Caraga" },
  { id: "barmm", name: "BARMM" },
];

export const regionNameById = new Map(PH_REGIONS.map((r) => [r.id, r.name]));

export interface GeoHit {
  regionId: string;
  province?: string;
  city?: string;
}

interface Place {
  /** Lowercase substrings that identify this locale in a venue string. */
  match: string[];
  regionId: string;
  province?: string;
  city?: string;
}

// Locales that actually host ticketed events, plus each region's major hubs.
// Order does not matter here — matching sorts by token length (longest wins),
// so "quezon city" beats "quezon" and "san fernando pampanga" beats a bare city.
const PLACES: Place[] = [
  // ── NCR / Metro Manila ──
  { match: ["quezon city", "cubao", "araneta city", "diliman", "eastwood", "new frontier", "smart araneta"], regionId: "ncr", province: "Metro Manila", city: "Quezon City" },
  { match: ["mall of asia", "moa arena", "pasay", "newport", "resorts world manila", "star city", "ccp complex", "cultural center of the philippines", "world trade center"], regionId: "ncr", province: "Metro Manila", city: "Pasay" },
  { match: ["makati", "circuit makati", "rockwell", "ayala avenue", "glorietta", "powermac center", "power mac center"], regionId: "ncr", province: "Metro Manila", city: "Makati" },
  { match: ["taguig", "bonifacio global city", "bgc", "sm aura", "the fort", "uptown bonifacio"], regionId: "ncr", province: "Metro Manila", city: "Taguig" },
  { match: ["parañaque", "paranaque", "solaire", "okada", "entertainment city", "city of dreams", "aseana"], regionId: "ncr", province: "Metro Manila", city: "Parañaque" },
  { match: ["mandaluyong", "megamall", "ortigas"], regionId: "ncr", province: "Metro Manila", city: "Mandaluyong" },
  { match: ["pasig", "the podium", "capitol commons"], regionId: "ncr", province: "Metro Manila", city: "Pasig" },
  { match: ["muntinlupa", "filinvest city", "alabang"], regionId: "ncr", province: "Metro Manila", city: "Muntinlupa" },
  { match: ["ateneo", "arete"], regionId: "ncr", province: "Metro Manila", city: "Quezon City" },
  { match: ["manila", "intramuros", "malate", "ermita", "binondo", "tondo"], regionId: "ncr", province: "Metro Manila", city: "Manila" },
  // ── CAR ──
  { match: ["baguio", "session road", "la trinidad", "benguet"], regionId: "car", province: "Benguet", city: "Baguio" },
  // ── Ilocos ──
  { match: ["laoag", "vigan", "ilocos", "san fernando la union", "dagupan", "pangasinan"], regionId: "ilocos" },
  // ── Cagayan Valley ──
  { match: ["tuguegarao", "cagayan valley", "isabela", "ilagan", "santiago city"], regionId: "cagayan-valley" },
  // ── Central Luzon ──
  { match: ["philippine arena", "bocaue", "bulacan", "malolos"], regionId: "central-luzon", province: "Bulacan" },
  { match: ["clark", "angeles", "pampanga", "san fernando pampanga", "mabalacat"], regionId: "central-luzon", province: "Pampanga" },
  { match: ["subic", "olongapo", "zambales"], regionId: "central-luzon", province: "Zambales" },
  { match: ["tarlac", "capas"], regionId: "central-luzon", province: "Tarlac" },
  { match: ["cabanatuan", "nueva ecija"], regionId: "central-luzon", province: "Nueva Ecija" },
  { match: ["bataan", "balanga"], regionId: "central-luzon", province: "Bataan" },
  // ── Calabarzon ──
  { match: ["tagaytay", "cavite", "bacoor", "imus", "dasmariñas", "dasmarinas"], regionId: "calabarzon", province: "Cavite" },
  { match: ["sta. rosa", "santa rosa", "sta rosa", "laguna", "calamba", "los baños", "los banos", "enchanted kingdom"], regionId: "calabarzon", province: "Laguna" },
  { match: ["batangas", "lipa", "nasugbu", "tanauan"], regionId: "calabarzon", province: "Batangas" },
  { match: ["antipolo", "rizal", "cainta", "taytay rizal"], regionId: "calabarzon", province: "Rizal" },
  { match: ["lucena", "quezon province"], regionId: "calabarzon", province: "Quezon" },
  // ── Mimaropa ──
  { match: ["puerto princesa", "palawan", "el nido", "coron", "calapan", "mindoro", "romblon", "marinduque"], regionId: "mimaropa" },
  // ── Bicol ──
  { match: ["legazpi", "legaspi", "naga city", "albay", "camarines", "bicol", "sorsogon", "daraga"], regionId: "bicol" },
  // ── Western Visayas ──
  { match: ["iloilo", "passi", "roxas city", "capiz"], regionId: "western-visayas", province: "Iloilo", city: "Iloilo City" },
  { match: ["bacolod", "negros occidental", "l'fisher", "lfisher", "silay"], regionId: "western-visayas", province: "Negros Occidental", city: "Bacolod" },
  { match: ["kalibo", "boracay", "aklan", "antique"], regionId: "western-visayas", province: "Aklan" },
  // ── Central Visayas ──
  { match: ["cebu", "mandaue", "lapu-lapu", "lapu lapu", "mactan", "waterfront cebu", "seaside city cebu", "iec cebu"], regionId: "central-visayas", province: "Cebu", city: "Cebu City" },
  { match: ["bohol", "tagbilaran", "panglao"], regionId: "central-visayas", province: "Bohol" },
  { match: ["dumaguete", "negros oriental"], regionId: "central-visayas", province: "Negros Oriental" },
  // ── Eastern Visayas ──
  { match: ["tacloban", "ormoc", "leyte", "samar", "catbalogan", "borongan"], regionId: "eastern-visayas" },
  // ── Zamboanga ──
  { match: ["zamboanga", "dipolog", "pagadian", "isabela city"], regionId: "zamboanga" },
  // ── Northern Mindanao ──
  { match: ["cagayan de oro", "cdo", "limketkai", "iligan", "bukidnon", "valencia city", "malaybalay", "camiguin", "ozamiz", "misamis"], regionId: "northern-mindanao", province: "Misamis Oriental", city: "Cagayan de Oro" },
  // ── Davao Region ──
  { match: ["davao", "sm lanang", "tagum", "digos", "panabo", "samal island"], regionId: "davao", province: "Davao del Sur", city: "Davao City" },
  // ── Soccsksargen ──
  { match: ["general santos", "gensan", "koronadal", "sarangani", "south cotabato", "sultan kudarat"], regionId: "soccsksargen" },
  // ── Caraga ──
  { match: ["butuan", "surigao", "bislig", "bayugan", "agusan", "dinagat"], regionId: "caraga" },
  // ── BARMM ──
  { match: ["cotabato city", "marawi", "lamitan", "jolo", "bongao", "maguindanao"], regionId: "barmm" },
];

// Flattened, longest-token-first so specific tokens win over generic ones.
const PLACE_INDEX = PLACES.flatMap((p) => p.match.map((m) => ({ token: m, place: p }))).sort(
  (a, b) => b.token.length - a.token.length,
);

/** Infer region/province/city from a venue or address string. */
export function inferGeo(venue: string): GeoHit | null {
  if (!venue) return null;
  const hay = ` ${venue.toLowerCase()} `;
  for (const { token, place } of PLACE_INDEX) {
    // Word-ish boundary so "cdo" doesn't match inside another word.
    if (hay.includes(token)) {
      return { regionId: place.regionId, province: place.province, city: place.city };
    }
  }
  return null;
}
