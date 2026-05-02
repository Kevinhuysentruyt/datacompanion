// ════════════════════════════════════════════════════════
//  SOURCE: WMS (v11)
//
//  v11: Snelle perceel-info via parallelle calls
//  - WFS GRB en CapaKey REST starten tegelijk (Promise.all)
//  - Popup toont WFS-info (oppervlakte) zodra die binnen is
//  - Gemeente/sectie/adres komen van CapaKey REST
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
// PERCELEN — parallelle calls voor snelheid
// ──────────────────────────────────────────────────────
function activeerPerceelKlik(laag, map) {
  let actief = false;
  laag.on('add', () => { actief = true; });
  laag.on('remove', () => { actief = false; });

  map.on('click', async (e) => {
    if (!actief || !map.hasLayer(laag)) return;

    const popup = L.popup({ maxWidth: 360 })
      .setLatLng(e.latlng)
      .setContent('<div class="perceel-popup-loading"><span class="loader-mini"></span>Perceel zoeken...</div>')
      .openOn(map);

    try {
      // Stap 1: krijg de WFS feature (geeft capakey + oppervlakte snel)
      const wfsFeature = await haalPerceelWFS(e.latlng);
      if (!wfsFeature) {
        popup.setContent('<div class="perceel-popup-fout">Geen perceel op deze locatie</div>');
        return;
      }

      const wfsProps = wfsFeature.properties || {};
      const capakey = wfsProps.CAPAKEY || wfsProps.capakey || wfsProps.CAPA_KEY;
      const oppervlakte = wfsProps.OPPERVL || wfsProps.oppervl || wfsProps.SHAPE_AREA || null;

      // Toon meteen wat we al hebben
      popup.setContent(formatPerceelPopup(capakey, null, { oppervlakte, gemeenteOphalen: true }));

      // Stap 2: haal de details parallel (gemeente/sectie/adres)
      if (capakey) {
        const details = await haalPerceelDetails(capakey);
        popup.setContent(formatPerceelPopup(capakey, details, { oppervlakte, gemeenteOphalen: false }));
      }

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

async function haalPerceelWFS(latlng) {
  const bbox = bboxRondPunt(latlng, 5);
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
  return data.features?.[0] || null;
}

async function haalCapakeyOp(latlng) {
  const wfsFeature = await haalPerceelWFS(latlng);
  if (!wfsFeature) return null;
  const p = wfsFeature.properties || {};
  return p.CAPAKEY || p.capakey || p.CAPA_KEY || null;
}

async function haalPerceelDetails(capakey) {
  const delen = capakey.split('/');
  if (delen.length !== 2) return null;
  const [code1, code2] = delen;
  const url = `https://geo.api.vlaanderen.be/capakey/v2/parcel/${encodeURIComponent(code1)}/${encodeURIComponent(code2)}?data=adp&status=actual&geometry=full&srs=4326`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`CapaKey REST gaf ${res.status} voor ${capakey}`);
    return null;
  }
  return await res.json();
}

function formatPerceelPopup(capakey, details, opties) {
  const oppervlakte = opties?.oppervlakte;
  const gemeenteOphalen = opties?.gemeenteOphalen;

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

  const oppText = oppervlakte
    ? `${Number(oppervlakte).toLocaleString('nl-BE', { maximumFractionDigits: 0 })} m²`
    : null;
  const oppHa = oppervlakte && oppervlakte > 5000
    ? `${(Number(oppervlakte) / 10000).toLocaleString('nl-BE', { maximumFractionDigits: 2 })} ha`
    : null;

  // Tijdens loading toon "Gemeente laden..."
  const gemeenteRij = gemeenteOphalen
    ? `<div class="perceel-popup-rij"><span>Gemeente:</span> <em style="color:#999;font-size:11px">laden...</em></div>`
    : `<div class="perceel-popup-rij"><span>Gemeente:</span> ${escapeHtml(gemeente)}</div>`;

  const sectieRij = gemeenteOphalen
    ? ''
    : `<div class="perceel-popup-rij"><span>Sectie:</span> ${escapeHtml(sectie)} / Perceel ${escapeHtml(String(perceel))}</div>`;

  const adresRij = adres
    ? `<div class="perceel-popup-rij"><span>Adres:</span> ${escapeHtml(adres)}</div>`
    : '';

  const oppRij = oppText
    ? `<div class="perceel-popup-rij"><span>Oppervlakte:</span> ${oppText}${oppHa ? ` <small style="color:#888">(${oppHa})</small>` : ''}</div>`
    : '';

  return `
    <div class="perceel-popup">
      <div class="perceel-popup-titel">${escapeHtml(capakey || '—')}</div>
      ${gemeenteRij}
      ${sectieRij}
      ${adresRij}
      ${oppRij}
      <div class="perceel-popup-link">
        <a href="https://eservices.minfin.fgov.be/ecad-web/?capakey=${encodeURIComponent(capakey || '')}" target="_blank" rel="noopener">
          Open in CadGIS →
        </a>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────────────
// ERFGOED — gemeente uit capakey + zoeklinks
// ──────────────────────────────────────────────────────
function activeerErfgoedKlik(laag, map, laagConfig) {
  let actief = false;
  laag.on('add', () => { actief = true; });
  laag.on('remove', () => { actief = false; });

  map.on('click', async (e) => {
    if (!actief || !map.hasLayer(laag)) return;

    const { lat, lng } = e.latlng;

    const popup = L.popup({ maxWidth: 340 })
      .setLatLng(e.latlng)
      .setContent('<div class="erfgoed-popup-loading"><span class="loader-mini"></span>Locatie identificeren...</div>')
      .openOn(map);

    let gemeente = null;
    try {
      const capakey = await haalCapakeyOp(e.latlng);
      if (capakey) {
        const details = await haalPerceelDetails(capakey);
        gemeente = details?.municipalityName || null;
      }
    } catch (err) {
      console.warn('Gemeente niet gevonden:', err);
    }

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
