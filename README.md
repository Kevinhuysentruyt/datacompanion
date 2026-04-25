<!DOCTYPE html>
<html lang="nl">
<!--
╔══════════════════════════════════════════════════════════════════╗
║  Data Companion Framework — Config-driven Dashboard              ║
║                                                                  ║
║  WERKING:                                                        ║
║  1. URL bevat ?config=zwevegem (of ?config=avelgem, etc.)       ║
║  2. Framework laadt configs/zwevegem.json                        ║
║  3. Bouwt header, kaart, panelen volgens config                  ║
║  4. Geen hardcoded indicatoren — alles via JSON                  ║
║                                                                  ║
║  NIEUWE GEMEENTE TOEVOEGEN:                                      ║
║  - Maak configs/nieuwe-gemeente.json                             ║
║  - Open ?config=nieuwe-gemeente — klaar                          ║
╚══════════════════════════════════════════════════════════════════╝
-->
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Data Companion Dashboard</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/MarkerCluster.css"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/MarkerCluster.Default.css"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400&display=swap');

    /* CSS-variabelen worden runtime overschreven door de config */
    :root {
      --bg:#f4f2ee; --surface:#fff; --border:#d9d5cc;
      --primair:#1a5c3a; --accent:#e67e22;
      --text:#1a1a18; --muted:#6b6b64;
      --ok:#1a5c3a; --warn:#d4820a; --err:#c0392b;
      --font:'DM Sans',sans-serif; --mono:'DM Mono',monospace; --r:8px;
    }

    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:var(--font);background:var(--bg);color:var(--text);display:flex;flex-direction:column;height:100vh;overflow:hidden}

    /* Header */
    header{background:var(--surface);border-bottom:1px solid var(--border);padding:0 20px;height:60px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;z-index:1000}
    .brand{display:flex;align-items:center;gap:12px}
    .brand-logo{width:32px;height:32px;background:var(--primair);border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:600;font-size:13px}
    .brand h1{font-size:15px;font-weight:600;line-height:1.1}
    .brand .sub{font-size:11px;color:var(--muted);margin-top:2px}
    .credits{font-size:11px;color:var(--muted)}
    .credits a{color:var(--muted);text-decoration:none}
    .credits a:hover{color:var(--primair)}

    /* Layout */
    .app{display:flex;flex:1;overflow:hidden}
    .panel{width:340px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto;flex-shrink:0}
    .map-area{flex:1;display:flex;flex-direction:column;overflow:hidden}
    #map{flex:1;z-index:1;min-height:200px}

    /* Panel sections */
    .ps{padding:14px 16px;border-bottom:1px solid var(--border)}
    .st{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin-bottom:10px}
    .ps h2{font-size:14px;font-weight:600;margin-bottom:6px}
    .ps .desc{font-size:12px;color:var(--muted);line-height:1.5}

    /* Indicator cards */
    .ind-card{background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:12px;margin-bottom:8px;cursor:pointer;transition:all .15s}
    .ind-card:hover{border-color:var(--primair);background:white}
    .ind-card.active{border-color:var(--primair);background:white;box-shadow:0 0 0 1px var(--primair)}
    .ind-title{font-size:13px;font-weight:600;margin-bottom:3px}
    .ind-source{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}
    .ind-value{font-size:20px;font-weight:600;color:var(--primair);margin-top:6px;font-family:var(--mono)}
    .ind-unit{font-size:11px;color:var(--muted);margin-left:4px}

    /* Layer toggles */
    .li{display:flex;align-items:center;justify-content:space-between;padding:7px 0;font-size:13px}
    .ll{display:flex;align-items:center;gap:8px}
    .ld{width:8px;height:8px;border-radius:50%;flex-shrink:0}
    .tgl{position:relative;width:36px;height:20px}
    .tgl input{opacity:0;width:0;height:0}
    .tt{position:absolute;inset:0;background:var(--border);border-radius:10px;cursor:pointer;transition:background .2s}
    .tgl input:checked+.tt{background:var(--primair)}
    .th2{position:absolute;top:3px;left:3px;width:14px;height:14px;background:white;border-radius:50%;transition:transform .2s;pointer-events:none}
    .tgl input:checked~.th2{transform:translateX(16px)}

    /* Info panel onderaan kaart */
    .info-bar{background:var(--surface);border-top:1px solid var(--border);padding:10px 16px;font-size:11px;color:var(--muted);display:flex;justify-content:space-between;align-items:center;flex-shrink:0}
    .info-bar .src{display:flex;gap:14px;flex-wrap:wrap}
    .info-bar code{font-family:var(--mono);font-size:10px}

    /* Loading state */
    .loader{position:fixed;inset:0;background:rgba(244,242,238,.95);z-index:5000;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px}
    .loader.hidden{display:none}
    .spinner{width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--primair);border-radius:50%;animation:spin 1s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}

    /* Error state */
    .error-box{padding:30px;max-width:500px;margin:50px auto;background:white;border:1px solid var(--err);border-radius:var(--r);color:var(--text)}
    .error-box h2{color:var(--err);margin-bottom:8px;font-size:16px}
    .error-box code{font-family:var(--mono);font-size:11px;background:var(--bg);padding:2px 6px;border-radius:3px}

    /* Popup styling */
    .leaflet-popup-content-wrapper{border-radius:var(--r)!important;font-family:var(--font)!important}
    .ptag{display:inline-block;background:rgba(26,92,58,.1);color:var(--primair);font-size:9px;font-weight:600;padding:2px 6px;border-radius:4px;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px}
    .ptit{font-weight:600;font-size:13px;margin-bottom:3px}
    .pbod{font-size:12px;color:var(--muted);line-height:1.5}

    @media(max-width:640px){.panel{display:none}}
  </style>
