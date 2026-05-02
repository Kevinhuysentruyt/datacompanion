// ════════════════════════════════════════════════════════
//  SOURCE: WMS (v9)
//
//  v9: Twee-staps perceel-info via CapaKey REST API
//  - Stap 1: GRB WFS → krijg capakey
//  - Stap 2: CapaKey REST → volledige details (gemeente, sectie, perceel, adres)
//  - Erfgoed: link naar inventaris zoekpagina met gemeente-filter
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

  if (laagConfig.klikbaar) {
    activeerPerceelKlik(wmsLaag, map);
  }

  if (laagConfig.klikbaar_inventaris) {
    activeerErfgoedKlik(wmsLaag, map, laagConfig);
  }

  return wmsLaag;
}

// ──────────────────────────────────────────────────────
// PERCELEN — twee-staps: WFS (capakey) + CapaKey REST (details)
// ──────────────────────────────────────────────────────
function activeerPerceelKlik(laag, map) {
  let actief = false;
  laag.on('add', () => { actief = true; });
  laag.on('remove', () => { actief = false; });

  map.on('click', async (e) => {
    if (!actief || !map.hasLayer(laag)) return;

    const popup = L.popup({ maxWidth: 340 })
      .setLatLng(e.latlng)
      .setContent('<div class="perceel-popup-loading"><span class="loader-mini"></span>Perceel zoeken...</div>')
      .openOn(map);

    try {
      // Stap 1: Krijg de capakey via WFS
      const bbox = bboxRondPunt(e.latlng, 5);
      const capakey = await haalCapakeyOp(bbox);

      if (!capakey) {
        popup.setContent('<div class="perceel-popup-fout">Geen perceel op deze locatie</div>');
        return;
      }

      // Stap 2: Krijg de volledige details via CapaKey REST
      popup.setContent('<div class="perceel-popup-loading"><span class="loader-mini"></span>Perceeldetails ophalen...</div>');
      const details = await haalPerceelDetails(capakey);
      popup.setContent(formatPerceelPopup(capakey, details));

    } catch (err) {
      console.error('Perceel-fout:', err);
      popup.setContent(`<div class="perceel-popup-fout">${escapeHtml(err.message || 'Fout bij ophalen perceel')}</div>`);
    }
  });
}

function bboxRondPunt(latlng, meters) {
  const dLat = meters / 111000;
  const dLng = meters / 70000;
  return {
    minLat: latlng.lat - dLat,
    maxLat: latlng.lat + dLat,
    minLng: latlng.lng - dLng,
    maxLng: latlng.lng + dLng
  };
}

async function haalCapakeyOp(bbox) {
  const url = new URL('https://geo.api.vlaanderen.be/GRB/wfs');
  url.search = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeNames: 'GRB:ADP',
    outputFormat: 'application/json',
    srsName: 'urn:ogc:def:crs:EPSG::4326',
    bbox: `${bbox.minLat},${bbox.minLng},${bbox.maxLat},${bbox.maxLng},urn:ogc:def:crs:EPSG::4326`,
    count: 1
  }).toString();

  const res = await fetch(url);
  if (!res.ok) throw new Error(`WFS HTTP ${res.status}`);
  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) return null;
  const p = feature.properties || {};
  return p.CAPAKEY || p.capakey || p.CAPA_KEY || null;
}

// CapaKey REST API v2 — geeft volledige details
// URL formaat: /capakey/v2/parcel/{parcelCode1}/{parcelCode2}
// Capakey "34042D0402/00_000" splitsen in:
//   - parcelCode1 = "34042D0402"
//   - parcelCode2 = "00_000"
async function haalPerceelDetails(capakey) {
  const delen = capakey.split('/');
  if (delen.length !== 2) {
    throw new Error(`Capakey-formaat onverwacht: ${capakey}`);
  }
  const [code1, code2] = delen;
  const url = `https://geo.api.vlaanderen.be/capakey/v2/parcel/${encodeURIComponent(code1)}/${encodeURIComponent(code2)}?data=adp&status=actual`;

  const res = await fetch(url);
  if (!res.ok) {
    // Niet kritiek: we kunnen toch nog de capakey zelf tonen
    console.warn(`CapaKey REST gaf ${res.status} voor ${capakey}`);
    return null;
  }
  return await res.json();
}

