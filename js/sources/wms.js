// ════════════════════════════════════════════════════════
//  SOURCE: WMS (v5)
//
//  v5 wijzigingen:
//  - GetFeatureInfo support voor erfgoed-lagen (klikbaar_info)
//  - Capakey klikbaar voor percelen
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

  // Capakey klikbaar (bestaande functionaliteit)
  if (laagConfig.klikbaar) {
    activeerCapakeyKlik(wmsLaag, map);
  }

  // Erfgoed/algemene WMS info via GetFeatureInfo
  if (laagConfig.klikbaar_info) {
    activeerGetFeatureInfo(wmsLaag, map, laagConfig);
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
// GetFeatureInfo — voor Onroerend Erfgoed lagen
// ──────────────────────────────────────────────────────
function activeerGetFeatureInfo(laag, map, laagConfig) {
  let actief = false;

  laag.on('add', () => { actief = true; });
  laag.on('remove', () => { actief = false; });

  map.on('click', async (e) => {
    if (!actief || !map.hasLayer(laag)) return;

    const popup = L.popup({ maxWidth: 360 })
      .setLatLng(e.latlng)
      .setContent('<div class="erfgoed-popup-loading">Laden erfgoedinfo...</div>')
      .openOn(map);

    try {
      const url = bouwGetFeatureInfoUrl(map, laagConfig, e.latlng);
      const res = await fetch(url);
      if (!res.ok) {
        popup.setContent('<div class="erfgoed-popup-fout">Geen info beschikbaar</div>');
        return;
      }

      const data = await res.json();
      const features = data.features || [];

      if (features.length === 0) {
        popup.setContent(`<div class="erfgoed-popup-leeg">Geen ${laagConfig.label.toLowerCase()} op deze locatie</div>`);
        return;
      }

      // Bouw popup uit alle features
      const html = features.map(f => formatErfgoedFeature(f, laagConfig.label)).join('<hr style="margin: 8px 0; border: 0; border-top: 1px solid #ddd;"/>');
      popup.setContent(`<div class="erfgoed-popup">${html}</div>`);

    } catch (err) {
      console.error('GetFeatureInfo fout:', err);
      popup.setContent('<div class="erfgoed-popup-fout">Fout bij ophalen info</div>');
    }
  });
}

function bouwGetFeatureInfoUrl(map, laagConfig, latlng) {
  const point = map.latLngToContainerPoint(latlng);
  const size = map.getSize();
  const bounds = map.getBounds();
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  // WMS 1.3.0 gebruikt CRS=EPSG:4326 met BBOX als lat,lon order
  const params = new URLSearchParams({
    service: 'WMS',
    version: '1.3.0',
    request: 'GetFeatureInfo',
    layers: laagConfig.layer,
    query_layers: laagConfig.layer,
    crs: 'EPSG:4326',
    bbox: `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`,
    width: size.x,
    height: size.y,
    i: Math.round(point.x),
    j: Math.round(point.y),
    info_format: 'application/json',
    feature_count: 5
  });

  return `${laagConfig.url}?${params.toString()}`;
}

function formatErfgoedFeature(feature, laagLabel) {
  const props = feature.properties || {};
  const naam = props.naam || props.NAAM || props.benaming || props.Benaming || props.objectnaam || 'Erfgoeditem';
  const id = props.id || props.objectid || props.aanduid_id || '';

  // Verzamel alle relevante eigenschappen, filter null/leeg
  const rijen = Object.entries(props)
    .filter(([k, v]) => v !== null && v !== '' && v !== 'null' && !k.startsWith('the_geom'))
    .filter(([k]) => !['id', 'objectid', 'naam', 'NAAM'].includes(k))
    .slice(0, 8)
    .map(([k, v]) => `<div class="erfgoed-rij"><span class="erfgoed-key">${formatKey(k)}:</span> ${escapeHtml(String(v))}</div>`)
    .join('');

  // Link naar inventaris.onroerenderfgoed.be als id beschikbaar
  let link = '';
  if (id && /^\d+$/.test(String(id))) {
    link = `<div class="erfgoed-link"><a href="https://id.erfgoed.net/erfgoedobjecten/${id}" target="_blank" rel="noopener">Bekijk in Inventaris →</a></div>`;
  } else if (props.aanduid_id) {
    link = `<div class="erfgoed-link"><a href="https://id.erfgoed.net/aanduidingsobjecten/${props.aanduid_id}" target="_blank" rel="noopener">Bekijk in Inventaris →</a></div>`;
  }

  return `
    <div class="erfgoed-feature">
      <div class="erfgoed-titel">${escapeHtml(naam)}</div>
      <div class="erfgoed-type">${laagLabel}</div>
      ${rijen}
      ${link}
    </div>
  `;
}

function formatKey(k) {
  return k.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
