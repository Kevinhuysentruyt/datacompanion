// ════════════════════════════════════════════════════════
//  SOURCE: WMS (v6)
//
//  v6 wijzigingen:
//  - klikbaar_inventaris: opent inventaris.onroerenderfgoed.be
//    rechtstreeks (omzeilt CORS-probleem van GetFeatureInfo)
//  - klikbaar (capakey) blijft werken voor percelen
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

  // Capakey klikbaar (kadastrale percelen)
  if (laagConfig.klikbaar) {
    activeerCapakeyKlik(wmsLaag, map);
  }

  // Erfgoed: klik opent inventaris-pagina met locatie
  if (laagConfig.klikbaar_inventaris) {
    activeerErfgoedKlik(wmsLaag, map, laagConfig);
  }

  return wmsLaag;
}

// ──────────────────────────────────────────────────────
// CAPAKEY (Geopunt) — voor kadastrale percelen
// ──────────────────────────────────────────────────────
function activeerCapakeyKlik(laag, map) {
  let actief = false;

  laag.on('add', () => { actief = true; });
  laag.on('remove', () => { actief = false; });

  map.on('click', async (e) => {
    if (!actief || !map.hasLayer(laag)) return;

    const { lat, lng } = e.latlng;
    const popup = L.popup()
      .setLatLng(e.latlng)
      .setContent('<div class="perceel-popup-loading">Laden perceelinfo...</div>')
      .openOn(map);

    try {
      const locUrl = `https://geo.api.vlaanderen.be/geolocation/v4/Location?xy=${lng},${lat}&c=1`;
      const locRes = await fetch(locUrl);
      const locData = await locRes.json();
      const lambert = locData?.LocationResult?.[0]?.Location;
      if (!lambert) {
        popup.setContent('<div class="perceel-popup-fout">Geen locatie gevonden</div>');
        return;
      }

      const capUrl = `https://geo.api.vlaanderen.be/capakey/v2/parcel?x=${lambert.X_Lambert72}&y=${lambert.Y_Lambert72}`;
      const capRes = await fetch(capUrl);
      if (!capRes.ok) {
        popup.setContent('<div class="perceel-popup-fout">Geen perceel op deze locatie</div>');
        return;
      }
      const cap = await capRes.json();

      popup.setContent(`
        <div class="perceel-popup">
          <div class="perceel-popup-titel">${cap.capakey || '—'}</div>
          <div class="perceel-popup-rij"><span>Gemeente:</span> ${cap.municipality?.name || '—'}</div>
          <div class="perceel-popup-rij"><span>Sectie:</span> ${cap.section || '—'} / Perceel ${cap.perceelnummer || cap.parcelNumber || '—'}</div>
          <div class="perceel-popup-link">
            <a href="https://eservices.minfin.fgov.be/ecad-web/?capakey=${cap.capakey}" target="_blank" rel="noopener">
              Open in CadGIS →
            </a>
          </div>
        </div>
      `);
    } catch (err) {
      popup.setContent('<div class="perceel-popup-fout">Fout bij ophalen perceel</div>');
    }
  });
}

// ──────────────────────────────────────────────────────
// ERFGOED — opent inventaris.onroerenderfgoed.be
// ──────────────────────────────────────────────────────
// Geen GetFeatureInfo (CORS-problemen). In plaats daarvan:
// directe link naar het officiële zoekportaal met de
// klikcoördinaten als locatie-zoekparameter.
function activeerErfgoedKlik(laag, map, laagConfig) {
  let actief = false;

  laag.on('add', () => { actief = true; });
  laag.on('remove', () => { actief = false; });

  map.on('click', (e) => {
    if (!actief || !map.hasLayer(laag)) return;

    const { lat, lng } = e.latlng;

    // Bouw URL naar de inventaris met de klikpositie als locatie
    // De inventaris ondersteunt ?lat=&lng=&zoom= als directe link
    const inventarisUrl = `https://inventaris.onroerenderfgoed.be/?lat=${lat.toFixed(6)}&lng=${lng.toFixed(6)}&zoom=17`;

    L.popup({ maxWidth: 320 })
      .setLatLng(e.latlng)
      .setContent(`
        <div class="erfgoed-popup">
          <div class="erfgoed-titel">${escapeHtml(laagConfig.label)}</div>
          <div class="erfgoed-uitleg">
            Klik op onderstaande link om alle <strong>${escapeHtml(laagConfig.label.toLowerCase())}</strong>
            op deze locatie te bekijken in de officiële inventaris van Onroerend Erfgoed.
          </div>
          <div class="erfgoed-link">
            <a href="${inventarisUrl}" target="_blank" rel="noopener">
              Open in inventaris.onroerenderfgoed.be →
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
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
