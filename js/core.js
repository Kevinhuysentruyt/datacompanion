// ════════════════════════════════════════════════════════
//  CORE — orchestratie van het dashboard
//  Verantwoordelijkheden:
//  - URL-parameters lezen
//  - Config en sources laden
//  - Branding toepassen
//  - Navigatie opbouwen
//  - Sjabloon kiezen en renderen
// ════════════════════════════════════════════════════════

import { renderSjabloonGeodata } from './sjablonen/geodata.js';
import { renderSjabloonEvolutie } from './sjablonen/evolutie.js';
import { renderSjabloonHybride } from './sjablonen/hybride.js';

// ── GLOBALE STATE ─────────────────────────────────────────
// Centraal bewaard zodat alle modules erbij kunnen
export const state = {
  config: null,        // gemeente-JSON
  sources: {},         // sources.json
  actiefLoket: null,   // huidig getoond loket
  mapInstance: null    // Leaflet kaart (null als geen kaart actief)
};

// Sjabloon-router: koppelt sjabloon-naam aan render-functie
// UITBREIDEN: voeg nieuwe sjablonen hier toe
const SJABLONEN = {
  'geodata':  renderSjabloonGeodata,
  'evolutie': renderSjabloonEvolutie,
  'hybride':  renderSjabloonHybride
};

// ── URL PARSING ──────────────────────────────────────────
function leesURL() {
  const params = new URLSearchParams(window.location.search);
  return {
    gemeente: params.get('gemeente') || params.get('config') || 'zwevegem',
    loket: params.get('loket') || null
  };
}

function updateURL(gemeente, loketId) {
  const url = new URL(window.location);
  url.searchParams.set('gemeente', gemeente);
  if (loketId) url.searchParams.set('loket', loketId);
  else url.searchParams.delete('loket');
  window.history.pushState({}, '', url);
}

// ── CONFIG + SOURCES LADEN ───────────────────────────────
async function laadConfig(gemeente) {
  const r = await fetch(`configs/${gemeente}.json`);
  if (!r.ok) throw new Error(`Config '${gemeente}.json' niet gevonden (HTTP ${r.status})`);
  return r.json();
}

async function laadSources() {
  try {
    const r = await fetch('sources.json');
    if (!r.ok) throw new Error('sources.json niet gevonden');
    return r.json();
  } catch (e) {
    console.warn('sources.json niet geladen:', e.message);
    return {};
  }
}

// Resolveert een laag-config naar volledige bron-info
// Combineert sources.json met laag-overrides uit gemeente-config
export function resolveSource(laag) {
  const sources = state.sources || {};
  if (sources[laag.bron]) {
    // Sources-definitie als basis, laag-config als override
    return { ...sources[laag.bron], ...laag, _bron_sleutel: laag.bron };
  }
  // Backwards-compatible: laag heeft directe URL/type
  return laag;
}

// ── BRANDING ─────────────────────────────────────────────
function pasBrandingToe(cfg) {
  document.title = `${cfg.gemeente.naam} — Data Companion`;
  document.getElementById('brand-title').textContent = cfg.dashboard?.titel || cfg.gemeente.naam;
  document.getElementById('brand-sub').textContent = cfg.dashboard?.subtitel || '';

  const initialen = cfg.gemeente.naam.substring(0, 2).toUpperCase();
  document.getElementById('brand-logo').textContent = initialen;

  const root = document.documentElement;
  if (cfg.dashboard?.kleuren?.primair) {
    root.style.setProperty('--primair', cfg.dashboard.kleuren.primair);
    document.getElementById('brand-logo').style.background = cfg.dashboard.kleuren.primair;
  }
  if (cfg.dashboard?.kleuren?.accent) {
    root.style.setProperty('--accent', cfg.dashboard.kleuren.accent);
  }

  const bronEl = document.getElementById('bronvermelding');
  bronEl.innerHTML = (cfg.bronvermelding || []).map(b =>
    `Bron: ${b.url ? `<a href="${b.url}" target="_blank" style="color:inherit">${b.naam}</a>` : b.naam}`
  ).join(' · ');
}

