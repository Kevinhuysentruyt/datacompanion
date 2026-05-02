// ════════════════════════════════════════════════════════
//  SOURCE: WMS (v7)
//
//  v7: Nieuwe aanpak via WFS GetFeature i.p.v. CORS-loze APIs
//  - Percelen: WFS naar GRB:ADP voor capakey + gemeente
//  - Erfgoed: WFS naar Onroerend Erfgoed voor masterdata
//  - Beide in dezelfde popup-stijl
// ════════════════════════════════════════════════════════

export function laadLaag(laagConfig, map, statusEl) {
  const opties = {
    layers: laagConfig.layer,
    format: 'image/png',
    transparent: true,
    version: '1.3.0',
    attribution: laagConfig.attribution || ''
  };

  if (laagConfig._pane) opties.pane = laagConfig._pane;

  const wmsLaag = L.tileLayer.wms(laagConfig.url, opties);

  // Percelen klikbaar via WFS
  if (laagConfig.klikbaar) {
    activeerPerceelKlik(wmsLaag, map);
  }

  // Erfgoed klikbaar via WFS
  if (laagConfig.klikbaar_inventaris) {
    activeerErfgoedKlik(wmsLaag, map, laagConfig);
  }

  return wmsLaag;
}

// ──────────────────────────────────────────────────────
// PERCELEN (GRB:ADP) — via WFS GetFeature met INTERSECTS
// ──────────────────────────────────────────────────────
function activeerPerceelKlik(laag, map) {
  let actief = false;
  laag.on('add', () => { actief = true; });
  laag.on('remove', () => { actief = false; });

  map.on('click', async (e) => {
    if (!actief || !map.hasLayer(laag)) return;

    const popup = L.popup({ maxWidth: 320 })
      .setLatLng(e.latlng)
      .setContent('<div class="perceel-popup-loading"><div class="loader-mini"></div>Perceel zoeken...</div>')
      .openOn(map);

    try {
      const feature = await haalPerceelOp(e.latlng);
      if (!feature) {
        popup.setContent('<div class="perceel-popup-fout">Geen perceel op deze locatie</div>');
        return;
      }
      popup.setContent(formatPerceelPopup(feature));
    } catch (err) {
      console.error('Perceel-fout:', err);
      popup.setContent('<div class="perceel-popup-fout">Fout bij ophalen perceel</div>');
    }
  });
}

async function haalPerceelOp(latlng) {
  // WFS naar GRB:ADP met BBOX-filter rond het klikpunt
  const dx = 0.00005; // ~5 meter buffer
  const bbox = `${latlng.lng - dx},${latlng.lat - dx},${latlng.lng + dx},${latlng.lat + dx},EPSG:4326`;

  const url = new URL('https://geo.api.vlaanderen.be/GRB/wfs');
  url.search = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeNames: 'GRB:ADP',
    outputFormat: 'application/json',
    srsName: 'EPSG:4326',
    bbox: bbox,
    count: 1
  }).toString();

  const res = await fetch(url);
  if (!res.ok) throw new Error(`WFS HTTP ${res.status}`);
  const data = await res.json();
  return data.features?.[0] || null;
}

