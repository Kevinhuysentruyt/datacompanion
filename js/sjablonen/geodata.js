// ════════════════════════════════════════════════════════
//  SJABLOON: Geodata (v2)
//  Twee secties in zijpaneel:
//  1. KAARTLAGEN — checkbox toggle + transparantie-schuiver
//  2. ACHTERGROND — radio button + transparantie-schuiver
// ════════════════════════════════════════════════════════

import { resolveSource } from '../core.js';
import { laadLaag as laadWMS } from '../sources/wms.js';
import { laadLaag as laadPOI } from '../sources/poi.js';
import { laadLaag as laadGeoJSON } from '../sources/geojson.js';
import { maakToggle } from '../renderers/toggle.js';
import { maakRadio } from '../renderers/radio.js';

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
        <div class="layer-group">
          <div class="layer-group-title">Kaartlagen</div>
          <div id="kaartlagen-container"></div>
        </div>
        <div class="layer-group">
          <div class="layer-group-title">Achtergrond</div>
          <div id="achtergrond-container"></div>
        </div>
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

  // Lagen verzamelen en opdelen
  const alleLagen = (loket.groepen || []).flatMap(g =>
    (g.lagen || []).map(l => ({ ...l, _groep_label: g.label }))
  );

  const isAchtergrond = (l) => {
    if (l.rol === 'achtergrond') return true;
    if (l.rol === 'kaartlaag') return false;
    const grp = (l._groep_label || '').toLowerCase();
    return grp.includes('achtergrond') || grp.includes('basiskaart');
  };

  const kaartlagen = alleLagen.filter(l => !isAchtergrond(l));
  const achtergrondlagen = alleLagen.filter(isAchtergrond);

  // Kaartlagen renderen
  const kaartContainer = document.getElementById('kaartlagen-container');
  if (kaartlagen.length === 0) {
    kaartContainer.innerHTML = '<div class="layer-empty">Geen kaartlagen geconfigureerd</div>';
  } else {
    kaartlagen.forEach(laag => {
      const el = bouwLaagControl(laag, map, 'toggle');
      if (el) kaartContainer.appendChild(el);
    });
  }

  // Achtergrond renderen
  const achterContainer = document.getElementById('achtergrond-container');
  if (achtergrondlagen.length === 0) {
    const fallback = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      subdomains: 'abcd', opacity: 0.6
    });
    fallback.addTo(map);
    achterContainer.innerHTML = '<div class="layer-empty">Standaard achtergrond actief</div>';
  } else {
    const radioNaam = `achtergrond-${Date.now()}`;
    const groep = [];
    achtergrondlagen.forEach((laag, idx) => {
      const el = bouwLaagControl(laag, map, 'radio', radioNaam, idx, groep);
      if (el) achterContainer.appendChild(el);
    });
  }

  // Auto-zoom via Basisregisters
  if (cfg.gemeente.niscode) {
    fetch(`https://api.basisregisters.vlaanderen.be/v2/gemeenten/${cfg.gemeente.niscode}`,
      { headers: { Accept: 'application/json' } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const bb = d?.geometrie?.boundingBox;
        if (bb && state.mapInstance) {
          state.mapInstance.fitBounds([[bb.minY, bb.minX], [bb.maxY, bb.maxX]], { padding: [30, 30] });
        }
      })
      .catch(() => {});
  }
}

// Bouwt een laag-control: toggle/radio + transparantie-schuiver
function bouwLaagControl(laagConfig, map, modus, radioNaam, idx, groep) {
  const laag = resolveSource(laagConfig);
  const bronType = laag.type || laag.bron;
  const sourceFn = SOURCES[bronType];
  if (!sourceFn) {
    console.warn(`Onbekende source: ${bronType}`);
    return null;
  }

  const statusEl = document.createElement('div');
  statusEl.className = 'layer-status';

  const kaartlaag = sourceFn(laag, map, statusEl);
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

// Transparantie-schuiver
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
  if (typeof laag.setOpacity === 'function') {
    laag.setOpacity(opacity);
    return;
  }
  if (typeof laag.eachLayer === 'function') {
    laag.eachLayer(sub => {
      if (typeof sub.setOpacity === 'function') sub.setOpacity(opacity);
      else if (typeof sub.setStyle === 'function') sub.setStyle({ opacity: opacity, fillOpacity: opacity * 0.7 });
    });
  }
}
