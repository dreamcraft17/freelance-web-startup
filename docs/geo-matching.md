# Geo Matching

- Store `lat/lng` on freelancer profile and jobs where relevant.
- Use `serviceRadiusKm` and optional service-area records for onsite matching.
- Work mode compatibility:
  - `REMOTE`: global remote jobs.
  - `ONSITE`: location + radius required.
  - `HYBRID`: can match remote and onsite rules.
- Initial implementation: Haversine filtering in PostgreSQL.
- Future evolution: PostGIS for indexed geospatial querying.