function formatPerceelPopup(feature) {
  const p = feature.properties || {};
  const capakey = p.CAPAKEY || p.capakey || '—';
  const gemeente = p.GEMEENTE || p.gemeente || p.MUNI_NAME || '—';
  const sectie = p.SECTIE || p.sectie || '—';
  const grondnr = p.GRONDNR || p.grondnr || p.PERCNR || '—';
  const opp = p.OPPERVL || p.oppervl || null;

  const oppText = opp ? `${Number(opp).toLocaleString('nl-BE', { maximumFractionDigits: 0 })} m²` : null;

  return `
    <div class="perceel-popup">
      <div class="perceel-popup-titel">${escapeHtml(capakey)}</div>
      <div class="perceel-popup-rij"><span>Gemeente:</span> ${escapeHtml(gemeente)}</div>
      <div class="perceel-popup-rij"><span>Sectie:</span> ${escapeHtml(sectie)} / Perceel ${escapeHtml(String(grondnr))}</div>
      ${oppText ? `<div class="perceel-popup-rij"><span>Oppervlakte:</span> ${oppText}</div>` : ''}
      <div class="perceel-popup-link">
        <a href="https://eservices.minfin.fgov.be/ecad-web/?capakey=${encodeURIComponent(capakey)}" target="_blank" rel="noopener">
          Open in CadGIS →
        </a>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────────────
// ERFGOED — via WFS GetFeature naar onroerenderfgoed.be
// ──────────────────────────────────────────────────────
// Mapping van WMS-laagnaam naar WFS-typename
const ERFGOED_WFS_MAP = {
  'vioe_geoportaal:bes_monument': 'vioe_geoportaal:bes_monument',
  'vioe_geoportaal:bes_landschap': 'vioe_geoportaal:bes_landschap',
  'vioe_geoportaal:bes_arch_site': 'vioe_geoportaal:bes_arch_site',
  'vioe_geoportaal:bes_sd_gezicht': 'vioe_geoportaal:bes_sd_gezicht',
  'vioe_geoportaal:bouwkundig_element': 'vioe_geoportaal:bouwkundig_element',
  'vioe_geoportaal:landschappelijk_element': 'vioe_geoportaal:landschappelijk_element',
  'vioe_geoportaal:archeologisch_element': 'vioe_geoportaal:archeologisch_element',
  'vioe_geoportaal:erfgoedls': 'vioe_geoportaal:erfgoedls'
};

function activeerErfgoedKlik(laag, map, laagConfig) {
  let actief = false;
  laag.on('add', () => { actief = true; });
  laag.on('remove', () => { actief = false; });

  map.on('click', async (e) => {
    if (!actief || !map.hasLayer(laag)) return;

    const popup = L.popup({ maxWidth: 360 })
      .setLatLng(e.latlng)
      .setContent('<div class="erfgoed-popup-loading"><div class="loader-mini"></div>Erfgoed zoeken...</div>')
      .openOn(map);

    try {
      const features = await haalErfgoedOp(e.latlng, laagConfig.layer);
      if (!features || features.length === 0) {
        popup.setContent(`<div class="erfgoed-popup-leeg">Geen ${escapeHtml(laagConfig.label.toLowerCase())} op deze locatie</div>`);
        return;
      }
      const html = features.map(f => formatErfgoedFeature(f, laagConfig.label)).join('<hr style="margin: 10px 0; border: 0; border-top: 1px solid #eee;"/>');
      popup.setContent(`<div class="erfgoed-popup">${html}</div>`);
    } catch (err) {
      console.error('Erfgoed-fout:', err);
      popup.setContent('<div class="erfgoed-popup-fout">Fout bij ophalen erfgoedinfo</div>');
    }
  });
}

async function haalErfgoedOp(latlng, wmsLayer) {
  const typeName = ERFGOED_WFS_MAP[wmsLayer] || wmsLayer;
  const dx = 0.0001; // ~10 meter buffer
  const bbox = `${latlng.lat - dx},${latlng.lng - dx},${latlng.lat + dx},${latlng.lng + dx},EPSG:4326`;

  const url = new URL('https://geo.onroerenderfgoed.be/geoserver/wfs');
  url.search = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeNames: typeName,
    outputFormat: 'application/json',
    srsName: 'EPSG:4326',
    bbox: bbox,
    count: 5
  }).toString();

  const res = await fetch(url);
  if (!res.ok) throw new Error(`WFS HTTP ${res.status}`);
  const data = await res.json();
  return data.features || [];
}

function formatErfgoedFeature(feature, laagLabel) {
  const p = feature.properties || {};

  // Naam zoeken in mogelijke veldnamen
  const naam = p.naam || p.NAAM || p.benaming || p.naam_obj || p.objectnaam || 'Onbenoemd erfgoed';

  // ID voor link naar inventaris
  const id = p.objectid || p.OBJECTID || p.id || p.aanduid_id || p.AANDUID_ID || null;

  // Belangrijke velden om te tonen (in volgorde van prioriteit)
  const belangrijkeVelden = [
    ['typologie', 'Typologie'],
    ['TYPOLOGIE', 'Typologie'],
    ['datering', 'Datering'],
    ['DATERING', 'Datering'],
    ['gemeente', 'Gemeente'],
    ['GEMEENTE', 'Gemeente'],
    ['deelgemeen', 'Deelgemeente'],
    ['DEELGEMEEN', 'Deelgemeente'],
    ['straat', 'Straat'],
    ['STRAAT', 'Straat'],
    ['huisnummer', 'Nr'],
    ['HUISNR', 'Nr'],
    ['stijl', 'Stijl'],
    ['STIJL', 'Stijl'],
    ['besluit', 'Beschermingsbesluit'],
    ['BESLUIT', 'Beschermingsbesluit'],
    ['datum_besl', 'Beschermingsdatum'],
    ['DATUM_BESL', 'Beschermingsdatum']
  ];

  const seen = new Set();
  const rijenHtml = belangrijkeVelden
    .filter(([key]) => p[key] !== undefined && p[key] !== null && p[key] !== '' && !seen.has(key.toLowerCase()))
    .map(([key, label]) => {
      seen.add(key.toLowerCase());
      return `<div class="erfgoed-rij"><span class="erfgoed-key">${label}:</span> ${escapeHtml(String(p[key]))}</div>`;
    })
    .slice(0, 6)
    .join('');

  // Link naar de officiële inventarisfiche
  let linkHtml = '';
  if (id && /^\d+$/.test(String(id))) {
    // Voor aanduidingsobjecten (beschermingen)
    if (p.aanduid_id || p.AANDUID_ID || laagLabel.toLowerCase().includes('beschermd') || laagLabel.toLowerCase().includes('gezicht')) {
      linkHtml = `
        <div class="erfgoed-link">
          <a href="https://id.erfgoed.net/aanduidingsobjecten/${id}" target="_blank" rel="noopener">
            Bekijk volledige fiche →
          </a>
        </div>`;
    } else {
      linkHtml = `
        <div class="erfgoed-link">
          <a href="https://id.erfgoed.net/erfgoedobjecten/${id}" target="_blank" rel="noopener">
            Bekijk volledige fiche →
          </a>
        </div>`;
    }
  }

  return `
    <div class="erfgoed-feature">
      <div class="erfgoed-titel">${escapeHtml(naam)}</div>
      <div class="erfgoed-type">${escapeHtml(laagLabel)}</div>
      ${rijenHtml}
      ${linkHtml}
    </div>
  `;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
