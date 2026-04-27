<!DOCTYPE html>
<html lang="nl">
<!--
╔══════════════════════════════════════════════════════════════════╗
║  DATA COMPANION — Dashboard Builder                              ║
║                                                                  ║
║  Werking:                                                        ║
║  - Detecteert automatisch beschikbare sjablonen via GitHub API   ║
║  - Detecteert automatisch beschikbare renderers via GitHub API   ║
║  - Laadt bronnen uit sources.json                               ║
║  - Bestaande configs laden en bewerken                          ║
║  - Genereert configs/gemeente.json automatisch                  ║
║                                                                  ║
║  Token: GitHub PAT (enkel in geheugen, tab sluiten = weg)       ║
╚══════════════════════════════════════════════════════════════════╝
-->
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Data Companion — Dashboard Builder</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400&display=swap');

    :root {
      --bg: #f4f2ee; --surface: #fff; --border: #d9d5cc;
      --primair: #1a5c3a; --accent: #e67e22;
      --text: #1a1a18; --muted: #6b6b64;
      --ok: #1a5c3a; --warn: #d4820a; --err: #c0392b;
      --font: 'DM Sans', sans-serif; --mono: 'DM Mono', monospace;
      --r: 8px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font); background: var(--bg); color: var(--text); }

    /* ── Layout ── */
    .app { display: grid; grid-template-columns: 280px 1fr 320px; height: 100vh; overflow: hidden; }

    /* ── Kolom 1: Bronnen & Components ── */
    .col-bronnen {
      background: var(--surface); border-right: 1px solid var(--border);
      display: flex; flex-direction: column; overflow: hidden;
    }

    /* ── Kolom 2: Builder canvas ── */
    .col-canvas {
      background: var(--bg); overflow-y: auto;
      display: flex; flex-direction: column;
    }

    /* ── Kolom 3: Eigenschappen ── */
    .col-props {
      background: var(--surface); border-left: 1px solid var(--border);
      overflow-y: auto;
    }

    /* ── Headers per kolom ── */
    .col-header {
      padding: 16px 18px; border-bottom: 1px solid var(--border);
      font-size: 13px; font-weight: 600; flex-shrink: 0;
      display: flex; align-items: center; justify-content: space-between;
    }
    .col-header-sub { font-size: 11px; color: var(--muted); font-weight: 400; }

    /* ── Scrollbare inhoud ── */
    .col-scroll { flex: 1; overflow-y: auto; padding: 14px; }

    /* ── Secties in kolommen ── */
    .sectie { margin-bottom: 20px; }
    .sectie-titel {
      font-size: 10px; font-weight: 600; text-transform: uppercase;
      letter-spacing: .07em; color: var(--muted); margin-bottom: 8px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .sectie-badge {
      background: var(--bg); border: 1px solid var(--border);
      padding: 1px 6px; border-radius: 8px; font-size: 9px; color: var(--muted);
    }

    /* ── Bron/component items (kolom 1) ── */
    .component-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 10px; border-radius: 6px; cursor: pointer;
      border: 1px solid transparent; margin-bottom: 4px;
      transition: all .15s; font-size: 13px;
      user-select: none;
    }
    .component-item:hover { background: var(--bg); border-color: var(--border); }
    .component-item.nieuw { border-style: dashed; color: var(--muted); }
    .component-item.nieuw:hover { border-color: var(--primair); color: var(--primair); }
    .component-ico { font-size: 16px; flex-shrink: 0; }
    .component-naam { font-size: 12px; font-weight: 500; }
    .component-sub { font-size: 10px; color: var(--muted); margin-top: 1px; }
    .component-type {
      margin-left: auto; font-size: 9px; font-weight: 600;
      text-transform: uppercase; background: var(--bg);
      border: 1px solid var(--border); padding: 1px 5px; border-radius: 4px;
      color: var(--muted); flex-shrink: 0;
    }

    /* ── Canvas (kolom 2) ── */
    .canvas-header {
      background: var(--surface); border-bottom: 1px solid var(--border);
      padding: 14px 20px; display: flex; align-items: center;
      justify-content: space-between; flex-shrink: 0;
    }
    .canvas-title { font-size: 18px; font-weight: 600; }
    .canvas-sub { font-size: 12px; color: var(--muted); margin-top: 3px; }
    .canvas-acties { display: flex; gap: 8px; }

    .canvas-body { padding: 20px; flex: 1; }

    /* ── Gemeente-info banner ── */
    .gemeente-banner {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--r); padding: 16px 18px; margin-bottom: 20px;
      display: flex; align-items: center; gap: 16px;
    }
    .gemeente-logo {
      width: 44px; height: 44px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 16px; flex-shrink: 0;
    }
    .gemeente-info { flex: 1; }
    .gemeente-naam-groot { font-size: 18px; font-weight: 700; }
    .gemeente-meta { font-size: 12px; color: var(--muted); margin-top: 3px; }

    /* ── Loketten in canvas ── */
    .loket-blok {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--r); margin-bottom: 16px;
      transition: border-color .15s;
    }
    .loket-blok.actief { border-color: var(--primair); }
    .loket-blok-header {
      padding: 14px 16px; display: flex; align-items: center;
      gap: 10px; cursor: pointer; border-radius: var(--r) var(--r) 0 0;
    }
    .loket-blok-header:hover { background: var(--bg); }
    .loket-blok-ico { font-size: 20px; }
    .loket-blok-naam { font-size: 14px; font-weight: 600; flex: 1; }
    .loket-blok-badge {
      font-size: 9px; font-weight: 600; text-transform: uppercase;
      background: var(--bg); border: 1px solid var(--border);
      padding: 2px 7px; border-radius: 8px; color: var(--muted);
    }
    .loket-blok-acties { display: flex; gap: 6px; }

    .loket-blok-body {
      border-top: 1px solid var(--border); padding: 14px 16px;
    }

    /* ── Laag items in loket ── */
    .laag-item {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 10px; background: var(--bg); border-radius: 6px;
      margin-bottom: 6px; font-size: 13px; cursor: pointer;
      border: 1px solid transparent; transition: all .15s;
    }
    .laag-item:hover { border-color: var(--primair); }
    .laag-item.actief { border-color: var(--primair); background: rgba(26,92,58,.06); }
    .laag-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .laag-naam { flex: 1; font-size: 12px; font-weight: 500; }
    .laag-type { font-size: 9px; color: var(--muted); text-transform: uppercase; }
    .laag-remove {
      opacity: 0; width: 18px; height: 18px; border-radius: 50%;
      background: var(--err); color: white; border: none; cursor: pointer;
      font-size: 10px; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: opacity .15s;
    }
    .laag-item:hover .laag-remove { opacity: 1; }

    /* ── Drop-zone ── */
    .drop-zone {
      border: 2px dashed var(--border); border-radius: 6px;
      padding: 14px; text-align: center; color: var(--muted);
      font-size: 12px; cursor: pointer; transition: all .15s; margin-top: 8px;
    }
    .drop-zone:hover { border-color: var(--primair); color: var(--primair); background: rgba(26,92,58,.04); }

    /* ── Loket toevoegen knop ── */
    .loket-toevoegen {
      border: 2px dashed var(--border); border-radius: var(--r);
      padding: 20px; text-align: center; color: var(--muted);
      font-size: 13px; cursor: pointer; transition: all .15s;
    }
    .loket-toevoegen:hover { border-color: var(--primair); color: var(--primair); background: rgba(26,92,58,.04); }

    /* ── Eigenschappen panel (kolom 3) ── */
    .props-header { padding: 16px 18px; border-bottom: 1px solid var(--border); }
    .props-titel { font-size: 14px; font-weight: 600; }
    .props-sub { font-size: 11px; color: var(--muted); margin-top: 3px; }
    .props-body { padding: 16px 18px; }

    /* ── Formulier elementen ── */
    .form-groep { margin-bottom: 16px; }
    .form-label {
      display: block; font-size: 10px; font-weight: 600;
      text-transform: uppercase; letter-spacing: .06em;
      color: var(--muted); margin-bottom: 5px;
    }
    .form-input, .form-select {
      width: 100%; padding: 8px 10px; font-size: 13px;
      border: 1px solid var(--border); border-radius: 6px;
      background: white; font-family: var(--font); transition: border-color .15s;
    }
    .form-input:focus, .form-select:focus { outline: none; border-color: var(--primair); }
    .form-hint { font-size: 10px; color: var(--muted); margin-top: 3px; }
    .form-rij { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

    /* ── Checkbox groep ── */
    .checkbox-groep { display: flex; flex-direction: column; gap: 6px; }
    .checkbox-item {
      display: flex; align-items: center; gap: 8px; padding: 7px 10px;
      background: var(--bg); border-radius: 6px; font-size: 12px; cursor: pointer;
      border: 1px solid transparent; transition: all .15s;
    }
    .checkbox-item:hover { border-color: var(--border); }
    .checkbox-item input { width: 14px; height: 14px; flex-shrink: 0; accent-color: var(--primair); }

    /* ── Renderer kiezen ── */
    .renderer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .renderer-optie {
      border: 2px solid var(--border); border-radius: 6px; padding: 10px 8px;
      text-align: center; cursor: pointer; transition: all .15s;
      font-size: 11px;
    }
    .renderer-optie:hover { border-color: var(--primair); }
    .renderer-optie.actief { border-color: var(--primair); background: rgba(26,92,58,.08); }
    .renderer-ico { font-size: 20px; margin-bottom: 4px; }
    .renderer-naam { font-weight: 500; }
    .renderer-status { font-size: 9px; color: var(--muted); }

    /* ── Knoppen ── */
    .btn {
      padding: 8px 14px; border-radius: 6px; font-size: 13px;
      font-weight: 500; cursor: pointer; border: none; font-family: var(--font);
      transition: all .15s; display: inline-flex; align-items: center; gap: 5px;
    }
    .btn-primair { background: var(--primair); color: white; }
    .btn-primair:hover { background: #154d30; }
    .btn-sec { background: var(--bg); color: var(--text); border: 1px solid var(--border); }
    .btn-sec:hover { background: var(--surface); }
    .btn-klein { padding: 4px 10px; font-size: 11px; }
    .btn-danger { background: rgba(192,57,43,.1); color: var(--err); border: 1px solid rgba(192,57,43,.2); }
    .btn:disabled { opacity: .5; cursor: not-allowed; }

    /* ── Token banner ── */
    .token-banner {
      background: var(--surface); border-bottom: 1px solid var(--border);
      padding: 10px 20px; display: flex; align-items: center; gap: 12px;
      font-size: 12px; flex-shrink: 0;
    }
    .token-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--err); flex-shrink: 0; }
    .token-dot.ok { background: var(--ok); }
    .token-input-klein {
      flex: 1; padding: 5px 8px; font-size: 11px; font-family: var(--mono);
      border: 1px solid var(--border); border-radius: 4px; max-width: 260px;
    }
    .token-input-klein:focus { outline: none; border-color: var(--primair); }

    /* ── Toast ── */
    .toast {
      position: fixed; bottom: 20px; right: 20px; z-index: 9999;
      background: var(--text); color: white; padding: 10px 16px;
      border-radius: var(--r); font-size: 13px; max-width: 340px;
      transform: translateY(80px); opacity: 0; transition: all .3s;
    }
    .toast.show { transform: translateY(0); opacity: 1; }
    .toast.ok { background: var(--ok); }
    .toast.err { background: var(--err); }

    /* ── Loader ── */
    .loader-inline {
      display: inline-block; width: 12px; height: 12px;
      border: 2px solid rgba(255,255,255,.3); border-top-color: white;
      border-radius: 50%; animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Empty state ── */
    .empty-state {
      text-align: center; padding: 40px 20px; color: var(--muted);
    }
    .empty-state .ico { font-size: 32px; margin-bottom: 10px; opacity: .4; }

    /* ── Gemeente kiezen modal ── */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.5);
      z-index: 500; display: flex; align-items: center; justify-content: center;
    }
    .modal-overlay.hidden { display: none; }
    .modal {
      background: var(--surface); border-radius: var(--r);
      padding: 28px; width: 480px; max-width: 90vw; max-height: 80vh;
      overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,.2);
    }
    .modal-titel { font-size: 18px; font-weight: 600; margin-bottom: 20px; }

    /* ── Gemeente-keuze lijst ── */
    .gemeente-keuze-item {
      display: flex; align-items: center; gap: 12px; padding: 12px 14px;
      border: 1px solid var(--border); border-radius: 6px; margin-bottom: 8px;
      cursor: pointer; transition: all .15s;
    }
    .gemeente-keuze-item:hover { border-color: var(--primair); background: rgba(26,92,58,.04); }
    .gemeente-keuze-logo {
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 13px; flex-shrink: 0;
    }

    /* ── Nieuw loket modal ── */
    .sjabloon-keuze-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
    .sjabloon-keuze {
      border: 2px solid var(--border); border-radius: var(--r);
      padding: 14px 12px; cursor: pointer; transition: all .15s; text-align: center;
    }
    .sjabloon-keuze:hover { border-color: var(--primair); }
    .sjabloon-keuze.actief { border-color: var(--primair); background: rgba(26,92,58,.08); }
    .sjabloon-keuze.disabled { opacity: .5; cursor: not-allowed; }
    .sjabloon-keuze .ico { font-size: 24px; margin-bottom: 6px; }
    .sjabloon-keuze .naam { font-size: 13px; font-weight: 600; }
    .sjabloon-keuze .status { font-size: 10px; color: var(--muted); margin-top: 3px; }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
  </style>
