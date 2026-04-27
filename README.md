# Data Companion Framework v3 — Modulair

**Config-driven dashboard voor Vlaamse gemeenten**
Auteur: Kevin Huysentruyt — Data Companion

---

## Inhoudsopgave

1. [Architectuur in één oogopslag](#1-architectuur-in-één-oogopslag)
2. [Bestandsstructuur](#2-bestandsstructuur)
3. [Wie doet wat — verantwoordelijkheden](#3-wie-doet-wat--verantwoordelijkheden)
4. [Hoe een dashboard tot stand komt](#4-hoe-een-dashboard-tot-stand-komt)
5. [Sjablonen](#5-sjablonen)
6. [Source-types](#6-source-types)
7. [Lokaal testen](#7-lokaal-testen)
8. [Deployment via GitHub Pages](#8-deployment-via-github-pages)
9. [Pipeline draaien](#9-pipeline-draaien)
10. [Aanpassingen — beslissingsboom](#10-aanpassingen--beslissingsboom)
11. [Nieuwe gemeente toevoegen](#11-nieuwe-gemeente-toevoegen)
12. [Nieuwe laag aan een dashboard toevoegen](#12-nieuwe-laag-aan-een-dashboard-toevoegen)
13. [Nieuw source-type aan framework toevoegen](#13-nieuw-source-type-aan-framework-toevoegen)
14. [Nieuwe renderer aan framework toevoegen](#14-nieuwe-renderer-aan-framework-toevoegen)
15. [Nieuw sjabloon aan framework toevoegen](#15-nieuw-sjabloon-aan-framework-toevoegen)
16. [Nieuwe databron aan sources.json toevoegen](#16-nieuwe-databron-aan-sourcesjson-toevoegen)
17. [Stijl aanpassen](#17-stijl-aanpassen)
18. [Veelgestelde fouten](#18-veelgestelde-fouten)
19. [Changelog](#19-changelog)

---

## 1. Architectuur in één oogopslag

```
LAAG 1 — FRAMEWORK CODE
  index.html         → HTML-skelet, laadt modules
  css/stijlen.css    → alle visuele opmaak
  js/core.js         → orchestratie (URL, config, navigatie)
  js/sources/        → data ophalen (één file per bron-type)
  js/renderers/      → UI-componenten (één file per visualisatie)
  js/sjablonen/      → schermen (één file per scherm-type)

LAAG 2 — DATA-CATALOGUS
  sources.json       → broncatalogus (welke data bestaat)
  data/              → verwerkte data (gegenereerd door pipelines)

LAAG 3 — KLANT-CONFIGURATIE
  configs/*.json     → één bestand per gemeente

LAAG 4 — DATA-PIPELINES
  pipelines/         → Python-scripts voor data-voorbereiding
  .github/workflows/ → automatische uitvoering via GitHub Actions
```

**Gouden regel:** elk bestand heeft één verantwoordelijkheid. Stijl wijzig je in CSS, data-ophalen in source-modules, schermen in sjabloon-modules. Geen kruisbestuiving.

---

## 2. Bestandsstructuur

```
datacompanion/
│
├── index.html                       ← HTML-skelet + module-imports
│
├── css/
│   └── stijlen.css                  ← alle visuele opmaak
│
├── js/
│   ├── core.js                      ← URL, config, sources, navigatie, init
│   │
│   ├── sources/                     ← HOE data ophalen
│   │   ├── wms.js                   ← Web Map Service tiles
│   │   ├── poi.js                   ← Geopunt POI met badge-paginering
│   │   └── geojson.js               ← statisch GeoJSON-bestand
│   │
│   ├── renderers/                   ← HOE data tonen (UI-componenten)
│   │   └── toggle.js                ← kaartlaag aan/uit knop
│   │
│   └── sjablonen/                   ← HOE schermen opbouwen
│       ├── geodata.js               ← kaart + zijpaneel
│       ├── evolutie.js              ← placeholder Fase D
│       └── hybride.js               ← placeholder Fase F
│
├── sources.json                     ← broncatalogus van Vlaamse APIs
│
├── configs/
│   ├── zwevegem.json                ← Zwevegem dashboard
│   ├── avelgem.json                 ← Avelgem dashboard
│   └── demo.json                    ← orthofoto + zorgkaart demo
│
├── data/                            ← gegenereerde data (door pipelines)
│   └── .gitkeep
│
├── pipelines/                       ← Python data-pipelines
│   └── zorg_pipeline.py             ← zorgvoorzieningen → GeoJSON
│
├── .github/
│   └── workflows/
│       └── zorg_pipeline.yml        ← GitHub Actions automatisering
│
└── README.md                        ← dit bestand
```

---

## 3. Wie doet wat — verantwoordelijkheden

| Bestand | Verantwoordelijkheid | Wijzig wanneer |
|---|---|---|
| `index.html` | HTML-skelet + modules laden | Vrijwel nooit |
| `css/stijlen.css` | Alle visuele opmaak | Stijl-aanpassingen |
| `js/core.js` | Orchestratie, URL, navigatie | Architectuurwijzigingen |
| `js/sources/*.js` | Data ophalen per bron-type | Nieuwe bron-types |
| `js/renderers/*.js` | UI-componenten | Nieuwe interactie-elementen |
| `js/sjablonen/*.js` | Scherm-layouts | Nieuwe scherm-types |
| `sources.json` | Broncatalogus | Nieuwe Vlaamse bronnen toevoegen |
| `configs/*.json` | Per klant | Nieuwe klant of klantwijziging |
| `pipelines/*.py` | Data-voorbereiding | Nieuwe data-bron pipeline |

---

## 4. Hoe een dashboard tot stand komt

```
Browser opent:
https://jouw-site.be/?gemeente=zwevegem&loket=kaart

Stap 1  index.html laadt en importeert js/core.js
Stap 2  core.js leest URL-parameters
Stap 3  core.js laadt parallel: sources.json + configs/zwevegem.json
Stap 4  core.js past branding toe (kleuren, titel, logo)
Stap 5  core.js bouwt navigatiebalk met loketten-tabs
Stap 6  core.js roept sjabloon-router aan voor het actieve loket
Stap 7  Sjabloon (bv. geodata.js) bouwt het scherm op
Stap 8  Sjabloon roept source-modules aan per laag
Stap 9  Source-modules halen data op (live API of statische data/)
Stap 10 Renderers (bv. toggle.js) bouwen UI-componenten
```

Belangrijke karakteristiek: **de browser haalt data rechtstreeks van Vlaamse APIs en jouw `data/` map**. Geen tussenserver nodig.

---

## 5. Sjablonen

Een sjabloon bepaalt de lay-out en het gedrag van een loket.

### `geodata` — Kaart met lagen (FUNCTIONEEL)

Kaart-centric scherm met laag-toggles in zijpaneel.
Bestand: `js/sjablonen/geodata.js`

Geschikt voor: luchtfoto's, gemeentegrenzen, POI-punten, thematische lagen.

### `evolutie` — Cijfers en grafieken (PLACEHOLDER — Fase D)

Lijngrafieken, vergelijkingsbalken, sorteerbare tabellen.
Bestand: `js/sjablonen/evolutie.js`

Toont nu een nette "in ontwikkeling" boodschap.

### `hybride` — Kaart + cijfers gecombineerd (PLACEHOLDER — Fase F)

Kaart en grafieken naast elkaar met cross-filtering.
Bestand: `js/sjablonen/hybride.js`

Toont nu een nette "in ontwikkeling" boodschap.

---

## 6. Source-types

Source-modules halen data op. Elk bron-type heeft een eigen module.

### `wms` — Web Map Service

Bestand: `js/sources/wms.js`
Gebruik: rasterkaart-tiles van Geopunt diensten (GRB, orthofoto, klimaatlagen).

### `poi` — Points of Interest

Bestand: `js/sources/poi.js`
Gebruik: Geopunt POI OGC API met badge-gewijze paginering tot 5000 records.

### `geojson_url` — Statisch GeoJSON-bestand

Bestand: `js/sources/geojson.js`
Gebruik: laadt een GeoJSON uit `data/` map. Gegenereerd door pipelines.

### Toekomstige source-types (gepland)

| Type | Bestand | Fase |
|---|---|---|
| `wfs` | `js/sources/wfs.js` | B |
| `stadsmonitor` | `js/sources/stadsmonitor.js` | D |
| `csv` | `js/sources/csv.js` | D |

---

## 7. Lokaal testen

### Via JupyterLab terminal

```bash
cd Documents/datacompanion
python -m http.server 8765
```

Open in browser:
```
http://localhost:8765/?gemeente=zwevegem
http://localhost:8765/?gemeente=avelgem
http://localhost:8765/?gemeente=demo
```

**Belangrijk:** module-imports werken niet via `file://` — je moet via een lokale webserver testen.

### Via VS Code Live Server

Rechtsklik op `index.html` → "Open with Live Server". Browser herlaadt automatisch bij elke wijziging.

---

## 8. Deployment via GitHub Pages

### Eenmalige setup

1. Repo Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` → `/ (root)`
4. Save

GitHub geeft je URL: `https://[username].github.io/datacompanion/`

### Workflow per aanpassing

```
Lokaal aanpassen + testen (localhost:8765)
       ↓
Bestand wijzigen in GitHub via webinterface
       ↓
GitHub Pages bouwt automatisch (1-2 min)
       ↓
Live op github.io URL
```

---

## 9. Pipeline draaien

### Optie A — Handmatig via GitHub Actions UI

1. Repo → tab **Actions**
2. Klik **"Zorgvoorzieningen data verversen"**
3. Klik **"Run workflow"** rechtsboven

### Optie B — Lokaal in JupyterLab

```bash
pip install requests
python pipelines/zorg_pipeline.py
```

Resultaat verschijnt in `data/zorgvoorzieningen.geojson`. Upload manueel naar GitHub.

### Automatisch maandelijks

GitHub Actions draait automatisch op de 1e van elke maand om 6u 's ochtends.

---

## 10. Aanpassingen — beslissingsboom

```
Wil je iets wijzigen?

├── Stijl (kleuren, lay-out, knoppen)?
│   → bewerk css/stijlen.css
│
├── Klant-specifiek (welke lagen, welke kleuren)?
│   → bewerk configs/[gemeente].json
│
├── Vlaamse bron toevoegen aan catalogus?
│   → bewerk sources.json
│
├── Nieuwe gemeente?
│   → maak configs/[naam].json
│
├── Nieuw soort databron (bv. Stadsmonitor)?
│   → maak js/sources/[type].js
│
├── Nieuwe visualisatie (bv. lijngrafiek)?
│   → maak js/renderers/[type].js
│
├── Nieuw scherm-type (bv. rapport)?
│   → maak js/sjablonen/[type].js
│
└── Data periodiek verversen?
    → maak pipelines/[naam]_pipeline.py
```

---

## 11. Nieuwe gemeente toevoegen

1. Open een bestaande config in GitHub (bv. `configs/zwevegem.json`)
2. Klik "Raw" → kopieer inhoud
3. **Add file → Create new file** → bestandsnaam `configs/[naam].json`
4. Plak en pas aan:
   ```json
   "gemeente": {
     "naam": "Anzegem",
     "niscode": "34002",
     "fallback_centrum": [50.83, 3.49]
   }
   ```
5. Commit → testen op `?gemeente=anzegem`

NIS-codes: https://statbel.fgov.be/nl/themas/bevolking/gemeentecodes

---

## 12. Nieuwe laag aan een dashboard toevoegen

In `configs/[gemeente].json`, voeg toe aan `groepen[].lagen`:

```json
{
  "bron": "geopunt:orthofoto_2021",
  "default_aan": false
}
```

Of met override van bron-eigenschappen:

```json
{
  "bron": "geopunt:grb",
  "default_aan": true,
  "transparantie": 0.5
}
```

De bron moet bestaan in `sources.json`.

---

## 13. Nieuw source-type aan framework toevoegen

**Stap 1** — Maak `js/sources/[type].js` aan met dit patroon:

```javascript
// js/sources/mijntype.js
export function laadLaag(laag, kaart, statusEl) {
  // Bouw een Leaflet-laag op basis van laag-config
  const kaartlaag = L.layerGroup();

  // Optioneel: lazy loading via _laadFn
  kaartlaag._laadFn = async function() {
    // data ophalen + features toevoegen
  };

  if (laag.default_aan) {
    kaartlaag.addTo(kaart);
    kaartlaag._laadFn();
  }

  return kaartlaag;
}
```

**Stap 2** — Registreer in `js/sjablonen/geodata.js`:

```javascript
import { laadLaag as laadMijnType } from '../sources/mijntype.js';

const SOURCES = {
  'wms': laadWMS,
  'poi': laadPOI,
  'geojson_url': laadGeoJSON,
  'mijntype': laadMijnType   // ← toevoegen
};
```

**Stap 3** — Gebruik in `sources.json`:

```json
"voorbeeld:bron": {
  "type": "mijntype",
  "url": "...",
  "label": "..."
}
```

---

## 14. Nieuwe renderer aan framework toevoegen

Renderers zijn UI-componenten zoals toggles, indicator-kaartjes, grafieken.

**Patroon** voor `js/renderers/[naam].js`:

```javascript
export function maakComponent(parameters) {
  const element = document.createElement('div');
  element.className = 'mijn-component';
  // bouw component op
  return element;
}
```

Importeer waar nodig in een sjabloon-bestand.

---

## 15. Nieuw sjabloon aan framework toevoegen

**Stap 1** — Maak `js/sjablonen/[naam].js`:

```javascript
export function renderSjabloon[Naam](container, loket, state) {
  container.innerHTML = `
    <div class="loket-header">
      <div class="loket-title">${loket.label}</div>
    </div>
    <!-- jouw scherm-layout -->
  `;
  // verdere logica
}
```

**Stap 2** — Registreer in `js/core.js`:

```javascript
import { renderSjabloon[Naam] } from './sjablonen/[naam].js';

const SJABLONEN = {
  'geodata': renderSjabloonGeodata,
  'evolutie': renderSjabloonEvolutie,
  'hybride': renderSjabloonHybride,
  '[naam]': renderSjabloon[Naam]   // ← toevoegen
};
```

**Stap 3** — Gebruik in een config:

```json
{
  "id": "rapport",
  "sjabloon": "[naam]",
  "label": "Rapport"
}
```

---

## 16. Nieuwe databron aan sources.json toevoegen

Voeg toe aan `sources.json`:

```json
"naam:bron": {
  "type": "wms",
  "label": "Beschrijvende naam",
  "url": "https://...",
  "layer": "LAAGNAAM",
  "transparantie": 0.8,
  "attribution": "© Bron"
}
```

Conventie voor bronnamen: `[bronhouder]:[wat]`
- `geopunt:grb`, `geopunt:orthofoto_2021`
- `stadsmonitor:kansarmoede`
- `provincies:bevolking`

Daarna direct te gebruiken in elke gemeente-config.

---

## 17. Stijl aanpassen

Alle stijlen zitten in `css/stijlen.css` met CSS-variabelen voor kleuren:

```css
:root {
  --primair: #1a5c3a;   ← hoofdkleur (per gemeente overschreven)
  --accent: #e67e22;    ← accentkleur
  --bg: #f4f2ee;        ← achtergrond
}
```

Per-gemeente kleuren in `configs/[gemeente].json`:

```json
"dashboard": {
  "kleuren": {
    "primair": "#7d3c98",
    "accent": "#f39c12"
  }
}
```

Layout-aanpassingen (kaart-grootte, panel-breedte) doe je rechtstreeks in `stijlen.css`.

---

## 18. Veelgestelde fouten

### "Configuratie niet gevonden (HTTP 404)"
- Bestand staat niet in `configs/` map
- Bestandsnaam komt niet overeen met URL-parameter (hoofdlettergevoelig!)
- JSON niet geldig — check op https://jsonlint.com

### "Failed to load module"
- Module-imports werken alleen via webserver, niet via `file://`
- Gebruik `python -m http.server` of GitHub Pages
- Bestandspad in `import` statement klopt niet

### Kaart laadt maar lagen verschijnen niet
- WMS URL of laagnaam fout
- Zoom te ver uit (sommige lagen tonen pas vanaf zoom 12-14)
- `transparantie: 0` ingesteld

### POI-punten laden niet
- CORS-probleem bij testen via `file://` → gebruik webserver
- API-categorie filter werkt niet (Geopunt OGC heeft geen `theme` queryable)

### "undefined" verschijnt in dashboard
- Bron in config bestaat niet in `sources.json`
- Property in feature heet anders dan verwacht (check console met F12)

---

## 19. Changelog

| Versie | Datum | Wijziging |
|---|---|---|
| v1.0 | april 2026 | Eerste werkend framework (alles in index.html) |
| v2.0 | april 2026 | Multi-loket navigatie, sjabloon-systeem |
| v2.1 | april 2026 | POI source, demo-config, documentatie |
| v3.0 | april 2026 | **Modulaire structuur** (split in CSS/JS-modules) |
| v3.0 | april 2026 | Sources.json broncatalogus |
| v3.0 | april 2026 | Pipelines met GitHub Actions |

**Geplande uitbreidingen:**

| Fase | Feature | Bestanden om aan te maken |
|---|---|---|
| B | WFS source-type | `js/sources/wfs.js` |
| B | Gebied-filtering | uitbreiding van bestaande sources |
| D | Stadsmonitor pipeline | `pipelines/stadsmonitor_pipeline.py` |
| D | Lijngrafiek-renderer | `js/renderers/lijngrafiek.js` |
| D | Evolutie-sjabloon | `js/sjablonen/evolutie.js` (vervangt placeholder) |
| F | Hybride-sjabloon | `js/sjablonen/hybride.js` (vervangt placeholder) |

---

*Data Companion Framework · Kevin Huysentruyt*
*Databronnen: Digitaal Vlaanderen (open data), Basisregisters Vlaanderen*
*Licentie framework: MIT — vrij herbruikbaar met bronvermelding*
