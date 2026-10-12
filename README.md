# Krishi Companion BD (কৃষি সহযোগী বিডি)

An offline, bilingual (EN/বাংলা) farmer's companion for Bangladesh — crop calendar,
fertilizer dose guidance, and a pest/disease quick reference. Single-page app, zero
network requests, mobile-first.

Built by **MUSE PROJECT FACTORY Ω — MEGA BATCH, RUN #48**.

## 1. Overview

Krishi Companion BD puts three essential extension tools in one offline page for
Bangladeshi farmers, students, and field workers:

- **Crop Calendar** — Bangladesh's three cropping seasons (Rabi, Kharif-1, Kharif-2)
  with sowing/transplanting/harvest windows for 11 crops.
- **Fertilizer Dose Calculator** — urea/TSP/MoP/gypsum/zinc/boric-acid guidance per
  acre, per decimal, and per bigha for 9 major crops, with save-to-device history.
- **Pest & Disease Quick Reference** — 22 entries across crops: symptoms + general
  IPM notes (cultural/mechanical first). No pesticide brands, no dosage prescriptions.

## 2. Features

- EN ⇄ বাংলা toggle with Bengali digits (১২৩) throughout, persisted in localStorage
- Season tabs with visual 12-month activity bars (sow / transplant / harvest)
- Calculator: area in decimal, acre, or bigha (1 acre = 100 decimal, 1 bigha = 33 decimal)
- Per-crop confidence badges: DAE/BRRI/BARI guidance vs FRG-derived vs approximate
- Saved calculations (up to 50) in localStorage — private to the device
- Pest reference with live search + crop filter chips
- Prominent "guidance only, not a prescription" disclaimers (EN + BN)
- Fully responsive ≤640px; works from `file://` with no server

## 3. Demo / Screenshots

Open `index.html` directly in any browser (double-click — no server needed).
Verified in headless Chromium (desktop + 390px mobile), 26/26 UI checks, 0 console errors.

## 4. Tech Stack

- Plain HTML5 + CSS3 + vanilla JavaScript — no frameworks, no build step, no dependencies
- All data in `js/data.js` (UMD: works in browser and Node)
- Node-only test suite (`tests/run.js`, zero dependencies)

## 5. Project Structure

```
krishi-companion-bd/
├── index.html          # app shell
├── css/style.css       # mobile-first styles, offline system fonts
├── js/
│   ├── data.js         # seasons, crops, fertilizer doses, pest reference
│   ├── i18n.js         # EN/বাংলা strings + Bengali digit helper
│   └── app.js          # UI rendering + interactions
├── tests/
│   └── run.js          # node unit tests (node tests/run.js)
├── README.md
└── .gitignore
```

## 6. Getting Started

```bash
# just open it
xdg-open index.html        # Linux
# or: open index.html      # macOS
# or double-click index.html in a file manager
```

Run unit tests:

```bash
node tests/run.js
```

## 7. Tests & QA

- **Unit tests (`node tests/run.js`): 19/19 pass**
  - Fertilizer math: hand-verified samples (e.g. Boro urea 100–110 kg/acre →
    mid 105; 1 acre → 105 kg; 1 bigha (33 decimal) → 34.65 kg; 50 decimal → 52.5 kg;
    potato MoP 2.5 acre → 262.5 kg; mustard boric per-decimal 0.0225 kg;
    lentil gypsum 10 decimal → 5.5 kg) + consistency invariants across all crops/areas
  - Season-window validation: all windows use months 1–12; sowing windows lie in a
    declared season (seedbeds may start in the preceding season); harvest windows may
    extend into the following season (Boro harvest Apr–May, Aman seedbed in June)
  - Dose-table schema: known fertilizer keys, lo ≤ hi, lo > 0, confidence ∈
    {solid, derived, approximate}, every dose/pest crop exists in the calendar
  - IPM hygiene: no pesticide brand names, no dosage-like text in pest data
  - i18n: every string has EN + BN, Bengali digits map correctly
