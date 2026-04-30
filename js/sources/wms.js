// ════════════════════════════════════════════════════════
//  SOURCE: WMS (Web Map Service)
//
//  Wijzigingen v4:
//  - Klikbare lagen via GetFeatureInfo
//  - Voor GRB-lagen: parcel info opvragen bij klik
//  - "klikbaar: true" in config activeert dit
// ════════════════════════════════════════════════════════

export function laadLaag(laag, kaart) {
  const opties = {
    layers: laag.layer,
    format: 'image/png',
    transparent: true,
    version: '1.3.0',
    opacity: laag.transparantie || 0.8,
    attribution: laag.attribution || ''
  };

  if (laag._pane) opties.pane = laag._pane;

  const wmsLayer = L.tileLayer.wms(laag.url, opties);

  // Klikbaar maken als config dat aangeeft
  if (laag.klikbaar) {
    activeerKlikInfo(wmsLayer, laag, kaart);
  }

  if (laag.default_aan) wmsLayer.addTo(kaart);
  return wmsLayer;
}

// ════════════════════════════════════════════════════════
//  GetFeatureInfo / Capakey lookup
//  Bij klik op de kaart: vraag perceelinfo op via Capakey API
// ════════════════════════════════════════════════════════
function activeerKlikInfo(wmsLayer, laag, kaart) {
  let isActief = false;
  wmsLayer.on('add', () => { isActief = true; });
  wmsLayer.on('remove', () => { isActief = false; });

  kaart.on('click', async (e) => {
    if (!isActief) return;

    // Toon laad-popup
    const popup = L.popup({ maxWidth: 360 })
      .setLatLng(e.latlng)
      .setContent(`<div class="ptag">Perceel zoeken...</div>
                   <div class="pbod">
                     <div class="loader-mini"></div>
                   </div>`)
      .openOn(kaart);

    try {
      // Converteer WGS-84 naar Lambert-72 via Geopunt's geolocation API
      // (eenvoudiger dan proj4js — gebruikt zelf al de juiste transformatie)
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;

      // Optie 1: Capakey via Geolocation API (werkt op lat/lon direct)
      const url = `https://geo.api.vlaanderen.be/geolocation/v4/Location?latlon=${lat},${lon}&c=1`;

      const r = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error('Capakey API niet bereikbaar');
      const data = await r.json();

      if (!data.LocationResult || !data.LocationResult.length) {
        popup.setContent(`
          <div class="ptag">Geen perceel gevonden</div>
          <div class="pbod">Op deze coördinaten is geen perceel gekend.</div>
        `);
        return;
      }

      const loc = data.LocationResult[0];

      // Haal nu de detail-info op voor het perceel via Lambert-72 X/Y
      const x = loc.Location.X_Lambert72;
      const y = loc.Location.Y_Lambert72;

      const perceelUrl = `https://geo.api.vlaanderen.be/capakey/v2/parcel?x=${x}&y=${y}`;
      const r2 = await fetch(perceelUrl, { headers: { Accept: 'application/json' } });

      if (!r2.ok) {
        // Fallback: toon alleen wat we hebben uit Geolocation
        popup.setContent(formatBasisInfo(loc));
        return;
      }

      const perceel = await r2.json();
      popup.setContent(formatPerceelInfo(perceel, loc));

    } catch (err) {
      console.error('Capakey fout:', err);
      popup.setContent(`
        <div class="ptag">Fout bij ophalen</div>
        <div class="pbod">${err.message}</div>
      `);
    }
  });
}

// Format perceel-info tot een leesbare popup
function formatPerceelInfo(perceel, loc) {
  const adres = (perceel.adres || []).join('<br>') || 'Geen adres beschikbaar';

  return `
    <div class="ptag">Kadastraal perceel</div>
    <div class="ptit">${perceel.capakey || '—'}</div>
    <div class="pbod">
      <div class="perceel-grid">
        <div class="lbl">Gemeente:</div>
        <div>${perceel.municipalityName || '—'} (${perceel.municipalityCode || '—'})</div>

        <div class="lbl">Afdeling:</div>
        <div>${perceel.departmentName || '—'}</div>

        <div class="lbl">Sectie:</div>
        <div>${perceel.sectionCode || '—'}</div>

        <div class="lbl">Perceelnummer:</div>
        <div>${perceel.perceelnummer || '—'}</div>

        ${perceel.grondnummer ? `<div class="lbl">Grondnummer:</div><div>${perceel.grondnummer}</div>` : ''}
        ${perceel.bisnummer ? `<div class="lbl">Bisnummer:</div><div>${perceel.bisnummer}</div>` : ''}
        ${perceel.exponent ? `<div class="lbl">Exponent:</div><div>${perceel.exponent}</div>` : ''}
        ${perceel.macht ? `<div class="lbl">Macht:</div><div>${perceel.macht}</div>` : ''}

        <div class="lbl">Adres:</div>
        <div>${adres}</div>
      </div>
      <div class="perceel-acties">
        <a href="https://eservices.minfin.fgov.be/ecad-web/?capakey=${perceel.capakey}"
           target="_blank" class="perceel-link">
          📋 Open in CadGIS
        </a>
      </div>
    </div>
  `;
}

function formatBasisInfo(loc) {
  return `
    <div class="ptag">Locatie</div>
    <div class="ptit">${loc.FormattedAddress || 'Onbekend adres'}</div>
    <div class="pbod">
      Lambert: ${loc.Location.X_Lambert72?.toFixed(0)}, ${loc.Location.Y_Lambert72?.toFixed(0)}<br>
      WGS84: ${loc.Location.Lat_WGS84?.toFixed(5)}, ${loc.Location.Lon_WGS84?.toFixed(5)}
    </div>
  `;
}
