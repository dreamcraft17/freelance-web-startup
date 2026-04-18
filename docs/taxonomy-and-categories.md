# Taxonomy and Categories

> **Doc revision:** v1  
> Last synchronized: 2026-04-18 (post-accept handoff update applied across product and docs).

- `Category` for top-level service grouping.
- `Subcategory` for more specific service classes.
- `Skill` for standardized searchable capabilities.
- `FreelancerSkill` and `JobSkill` as join tables.
- `metadataSchema` on subcategory allows category-specific future fields without schema rewrite.

## Update status (April 2026)

- Taxonomy tetap dipakai sebagai fondasi filter discovery (`/jobs`, `/freelancers`) dan tetap menjadi sinyal utama browse/search.
- UX filter terbaru menempatkan category sebagai filter praktis (bukan elemen dekoratif), sehingga relevansi hasil lebih mudah dipahami user.
