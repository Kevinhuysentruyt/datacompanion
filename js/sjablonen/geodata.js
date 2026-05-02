// ════════════════════════════════════════════════════════
//  SJABLOON: Geodata (v7)
//
//  Wijzigingen v7:
//  - Achtergrond-groep ook samenklapbaar (zoals kaartlagen)
//  - Titel "Kaartlagen" boven de rubrieken
//  - XYZ/MapLibre GL source toegevoegd
//  - Kaart-afbakening per loket
// ════════════════════════════════════════════════════════

import { resolveSource } from '../core.js';
import { laadLaag as laadWMS } from '../sources/wms.js';
import { laadLaag as laadPOI } from '../sources/poi.js';
import { laadLaag as laadGeoJSON } from '../sources/geojson.js';
import { laadLaag as laadXYZ } from '../sources/xyz.js';
import { maakToggle } from '../renderers/toggle.js';
import { maakRadio } from '../renderers/radio.js';

const SOURCES = {
  'wms':         laadWMS,
  'poi':         laadPOI,
  'geojson_url': laadGeoJSON,
  'xyz':         laadXYZ
};

const AFBAKENING_DEFAULTS = {
  modus: 'soft_lock',
  marge_percentage: 15,
  min_zoom: 12,
  max_zoom: 19,
  viscosity: 0.7
};