</head>
<body>

<!-- Token banner bovenaan -->
<div class="token-banner">
  <div class="token-dot" id="token-dot"></div>
  <span id="token-tekst" style="color:var(--muted)">Geen token — alleen lezen</span>
  <input type="password" class="token-input-klein" id="token-input"
    placeholder="ghp_... (voor opslaan)" oninput="slaTokenOp(this.value)"/>
  <button class="btn btn-sec btn-klein" onclick="toonGemeenteKeuze()">📂 Laad dashboard</button>
  <button class="btn btn-primair btn-klein" onclick="toonNieuwDashboard()">+ Nieuw dashboard</button>
  <span style="margin-left:auto;font-size:11px;color:var(--muted)">Data Companion Builder</span>
</div>

<div class="app">

  <!-- ══ KOLOM 1: Beschikbare componenten ══ -->
  <aside class="col-bronnen">
    <div class="col-header">
      <div>
        Componenten
        <div class="col-header-sub">Klik om toe te voegen</div>
      </div>
      <button class="btn btn-sec btn-klein" onclick="verversComponenten()" title="Verversen">↻</button>
    </div>
    <div class="col-scroll" id="componenten-panel">
      <div class="empty-state">
        <div class="ico">🔄</div>
        <p style="font-size:12px">Laden...</p>
      </div>
    </div>
  </aside>

  <!-- ══ KOLOM 2: Builder canvas ══ -->
  <main class="col-canvas">
    <div class="canvas-header">
      <div>
        <div class="canvas-title" id="canvas-titel">Selecteer een dashboard</div>
        <div class="canvas-sub" id="canvas-sub">Laad een bestaand dashboard of maak een nieuw aan</div>
      </div>
      <div class="canvas-acties">
        <button class="btn btn-sec" onclick="toonPreview()" id="btn-preview" disabled>👁 Preview</button>
        <button class="btn btn-primair" onclick="opslaanDashboard()" id="btn-opslaan" disabled>
          💾 Opslaan
        </button>
      </div>
    </div>
    <div class="canvas-body" id="canvas-body">
      <div class="empty-state" style="margin-top:80px">
        <div class="ico">🏗️</div>
        <p>Laad een bestaand dashboard of maak een nieuw aan</p>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:16px">
          <button class="btn btn-primair" onclick="toonGemeenteKeuze()">📂 Bestaand laden</button>
          <button class="btn btn-sec" onclick="toonNieuwDashboard()">+ Nieuw aanmaken</button>
        </div>
      </div>
    </div>
  </main>

  <!-- ══ KOLOM 3: Eigenschappen ══ -->
  <aside class="col-props">
    <div class="props-header">
      <div class="props-titel" id="props-titel">Eigenschappen</div>
      <div class="props-sub" id="props-sub">Selecteer een element om te bewerken</div>
    </div>
    <div class="props-body" id="props-body">
      <div class="empty-state" style="margin-top:40px">
        <div class="ico">👆</div>
        <p style="font-size:12px">Klik op een loket of laag om eigenschappen te zien</p>
      </div>
    </div>
  </aside>

