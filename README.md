# @tonight/shared

The **contract** shared by the two Tonight projects:

- [`tonight-web`](../tonight-web) — the public site.
- [`tonight-data`](../tonight-data) — the ingestion pipeline + `/admin` dashboard.

It ships raw TypeScript (no build step); consumers compile it via Next's
`transpilePackages: ["@tonight/shared"]`.

## Exports

| Import | What |
|---|---|
| `@tonight/shared/types` | Core domain types (`Chain`, `City`, `Movie`, `Theater`, `Showtime`, `CinemaFormat`, …) |
| `@tonight/shared/ingest-types` | Dataset + provenance contracts (`GeneratedDataset`, `IngestMeta`, `SourceProvenance`, `CoverageSummary`) |
| `@tonight/shared/events-types` | Events contracts (`LiveEvent`, `EventVenue`, `GeneratedEvents`, `EventsIngestMeta`) |
| `@tonight/shared/dates` | Manila-time date helpers (`manilaDateStr`, `dateWindow`, …) |
| `@tonight/shared/ph-geo` | Philippine region geography (`regionNameById`, …) |
| `@tonight/shared/sm-sites` | SM Cinema booking site-id map |

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
  "@tonight/shared": "github:<org>/tonight-shared#v0.1.0"
}
```