export function renderSjabloonGeodata(container, loket, state) {
  container.innerHTML = `
    <div class="loket-header">
      <div class="loket-title">${loket.label}</div>
      <div class="loket-desc">${loket.beschrijving || 'Interactieve kaart'}</div>
    </div>
    <div class="geodata-layout">
      <aside class="geodata-panel">
        <div class="panel-sectie-titel">Kaartlagen</div>
        <div id="kaartlagen-rubrieken"></div>
        <div id="achtergrond-rubriek"></div>
      </aside>
      <div class="geodata-map">
        <div id="map"></div>
      </div>
    </div>
  `;

  const cfg = state.config;
  const centrum = cfg.gemeente.fallback_centrum || [50.9, 4.0];
  const afbakening = { ...AFBAKENING_DEFAULTS, ...(loket.kaart_afbakening || {}) };

  const mapOpties = { attributionControl: true };
  if (afbakening.modus !== 'geen') {
    if (afbakening.min_zoom !== undefined) mapOpties.minZoom = afbakening.min_zoom;
    if (afbakening.max_zoom !== undefined) mapOpties.maxZoom = afbakening.max_zoom;
    mapOpties.maxBoundsViscosity = afbakening.modus === 'hard_lock' ? 1.0 : (afbakening.viscosity ?? 0.7);
  }

  const map = L.map('map', mapOpties).setView(centrum, 13);
  state.mapInstance = map;

  map.createPane('achtergrond');
  map.getPane('achtergrond').style.zIndex = 200;
  map.createPane('kaartlagen');
  map.getPane('kaartlagen').style.zIndex = 400;

  const groepen = loket.groepen || [];
  const isAchtergrondGroep = (g) => {
    const lbl = (g.label || '').toLowerCase();
    return lbl.includes('achtergrond') || lbl.includes('basiskaart');
  };

  const kaartGroepen = groepen.filter(g => !isAchtergrondGroep(g));
  const achtergrondGroep = groepen.find(isAchtergrondGroep);

  // ── KAARTLAGEN PER RUBRIEK ─────────────────────────────
  const rubriekContainer = document.getElementById('kaartlagen-rubrieken');

  if (kaartGroepen.length === 0) {
    rubriekContainer.innerHTML = '<div class="layer-empty">Geen kaartlagen</div>';
  } else {
    kaartGroepen.forEach((groep, idx) => {
      const groepEl = maakRubriek(
        groep.label || 'Rubriek',
        groep.lagen || [],
        idx === 0,  // eerste open
        map,
        'kaartlagen',
        'toggle'
      );
      if (groepEl) rubriekContainer.appendChild(groepEl);
    });
  }

  // ── ACHTERGROND — ook samenklapbaar ───────────────────
  const achterContainer = document.getElementById('achtergrond-rubriek');
  const achtergrondLagen = achtergrondGroep ? (achtergrondGroep.lagen || []) : [];
  const achtergrondLabel = achtergrondGroep?.label || 'Achtergrond';

  if (achtergrondLagen.length === 0) {
    achterContainer.innerHTML = '<div class="layer-empty">Geen achtergrond geconfigureerd</div>';
  } else {
    const radioNaam = `achtergrond-${Date.now()}`;
    const groepArray = [];

    // Bouw rubriek-wrapper
    const achterRubriekEl = document.createElement('div');
    achterRubriekEl.className = 'layer-group layer-group-rubriek layer-group-achtergrond';

    // Start gesloten
    achterRubriekEl.innerHTML = `
      <button class="rubriek-header" type="button">
        <span class="rubriek-arrow">▶</span>
        <span class="rubriek-titel">${achtergrondLabel}</span>
        <span class="rubriek-aantal">${achtergrondLagen.length}</span>
      </button>
      <div class="rubriek-content rubriek-gesloten"></div>
    `;

    const headerBtn = achterRubriekEl.querySelector('.rubriek-header');
    const contentEl = achterRubriekEl.querySelector('.rubriek-content');
    headerBtn.addEventListener('click', () => {
      headerBtn.classList.toggle('rubriek-open');
      contentEl.classList.toggle('rubriek-gesloten');
    });

    achtergrondLagen.forEach((laagConfig, idx) => {
      let laag;
      try { laag = resolveSource(laagConfig); }
      catch (e) { console.warn(`Bron niet gevonden: ${laagConfig.bron}`); return; }

      const bronType = laag.type || laag.bron;
      const sourceFn = SOURCES[bronType];
      if (!sourceFn) return;

      const laagMetPane = { ...laag, _pane: 'achtergrond' };
      let kaartlaag;
      try { kaartlaag = sourceFn(laagMetPane, map, null); }
      catch (e) { console.error(`Fout bij laden van ${laag.label}:`, e); return; }

      if (!kaartlaag) return;

      const item = document.createElement('div');
      item.className = 'layer-control';
      const toggleEl = maakRadio(laag.label || 'Naamloos', kaartlaag, map, radioNaam, idx === 0, groepArray);
      groepArray.push(kaartlaag);
      item.appendChild(toggleEl);

      const startOpacity = laag.transparantie ?? 1.0;
      item.appendChild(bouwSlider(kaartlaag, startOpacity));
      contentEl.appendChild(item);
    });

    // Scheidingslijn + label boven achtergrond
    const scheiding = document.createElement('div');
    scheiding.className = 'panel-sectie-scheiding';
    achterContainer.appendChild(scheiding);
    achterContainer.appendChild(achterRubriekEl);
  }

  // ── AUTO-ZOOM + AFBAKENING ─────────────────────────────
  if (cfg.gemeente.niscode) {
    fetch(`https://api.basisregisters.vlaanderen.be/v2/gemeenten/${cfg.gemeente.niscode}`,
      { headers: { Accept: 'application/json' } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const bb = d?.geometrie?.boundingBox;
        if (!bb || !state.mapInstance) return;

        const bounds = L.latLngBounds([bb.minY, bb.minX], [bb.maxY, bb.maxX]);
        state.mapInstance.fitBounds(bounds, { padding: [30, 30] });

        if (afbakening.modus !== 'geen') {
          const margeFactor = (afbakening.marge_percentage || 0) / 100;
          const breedte = bb.maxX - bb.minX;
          const hoogte = bb.maxY - bb.minY;
          const maxBounds = L.latLngBounds(
            [bb.minY - hoogte * margeFactor, bb.minX - breedte * margeFactor],
            [bb.maxY + hoogte * margeFactor, bb.maxX + breedte * margeFactor]
          );
          state.mapInstance.setMaxBounds(maxBounds);
        }
      })
      .catch(err => console.warn('Basisregisters niet bereikbaar:', err));
  }

  setTimeout(() => map.invalidateSize(), 100);
}

