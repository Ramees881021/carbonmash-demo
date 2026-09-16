// UK Government (DESNZ/DEFRA) GHG conversion factors 2026 — tCO2e per unit
// Primary source: "Greenhouse gas reporting: conversion factors 2026", flat file v1.2 (published 11 June 2026, revised 31 July 2026)
// https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026
// Non-UK grid factors: IEA 2025 / national agencies (see country-emission-factors.ts)
// Last updated: 2026-09-11

export const FUEL_TYPES = {
  natural_gas: { label: 'Natural Gas', unit: 'kWh', factor: 0.00018231, source: 'DEFRA 2026 (Gross CV)' },
  diesel: { label: 'Diesel', unit: 'litres', factor: 0.00258354, source: 'DEFRA 2026' },
  petrol: { label: 'Petrol/Gasoline', unit: 'litres', factor: 0.00207500, source: 'DEFRA 2026' },
  coal: { label: 'Coal', unit: 'tonnes', factor: 2.41504, source: 'DEFRA 2026 (industrial)' },
  propane: { label: 'Propane/LPG', unit: 'litres', factor: 0.00155713, source: 'DEFRA 2026' },
  fuel_oil: { label: 'Fuel Oil', unit: 'litres', factor: 0.00317492, source: 'DEFRA 2026' },
  biodiesel: { label: 'Biodiesel (100%)', unit: 'litres', factor: 0.00016751, source: 'DEFRA 2026' },
  bioethanol: { label: 'Bioethanol (100%)', unit: 'litres', factor: 0.00000901, source: 'DEFRA 2026' },
  cng: { label: 'Compressed Natural Gas', unit: 'kg', factor: 0.00250772, source: 'DEFRA 2026' },
  lng: { label: 'Liquefied Natural Gas', unit: 'litres', factor: 0.00114791, source: 'DEFRA 2026' },
  wood_pellets: { label: 'Wood Pellets', unit: 'tonnes', factor: 0.05725249, source: 'DEFRA 2026' },
  wood_chips: { label: 'Wood Chips', unit: 'tonnes', factor: 0.04505983, source: 'DEFRA 2026' },
} as const;

export const VEHICLE_TYPES = {
  petrol_car: { label: 'Petrol Car (avg)', unit: 'km', factor: 0.00016152, source: 'DEFRA 2026' },
  diesel_car: { label: 'Diesel Car (avg)', unit: 'km', factor: 0.00017265, source: 'DEFRA 2026' },
  hybrid_car: { label: 'Hybrid Car', unit: 'km', factor: 0.00012961, source: 'DEFRA 2026' },
  phev_car: { label: 'Plug-in Hybrid (PHEV)', unit: 'km', factor: 0.00009918, source: 'DEFRA 2026' },
  electric_car: { label: 'Battery Electric (BEV)', unit: 'km', factor: 0.00002951, source: 'DEFRA 2026' },
  van_diesel: { label: 'Diesel Van', unit: 'km', factor: 0.00025716, source: 'DEFRA 2026' },
  van_petrol: { label: 'Petrol Van', unit: 'km', factor: 0.00020905, source: 'DEFRA 2026' },
  van_electric: { label: 'Electric Van', unit: 'km', factor: 0.00004260, source: 'DEFRA 2026' },
  hgv_rigid: { label: 'HGV Rigid (avg)', unit: 'km', factor: 0.00084606, source: 'DEFRA 2026' },
  hgv_artic: { label: 'HGV Articulated (avg)', unit: 'km', factor: 0.00093374, source: 'DEFRA 2026' },
  hgv: { label: 'HGV/Truck (all avg)', unit: 'km', factor: 0.00089743, source: 'DEFRA 2026' },
  motorcycle: { label: 'Motorcycle', unit: 'km', factor: 0.00011367, source: 'DEFRA 2026' },
  bus: { label: 'Local Bus', unit: 'passenger.km', factor: 0.00010151, source: 'DEFRA 2026' },
  coach: { label: 'Coach', unit: 'passenger.km', factor: 0.00003948, source: 'DEFRA 2026' },
  rail_national: { label: 'National Rail', unit: 'passenger.km', factor: 0.00003092, source: 'DEFRA 2026' },
  rail_light: { label: 'Light Rail / Tram', unit: 'passenger.km', factor: 0.00002121, source: 'DEFRA 2026' },
  taxi: { label: 'Taxi (regular)', unit: 'km', factor: 0.00014861, source: 'DEFRA 2026' },
} as const;