- **Headless-Chrome UI tests (CDP, `file://`): 26/26 pass, 0 console/page errors**
  - Season tab switching (Rabi/Kharif-1/Kharif-2) shows/hides correct crop cards
  - Calculator end-to-end with verified numbers (105 kg; 34.65 kg per bigha)
  - Invalid-area error, save-to-localStorage + delete, clear-all
  - Pest search filtering ("aphid") and crop chip filter (potato → 3 cards)
  - Language toggle: Bengali title + Bengali digits (১০৫) + Bengali disclaimer
  - 390px mobile: no horizontal overflow on all three tabs

## 8. Data & Agronomic Sources

| Data | Source |
|---|---|
| Season definitions (Rabi mid-Oct–mid-Mar; Kharif-1 mid-Mar–mid-Jul; Kharif-2 mid-Jul–mid-Oct) | ACIAR; USDA FAS GAIN "Grain and Feed Update Dhaka 2019" (Krishi Diary crop calendar); agriculturistmusa.com |
| Crop sowing/transplant/harvest windows | USDA FAS Krishi Diary table; compiled DAE calendar; SAARC J. Agri. cropping-pattern trials (banglajol.info) |
| T. Aman / Boro / Maize / Potato product-form doses | Compiled from BARC FRG-2018 + DAE leaflets; potato cross-checked with BARI Krishi Projukti Hatboi (Azad et al. 2019) via Nahiyan et al. 2024; Boro within BRRI dhan29 band (PLOS ONE 2022) |
| Lentil dose | Experimental recommendation for BARI masur-6/7/9, Gopalganj (Haq & Ahmed 2022) |
| Mustard / Wheat / Jute / Aus doses | Derived by us from FRG-2005 nutrient tables (hasanuzzaman.weebly.com mirror): urea=N/0.46, TSP=P/0.20, MoP=K/0.50, gypsum=S/0.18, zinc sulphate=Zn/0.227, boric acid=B/0.17; 1 ha = 2.471 acre; rounded |
| Unit conversions | 1 acre = 100 decimal; 1 bigha = 33 decimal (Bangladesh standard) |
| Pest/disease symptoms & IPM notes | General agronomic knowledge; cultural/mechanical control first |

Full URLs of the key web sources are recorded in the build notes; all dose figures
are labeled in-app with their provenance and confidence level.

## 9. Disclaimers

- **Fertilizer figures are guidance only, not a prescription.** They assume
  medium-fertility soil. Always do a soil test and consult the local agriculture
  officer (উপসহকারী কৃষি কর্মকর্তা / SAAO) before applying fertilizer.
- **Pest notes are general IPM information only.** No pesticide brands or doses are
  given. If a problem spreads, consult the local agriculture officer first.
- Windows are typical ranges for Bangladesh; they shift with variety, region, and weather.

## 10. Limitations

- Doses do not account for soil-test values, previous crop, or organic manure applied
  (standard practice: reduce ~20% where ~2 t/acre cowdung is applied).
- Wheat, jute, mustard, and aus rates are converted from older FRG-2005 nutrient
  tables — regional DAE charts differ (e.g. 140–180 kg/ha TSP cited for wheat in N.
  Bengal surveys). Lentil uses an experimental recommendation. These carry an
  "approximate — confirm with agriculture officer" badge in the app.
- Maize: intensive hybrid-maize FRG-2012 rates (N 250 kg/ha, BJAR 2022) are
  substantially higher than the medium-input rates shown; the app flags this.
- Crop calendar covers major field crops; horticultural and regional specialty crops
  are not included.
- Bengali copy was written for this app, not reviewed by a native agronomist.

## 11. Build Notes

- Run #48, built 2026-10-12 as a staged build (not published).
- Two genuine repairs during QA:
  1. Unit tests caught Boro's Apr–May harvest falling outside Rabi and Kharif-2
     having only Aman — fixed by allowing harvest spill into the following season in
     the validator, adding jute to Kharif-2 (per USDA table) and adding Black gram
     (মাসকলাই) as a Kharif-2 pulse.
  2. Browser QA caught the EN/বাংলা toggle failing after tab switches — the click
     handler was re-bound on every render, toggling the language an even number of
     times. Fixed by binding it once at init.
- Agronomic research: 4 web searches (seasons, crop windows, fertilizer rates,
  wheat/jute FRG rates). No secrets anywhere in the repo; secrets scan clean.

## 12. License

MIT — free for farmers, students, and extension workers. Agronomic data remains
subject to its original sources; see section 8.
