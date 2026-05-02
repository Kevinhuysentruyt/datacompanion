// ════════════════════════════════════════════════════════
//  SOURCE: WMS (v8)
//
//  v8: Werkende oplossing zonder CORS-issues
//  - Percelen: WFS naar GRB met Lambert72 BBOX (CORS werkt)
//  - Erfgoed: link-popup naar inventaris.onroerenderfgoed.be
//    (Onroerend Erfgoed WFS staat geen CORS toe)
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
// PERCELEN — via GRB WFS (Lambert72 BBOX, GML output)
// ──────────────────────────────────────────────────────
function activeerPerceelKlik(laag, map) {
  let actief = false;
  laag.on('add', () => { actief = true; });
  laag.on('remove', () => { actief = false; });

  map.on('click', async (e) => {
    if (!actief || !map.hasLayer(laag)) return;

    const popup = L.popup({ maxWidth: 320 })
      .setLatLng(e.latlng)
      .setContent('<div class="perceel-popup-loading"><span class="loader-mini"></span>Perceel zoeken...</div>')
      .openOn(map);

    try {
      // Stap 1: WGS84 → Lambert72 conversie via een eenvoudige formule
      // Voor Vlaanderen volstaat een proj4-achtige benadering, maar we gebruiken
      // de Geopunt geolocation API NIET (geen CORS).
      // We doen het via de WFS direct in WGS84-bbox:
      const bbox = bboxRondPunt(e.latlng, 5); // 5 meter buffer
      const feature = await haalPerceelOp(bbox);

      if (!feature) {
        popup.setContent('<div class="perceel-popup-fout">Geen perceel op deze locatie</div>');
        return;
      }
      popup.setContent(formatPerceelPopup(feature));
    } catch (err) {
      console.error('Perceel-fout:', err);
      popup.setContent(`<div class="perceel-popup-fout">${escapeHtml(err.message || 'Fout bij ophalen perceel')}</div>`);
    }
  });
}

// Maak een BBOX rond een lat/lng punt met een buffer in meters (geschat)
function bboxRondPunt(latlng, meters) {
  // Op 51° breedte: 1° lat ≈ 111 km, 1° lng ≈ 70 km
  const dLat = meters / 111000;
  const dLng = meters / 70000;
  return {
    minLat: latlng.lat - dLat,
    maxLat: latlng.lat + dLat,
    minLng: latlng.lng - dLng,
    maxLng: latlng.lng + dLng
  };
}

async function haalPerceelOp(bbox) {
  // Gebruik EPSG:4326 met juiste assen-volgorde voor WFS 2.0.0
  // WFS 2.0.0 met EPSG:4326 verwacht lat,lng order
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
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`WFS HTTP ${res.status}: ${txt.slice(0, 100)}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('json')) {
    const txt = await res.text();
    console.warn('WFS gaf geen JSON terug:', txt.slice(0, 300));
    throw new Error('WFS gaf geen JSON terug');
  }
  const data = await res.json();
  return data.features?.[0] || null;
}

function formatPerceelPopup(feature) {
  const p = feature.properties || {};

  // Probeer alle mogelijke veldnamen (capakey wisselt per dataset)
  const capakey = p.CAPAKEY || p.capakey || p.CAPA_KEY || '—';
  const gemeente = p.GEMEENTE || p.gemeente || p.MUNI_NAME || p.muni_name || '—';
  const sectie = p.SECTIE || p.sectie || '—';
  const grondnr = p.GRONDNR || p.grondnr || p.PERCNR || p.percnr || '—';
  const opp = p.OPPERVL || p.oppervl || p.SHAPE_AREA || null;

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
// ERFGOED — directe link naar inventaris (geen API-call)
// ──────────────────────────────────────────────────────
// Onroerend Erfgoed WFS staat geen CORS toe vanaf externe origins.
// Daarom maken we een popup met een directe link naar de
// inventaris.onroerenderfgoed.be zoekpagina rond de klikpunt.
// Daar krijgt de gebruiker alle masterdata (foto's, geschiedenis,
// beschermingsbesluit, ...).
function activeerErfgoedKlik(laag, map, laagConfig) {
  let actief = false;
  laag.on('add', () => { actief = true; });
  laag.on('remove', () => { actief = false; });

  map.on('click', (e) => {
    if (!actief || !map.hasLayer(laag)) return;

    const { lat, lng } = e.latlng;
    const inventarisUrl = `https://inventaris.onroerenderfgoed.be/?lat=${lat.toFixed(6)}&lng=${lng.toFixed(6)}&zoom=18`;
    const geoportaalUrl = `https://geo.onroerenderfgoed.be/#/?layer=${encodeURIComponent(laagConfig.layer)}&zoom=18&center=${lat.toFixed(6)},${lng.toFixed(6)}`;

    L.popup({ maxWidth: 320 })
      .setLatLng(e.latlng)
      .setContent(`
        <div class="erfgoed-popup">
          <div class="erfgoed-titel">${escapeHtml(laagConfig.label)}</div>
          <div class="erfgoed-uitleg">
            Bekijk alle <strong>${escapeHtml(laagConfig.label.toLowerCase())}</strong>
            op deze locatie in de officiële inventaris van Onroerend Erfgoed,
            inclusief foto's, datering, beschermingsbesluit en geschiedenis.
          </div>
          <div class="erfgoed-link">
            <a href="${inventarisUrl}" target="_blank" rel="noopener">
              Open in inventaris →
            </a>
          </div>
          <div class="erfgoed-link" style="border-top:none;padding-top:0;margin-top:4px">
            <a href="${geoportaalUrl}" target="_blank" rel="noopener">
              Open in geoportaal →
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

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
