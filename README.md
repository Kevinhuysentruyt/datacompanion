# Data Companion Framework v2
**Config-driven dashboard voor Vlaamse gemeenten**
Auteur: Kevin Huysentruyt — Data Companion

---

## Inhoudsopgave

1. [Architectuur](#1-architectuur)
2. [Bestandsstructuur](#2-bestandsstructuur)
3. [Hoe het werkt](#3-hoe-het-werkt)
4. [Gemeente-config opbouwen](#4-gemeente-config-opbouwen)
5. [Sjablonen](#5-sjablonen)
6. [Source-types](#6-source-types)
7. [Loketten en navigatie](#7-loketten-en-navigatie)
8. [Secties in index.html](#8-secties-in-indexhtml)
9. [Lokaal testen](#9-lokaal-testen)
10. [Deployment](#10-deployment)
11. [Nieuwe gemeente toevoegen](#11-nieuwe-gemeente-toevoegen)
12. [Nieuwe laag toevoegen](#12-nieuwe-laag-toevoegen)
13. [Nieuw source-type toevoegen aan framework](#13-nieuw-source-type-toevoegen-aan-framework)
14. [Nieuw sjabloon toevoegen](#14-nieuw-sjabloon-toevoegen)
15. [Veelgestelde fouten](#15-veelgestelde-fouten)
16. [Changelog](#16-changelog)

---

## 1. Architectuur

```
LAAG 1 — FRAMEWORK (index.html)
  Lees config → bouw navigatie → render sjabloon
  Wijzig NOOIT rechtstreeks voor één specifieke klant

LAAG 2 — CONFIGURATIE (configs/gemeente.json)
  Wat tonen: kleuren, loketten, lagen, indicatoren
  Één bestand per gemeente — dit is je klantwerk

LAAG 3 — DATABRONNEN (externe Vlaamse APIs)
  Geopunt WMS/WFS, Basisregisters, POI-service
  Gehost door Vlaamse overheid — gratis, open data
```

**Gouden regel:**
- Nieuwe gemeente? → nieuw JSON-bestand, framework ongewijzigd
- Nieuwe laag voor klant? → JSON aanpassen, framework ongewijzigd
- Nieuw soort databron? → framework uitbreiden, alle klanten profiteren

---

## 2. Bestandsstructuur

```
datacompanion/
│
├── index.html              ← HET FRAMEWORK
│                             Bevat HTML-structuur, CSS-stijlen, JavaScript
│                             Pas aan voor nieuwe features of bugfixes
│                             Nooit aanpassen per klant
│
├── configs/                ← GEMEENTE-CONFIGURATIES
│   ├── zwevegem.json       ← Dashboard Zwevegem (3 loketten)
│   ├── avelgem.json        ← Dashboard Avelgem (2 loketten)
│   ├── demo.json           ← Demo: orthofoto 2021 + zorgkaart
│   └── [naam].json         ← Nieuwe klant: voeg hier toe
│
└── README.md               ← Dit bestand
```

---

## 3. Hoe het werkt

```
Browser opent:
https://jouw-site.be/?gemeente=zwevegem&loket=kaart

Stap 1  index.html laadt in de browser van de bezoeker
Stap 2  JavaScript leest URL-parameters (gemeente + loket)
Stap 3  Framework haalt configs/zwevegem.json op
Stap 4  Branding toegepast (kleuren, titel, logo-initialen)
Stap 5  Navigatiebalk gebouwd (één tab per loket)
Stap 6  Eerste loket gerenderd via het juiste sjabloon
Stap 7  Kaart en lagen geladen rechtstreeks van Vlaamse APIs
```

Jouw server levert enkel index.html en de JSON-config.
De browser haalt data rechtstreeks van Vlaamse overheidsservers.

---

## 4. Gemeente-config opbouwen

Elke config heeft vier secties:

```json
{
  "$schema": "Data Companion v2",

  "gemeente": {
    "naam": "Zwevegem",
    "niscode": "34042",
    "fallback_centrum": [50.81, 3.34]
  },

  "dashboard": {
    "titel": "Zwevegem in cijfers",
    "subtitel": "Beleidsdashboard",
    "kleuren": {
      "primair": "#1a5c3a",
      "accent": "#e67e22"
    }
  },

  "bronvermelding": [
    {
      "naam": "Geopunt / Digitaal Vlaanderen",
      "url": "https://www.geopunt.be"
    }
  ],

  "loketten": [ ... ]
}
```

**NIS-codes opzoeken:** https://statbel.fgov.be/nl/themas/bevolking/gemeentecodes

---

## 5. Sjablonen

Een sjabloon bepaalt de lay-out en het gedrag van een loket.

### `geodata` — Kaart met lagen (FUNCTIONEEL)

Interactieve kaart met laag-toggles in zijpaneel.
Geschikt voor: luchtfoto's, gemeentegrenzen, POI-punten, thematische lagen.

```json
{
  "id": "kaart",
  "label": "Kaartlagen",
  "icoon": "🗺️",
  "sjabloon": "geodata",
  "beschrijving": "Tekst zichtbaar onder de loket-titel",
  "groepen": [ ... ]
}
```

### `evolutie` — Cijfers en grafieken (PLACEHOLDER — Fase D)

Lijngrafieken, vergelijkingsbalken, sorteerbare tabellen.
Toont nu een nette "in ontwikkeling" boodschap.

```json
{
  "id": "cijfers",
  "label": "Cijfers & Evoluties",
  "icoon": "📊",
  "badge": "soon",
  "sjabloon": "evolutie",
  "indicatoren": ["inwoners", "vergrijzing"],
  "periode": { "van": 2018, "tot": 2024 }
}
```

### `hybride` — Kaart + cijfers gecombineerd (PLACEHOLDER — Fase F)

Kaart en grafieken naast elkaar met cross-filtering.
Toont nu een nette "in ontwikkeling" boodschap.

---

## 6. Source-types

Binnen het geodata-sjabloon worden lagen gegroepeerd.
Het `bron`-veld per laag bepaalt hoe data wordt opgehaald.

### `wms` — Web Map Service (rasterkaart tiles)

```json
{
  "id": "grb",
  "label": "GRB basiskaart",
  "bron": "wms",
  "url": "https://geo.api.vlaanderen.be/GRB/wms",
  "layer": "GRB_BSK",
  "default_aan": true,
  "transparantie": 0.8,
  "attribution": "GRB © Digitaal Vlaanderen"
}
```

**Beschikbare Geopunt WMS-diensten:**

| Dienst | URL-pad | Laagnaam |
|---|---|---|
| GRB basiskaart | `/GRB/wms` | `GRB_BSK` |
| Orthofoto 2021 kleur | `/OMZ/wms` | `OI.OrthoimageCoverage.OMZ.RGB` |
| Gemeentegrenzen | `/VRBG/wms` | `Refgem` |

Volledige lijst + laagnamen via GetCapabilities:
`https://geo.api.vlaanderen.be/[DIENST]/wms?SERVICE=WMS&REQUEST=GetCapabilities`

### `poi` — Points of Interest (Geopunt OGC API)

```json
{
  "id": "zorg",
  "label": "Zorgvoorzieningen",
  "bron": "poi",
  "url": "https://geo.api.vlaanderen.be/POI/ogc/features/v1/collections/POI/items",
  "categorie": "Welzijn, gezondheid en gezin",
  "max_items": 200,
  "default_aan": false,
  "kleur_marker": "#e74c3c",
  "popup_velden": ["naam", "adres", "gemeente"],
  "attribution": "Zorgvoorzieningen © Departement Zorg"
}
```

**POI-categorieën (selectie):**
- `Welzijn, gezondheid en gezin` — ziekenhuizen, thuiszorg, woonzorg
- `Onderwijs en vorming` — scholen, academies
- `Sport en vrije tijd` — sportinfrastructuur, bibliotheken

### Toekomstige source-types (gepland)

| Type | Gebruik | Fase |
|---|---|---|
| `wfs` | Vectordata als GeoJSON | B |
| `geojson_url` | Externe GeoJSON-URL | B |
| `stadsmonitor` | Beleidsindicatoren | D |
| `csv` | Eigen klantdata | D |

---

## 7. Loketten en navigatie

```json
"loketten": [
  {
    "id": "kaart",          ← unieke ID, gebruikt in URL: ?loket=kaart
    "label": "Geodata",     ← tekst in de tab
    "icoon": "🗺️",          ← emoji in de tab
    "badge": "nieuw",       ← optionele badge (oranje label)
    "sjabloon": "geodata",  ← lay-out type (zie sectie 5)
    "beschrijving": "...",  ← zichtbaar onder de loket-titel
    "groepen": [ ... ]      ← alleen voor sjabloon "geodata"
  }
]
```

**URL-gedrag:**
- `?gemeente=zwevegem` → eerste loket in de array
- `?gemeente=zwevegem&loket=kaart` → specifiek loket
- Browser back/forward werkt correct
- URL wordt automatisch bijgewerkt bij tab-klikken

---

## 8. Secties in index.html

Het JavaScript-bestand is opgedeeld in genummerde secties.
Gebruik deze nummers als referentie bij aanpassingen via Claude.

```
SECTIE 1  — URL PARSING
           Leest ?gemeente= en ?loket= uit de URL
           Functies: leesURL(), updateURL()

SECTIE 2  — CONFIG LADEN
           Haalt configs/[gemeente].json op via fetch()
           Functie: laadConfig()

SECTIE 3  — BRANDING TOEPASSEN
           Zet titel, kleuren (CSS-variabelen), bronvermelding
           Functie: pasBrandingToe()

SECTIE 4  — NAVIGATIE OPBOUWEN
           Maakt de loketten-tabs in de navigatiebalk
           Functie: bouwNavigatie()

SECTIE 5  — LOKET ACTIVEREN
           Markeert actieve tab, roept renderLoket() aan
           Functie: activeerLoket()

SECTIE 6  — SJABLOON-ROUTER
           Koppelt loket.sjabloon aan de juiste render-functie
           Object: sjablonen { geodata, evolutie, hybride }

SECTIE 7  — SJABLOON GEODATA (functioneel)
           Bouwt kaart, laag-groepen, toggles
           Bevat: SOURCE ROUTER (wms / poi / toekomstige types)
           Bevat: auto-zoom via Basisregisters NIS-code
           Functie: renderSjabloonGeodata()

SECTIE 8  — SJABLOON EVOLUTIE (placeholder)
           Toont "in ontwikkeling" bericht
           Functie: renderSjabloonEvolutie()

SECTIE 9  — SJABLOON HYBRIDE (placeholder)
           Toont "in ontwikkeling" bericht
           Functie: renderSjabloonHybride()

SECTIE 10 — ERROR HANDLING
           Toont foutpagina bij config-problemen
           Functie: toonError()

SECTIE 11 — CONFIG LINK
           "Config bekijken" knop in footer

SECTIE 12 — BROWSER NAVIGATIE
           Luistert naar back/forward knop

SECTIE 13 — INIT
           Startpunt: laad config → bouw navigatie → render loket
```

**CSS-secties in de style-tag:**
```
── Header          (.brand, .brand-logo)
── Navigatiebalk   (.nav-loketten, .nav-loket, .active, .badge)
── Content area    (.content, .content-inner)
── Loket header    (.loket-header, .loket-title, .loket-desc)
── Placeholders    (.sjabloon-placeholder, .badge-status)
── Geodata layout  (.geodata-layout, .geodata-panel, .geodata-map)
── Laag-toggles    (.layer-group, .layer-group-title, .layer-item, .tgl)
── Footer          (.footer-bar)
── Loader          (.loader, .spinner)
── Error           (.error-box)
── Popups          (.ptag, .ptit, .pbod)
```

---

## 9. Lokaal testen

### Via JupyterLab (aanbevolen)

```bash
# Open terminal in JupyterLab: File → New → Terminal

cd Documents/datacompanion   # pas pad aan naar jouw map
python -m http.server 8765
```

Daarna openen in browser:
```
http://localhost:8765/?gemeente=zwevegem&loket=kaart
http://localhost:8765/?gemeente=avelgem
http://localhost:8765/?gemeente=demo
```

**Workflow:**
1. Bestand bewerken in JupyterLab teksteditor
2. Opslaan: Ctrl+S
3. Browser: F5 om te herladen
4. Tevreden? → uploaden naar GitHub

### Via VS Code + Live Server

Rechtsklik op `index.html` → "Open with Live Server"
Browser herlaadt automatisch bij elke opgeslagen wijziging.

---

## 10. Deployment

### Workflow per aanpassing

```
Lokaal testen (localhost:8765)
       ↓
Bestand uploaden naar GitHub
  (webinterface: klik potlood-icoon → bewerk → commit)
       ↓
Cloudflare Pages deployt automatisch (30-60 sec)
       ↓
Live op: datacompanion.pages.dev/?gemeente=[naam]
```

### Per nieuwe gemeente

1. Maak `configs/[naam].json` aan in GitHub
2. Commit → Cloudflare deployt automatisch
3. Dashboard direct bereikbaar via URL

### Eigen domeinnaam (bij eerste betalende klant)

1. Koop `datacompanion.be` bij Combell (~€12/jaar)
2. In Cloudflare Pages: Custom domain instellen
3. Per klant subdomein: `zwevegem.datacompanion.be`

---

## 11. Nieuwe gemeente toevoegen

1. Open GitHub → `configs/zwevegem.json`
2. Kopieer de volledige JSON-inhoud
3. Maak nieuw bestand: `configs/[naam].json`
4. Minimale aanpassingen:

```json
"gemeente": {
  "naam": "Anzegem",
  "niscode": "34002",
  "fallback_centrum": [50.83, 3.49]
},
"dashboard": {
  "titel": "Anzegem · Monitor",
  "kleuren": { "primair": "#8e44ad" }
}
```

5. Lagen aanpassen of overnemen
6. Commit → testen op `?gemeente=anzegem`

---

## 12. Nieuwe laag toevoegen

**Aan een bestaand dashboard (via JSON aanpassen):**

1. Open de config in GitHub (potlood-icoon)
2. Zoek het juiste `groepen`-item in het geodata-loket
3. Voeg toe aan het `lagen`-array:

```json
{
  "id": "nieuwe-laag",
  "label": "Naam in zijpaneel",
  "bron": "wms",
  "url": "https://geo.api.vlaanderen.be/[DIENST]/wms",
  "layer": "LAAGNAAM",
  "default_aan": false,
  "transparantie": 0.7,
  "attribution": "© Bron"
}
```

4. Commit → testen

**Laagnamen vinden:**
```
https://geo.api.vlaanderen.be/[DIENST]/wms?SERVICE=WMS&REQUEST=GetCapabilities
```
Zoek `<Layer>` elementen → noteer de naam.

---

## 13. Nieuw source-type toevoegen aan framework

Wanneer een nieuwe databron nog niet ondersteund is
(bv. `wfs`, `geojson_url`, `stadsmonitor`):

**Locatie in index.html:** Sectie 7, zoek naar:
```
// ── SOURCE ROUTER: kies juiste laag op basis van bron-type ──
```

**Patroon — voeg toe net voor de `} else {` van WMS:**

```javascript
} else if (laag.bron === 'geojson_url') {
  // Nieuwe source: externe GeoJSON-URL ophalen

  const geojsonLaag = L.geoJSON(null, {
    style: laag.stijl || { color: '#3498db', weight: 2 },
    onEachFeature(f, l) {
      l.bindPopup(`<div class="ptit">${f.properties.naam || 'Feature'}</div>`);
    }
  });

  fetch(laag.url)
    .then(r => r.json())
    .then(data => {
      geojsonLaag.addData(data);
      if (laag.default_aan) geojsonLaag.addTo(mapInstance);
    })
    .catch(e => console.error('GeoJSON fout:', e));

  const input = item.querySelector('input');
  input.addEventListener('change', e => {
    if (e.target.checked) geojsonLaag.addTo(mapInstance);
    else mapInstance.removeLayer(geojsonLaag);
  });

} else {
  // Bestaande WMS-code...
```

**Gebruik in config na toevoeging:**
```json
{
  "bron": "geojson_url",
  "url": "https://mijn-server.be/data/punten.geojson",
  "label": "Eigen data",
  "default_aan": false
}
```

---

## 14. Nieuw sjabloon toevoegen

**Stap 1 — Functie toevoegen in index.html (na Sectie 9):**

```javascript
// ── 9b. SJABLOON: TABEL ──────────────────────────────────
function renderSjabloonTabel(container, loket) {
  container.innerHTML = `
    <div class="loket-header">
      <div class="loket-title">${loket.label}</div>
      <div class="loket-desc">${loket.beschrijving || ''}</div>
    </div>
    <!-- Tabel-implementatie hier -->
  `;
  // Verdere rendering-logica
}
```

**Stap 2 — Registreren in sjabloon-router (Sectie 6):**

Zoek:
```javascript
const sjablonen = {
  'geodata': renderSjabloonGeodata,
  'evolutie': renderSjabloonEvolutie,
  'hybride': renderSjabloonHybride
};
```

Voeg `'tabel': renderSjabloonTabel` toe aan het object.

**Stap 3 — Gebruiken in config:**
```json
{ "id": "overzicht", "sjabloon": "tabel", "label": "Tabel" }
```

---

## 15. Veelgestelde fouten

### "Configuratie niet gevonden (HTTP 404)"

Checklist:
- Staat het bestand in `configs/` (niet op de root)?
- Is de naam exact gelijk aan de URL-parameter?
  - `?gemeente=zwevegem` → `configs/zwevegem.json` ✓
  - `?gemeente=Zwevegem` → `configs/zwevegem.json` ✗ (hoofdlettergevoelig)
- Is de JSON geldig? Controleer op https://jsonlint.com

### Kaart laadt maar lagen verschijnen niet

Oorzaak 1: WMS URL of laagnaam fout
→ Controleer via GetCapabilities URL

Oorzaak 2: Zoom te ver uit
→ Sommige WMS-lagen tonen pas vanaf zoom 12-14

Oorzaak 3: `transparantie: 0` ingesteld
→ Zet op `0.8` of hoger

### POI-punten laden niet

Oorzaak: CORS-probleem bij lokaal testen via `file://`
Oplossing: altijd testen via `python -m http.server`, niet door dubbelklikken op HTML

### JSON is niet geldig (dashboard laadt niet)

Een komma te veel of te weinig breekt alles.
Controleer op https://jsonlint.com of in JupyterLab teksteditor.

---

## 16. Changelog

| Versie | Datum | Wijziging |
|---|---|---|
| v2.0 | april 2026 | Multi-loket navigatie, URL-routing, sjabloon-systeem |
| v2.1 | april 2026 | POI source-type (Geopunt OGC API Features) |
| v2.1 | april 2026 | Demo-config (orthofoto 2021 + zorgkaart) |
| v2.1 | april 2026 | Volledige documentatie README + inline code |

**Geplande uitbreidingen:**

| Fase | Feature |
|---|---|
| B | WFS source-type, gebied-filtering |
| D | Stadsmonitor data-pipeline, lijngrafiek-renderer, evolutie-sjabloon |
| F | Hybride-sjabloon met cross-filtering |

---

*Data Companion Framework · Kevin Huysentruyt*
*Databronnen: Digitaal Vlaanderen (open data), Basisregisters Vlaanderen*