</div>

<!-- ══ MODAL: Gemeente kiezen ══ -->
<div class="modal-overlay hidden" id="modal-gemeente">
  <div class="modal">
    <div class="modal-titel">Dashboard laden</div>
    <div id="gemeente-lijst">
      <div class="empty-state"><div class="ico">🔄</div><p>Laden...</p></div>
    </div>
    <div style="margin-top:16px">
      <button class="btn btn-sec" onclick="sluitModal('modal-gemeente')">Annuleren</button>
    </div>
  </div>
</div>

<!-- ══ MODAL: Nieuw loket ══ -->
<div class="modal-overlay hidden" id="modal-loket">
  <div class="modal">
    <div class="modal-titel">Loket toevoegen</div>
    <div style="margin-bottom:14px">
      <label class="form-label">Loket-label</label>
      <input type="text" class="form-input" id="nieuw-loket-label" placeholder="bv. Klimaatdashboard"/>
    </div>
    <div style="margin-bottom:14px">
      <label class="form-label">Icoon</label>
      <input type="text" class="form-input" id="nieuw-loket-icoon" placeholder="🗺️" maxlength="2"/>
    </div>
    <div style="margin-bottom:16px">
      <label class="form-label">Sjabloon</label>
      <div class="sjabloon-keuze-grid" id="sjabloon-keuze-grid">
        <!-- Dynamisch gevuld -->
      </div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-primair" onclick="bevestigNieuwLoket()">Toevoegen</button>
      <button class="btn btn-sec" onclick="sluitModal('modal-loket')">Annuleren</button>
    </div>
  </div>
</div>

<!-- ══ MODAL: Nieuw dashboard ══ -->
<div class="modal-overlay hidden" id="modal-nieuw">
  <div class="modal">
    <div class="modal-titel">Nieuw dashboard</div>
    <div style="margin-bottom:12px">
      <label class="form-label">Gemeentenaam</label>
      <input type="text" class="form-input" id="nieuw-gem-naam" placeholder="bv. Anzegem"/>
    </div>
    <div class="form-rij" style="margin-bottom:12px">
      <div>
        <label class="form-label">NIS-code</label>
        <input type="text" class="form-input" id="nieuw-gem-nis" placeholder="34002"/>
      </div>
      <div>
        <label class="form-label">Primaire kleur</label>
        <input type="color" id="nieuw-gem-kleur" value="#1a5c3a" style="width:100%;height:38px;border-radius:6px;border:1px solid var(--border);cursor:pointer"/>
      </div>
    </div>
    <div style="margin-bottom:12px">
      <label class="form-label">Centrum (lat, lon)</label>
      <input type="text" class="form-input" id="nieuw-gem-centrum" placeholder="50.83, 3.49"/>
      <div class="form-hint"><a href="https://maps.google.com" target="_blank" style="color:var(--primair)">Coördinaten opzoeken via Google Maps</a></div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-primair" onclick="maakNieuwDashboard()">Aanmaken</button>
      <button class="btn btn-sec" onclick="sluitModal('modal-nieuw')">Annuleren</button>
    </div>
  </div>
</div>

<!-- Toast -->
<div class="toast" id="toast"></div>

<script>
// ════════════════════════════════════════════════════════
//  CONFIGURATIE — pas aan naar jouw repo
// ════════════════════════════════════════════════════════
const REPO_OWNER = 'Kevinhuysentruyt';
const REPO_NAME  = 'datacompanion';
const DASHBOARD_URL = `https://${REPO_OWNER.toLowerCase()}.github.io/${REPO_NAME}`;
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

// ── STATE ────────────────────────────────────────────────
let token = null;
let huidigConfig = null;       // geladen gemeente-config
let huidigNaam = null;         // gemeente-bestandsnaam (zonder .json)
let huidigSha = null;          // GitHub SHA voor overschrijven
let actiefElement = null;      // geselecteerd loket of laag
let beschikbareSjablonen = []; // uit js/sjablonen/
let beschikbareRenderers = []; // uit js/renderers/
let beschikbareSources = {};   // uit sources.json
let gekozenSjabloon = 'geodata';

