// ════════════════════════════════════════════════════════
//  SJABLOON: Geodata
//  Kaart-centric scherm met laag-toggles in zijpaneel
//
//  Roept de juiste source-module aan per laag-type
//  (wms, poi, geojson_url) en maakt toggles voor het paneel
// ════════════════════════════════════════════════════════

import { resolveSource, state } from '../core.js';
import { laadLaag as laadWMS } from '../sources/wms.js';
import { laadLaag as laadPOI } from '../sources/poi.js';
import { laadLaag as laadGeoJSON } from '../sources/geojson.js';
import { maakToggle } from '../renderers/toggle.js';

// Source-router: koppelt bron-type aan source-module
// UITBREIDEN: voeg nieuwe types hier toe
const SOURCES = {
  'wms':         laadWMS,
  'poi':         laadPOI,
  'geojson_url': laadGeoJSON
};

export function renderSjabloonGeodata(container, loket, state) {
  container.innerHTML = `
    <div class="loket-header">
      <div class="loket-title">${loket.label}</div>
      <div class="loket-desc">${loket.beschrijving || 'Interactieve kaart'}</div>
    </div>
    <div class="geodata-layout">
      <aside class="geodata-panel">
        <div id="lagen-container"></div>
      </aside>
      <div class="geodata-map">
        <div id="map"></div>
      </div>
    </div>
  `;

  // Kaart initialiseren
  const cfg = state.config;
  const centrum = cfg.gemeente.fallback_centrum || [50.9, 4.0];
  const map = L.map('map').setView(centrum, 12);
  state.mapInstance = map;

  // Achtergrondkaart
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    opacity: 0.4
  }).addTo(map);

  // Lagen-paneel opbouwen vanuit groepen
  const paneel = document.getElementById('lagen-container');

  (loket.groepen || []).forEach(groep => {
    const groepEl = document.createElement('div');
    groepEl.className = 'layer-group';
    groepEl.innerHTML = `<div class="layer-group-title">${groep.label}</div>`;

    (groep.lagen || []).forEach(laagConfig => {
      // Resolve via sources.json
      const laag = resolveSource(laagConfig);
      const bronType = laag.type || laag.bron;
      const sourceFn = SOURCES[bronType];

      if (!sourceFn) {
        console.warn(`Onbekende source type: ${bronType}`);
        return;
      }

      // Status-element voor lazy-loading feedback
      const statusEl = document.createElement('div');
      statusEl.className = 'layer-status';

      // Laag aanmaken via juiste source-module
      const kaartlaag = sourceFn(laag, map, statusEl);

      // Toggle in zijpaneel
      const toggle = maakToggle(laag.label || 'Naamloze laag', kaartlaag, map);
      toggle.appendChild(statusEl);
      groepEl.appendChild(toggle);
    });

    paneel.appendChild(groepEl);
  });

  // Auto-zoom via Basisregisters NIS-code
  if (cfg.gemeente.niscode) {
    fetch(`https://api.basisregisters.vlaanderen.be/v2/gemeenten/${cfg.gemeente.niscode}`,
      { headers: { Accept: 'application/json' } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const bb = d?.geometrie?.boundingBox;
        if (bb && state.mapInstance) {
          state.mapInstance.fitBounds(
            [[bb.minY, bb.minX], [bb.maxY, bb.maxX]],
            { padding: [30, 30] }
          );
        }
      })
      .catch(() => {/* fallback al gezet */});
  }
}
