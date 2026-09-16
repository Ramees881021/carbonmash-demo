# Year-specific emission factors

Right now the calculator uses one single set of 2026 UK conversion factors for every calculation, no matter which reporting year is selected. That is wrong: a 2024 footprint must be calculated with the 2024 published factors. This change makes the factor set follow the reporting year.

## What you will see

- The calculator picks its factors automatically from the reporting year already chosen at the top of the dashboard (e.g. 2024 → 2024 factors).
- A small label on the calculator shows which factor edition is in use, e.g. "UK Government conversion factors 2024".
- Every saved entry keeps a record of the factor value, its source and the year edition used, so past calculations never change when a new edition is added.
- Years without a published edition fall back to the closest earlier edition, with a note saying so.

## How it will be built

1. **Factor data by vintage.** Download the official UK Government (DESNZ/DEFRA) flat files for 2022, 2023, 2024, 2025 and reuse the already-parsed 2026 file. A one-off script parses each file and writes generated data modules:
   `src/lib/factors/2022.ts` … `src/lib/factors/2026.ts`, each exporting the same shape as today's `emission-factors.ts` (fuels, vehicles, refrigerant GWPs, UK grid + T&D, flights, commuting, homeworking, hotels + country hotels, waste, water, freight, spend factors).

2. **Registry and resolver.** `src/lib/factors/index.ts` exports `FACTOR_YEARS`, `getFactorSet(year)` (exact match, else nearest earlier edition, else oldest), and `resolveFactorYear(year)` returning `{ year, isFallback, label }`.

3. **Context wiring.** A `useFactorSet()` hook reads `selectedYear` from `DashboardContext` and returns the resolved set. `src/lib/emission-factors.ts` stays as a thin re-export of the newest set so nothing breaks during migration.

4. **Form migration.** Each calculator form and bulk-operation hook switches from static imports to `useFactorSet()`:
   Scope1Form, Scope2Form, Scope3Form, FuelEnergy, Transport, Waste, EndOfLife, UpstreamLeased, UseSold, Franchises, Investments, SupplierPipeline, ResultsSummary, DatabaseTab, AuditReportGenerator, CarbonDashboardTab, EmissionsTab, and the Scope1/Scope2/Emissions bulk hooks.
   Non-UK grid factors in `country-emission-factors.ts` get the same vintage treatment where year-specific data exists; otherwise they keep their published source year and are labelled accordingly.

5. **Persistence.** Saved calculator entries store `factor_year` alongside the existing emission factor and source fields, and the audit trail and audit report show it. A migration adds the column and backfills existing rows with the year they were created against.

6. **Verification.** Recalculate a sample Scope 1/2/3 entry across 2024, 2025 and 2026 and confirm the totals differ and match the published factors for that year; typecheck the whole app.

## Notes

- Older UK editions do not publish every category the 2026 edition does (some hotel countries, some waste routes). Where a value is missing for a year, the resolver uses the nearest earlier published value and flags the source string accordingly rather than silently using 2026.
- Spend-based (USEEIO) and estimated factors are not UK-published per year; these stay constant across editions with their real source year shown.