// Global warming potentials — DEFRA 2026 (IPCC AR5, 100-year)
export const REFRIGERANT_TYPES = {
  r134a: { label: 'R-134a (HFC)', gwp: 1300 },
  r410a: { label: 'R-410A', gwp: 1924 },
  r407c: { label: 'R-407C', gwp: 1624 },
  r32: { label: 'R-32', gwp: 677 },
  r404a: { label: 'R-404A', gwp: 3943 },
  r507a: { label: 'R-507A', gwp: 3985 },
  r22: { label: 'R-22 (HCFC)', gwp: 1760 },
  r1234yf: { label: 'R-1234yf (HFO)', gwp: 1 },
  r1234ze: { label: 'R-1234ze (HFO)', gwp: 1 },
  r290: { label: 'R-290 (Propane)', gwp: 0.06 },
  r744: { label: 'R-744 (CO₂)', gwp: 1 },
  sf6: { label: 'SF6 (Electrical)', gwp: 23500 },
} as const;

// Grid emission factors by region (tCO2e per kWh)
// UK: DEFRA 2026 (generation). Others: IEA 2025 / national agencies — no UK Government factors published for overseas grids.
export const GRID_REGIONS = {
  uk: { label: 'UK Grid', factor: 0.00013096, source: 'DEFRA 2026' },
  us_avg: { label: 'US Average', factor: 0.000373, source: 'EPA eGRID 2023' },
  eu_avg: { label: 'EU Average', factor: 0.000220, source: 'EEA 2024' },
  germany: { label: 'Germany', factor: 0.000380, source: 'UBA 2024' },
  france: { label: 'France', factor: 0.000056, source: 'RTE 2024' },
  china: { label: 'China', factor: 0.000537, source: 'IEA 2025' },
  india: { label: 'India', factor: 0.000692, source: 'CEA 2024' },
  japan: { label: 'Japan', factor: 0.000434, source: 'MOE 2024' },
  australia: { label: 'Australia', factor: 0.000620, source: 'CER 2024' },
  canada: { label: 'Canada', factor: 0.000110, source: 'ECCC 2024' },
  brazil: { label: 'Brazil', factor: 0.000062, source: 'IEA 2025' },
  south_korea: { label: 'South Korea', factor: 0.000415, source: 'IEA 2025' },
} as const;

// UK electricity transmission & distribution losses (tCO2e per kWh) — DEFRA 2026
export const GRID_TD_LOSSES = { label: 'UK T&D Losses', factor: 0.00001148, source: 'DEFRA 2026' } as const;

// Scope 3 EEIO spend-based factors (tCO2e per £/$ 1000 spent)
// Source: USEEIO v2.0.1, DEFRA 2026
export const SPEND_FACTORS = {
  purchased_goods: { label: 'Purchased Goods & Services', factor: 0.43, source: 'USEEIO v2.0' },
  capital_goods: { label: 'Capital Goods', factor: 0.52, source: 'USEEIO v2.0' },
  fuel_energy: { label: 'Fuel & Energy Activities', factor: 0.15, source: 'DEFRA 2026' },
  upstream_transport: { label: 'Upstream Transportation', factor: 0.18, source: 'DEFRA 2026' },
  waste: { label: 'Waste in Operations', factor: 0.21, source: 'DEFRA 2026' },
  business_services: { label: 'Business Services', factor: 0.28, source: 'USEEIO v2.0' },
  it_telecom: { label: 'IT & Telecommunications', factor: 0.20, source: 'USEEIO v2.0' },
} as const;

// Business travel — air. DEFRA 2026, with radiative forcing (RF) included.
export const FLIGHT_FACTORS = {
  domestic: { label: 'Domestic (<500km)', factor: 0.00022928, unit: 'passenger.km', source: 'DEFRA 2026 (with RF)' },
  short_haul: { label: 'Short-haul (500-3700km)', factor: 0.00012786, unit: 'passenger.km', source: 'DEFRA 2026 (with RF)' },
  long_haul_economy: { label: 'Long-haul Economy', factor: 0.00011704, unit: 'passenger.km', source: 'DEFRA 2026 (with RF)' },
  long_haul_premium_economy: { label: 'Long-haul Premium Economy', factor: 0.00018726, unit: 'passenger.km', source: 'DEFRA 2026 (with RF)' },
  long_haul_business: { label: 'Long-haul Business', factor: 0.00033940, unit: 'passenger.km', source: 'DEFRA 2026 (with RF)' },
  long_haul_first: { label: 'Long-haul First', factor: 0.00046814, unit: 'passenger.km', source: 'DEFRA 2026 (with RF)' },
  international_economy: { label: 'International (non-UK) Economy', factor: 0.00010916, unit: 'passenger.km', source: 'DEFRA 2026 (with RF)' },
  international_business: { label: 'International (non-UK) Business', factor: 0.00031656, unit: 'passenger.km', source: 'DEFRA 2026 (with RF)' },
} as const;