// ── NAVIGATIE OPBOUWEN ───────────────────────────────────
function bouwNavigatie(loketten) {
  const nav = document.getElementById('nav-loketten');
  nav.innerHTML = '';

  loketten.forEach(loket => {
    const item = document.createElement('div');
    item.className = 'nav-loket';
    item.dataset.loketId = loket.id;
    item.innerHTML = `
      <span class="ico">${loket.icoon || '📊'}</span>
      <span>${loket.label}</span>
      ${loket.badge ? `<span class="badge">${loket.badge}</span>` : ''}
    `;
    item.onclick = () => activeerLoket(loket.id);
    nav.appendChild(item);
  });
}

// ── LOKET ACTIVEREN ──────────────────────────────────────
function activeerLoket(loketId) {
  const loket = state.config.loketten.find(l => l.id === loketId);
  if (!loket) {
    console.error('Loket niet gevonden:', loketId);
    return;
  }

  state.actiefLoket = loket;

  document.querySelectorAll('.nav-loket').forEach(el => {
    el.classList.toggle('active', el.dataset.loketId === loketId);
  });

  updateURL(state.config.gemeente.naam.toLowerCase(), loketId);
  renderLoket(loket);
}

// ── LOKET RENDEREN VIA SJABLOON-ROUTER ───────────────────
function renderLoket(loket) {
  const content = document.getElementById('content');

  // Cleanup vorige kaart
  if (state.mapInstance) {
    state.mapInstance.remove();
    state.mapInstance = null;
  }

  const renderFn = SJABLONEN[loket.sjabloon];

  if (!renderFn) {
    content.innerHTML = `
      <div class="sjabloon-placeholder">
        <div class="ico">⚠️</div>
        <h3>Onbekend sjabloon: "${loket.sjabloon}"</h3>
        <p>Beschikbare sjablonen: ${Object.keys(SJABLONEN).join(', ')}</p>
      </div>
    `;
    return;
  }

  renderFn(content, loket, state);
}

// ── ERROR HANDLING ───────────────────────────────────────
function toonError(titel, body) {
  document.getElementById('loader').classList.add('hidden');
  document.body.innerHTML = `
    <div class="error-box">
      <h2>${titel}</h2>
      <div>${body}</div>
    </div>
  `;
}

// ── INIT ─────────────────────────────────────────────────
export async function init() {
  try {
    const params = leesURL();

    // Sources en config parallel laden voor snelheid
    const [sources, cfg] = await Promise.all([
      laadSources(),
      laadConfig(params.gemeente)
    ]);

    state.sources = sources;
    state.config = cfg;

    pasBrandingToe(cfg);

    if (!cfg.loketten || cfg.loketten.length === 0) {
      throw new Error('Configuratie heeft geen loketten gedefinieerd');
    }

    bouwNavigatie(cfg.loketten);

    const startLoket = cfg.loketten.find(l => l.id === params.loket) || cfg.loketten[0];
    activeerLoket(startLoket.id);

    document.getElementById('loader').classList.add('hidden');

    // Browser back/forward support
    window.addEventListener('popstate', () => {
      const p = leesURL();
      const l = state.config.loketten.find(l => l.id === p.loket) || state.config.loketten[0];
      if (l) activeerLoket(l.id);
    });

    // Config-link in footer
    document.getElementById('link-config').addEventListener('click', e => {
      e.preventDefault();
      const w = window.open('', '_blank');
      w.document.write(`<pre style="font-family:monospace;padding:20px;font-size:12px;background:#f4f2ee">${
        JSON.stringify(cfg, null, 2).replace(/</g, '&lt;')
      }</pre>`);
    });

  } catch (e) {
    console.error('Init fout:', e);
    toonError(
      'Configuratie probleem',
      `${e.message}<br><br>Probeer <code>?gemeente=zwevegem</code> of <code>?gemeente=avelgem</code>`
    );
  }
}
