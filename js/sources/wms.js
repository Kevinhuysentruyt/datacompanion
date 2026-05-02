// ════════════════════════════════════════════════════════
//  SOURCE: WMS (v10)
//
//  v10: Eerlijke en werkende oplossing
//  - Percelen: capakey + REST details (zoals v9)
//  - Erfgoed: gemeente uit capakey + zoeklinks die WERKEN
//    (geen valse beloften over deeplinks naar specifieke objecten)
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
// PERCELEN — twee-staps via WFS + CapaKey REST
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
      const bbox = bboxRondPunt(e.latlng, 5);
      const capakey = await haalCapakeyOp(bbox);

      if (!capakey) {
        popup.setContent('<div class="perceel-popup-fout">Geen perceel op deze locatie</div>');
        return;
      }

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

async function haalPerceelDetails(capakey) {
  const delen = capakey.split('/');
  if (delen.length !== 2) return null;
  const [code1, code2] = delen;
  const url = `https://geo.api.vlaanderen.be/capakey/v2/parcel/${encodeURIComponent(code1)}/${encodeURIComponent(code2)}?data=adp&status=actual`;
  const res = await fetch(url);
  if (!res.ok) {
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
// ERFGOED — eerlijke aanpak: gemeentecontext + zoeklinks
// ──────────────────────────────────────────────────────
// De inventaris en het geoportaal van Onroerend Erfgoed hebben geen
// publieke deeplink-API voor coördinaten. We tonen daarom:
//   1. De gemeente waar geklikt werd (uit capakey-lookup)
//   2. Het type erfgoed-laag
//   3. Werkende links naar de zoekformulieren
function activeerErfgoedKlik(laag, map, laagConfig) {
  let actief = false;
  laag.on('add', () => { actief = true; });
  laag.on('remove', () => { actief = false; });

  map.on('click', async (e) => {
    if (!actief || !map.hasLayer(laag)) return;

    const { lat, lng } = e.latlng;

    // Stap 1: open popup met loader
    const popup = L.popup({ maxWidth: 340 })
      .setLatLng(e.latlng)
      .setContent('<div class="erfgoed-popup-loading"><span class="loader-mini"></span>Locatie identificeren...</div>')
      .openOn(map);

    // Stap 2: probeer de gemeente te bepalen
    let gemeente = null;
    try {
      const bbox = bboxRondPunt(e.latlng, 10);
      const capakey = await haalCapakeyOp(bbox);
      if (capakey) {
        const details = await haalPerceelDetails(capakey);
        gemeente = details?.municipalityName || null;
      }
    } catch (err) {
      console.warn('Gemeente niet gevonden:', err);
    }

    // Stap 3: bouw popup met de info die we wel hebben
    const inventarisType = bepaalInventarisType(laagConfig.layer);
    const inventarisZoekUrl = `https://inventaris.onroerenderfgoed.be/${inventarisType}/zoeken`;
    const geoportaalUrl = 'https://geo.onroerenderfgoed.be/';

    const gemeenteHint = gemeente
      ? `<div class="erfgoed-hint">💡 Vul <strong>${escapeHtml(gemeente)}</strong> in bij gemeente om te filteren.</div>`
      : '';

    popup.setContent(`
      <div class="erfgoed-popup">
        <div class="erfgoed-titel">${escapeHtml(laagConfig.label)}</div>
        ${gemeente ? `<div class="erfgoed-rij"><span class="erfgoed-key">Gemeente:</span> ${escapeHtml(gemeente)}</div>` : ''}
        <div class="erfgoed-rij"><span class="erfgoed-key">Coördinaat:</span> ${lat.toFixed(5)}°, ${lng.toFixed(5)}°</div>

        ${gemeenteHint}

        <div class="erfgoed-link">
          <a href="${inventarisZoekUrl}" target="_blank" rel="noopener">
            Zoek in inventaris →
          </a>
        </div>
        <div class="erfgoed-link" style="border-top:none;padding-top:0;margin-top:4px">
          <a href="${geoportaalUrl}" target="_blank" rel="noopener">
            Open Geoportaal →
          </a>
        </div>
      </div>
    `);
  });
}

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
