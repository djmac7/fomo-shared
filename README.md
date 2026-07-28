# @fomo/shared

The **contract** shared by the two FOMO projects:

- [`fomo-web`](../fomo-web) — the public site.
- [`fomo-data`](../fomo-data) — the ingestion pipeline + `/admin` dashboard.

It ships raw TypeScript (no build step); consumers compile it via Next's
`transpilePackages: ["@fomo/shared"]`.

## Exports

| Import | What |
|---|---|
| `@fomo/shared/types` | Core domain types (`Chain`, `City`, `Movie`, `Theater`, `Showtime`, `CinemaFormat`, …) |
| `@fomo/shared/ingest-types` | Dataset + provenance contracts (`GeneratedDataset`, `IngestMeta`, `SourceProvenance`, `CoverageSummary`) |
| `@fomo/shared/events-types` | Events contracts (`LiveEvent`, `EventVenue`, `GeneratedEvents`, `EventsIngestMeta`) |
| `@fomo/shared/dates` | Manila-time date helpers (`manilaDateStr`, `dateWindow`, …) |
| `@fomo/shared/ph-geo` | Philippine region geography (`regionNameById`, …) |
| `@fomo/shared/sm-sites` | SM Cinema booking site-id map |

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
  "@fomo/shared": "github:<org>/fomo-shared#v0.1.0"
}
```