// ── TOKEN ────────────────────────────────────────────────
function slaTokenOp(w) {
  token = w.trim() || null;
  const dot = document.getElementById('token-dot');
  const txt = document.getElementById('token-tekst');
  if (token) {
    dot.className = 'token-dot ok';
    txt.textContent = 'Token actief — schrijven mogelijk';
    txt.style.color = 'var(--ok)';
  } else {
    dot.className = 'token-dot';
    txt.textContent = 'Geen token — alleen lezen';
    txt.style.color = 'var(--muted)';
  }
}

// ── GITHUB API ───────────────────────────────────────────
async function apiFetch(pad, opties = {}) {
  const headers = { 'Accept': 'application/vnd.github.v3+json' };
  if (token) headers['Authorization'] = `token ${token}`;
  const r = await fetch(`${API_BASE}/${pad}`, { headers, ...opties });
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e.message || `HTTP ${r.status}`);
  }
  return r.json();
}

async function leesBestand(pad) {
  const d = await apiFetch(`contents/${pad}`);
  return {
    inhoud: JSON.parse(atob(d.content.replace(/\n/g,''))),
    sha: d.sha
  };
}

async function leesMapBestanden(pad) {
  return apiFetch(`contents/${pad}`);
}

async function schrijfBestand(pad, inhoud, bericht, sha = null) {
  if (!token) throw new Error('Geen token — kan niet schrijven');
  const body = {
    message: bericht,
    content: btoa(unescape(encodeURIComponent(JSON.stringify(inhoud, null, 2))))
  };
  if (sha) body.sha = sha;
  return apiFetch(`contents/${pad}`, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  });
}

// ── INITIALISATIE ────────────────────────────────────────
async function init() {
  await Promise.all([
    laadSjablonen(),
    laadRenderers(),
    laadSources()
  ]);
  renderComponentenPanel();
}

// ── DETECTIE: SJABLONEN ──────────────────────────────────
// Leest js/sjablonen/ uit GitHub — detecteert automatisch nieuwe sjablonen
async function laadSjablonen() {
  try {
    const bestanden = await leesMapBestanden('js/sjablonen');
    beschikbareSjablonen = bestanden
      .filter(b => b.name.endsWith('.js'))
      .map(b => {
        const naam = b.name.replace('.js', '');
        // Sjabloon-metadata op basis van naamconventie
        const meta = {
          geodata:  { label: 'Geodata-loket', ico: '🗺️', beschrijving: 'Kaart + lagen', status: 'actief' },
          evolutie: { label: 'Cijfers-loket', ico: '📊', beschrijving: 'Grafieken + tabellen', status: 'gepland' },
          hybride:  { label: 'Hybride loket', ico: '🌡️', beschrijving: 'Kaart + cijfers', status: 'gepland' }
        };
        return { naam, ...( meta[naam] || { label: naam, ico: '📋', beschrijving: '', status: 'nieuw' }) };
      });
  } catch (e) {
    console.warn('Sjablonen niet geladen:', e.message);
    // Fallback
    beschikbareSjablonen = [
      { naam: 'geodata', label: 'Geodata-loket', ico: '🗺️', beschrijving: 'Kaart + lagen', status: 'actief' },
      { naam: 'evolutie', label: 'Cijfers-loket', ico: '📊', beschrijving: 'Grafieken', status: 'gepland' },
      { naam: 'hybride', label: 'Hybride loket', ico: '🌡️', beschrijving: 'Kaart + cijfers', status: 'gepland' }
    ];
  }
}

// ── DETECTIE: RENDERERS ──────────────────────────────────
// Leest js/renderers/ uit GitHub — detecteert automatisch nieuwe renderers
async function laadRenderers() {
  try {
    const bestanden = await leesMapBestanden('js/renderers');
    beschikbareRenderers = bestanden
      .filter(b => b.name.endsWith('.js'))
      .map(b => {
        const naam = b.name.replace('.js', '');
        const meta = {
          toggle:       { label: 'Kaartlaag toggle', ico: '🔘', status: 'actief' },
          lijngrafiek:  { label: 'Lijngrafiek', ico: '📈', status: 'gepland' },
          choropleth:   { label: 'Choropleth', ico: '🗺️', status: 'gepland' },
          indicator:    { label: 'Kerncijfer', ico: '🔢', status: 'gepland' },
          tabel:        { label: 'Tabel', ico: '📋', status: 'gepland' }
        };
        return { naam, ...(meta[naam] || { label: naam, ico: '✨', status: 'nieuw' }) };
      });
  } catch (e) {
    console.warn('Renderers niet geladen:', e.message);
    beschikbareRenderers = [
      { naam: 'toggle', label: 'Kaartlaag toggle', ico: '🔘', status: 'actief' }
    ];
  }
}

// ── DETECTIE: SOURCES ────────────────────────────────────
async function laadSources() {
  try {
    const { inhoud } = await leesBestand('sources.json');
    beschikbareSources = inhoud;
  } catch (e) {
    console.warn('sources.json niet geladen:', e.message);
    beschikbareSources = {};
  }
}

async function verversComponenten() {
  await Promise.all([laadSjablonen(), laadRenderers(), laadSources()]);
  renderComponentenPanel();
  toonToast('Componenten ververst', 'ok');
}