</head>
<body>

<div class="loader" id="loader">
  <div class="spinner"></div>
  <div style="font-size:13px;color:var(--muted)">Configuratie aan het laden...</div>
</div>

<header>
  <div class="brand">
    <div class="brand-logo" id="brand-logo">DC</div>
    <div>
      <h1 id="brand-title">Data Companion</h1>
      <div class="sub" id="brand-sub">Dashboard wordt geladen...</div>
    </div>
  </div>
  <div class="credits">
    Powered by <a href="https://datacompanion.be" target="_blank">Data Companion</a>
  </div>
</header>

<div class="app">
  <aside class="panel" id="panel">
    <!-- Wordt dynamisch gevuld op basis van config -->
  </aside>
  <div class="map-area">
    <div id="map"></div>
    <div class="info-bar">
      <div class="src" id="bronvermelding">
        <!-- Wordt dynamisch gevuld -->
      </div>
      <div>
        <a href="#" onclick="toonConfig();return false;" style="color:var(--muted);font-size:11px">Config bekijken</a>
      </div>
    </div>
  </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/leaflet.markercluster.min.js"></script>

<script>
// ════════════════════════════════════════════════════════
//  DATA COMPANION FRAMEWORK
//  Config-driven dashboard voor Vlaamse gemeenten
//
//  Architectuur:
//  - SOURCES: hoe data ophalen (WMS, WFS, REST)
//  - RENDERERS: hoe data tonen (kaart, indicator, choropleth)
//  - CONFIG: welke data, welke renderer, welke styling
// ════════════════════════════════════════════════════════

// ── 1. SOURCE PLUGINS ────────────────────────────────────
// Elke source heeft een uniforme interface: fetch(params) → Promise<data>
const sources = {

  // WMS: tile-laag (raster) van een Vlaamse WMS-server
  wms: {
    create(config) {
      return L.tileLayer.wms(config.url, {
        layers: config.layer,
        format: 'image/png',
        transparent: true,
        version: config.version || '1.3.0',
        opacity: config.opacity || 0.8,
        attribution: config.attribution || ''
      });
    }
  },

  // WFS: vectordata als GeoJSON
  wfs: {
    async fetch(config) {
      const params = new URLSearchParams({
        SERVICE: 'WFS', VERSION: '2.0.0', REQUEST: 'GetFeature',
        TYPENAMES: config.typename,
        outputFormat: 'application/json',
        count: config.count || 350,
        SRSNAME: 'EPSG:4326'
      });
      const r = await fetch(`${config.url}?${params}`);
      if (!r.ok) throw new Error(`WFS ${config.typename} → HTTP ${r.status}`);
      return r.json();
    }
  },

  // Basisregisters REST API
  basisregisters: {
    async fetchGemeente(niscode) {
      const r = await fetch(
        `https://api.basisregisters.vlaanderen.be/v2/gemeenten/${niscode}`,
        { headers: { Accept: 'application/json' } }
      );
      if (!r.ok) throw new Error('Basisregisters gemeente → HTTP ' + r.status);
      return r.json();
    },
    async fetchAdressen(gemeentenaam, limit = 30) {
      const r = await fetch(
        'https://api.basisregisters.vlaanderen.be/v2/adressen?' +
        new URLSearchParams({ gemeentenaam, limit, offset: 0 }),
        { headers: { Accept: 'application/json' } }
      );
      if (!r.ok) throw new Error('Basisregisters adressen → HTTP ' + r.status);
      return r.json();
    }
  }

};

