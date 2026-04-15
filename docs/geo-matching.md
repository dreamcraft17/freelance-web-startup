# Geo Matching

- Store `lat/lng` on freelancer profile and jobs where relevant.
- Use `serviceRadiusKm` and optional service-area records for onsite matching.
- Work mode compatibility:
  - `REMOTE`: global remote jobs.
  - `ONSITE`: location + radius required.
  - `HYBRID`: can match remote and onsite rules.
- Initial implementation: Haversine filtering in PostgreSQL.
- Future evolution: PostGIS for indexed geospatial querying.

## Update status (April 2026)

- Nearby flow sudah dipakai nyata di discovery freelancers:
  - browser location + radius filter,
  - ranking berdasarkan jarak terdekat,
  - jarak ditampilkan di kartu hasil saat data koordinat tersedia.
- Geo cues dipertahankan sebagai sinyal operasional (bukan sekadar copy), khususnya untuk use case onsite/hybrid.