function formatPerceelPopup(capakey, details) {
  let gemeente = '—';
  let sectie = '—';
  let perceel = '—';
  let adres = null;

  if (details) {
    gemeente = details.municipalityName || '—';
    sectie = details.sectionCode || '—';
    perceel = details.perceelnummer || '—';
    if (Array.isArray(details.adres) && details.adres.length > 0) {
      adres = details.adres.filter(a => a && a.trim()).join(', ');
    }
  }

  return `
    <div class="perceel-popup">
      <div class="perceel-popup-titel">${escapeHtml(capakey)}</div>
      <div class="perceel-popup-rij"><span>Gemeente:</span> ${escapeHtml(gemeente)}</div>
      <div class="perceel-popup-rij"><span>Sectie:</span> ${escapeHtml(sectie)} / Perceel ${escapeHtml(String(perceel))}</div>
      ${adres ? `<div class="perceel-popup-rij"><span>Adres:</span> ${escapeHtml(adres)}</div>` : ''}
      <div class="perceel-popup-link">
        <a href="https://eservices.minfin.fgov.be/ecad-web/?capakey=${encodeURIComponent(capakey)}" target="_blank" rel="noopener">
          Open in CadGIS →
        </a>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────────────
// ERFGOED — links naar inventaris + geoportaal van Onroerend Erfgoed
// ──────────────────────────────────────────────────────
// We kunnen geen API-call doen (CORS geblokkeerd). In plaats daarvan:
// - Link naar inventaris-zoekpagina gefilterd op de gemeente uit de config
// - Link naar het Geoportaal van Onroerend Erfgoed
function activeerErfgoedKlik(laag, map, laagConfig) {
  let actief = false;
  laag.on('add', () => { actief = true; });
  laag.on('remove', () => { actief = false; });

  map.on('click', async (e) => {
    if (!actief || !map.hasLayer(laag)) return;

    const { lat, lng } = e.latlng;

    // Probeer de gemeente te vinden via een capakey-call (we zitten al op WGS84)
    let gemeente = null;
    try {
      const bbox = bboxRondPunt(e.latlng, 10);
      const capakey = await haalCapakeyOp(bbox);
      if (capakey) {
        const details = await haalPerceelDetails(capakey);
        gemeente = details?.municipalityName || null;
      }
    } catch (err) {
      console.warn('Gemeente niet gevonden voor erfgoed-popup:', err);
    }

    // Bouw URLs op
    const inventarisType = bepaalInventarisType(laagConfig.layer);
    let inventarisUrl;
    if (gemeente) {
      inventarisUrl = `https://inventaris.onroerenderfgoed.be/${inventarisType}/zoeken?gemeente=${encodeURIComponent(gemeente)}`;
    } else {
      inventarisUrl = `https://inventaris.onroerenderfgoed.be/${inventarisType}/zoeken`;
    }
    const geoportaalUrl = 'https://geo.onroerenderfgoed.be/';

    L.popup({ maxWidth: 320 })
      .setLatLng(e.latlng)
      .setContent(`
        <div class="erfgoed-popup">
          <div class="erfgoed-titel">${escapeHtml(laagConfig.label)}</div>
          ${gemeente ? `<div class="perceel-popup-rij"><span>Gemeente:</span> ${escapeHtml(gemeente)}</div>` : ''}
          <div class="erfgoed-uitleg">
            Bekijk alle <strong>${escapeHtml(laagConfig.label.toLowerCase())}</strong>${gemeente ? ` in <strong>${escapeHtml(gemeente)}</strong>` : ''}
            in de officiële inventaris van Onroerend Erfgoed,
            inclusief foto's, datering en beschermingsbesluit.
          </div>
          <div class="erfgoed-link">
            <a href="${inventarisUrl}" target="_blank" rel="noopener">
              Open in inventaris →
            </a>
          </div>
          <div class="erfgoed-link" style="border-top:none;padding-top:0;margin-top:4px">
            <a href="${geoportaalUrl}" target="_blank" rel="noopener">
              Open Geoportaal Onroerend Erfgoed →
            </a>
          </div>
          <div class="erfgoed-coords">
            <small>Locatie: ${lat.toFixed(5)}°, ${lng.toFixed(5)}°</small>
          </div>
        </div>
      `)
      .openOn(map);
  });
}

// Bepaalt of we naar erfgoedobjecten of aanduidingsobjecten moeten linken
// op basis van de WMS-laagnaam.
function bepaalInventarisType(wmsLayer) {
  const beschermd = ['bes_monument', 'bes_landschap', 'bes_arch_site', 'bes_sd_gezicht', 'erfgoedls', 'unesco'];
  const isBeschermd = beschermd.some(b => wmsLayer.includes(b));
  return isBeschermd ? 'aanduidingsobjecten' : 'erfgoedobjecten';
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
