# @vibes/shared

The **contract** shared by the two Vibes projects:

- [`vibes-web`](../vibes-web) — the public site.
- [`vibes-data`](../vibes-data) — the ingestion pipeline + `/admin` dashboard.

It ships raw TypeScript (no build step); consumers compile it via Next's
`transpilePackages: ["@vibes/shared"]`.

## Exports

| Import | What |
|---|---|
| `@vibes/shared/types` | Core domain types (`Chain`, `City`, `Movie`, `Theater`, `Showtime`, `CinemaFormat`, …) |
| `@vibes/shared/ingest-types` | Dataset + provenance contracts (`GeneratedDataset`, `IngestMeta`, `SourceProvenance`, `CoverageSummary`) |
| `@vibes/shared/events-types` | Events contracts (`LiveEvent`, `EventVenue`, `GeneratedEvents`, `EventsIngestMeta`) |
| `@vibes/shared/dates` | Manila-time date helpers (`manilaDateStr`, `dateWindow`, …) |
| `@vibes/shared/ph-geo` | Philippine region geography (`regionNameById`, …) |
| `@vibes/shared/sm-sites` | SM Cinema booking site-id map |

## Versioning = the safety net

This package is the **only** coupling between the two projects. SemVer is the
guardrail: a breaking change to the JSON/data shape is a **major** bump. The web
app stays pinned to a major until it adapts, and `tsc` flags every mismatch — so
a pipeline change can never silently break the site.

## Consume

Published to GitHub Packages, or via a git tag while bootstrapping:

```jsonc
// package.json
"dependencies": {
  "@vibes/shared": "github:<org>/vibes-shared#v0.1.0"
}
```