// ── 2. RENDERER PLUGINS ──────────────────────────────────
// Elke renderer kent een 'render(container, data, config)' methode
const renderers = {

  // Indicator-kaart: groot getal met label
  indicator: {
    render(container, data, config) {
      const card = document.createElement('div');
      card.className = 'ind-card';
      card.innerHTML = `
        <div class="ind-source">${config.bronlabel || config.bron}</div>
        <div class="ind-title">${config.titel}</div>
        <div class="ind-value">${data.waarde}<span class="ind-unit">${config.eenheid || ''}</span></div>
      `;
      if (config.actie === 'zoom_naar_gemeente') {
        card.onclick = () => zoomNaarGemeente();
      }
      container.appendChild(card);
    }
  },

  // Toggle voor kaartlaag
  toggle: {
    render(container, data, config) {
      const item = document.createElement('div');
      item.className = 'li';
      item.innerHTML = `
        <div class="ll">
          <div class="ld" style="background:${config.kleur || 'var(--primair)'}"></div>
          <span>${config.label}</span>
        </div>
        <label class="tgl">
          <input type="checkbox" ${config.standaard_aan ? 'checked' : ''}>
          <div class="tt"></div><div class="th2"></div>
        </label>
      `;
      container.appendChild(item);

      const input = item.querySelector('input');
      const layer = data.layer;

      if (config.standaard_aan) layer.addTo(map);

      input.addEventListener('change', e => {
        if (e.target.checked) layer.addTo(map);
        else map.removeLayer(layer);
      });
    }
  }

};

// ── 3. KAART INITIALISATIE ───────────────────────────────
const map = L.map('map', { zoomControl: true });

// Achtergrondkaart
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap &copy; CARTO',
  subdomains: 'abcd',
  maxZoom: 20
}).addTo(map);

// Globale config (wordt geladen)
let config = null;
let gemeenteCentroid = null;

// ── 4. CONFIG LADEN ──────────────────────────────────────
async function laadConfig() {
  // URL parameter: ?config=zwevegem
  const params = new URLSearchParams(window.location.search);
  const configNaam = params.get('config') || 'demo';

  try {
    const r = await fetch(`configs/${configNaam}.json`);
    if (!r.ok) throw new Error(`Config '${configNaam}.json' niet gevonden (HTTP ${r.status})`);
    config = await r.json();
    return config;
  } catch (e) {
    toonError(
      `Configuratie niet gevonden`,
      `Kon <code>configs/${configNaam}.json</code> niet laden.<br><br>
       Probeer <code>?config=zwevegem</code> of <code>?config=avelgem</code>.<br><br>
       <small>Technische fout: ${e.message}</small>`
    );
    throw e;
  }
}

// ── 5. CONFIG TOEPASSEN ──────────────────────────────────
async function pasConfigToe(config) {
  // Branding
  document.title = `${config.gemeente.naam} — Data Companion`;
  document.getElementById('brand-title').textContent = config.dashboard.titel;
  document.getElementById('brand-sub').textContent = config.dashboard.subtitel || config.gemeente.naam;

  const initialen = config.gemeente.naam.substring(0, 2).toUpperCase();
  document.getElementById('brand-logo').textContent = initialen;

  // Kleuren via CSS-variabelen
  if (config.dashboard.kleuren) {
    const root = document.documentElement;
    if (config.dashboard.kleuren.primair) root.style.setProperty('--primair', config.dashboard.kleuren.primair);
    if (config.dashboard.kleuren.accent) root.style.setProperty('--accent', config.dashboard.kleuren.accent);
    document.getElementById('brand-logo').style.background = config.dashboard.kleuren.primair;
  }

  // Initiële kaartpositie via Basisregisters
  try {
    const gem = await sources.basisregisters.fetchGemeente(config.gemeente.niscode);
    const bb = gem.geometrie?.boundingBox;
    if (bb) {
      map.fitBounds([[bb.minY, bb.minX], [bb.maxY, bb.maxX]], { padding: [30, 30] });
      // Centroid bewaren voor later
      gemeenteCentroid = [
        (bb.minY + bb.maxY) / 2,
        (bb.minX + bb.maxX) / 2
      ];
    } else {
      map.setView(config.gemeente.fallback_centrum || [50.9, 4.0], 12);
    }
  } catch (e) {
    console.warn('Kon gemeentebbox niet ophalen:', e);
    map.setView(config.gemeente.fallback_centrum || [50.9, 4.0], 12);
  }

  // Bronvermelding
  const bronvermelding = document.getElementById('bronvermelding');
  bronvermelding.innerHTML = (config.bronvermelding || []).map(b =>
    `<span>Bron: <a href="${b.url}" target="_blank" style="color:inherit">${b.naam}</a></span>`
  ).join('');

  // Panelen renderen
  await renderPanelen(config.panelen || []);
}