// ──────────────────────────────────────────────────────
// Bouw een inklapbare rubriek
// ──────────────────────────────────────────────────────
function maakRubriek(label, lagen, startOpen, map, paneNaam, modus, radioNaam, groepArray) {
  const groepEl = document.createElement('div');
  groepEl.className = 'layer-group layer-group-rubriek';

  groepEl.innerHTML = `
    <button class="rubriek-header${startOpen ? ' rubriek-open' : ''}" type="button">
      <span class="rubriek-arrow">▶</span>
      <span class="rubriek-titel">${label}</span>
      <span class="rubriek-aantal">${lagen.length}</span>
    </button>
    <div class="rubriek-content${startOpen ? '' : ' rubriek-gesloten'}"></div>
  `;

  const headerBtn = groepEl.querySelector('.rubriek-header');
  const contentEl = groepEl.querySelector('.rubriek-content');
  headerBtn.addEventListener('click', () => {
    headerBtn.classList.toggle('rubriek-open');
    contentEl.classList.toggle('rubriek-gesloten');
  });

  lagen.forEach((laagConfig, idx) => {
    const el = bouwLaagControl(laagConfig, map, modus || 'toggle', radioNaam, idx, groepArray, paneNaam);
    if (el) contentEl.appendChild(el);
  });

  return groepEl;
}

// ──────────────────────────────────────────────────────
// Bouw een laag-control (toggle of radio)
// ──────────────────────────────────────────────────────
function bouwLaagControl(laagConfig, map, modus, radioNaam, idx, groep, paneNaam) {
  let laag;
  try { laag = resolveSource(laagConfig); }
  catch (e) { console.warn(`Bron niet gevonden: ${laagConfig.bron}`, e); return null; }

  const bronType = laag.type || laag.bron;
  const sourceFn = SOURCES[bronType];
  if (!sourceFn) {
    console.warn(`Onbekende source type: ${bronType} voor ${laag.label || laagConfig.bron}`);
    return null;
  }

  const laagMetPane = { ...laag, _pane: paneNaam };
  const statusEl = document.createElement('div');
  statusEl.className = 'layer-status';

  let kaartlaag;
  try { kaartlaag = sourceFn(laagMetPane, map, statusEl); }
  catch (e) { console.error(`Fout bij laden van ${laag.label}:`, e); return null; }

  if (!kaartlaag) return null;

  if (typeof kaartlaag.on === 'function') {
    kaartlaag.on('tileerror', (err) => {
      console.warn(`Tile-fout voor ${laag.label}:`, err.tile?.src);
    });
  }

  const item = document.createElement('div');
  item.className = 'layer-control';

  let toggleEl;
  if (modus === 'radio') {
    toggleEl = maakRadio(laag.label || 'Naamloos', kaartlaag, map, radioNaam, idx === 0, groep);
    if (groep) groep.push(kaartlaag);
  } else {
    toggleEl = maakToggle(laag.label || 'Naamloos', kaartlaag, map);
  }
  item.appendChild(toggleEl);

  const startOpacity = laag.transparantie ?? 0.8;
  item.appendChild(bouwSlider(kaartlaag, startOpacity));
  item.appendChild(statusEl);
  return item;
}

function bouwSlider(kaartlaag, startOpacity) {
  const wrapper = document.createElement('div');
  wrapper.className = 'layer-slider';
  const startPercent = Math.round(startOpacity * 100);
  wrapper.innerHTML = `
    <input type="range" min="0" max="100" value="${startPercent}" class="slider-input" aria-label="Transparantie"/>
    <span class="slider-waarde">${startPercent}%</span>
  `;
  const input = wrapper.querySelector('.slider-input');
  const waardeEl = wrapper.querySelector('.slider-waarde');
  pasOpacityToe(kaartlaag, startOpacity);
  input.addEventListener('input', e => {
    const p = parseInt(e.target.value, 10);
    waardeEl.textContent = `${p}%`;
    pasOpacityToe(kaartlaag, p / 100);
  });
  return wrapper;
}

function pasOpacityToe(laag, opacity) {
  if (!laag) return;
  if (typeof laag.setOpacity === 'function') { laag.setOpacity(opacity); return; }
  if (typeof laag.eachLayer === 'function') {
    laag.eachLayer(sub => {
      if (typeof sub.setOpacity === 'function') sub.setOpacity(opacity);
      else if (typeof sub.setStyle === 'function') sub.setStyle({ opacity, fillOpacity: opacity * 0.7 });
    });
  }
}