export const COMMUTE_MODES = {
  car_alone: { label: 'Car (average, alone)', factor: 0.00016591, unit: 'km', source: 'DEFRA 2026' },
  petrol_car: { label: 'Petrol Car', factor: 0.00016152, unit: 'km', source: 'DEFRA 2026' },
  diesel_car: { label: 'Diesel Car', factor: 0.00017265, unit: 'km', source: 'DEFRA 2026' },
  hybrid_car: { label: 'Hybrid Car', factor: 0.00012961, unit: 'km', source: 'DEFRA 2026' },
  phev_car: { label: 'Plug-in Hybrid Car (PHEV)', factor: 0.00009918, unit: 'km', source: 'DEFRA 2026' },
  electric_car: { label: 'Electric Car (BEV)', factor: 0.00002951, unit: 'km', source: 'DEFRA 2026' },
  motorcycle: { label: 'Motorcycle', factor: 0.00011367, unit: 'km', source: 'DEFRA 2026' },
  car_shared: { label: 'Car (shared, 2 people)', factor: 0.00008296, unit: 'km', source: 'DEFRA 2026' },
  bus: { label: 'Bus', factor: 0.00010151, unit: 'km', source: 'DEFRA 2026' },
  train: { label: 'Train/Metro', factor: 0.00003092, unit: 'km', source: 'DEFRA 2026' },
  cycling: { label: 'Cycling/Walking', factor: 0, unit: 'km', source: 'N/A' },
  remote: { label: 'Remote/WFH', factor: 0.000008, unit: 'km', source: 'Estimated' }, // home energy
  ebike: { label: 'E-Bike / E-Scooter', factor: 0.000005, unit: 'km', source: 'Estimated' },
} as const;

// Homeworking (tCO2e per FTE working hour) — DEFRA 2026
export const HOMEWORKING_FACTORS = {
  office_equipment: { label: 'Office Equipment', factor: 0.00002159, source: 'DEFRA 2026' },
  heating: { label: 'Heating', factor: 0.00030234, source: 'DEFRA 2026' },
  combined: { label: 'Equipment + Heating', factor: 0.00032393, source: 'DEFRA 2026' },
} as const;

// Hotel stays (tCO2e per room per night) — DEFRA 2026
export const HOTEL_FACTORS = {
  uk: { label: 'UK', factor: 0.01040, source: 'DEFRA 2026' },
  international: { label: 'International (avg)', factor: 0.03878, source: 'DEFRA 2026 (avg of published countries)' },
} as const;

// Hotel stays by country (tCO2e per room per night) — DEFRA 2026
export const HOTEL_COUNTRY_FACTORS = {
  uk: { label: 'United Kingdom', factor: 0.01040 },
  uk_london: { label: 'UK (London)', factor: 0.01150 },
  australia: { label: 'Australia', factor: 0.03500 },
  belgium: { label: 'Belgium', factor: 0.01220 },
  brazil: { label: 'Brazil', factor: 0.00870 },
  canada: { label: 'Canada', factor: 0.00740 },
  chile: { label: 'Chile', factor: 0.02760 },
  china: { label: 'China', factor: 0.05350 },
  colombia: { label: 'Colombia', factor: 0.01470 },
  costa_rica: { label: 'Costa Rica', factor: 0.00470 },
  egypt: { label: 'Egypt', factor: 0.04420 },
  france: { label: 'France', factor: 0.00670 },
  germany: { label: 'Germany', factor: 0.01320 },
  hong_kong: { label: 'Hong Kong, China', factor: 0.05150 },
  india: { label: 'India', factor: 0.05890 },
  indonesia: { label: 'Indonesia', factor: 0.06270 },
  italy: { label: 'Italy', factor: 0.01430 },
  japan: { label: 'Japan', factor: 0.03900 },
  jordan: { label: 'Jordan', factor: 0.06890 },
  korea: { label: 'South Korea', factor: 0.05580 },
  malaysia: { label: 'Malaysia', factor: 0.06150 },
  maldives: { label: 'Maldives', factor: 0.15220 },
  mexico: { label: 'Mexico', factor: 0.01930 },
  netherlands: { label: 'Netherlands', factor: 0.01480 },
  oman: { label: 'Oman', factor: 0.09030 },
  philippines: { label: 'Philippines', factor: 0.05430 },
  portugal: { label: 'Portugal', factor: 0.01900 },
  qatar: { label: 'Qatar', factor: 0.08620 },
  russia: { label: 'Russian Federation', factor: 0.02420 },
  saudi_arabia: { label: 'Saudi Arabia', factor: 0.10640 },
  singapore: { label: 'Singapore', factor: 0.02450 },
  south_africa: { label: 'South Africa', factor: 0.05140 },
  spain: { label: 'Spain', factor: 0.00700 },
  switzerland: { label: 'Switzerland', factor: 0.00660 },
  thailand: { label: 'Thailand', factor: 0.04340 },
  turkey: { label: 'Turkey', factor: 0.03210 },
  uae: { label: 'United Arab Emirates', factor: 0.06380 },
  usa: { label: 'United States', factor: 0.01610 },
  vietnam: { label: 'Vietnam', factor: 0.03850 },
} as const;