// ── COMPONENTEN PANEL RENDEREN ───────────────────────────
function renderComponentenPanel() {
  const panel = document.getElementById('componenten-panel');

  // Groepeer sources per type
  const wms = Object.entries(beschikbareSources).filter(([,v]) => v.type === 'wms' && !v['$schema']);
  const poi = Object.entries(beschikbareSources).filter(([,v]) => v.type === 'poi');
  const geojson = Object.entries(beschikbareSources).filter(([,v]) => v.type === 'geojson_url');

  panel.innerHTML = `
    <!-- Sjablonen -->
    <div class="sectie">
      <div class="sectie-titel">
        Sjablonen
        <span class="sectie-badge">${beschikbareSjablonen.length} beschikbaar</span>
      </div>
      ${beschikbareSjablonen.map(s => `
        <div class="component-item" onclick="voegLoketToe('${s.naam}')">
          <div class="component-ico">${s.ico}</div>
          <div>
            <div class="component-naam">${s.label}</div>
            <div class="component-sub">${s.beschrijving}</div>
          </div>
          <span class="component-type">${s.status}</span>
        </div>
      `).join('')}
    </div>

    <!-- WMS Kaartlagen -->
    ${wms.length ? `
    <div class="sectie">
      <div class="sectie-titel">
        Kaartlagen (WMS)
        <span class="sectie-badge">${wms.length}</span>
      </div>
      ${wms.map(([sleutel, bron]) => `
        <div class="component-item" onclick="voegLaagToe('${sleutel}')">
          <div class="component-ico">🗺️</div>
          <div>
            <div class="component-naam">${bron.label || sleutel}</div>
            <div class="component-sub">${sleutel}</div>
          </div>
          <span class="component-type">wms</span>
        </div>
      `).join('')}
    </div>` : ''}

    <!-- POI Punten -->
    ${poi.length ? `
    <div class="sectie">
      <div class="sectie-titel">
        Punten (POI)
        <span class="sectie-badge">${poi.length}</span>
      </div>
      ${poi.map(([sleutel, bron]) => `
        <div class="component-item" onclick="voegLaagToe('${sleutel}')">
          <div class="component-ico">📍</div>
          <div>
            <div class="component-naam">${bron.label || sleutel}</div>
            <div class="component-sub">${sleutel}</div>
          </div>
          <span class="component-type">poi</span>
        </div>
      `).join('')}
    </div>` : ''}

    <!-- GeoJSON data -->
    ${geojson.length ? `
    <div class="sectie">
      <div class="sectie-titel">
        Statische data
        <span class="sectie-badge">${geojson.length}</span>
      </div>
      ${geojson.map(([sleutel, bron]) => `
        <div class="component-item" onclick="voegLaagToe('${sleutel}')">
          <div class="component-ico">📂</div>
          <div>
            <div class="component-naam">${bron.label || sleutel}</div>
            <div class="component-sub">${sleutel}</div>
          </div>
          <span class="component-type">geojson</span>
        </div>
      `).join('')}
    </div>` : ''}

    <!-- Renderers -->
    <div class="sectie">
      <div class="sectie-titel">
        Visualisaties
        <span class="sectie-badge">${beschikbareRenderers.length}</span>
      </div>
      ${beschikbareRenderers.map(r => `
        <div class="component-item nieuw" title="Renderer — kies per laag">
          <div class="component-ico">${r.ico}</div>
          <div>
            <div class="component-naam">${r.label}</div>
            <div class="component-sub">renderer</div>
          </div>
          <span class="component-type">${r.status}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// ── GEMEENTE KIEZEN ──────────────────────────────────────
async function toonGemeenteKeuze() {
  document.getElementById('modal-gemeente').classList.remove('hidden');
  const lijst = document.getElementById('gemeente-lijst');
  lijst.innerHTML = '<div class="empty-state"><div class="ico">🔄</div><p>Laden...</p></div>';

  try {
    const bestanden = await leesMapBestanden('configs');
    const configs = bestanden.filter(b => b.name.endsWith('.json'));

    // Laad config-details voor weergave
    const details = await Promise.all(configs.map(async b => {
      try {
        const { inhoud } = await leesBestand(`configs/${b.name}`);
        return { naam: b.name.replace('.json',''), config: inhoud, sha: b.sha };
      } catch { return null; }
    }));

    lijst.innerHTML = details.filter(Boolean).map(d => {
      const g = d.config.gemeente || {};
      const kleur = d.config.dashboard?.kleuren?.primair || '#1a5c3a';
      const initialen = (g.naam || d.naam).substring(0,2).toUpperCase();
      const loketten = d.config.loketten?.length || 0;
      return `
        <div class="gemeente-keuze-item" onclick="laadDashboard('${d.naam}')">
          <div class="gemeente-keuze-logo" style="background:${kleur}">${initialen}</div>
          <div>
            <div style="font-weight:600;font-size:14px">${g.naam || d.naam}</div>
            <div style="font-size:11px;color:var(--muted)">NIS ${g.niscode || '—'} · ${loketten} loket(ten)</div>
          </div>
          <span style="font-size:11px;color:var(--muted);margin-left:auto">Laden →</span>
        </div>
      `;
    }).join('');
  } catch (e) {
    lijst.innerHTML = `<div class="empty-state"><div class="ico">⚠️</div><p>${e.message}</p></div>`;
  }
}

async function laadDashboard(naam) {
  sluitModal('modal-gemeente');
  try {
    const { inhoud, sha } = await leesBestand(`configs/${naam}.json`);
    huidigConfig = inhoud;
    huidigNaam = naam;
    huidigSha = sha;
    renderCanvas();
    document.getElementById('btn-opslaan').disabled = false;
    document.getElementById('btn-preview').disabled = false;
    toonToast(`Dashboard '${naam}' geladen`, 'ok');
  } catch (e) {
    toonToast(`Fout: ${e.message}`, 'err');
  }
}

// ── NIEUW DASHBOARD ──────────────────────────────────────
function toonNieuwDashboard() {
  document.getElementById('modal-nieuw').classList.remove('hidden');
}

function maakNieuwDashboard() {
  const naam = document.getElementById('nieuw-gem-naam').value.trim();
  const nis = document.getElementById('nieuw-gem-nis').value.trim();
  const kleur = document.getElementById('nieuw-gem-kleur').value;
  const centrumTxt = document.getElementById('nieuw-gem-centrum').value.trim();

  if (!naam || !nis) { toonToast('Vul naam en NIS-code in', 'err'); return; }

  const centrum = centrumTxt
    ? centrumTxt.split(',').map(s => parseFloat(s.trim()))
    : [50.9, 4.0];

  huidigConfig = {
    '$schema': 'Data Companion v3',
    gemeente: { naam, niscode: nis, fallback_centrum: centrum },
    dashboard: {
      titel: `${naam} in cijfers`,
      subtitel: `${naam} · Beleidsdashboard`,
      kleuren: { primair: kleur, accent: '#e67e22' }
    },
    bronvermelding: [
      { naam: 'Geopunt / Digitaal Vlaanderen', url: 'https://www.geopunt.be' }
    ],
    loketten: []
  };

  huidigNaam = naam.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
  huidigSha = null;

  sluitModal('modal-nieuw');
  renderCanvas();
  document.getElementById('btn-opslaan').disabled = false;
  document.getElementById('btn-preview').disabled = false;
}

// ── CANVAS RENDEREN ──────────────────────────────────────
function renderCanvas() {
  if (!huidigConfig) return;
  const g = huidigConfig.gemeente || {};
  const d = huidigConfig.dashboard || {};
  const kleur = d.kleuren?.primair || '#1a5c3a';
  const initialen = (g.naam || huidigNaam).substring(0,2).toUpperCase();

  document.getElementById('canvas-titel').textContent = d.titel || g.naam;
  document.getElementById('canvas-sub').textContent = d.subtitel || '';

  const loketten = huidigConfig.loketten || [];

  document.getElementById('canvas-body').innerHTML = `
    <!-- Gemeente banner -->
    <div class="gemeente-banner">
      <div class="gemeente-logo" style="background:${kleur}">${initialen}</div>
      <div class="gemeente-info">
        <div class="gemeente-naam-groot">${g.naam || huidigNaam}</div>
        <div class="gemeente-meta">
          NIS: ${g.niscode || '—'} ·
          Centrum: ${g.fallback_centrum ? g.fallback_centrum.join(', ') : '—'} ·
          ${loketten.length} loket(ten)
        </div>
      </div>
      <button class="btn btn-sec btn-klein" onclick="selecteerGemeente()">⚙️ Gemeente-instellingen</button>
    </div>

    <!-- Loketten -->
    ${loketten.map((l, i) => renderLoketBlok(l, i)).join('')}

    <!-- Loket toevoegen -->
    <div class="loket-toevoegen" onclick="openNieuwLoketModal()">
      + Loket toevoegen
    </div>
  `;
}

function renderLoketBlok(loket, index) {
  const sjabloon = beschikbareSjablonen.find(s => s.naam === loket.sjabloon);
  const lagen = loket.groepen?.flatMap(g => g.lagen || []) || [];

  return `
    <div class="loket-blok" id="loket-${index}">
      <div class="loket-blok-header" onclick="selecteerLoket(${index})">
        <span class="loket-blok-ico">${loket.icoon || '📊'}</span>
        <span class="loket-blok-naam">${loket.label}</span>
        <span class="loket-blok-badge">${sjabloon?.label || loket.sjabloon}</span>
        <div class="loket-blok-acties" onclick="event.stopPropagation()">
          ${index > 0 ? `<button class="btn btn-sec btn-klein" onclick="verplaatsLoket(${index}, -1)">↑</button>` : ''}
          ${index < (huidigConfig.loketten?.length - 1) ? `<button class="btn btn-sec btn-klein" onclick="verplaatsLoket(${index}, 1)">↓</button>` : ''}
          <button class="btn btn-danger btn-klein" onclick="verwijderLoket(${index})">✕</button>
        </div>
      </div>
      <div class="loket-blok-body">
        ${lagen.map((laag, li) => renderLaagItem(laag, index, li)).join('')}
        ${loket.sjabloon === 'geodata' ? `
          <div class="drop-zone" onclick="voegLaagToeAanLoket(${index})">
            + Laag toevoegen aan dit loket
          </div>
        ` : ''}
        ${loket.sjabloon !== 'geodata' ? `
          <div style="font-size:12px;color:var(--muted);padding:8px;text-align:center">
            ${sjabloon?.status === 'gepland' ? '🚧 Sjabloon in ontwikkeling' : 'Configureer via eigenschappen →'}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderLaagItem(laag, loketIdx, laagIdx) {
  const bron = beschikbareSources[laag.bron] || {};
  const kleur = bron.type === 'poi' ? '#e74c3c' : '#2980b9';
  const label = bron.label || laag.bron || laag.label || 'Naamloze laag';

  return `
    <div class="laag-item" onclick="selecteerLaag(${loketIdx}, ${laagIdx})">
      <div class="laag-dot" style="background:${kleur}"></div>
      <div class="laag-naam">${label}</div>
      <div class="laag-type">${bron.type || laag.bron || '—'}</div>
      <button class="laag-remove" onclick="event.stopPropagation();verwijderLaag(${loketIdx}, ${laagIdx})">✕</button>
    </div>
  `;
}

// ── LOKET ACTIES ─────────────────────────────────────────
function openNieuwLoketModal() {
  if (!huidigConfig) return;
  // Vul sjabloon-keuze grid dynamisch in
  const grid = document.getElementById('sjabloon-keuze-grid');
  grid.innerHTML = beschikbareSjablonen.map(s => `
    <div class="sjabloon-keuze ${gekozenSjabloon === s.naam ? 'actief' : ''} ${s.status !== 'actief' ? '' : ''}"
         onclick="kiesSjabloon('${s.naam}')">
      <div class="ico">${s.ico}</div>
      <div class="naam">${s.label}</div>
      <div class="status">${s.status}</div>
    </div>
  `).join('');
  document.getElementById('modal-loket').classList.remove('hidden');
}

function kiesSjabloon(naam) {
  gekozenSjabloon = naam;
  document.querySelectorAll('.sjabloon-keuze').forEach(el => {
    el.classList.toggle('actief', el.onclick?.toString().includes(`'${naam}'`));
  });
  // Herrender grid
  openNieuwLoketModal();
}

function bevestigNieuwLoket() {
  const label = document.getElementById('nieuw-loket-label').value.trim() || gekozenSjabloon;
  const icoon = document.getElementById('nieuw-loket-icoon').value.trim() || '📊';
  const id = label.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') + '-' + Date.now();

  const nieuwLoket = {
    id, label, icoon,
    sjabloon: gekozenSjabloon,
    beschrijving: ''
  };

  if (gekozenSjabloon === 'geodata') {
    nieuwLoket.groepen = [{ label: 'Lagen', lagen: [] }];
  }

  if (!huidigConfig.loketten) huidigConfig.loketten = [];
  huidigConfig.loketten.push(nieuwLoket);

  sluitModal('modal-loket');
  document.getElementById('nieuw-loket-label').value = '';
  document.getElementById('nieuw-loket-icoon').value = '';
  renderCanvas();
}

function verwijderLoket(index) {
  if (!confirm(`Loket '${huidigConfig.loketten[index].label}' verwijderen?`)) return;
  huidigConfig.loketten.splice(index, 1);
  renderCanvas();
}

function verplaatsLoket(index, richting) {
  const loketten = huidigConfig.loketten;
  const nieuwIndex = index + richting;
  if (nieuwIndex < 0 || nieuwIndex >= loketten.length) return;
  [loketten[index], loketten[nieuwIndex]] = [loketten[nieuwIndex], loketten[index]];
  renderCanvas();
}

// ── LAAG ACTIES ──────────────────────────────────────────
function voegLaagToe(bronSleutel) {
  // Voeg toe aan het eerste geodata-loket
  if (!huidigConfig) {
    toonToast('Laad eerst een dashboard', 'err');
    return;
  }
  const geodataLoket = huidigConfig.loketten?.find(l => l.sjabloon === 'geodata');
  if (!geodataLoket) {
    toonToast('Voeg eerst een Geodata-loket toe', 'err');
    return;
  }
  if (!geodataLoket.groepen) geodataLoket.groepen = [{ label: 'Lagen', lagen: [] }];
  geodataLoket.groepen[0].lagen.push({ bron: bronSleutel, default_aan: false });
  renderCanvas();
  toonToast(`${beschikbareSources[bronSleutel]?.label || bronSleutel} toegevoegd`, 'ok');
}

function voegLaagToeAanLoket(loketIndex) {
  // Toon een mini-picker met beschikbare lagen
  const bron = Object.keys(beschikbareSources).filter(k => !k.startsWith('$') && !k.startsWith('_'));
  const keuze = prompt(
    'Beschikbare bronnen:\n' + bron.map((k,i) => `${i+1}. ${k} (${beschikbareSources[k].label || ''})`).join('\n') +
    '\n\nTyp het nummer van de bron om toe te voegen:'
  );
  if (!keuze) return;
  const idx = parseInt(keuze) - 1;
  if (idx >= 0 && idx < bron.length) {
    const loket = huidigConfig.loketten[loketIndex];
    if (!loket.groepen) loket.groepen = [{ label: 'Lagen', lagen: [] }];
    loket.groepen[0].lagen.push({ bron: bron[idx], default_aan: false });
    renderCanvas();
    toonToast(`${bron[idx]} toegevoegd`, 'ok');
  }
}

function verwijderLaag(loketIdx, laagIdx) {
  const loket = huidigConfig.loketten[loketIdx];
  const allelagen = loket.groepen?.flatMap((g, gi) =>
    (g.lagen || []).map((l, li) => ({ groepIdx: gi, laagIdx: li }))
  ) || [];
  const target = allelagen[laagIdx];
  if (target) {
    loket.groepen[target.groepIdx].lagen.splice(target.laagIdx, 1);
    renderCanvas();
  }
}

function voegLoketToe(sjabloonNaam) {
  if (!huidigConfig) {
    toonToast('Laad eerst een dashboard', 'err');
    return;
  }
  gekozenSjabloon = sjabloonNaam;
  openNieuwLoketModal();
}

// ── SELECTIE EN EIGENSCHAPPEN ────────────────────────────
function selecteerGemeente() {
  if (!huidigConfig) return;
  const g = huidigConfig.gemeente || {};
  const d = huidigConfig.dashboard || {};
  const kleur = d.kleuren?.primair || '#1a5c3a';

  document.getElementById('props-titel').textContent = 'Gemeente-instellingen';
  document.getElementById('props-sub').textContent = g.naam || huidigNaam;

  document.getElementById('props-body').innerHTML = `
    <div class="form-groep">
      <label class="form-label">Gemeentenaam</label>
      <input type="text" class="form-input" id="prop-naam" value="${g.naam || ''}"
        oninput="updateConfig('gemeente.naam', this.value)"/>
    </div>
    <div class="form-groep">
      <label class="form-label">NIS-code</label>
      <input type="text" class="form-input" id="prop-nis" value="${g.niscode || ''}"
        oninput="updateConfig('gemeente.niscode', this.value)"/>
    </div>
    <div class="form-groep">
      <label class="form-label">Dashboard-titel</label>
      <input type="text" class="form-input" value="${d.titel || ''}"
        oninput="updateConfig('dashboard.titel', this.value)"/>
    </div>
    <div class="form-groep">
      <label class="form-label">Subtitel</label>
      <input type="text" class="form-input" value="${d.subtitel || ''}"
        oninput="updateConfig('dashboard.subtitel', this.value)"/>
    </div>
    <div class="form-groep">
      <label class="form-label">Primaire kleur</label>
      <input type="color" value="${kleur}" style="width:100%;height:38px;border-radius:6px;border:1px solid var(--border);cursor:pointer"
        oninput="updateConfig('dashboard.kleuren.primair', this.value)"/>
    </div>
    <div class="form-groep">
      <label class="form-label">Kaartcentrum (lat, lon)</label>
      <input type="text" class="form-input" value="${g.fallback_centrum ? g.fallback_centrum.join(', ') : ''}"
        oninput="setCentrum(this.value)"/>
      <div class="form-hint">bv. 50.81, 3.34</div>
    </div>
  `;
}

function selecteerLoket(index) {
  const loket = huidigConfig.loketten[index];
  document.getElementById('props-titel').textContent = loket.label;
  document.getElementById('props-sub').textContent = `${loket.sjabloon} sjabloon`;

  const sjabloon = beschikbareSjablonen.find(s => s.naam === loket.sjabloon);

  document.getElementById('props-body').innerHTML = `
    <div class="form-groep">
      <label class="form-label">Label (tabnaam)</label>
      <input type="text" class="form-input" value="${loket.label}"
        oninput="updateLoket(${index}, 'label', this.value)"/>
    </div>
    <div class="form-groep">
      <label class="form-label">Icoon</label>
      <input type="text" class="form-input" value="${loket.icoon || ''}"
        oninput="updateLoket(${index}, 'icoon', this.value)" maxlength="2"/>
    </div>
    <div class="form-groep">
      <label class="form-label">Beschrijving</label>
      <input type="text" class="form-input" value="${loket.beschrijving || ''}"
        oninput="updateLoket(${index}, 'beschrijving', this.value)"/>
    </div>
    <div class="form-groep">
      <label class="form-label">Badge</label>
      <input type="text" class="form-input" value="${loket.badge || ''}"
        oninput="updateLoket(${index}, 'badge', this.value)"
        placeholder="bv. 'soon' of 'nieuw'"/>
    </div>
    ${loket.sjabloon === 'evolutie' ? `
    <div class="form-groep">
      <label class="form-label">Indicatoren (komma-gescheiden)</label>
      <input type="text" class="form-input"
        value="${(loket.indicatoren || []).join(', ')}"
        oninput="updateLoketArray(${index}, 'indicatoren', this.value)"/>
      <div class="form-hint">bv. inwoners, vergrijzing, kansarmoede</div>
    </div>
    <div class="form-groep">
      <label class="form-label">Periode</label>
      <div class="form-rij">
        <div>
          <label class="form-label" style="margin-top:4px">Van</label>
          <input type="number" class="form-input" min="2000" max="2030"
            value="${loket.periode?.van || 2014}"
            oninput="updateLoketPeriode(${index}, 'van', this.value)"/>
        </div>
        <div>
          <label class="form-label" style="margin-top:4px">Tot</label>
          <input type="number" class="form-input" min="2000" max="2030"
            value="${loket.periode?.tot || 2023}"
            oninput="updateLoketPeriode(${index}, 'tot', this.value)"/>
        </div>
      </div>
    </div>
    <div class="form-groep">
      <label class="form-label">Vergelijkingsgebieden (NIS-codes, komma)</label>
      <input type="text" class="form-input"
        value="${(loket.vergelijking || []).join(', ')}"
        oninput="updateLoketArray(${index}, 'vergelijking', this.value)"/>
      <div class="form-hint">bv. 34003, 34002, 34013</div>
    </div>
    ` : ''}
    <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
      <div class="form-label" style="margin-bottom:8px">Sjabloon</div>
      <div class="renderer-grid">
        ${beschikbareSjablonen.map(s => `
          <div class="renderer-optie ${loket.sjabloon === s.naam ? 'actief' : ''}"
               onclick="updateLoket(${index}, 'sjabloon', '${s.naam}')">
            <div class="renderer-ico">${s.ico}</div>
            <div class="renderer-naam">${s.label}</div>
            <div class="renderer-status">${s.status}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function selecteerLaag(loketIdx, laagIdx) {
  const loket = huidigConfig.loketten[loketIdx];
  const allelagen = loket.groepen?.flatMap(g => g.lagen || []) || [];
  const laag = allelagen[laagIdx];
  if (!laag) return;

  const bron = beschikbareSources[laag.bron] || {};

  document.getElementById('props-titel').textContent = bron.label || laag.bron || 'Laag';
  document.getElementById('props-sub').textContent = laag.bron;

  document.getElementById('props-body').innerHTML = `
    <div class="form-groep">
      <label class="form-label">Databron</label>
      <select class="form-select" onchange="updateLaagBron(${loketIdx}, ${laagIdx}, this.value)">
        ${Object.entries(beschikbareSources).filter(([k]) => !k.startsWith('$') && !k.startsWith('_')).map(([k,v]) => `
          <option value="${k}" ${laag.bron === k ? 'selected' : ''}>${v.label || k}</option>
        `).join('')}
      </select>
    </div>
    <div class="form-groep">
      <label class="form-label">Standaard aan</label>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" ${laag.default_aan ? 'checked' : ''}
          onchange="updateLaagProp(${loketIdx}, ${laagIdx}, 'default_aan', this.checked)"
          style="accent-color:var(--primair)"/>
        <span style="font-size:13px">Laag standaard ingeschakeld</span>
      </label>
    </div>
    <div class="form-groep">
      <label class="form-label">Transparantie (0-1)</label>
      <input type="range" min="0" max="1" step="0.1"
        value="${laag.transparantie || bron.transparantie || 0.8}"
        oninput="updateLaagProp(${loketIdx}, ${laagIdx}, 'transparantie', parseFloat(this.value));document.getElementById('trans-val').textContent=this.value"/>
      <span id="trans-val" style="font-size:12px;color:var(--muted)">${laag.transparantie || 0.8}</span>
    </div>
    <div class="form-groep">
      <label class="form-label">Visualisatie</label>
      <div class="renderer-grid">
        ${beschikbareRenderers.map(r => `
          <div class="renderer-optie ${(laag.renderer || 'toggle') === r.naam ? 'actief' : ''}"
               onclick="updateLaagProp(${loketIdx}, ${laagIdx}, 'renderer', '${r.naam}')">
            <div class="renderer-ico">${r.ico}</div>
            <div class="renderer-naam">${r.label}</div>
            <div class="renderer-status">${r.status}</div>
          </div>
        `).join('')}
      </div>
    </div>
    ${bron.type === 'poi' || bron.type === 'geojson_url' ? `
    <div class="form-groep">
      <label class="form-label">Marker kleur</label>
      <input type="color" value="${laag.kleur_marker || '#e74c3c'}"
        style="width:100%;height:38px;border-radius:6px;border:1px solid var(--border);cursor:pointer"
        oninput="updateLaagProp(${loketIdx}, ${laagIdx}, 'kleur_marker', this.value)"/>
    </div>
    ` : ''}
  `;
}

// ── CONFIG UPDATE HELPERS ────────────────────────────────
function updateConfig(pad, waarde) {
  const sleutels = pad.split('.');
  let obj = huidigConfig;
  for (let i = 0; i < sleutels.length - 1; i++) {
    if (!obj[sleutels[i]]) obj[sleutels[i]] = {};
    obj = obj[sleutels[i]];
  }
  obj[sleutels[sleutels.length - 1]] = waarde;
}

function setCentrum(txt) {
  const parts = txt.split(',').map(s => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    huidigConfig.gemeente.fallback_centrum = parts;
  }
}

function updateLoket(idx, sleutel, waarde) {
  huidigConfig.loketten[idx][sleutel] = waarde;
  // Herrender canvas titel als label verandert
  if (sleutel === 'label' || sleutel === 'icoon') renderCanvas();
}

function updateLoketArray(idx, sleutel, txt) {
  huidigConfig.loketten[idx][sleutel] = txt.split(',').map(s => s.trim()).filter(Boolean);
}

function updateLoketPeriode(idx, sleutel, waarde) {
  if (!huidigConfig.loketten[idx].periode) huidigConfig.loketten[idx].periode = {};
  huidigConfig.loketten[idx].periode[sleutel] = parseInt(waarde);
}

function updateLaagBron(loketIdx, laagIdx, bronSleutel) {
  const allelagen = huidigConfig.loketten[loketIdx].groepen?.flatMap(g => g.lagen || []) || [];
  if (allelagen[laagIdx]) allelagen[laagIdx].bron = bronSleutel;
  renderCanvas();
}

function updateLaagProp(loketIdx, laagIdx, sleutel, waarde) {
  const allelagen = huidigConfig.loketten[loketIdx].groepen?.flatMap(g => g.lagen || []) || [];
  if (allelagen[laagIdx]) allelagen[laagIdx][sleutel] = waarde;
}

// ── OPSLAAN ──────────────────────────────────────────────
async function opslaanDashboard() {
  if (!token) { toonToast('Token vereist voor opslaan', 'err'); return; }
  if (!huidigConfig || !huidigNaam) return;

  const btn = document.getElementById('btn-opslaan');
  btn.innerHTML = '<div class="loader-inline"></div> Opslaan...';
  btn.disabled = true;

  try {
    const bericht = huidigSha
      ? `Builder: config ${huidigNaam} bijgewerkt`
      : `Builder: nieuw dashboard ${huidigNaam} aangemaakt`;

    await schrijfBestand(`configs/${huidigNaam}.json`, huidigConfig, bericht, huidigSha);
    toonToast(`✓ ${huidigNaam}.json opgeslagen in GitHub`, 'ok');

    // Haal nieuwe SHA op
    const { sha } = await leesBestand(`configs/${huidigNaam}.json`);
    huidigSha = sha;
  } catch (e) {
    toonToast(`Fout: ${e.message}`, 'err');
  } finally {
    btn.innerHTML = '💾 Opslaan';
    btn.disabled = false;
  }
}

// ── PREVIEW ──────────────────────────────────────────────
function toonPreview() {
  if (!huidigNaam) return;
  window.open(`${DASHBOARD_URL}/?gemeente=${huidigNaam}`, '_blank');
}

// ── MODAL BEHEER ─────────────────────────────────────────
function sluitModal(id) {
  document.getElementById(id).classList.add('hidden');
}
document.addEventListener('click', e => {
  ['modal-gemeente','modal-loket','modal-nieuw'].forEach(id => {
    const el = document.getElementById(id);
    if (el && e.target === el) sluitModal(id);
  });
});

// ── TOAST ────────────────────────────────────────────────
let toastTimer;
function toonToast(txt, type = '') {
  const t = document.getElementById('toast');
  t.textContent = txt;
  t.className = `toast show${type ? ' '+type : ''}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
}

// ── START ────────────────────────────────────────────────
init();
</script>
</body>
</html>