// ── 6. PANELEN RENDEREN ──────────────────────────────────
async function renderPanelen(panelen) {
  const container = document.getElementById('panel');
  container.innerHTML = '';

  for (const paneel of panelen) {
    const sectie = document.createElement('div');
    sectie.className = 'ps';

    // Section header
    if (paneel.titel || paneel.beschrijving) {
      const head = document.createElement('div');
      head.className = 'st';
      head.textContent = paneel.titel;
      sectie.appendChild(head);
    }
    if (paneel.beschrijving) {
      const desc = document.createElement('div');
      desc.className = 'desc';
      desc.style.marginBottom = '10px';
      desc.textContent = paneel.beschrijving;
      sectie.appendChild(desc);
    }

    // Items in dit paneel
    for (const item of (paneel.items || [])) {
      try {
        await renderItem(sectie, item);
      } catch (e) {
        console.error(`Item '${item.titel}' fout:`, e);
        const errEl = document.createElement('div');
        errEl.style.cssText = 'font-size:11px;color:var(--err);padding:6px 0';
        errEl.textContent = `⚠ ${item.titel}: ${e.message}`;
        sectie.appendChild(errEl);
      }
    }

    container.appendChild(sectie);
  }
}

async function renderItem(container, item) {
  // Bepaal data afhankelijk van type
  let data = {};

  if (item.type === 'toggle' && item.bron === 'wms') {
    // WMS-laag aanmaken
    data.layer = sources.wms.create({
      url: item.url,
      layer: item.layer,
      attribution: item.attribution
    });
  } else if (item.type === 'toggle' && item.bron === 'wfs') {
    // WFS-data eerst ophalen, dan als laag toevoegen
    const geojson = await sources.wfs.fetch({
      url: item.url,
      typename: item.typename,
      count: item.count
    });
    data.layer = L.geoJSON(geojson, {
      style: item.stijl || { color: 'var(--primair)', weight: 1.5, fillOpacity: 0.05 },
      onEachFeature(f, l) {
        const props = f.properties;
        const titel = item.popup_titel ? evalTemplate(item.popup_titel, props) : '';
        const body = item.popup_body ? evalTemplate(item.popup_body, props) : '';
        l.bindPopup(`
          <div class="ptag">${item.popup_label || 'Feature'}</div>
          <div class="ptit">${titel}</div>
          <div class="pbod">${body}</div>
        `);
      }
    });
  } else if (item.type === 'indicator' && item.bron === 'static') {
    // Statische waarde uit config zelf
    data.waarde = item.waarde;
  } else if (item.type === 'indicator' && item.bron === 'basisregisters_aantal_adressen') {
    // Live aantal adressen ophalen
    const r = await sources.basisregisters.fetchAdressen(item.gemeentenaam, 1);
    data.waarde = r.adressen?.length > 0 ? '✓' : '?';
  }

  // Render via juiste renderer
  if (renderers[item.type]) {
    renderers[item.type].render(container, data, item);
  } else {
    throw new Error(`Onbekende renderer-type: ${item.type}`);
  }
}

// ── 7. HULPFUNCTIES ──────────────────────────────────────
function evalTemplate(template, data) {
  // Vervangt {NAAM} door data.NAAM, etc.
  return template.replace(/\{(\w+)\}/g, (_, key) => data[key] ?? '—');
}

function zoomNaarGemeente() {
  if (gemeenteCentroid) map.setView(gemeenteCentroid, 13);
}

function toonError(titel, body) {
  document.getElementById('loader').classList.add('hidden');
  document.body.innerHTML = `
    <div class="error-box">
      <h2>${titel}</h2>
      <div>${body}</div>
    </div>
  `;
}

function toonConfig() {
  if (!config) return;
  const w = window.open('', '_blank');
  w.document.write(`<pre style="font-family:monospace;padding:20px;font-size:12px">${
    JSON.stringify(config, null, 2).replace(/</g, '&lt;')
  }</pre>`);
}

// ── 8. STARTEN ───────────────────────────────────────────
(async () => {
  try {
    const cfg = await laadConfig();
    await pasConfigToe(cfg);
    document.getElementById('loader').classList.add('hidden');
  } catch (e) {
    console.error('Init fout:', e);
  }
})();
</script>

</body>
</html>