// Waste disposal factors (tCO2e per tonne) — DEFRA 2026
export const WASTE_FACTORS = {
  landfill_mixed: { label: 'Landfill (commercial & industrial)', factor: 0.52058, source: 'DEFRA 2026' },
  recycled_mixed: { label: 'Recycled (closed-loop)', factor: 0.00465358, source: 'DEFRA 2026' },
  composted: { label: 'Composted', factor: 0.00900687, source: 'DEFRA 2026' },
  incineration: { label: 'Incineration/Combustion (with energy recovery)', factor: 0.00465358, source: 'DEFRA 2026' },
  anaerobic_digestion: { label: 'Anaerobic Digestion', factor: 0.00900687, source: 'DEFRA 2026' },
  electrical_waste: { label: 'Electrical Items (WEEE, recycled)', factor: 0.00465358, source: 'DEFRA 2026' },
  household_landfill: { label: 'Landfill (household residual)', factor: 0.49729, source: 'DEFRA 2026' },
} as const;

// Water supply & treatment (tCO2e per m³) — DEFRA 2026
export const WATER_FACTORS = {
  supply: { label: 'Water Supply', factor: 0.00019130, source: 'DEFRA 2026' },
  treatment: { label: 'Water Treatment', factor: 0.00017088, source: 'DEFRA 2026' },
} as const;

// Equivalency helpers
export function getEquivalencies(tco2e: number) {
  return [
    { label: 'km driven by car', value: Math.round(tco2e / 0.00016591), icon: '🚗' },
    { label: 'economy flights London→NYC', value: Math.round(tco2e / 0.65), icon: '✈️' },
    { label: 'trees needed to offset (per year)', value: Math.round(tco2e / 0.022), icon: '🌳' },
    { label: 'homes powered for a year', value: Math.round(tco2e / 2.9), icon: '🏠' },
  ];
}

// Scope 3 category definitions
export const SCOPE3_CATEGORIES = [
  { code: 'purchased_goods', label: '1. Purchased Goods & Services', description: 'Spend-based or activity-based calculations by supplier/category' },
  { code: 'capital_goods', label: '2. Capital Goods', description: 'Emissions from manufacturing long-term assets' },
  { code: 'fuel_energy', label: '3. Fuel & Energy-Related Activities', description: 'Upstream extraction, refining, transmission losses' },
  { code: 'upstream_transport', label: '4. Upstream Transportation & Distribution', description: 'Inbound logistics, third-party warehousing' },
  { code: 'waste', label: '5. Waste Generated in Operations', description: 'By waste type and disposal method' },
  { code: 'business_travel', label: '6. Business Travel', description: 'Flights, hotels, ground transport, rail' },
  { code: 'employee_commuting', label: '7. Employee Commuting', description: 'Distance, mode, remote work percentage' },
  { code: 'upstream_leased', label: '8. Upstream Leased Assets', description: 'Assets not in Scope 1/2' },
  { code: 'downstream_transport', label: '9. Downstream Transportation', description: 'Outbound shipping to customers' },
  { code: 'processing_sold', label: '10. Processing of Sold Products', description: 'Intermediate product manufacturing' },
  { code: 'use_sold', label: '11. Use of Sold Products', description: 'Product lifetime energy consumption' },
  { code: 'end_of_life', label: '12. End-of-Life Treatment', description: 'Product disposal emissions' },
  { code: 'downstream_leased', label: '13. Downstream Leased Assets', description: 'Franchises, leased property emissions' },
  { code: 'franchises', label: '14. Franchises', description: 'Scope 1/2 of franchise operations' },
  { code: 'investments', label: '15. Investments', description: 'Financed emissions for financial institutions' },
] as const;
