// ════════════════════════════════════════════════════════
//  SOURCE: POI (Points of Interest)
//  Voor Geopunt POI OGC API Features
//  bv. zorgvoorzieningen, scholen
//
//  Eigenschappen:
//  - Badge-gewijze paginering (500 per request)
//  - Lazy loading (laadt enkel bij toggle aan)
//  - Status-update tijdens laden
// ════════════════════════════════════════════════════════

export function laadLaag(laag, kaart, statusEl) {
  const cluster = L.layerGroup();

  // Voeg één feature toe als marker
  function voegMarkerToe(f) {
    const coords = f.geometry?.coordinates;
    if (!coords) return;
    const [lon, lat] = coords;
    const props = f.properties || {};
    const naam = props.name || props.naam || '(geen naam)';

    const velden = (laag.popup_velden || ['name', 'municipality']).map(v => {
      const w = props[v] || props[v.toLowerCase()] || '';
      return w ? `<div><strong>${v}:</strong> ${w}</div>` : '';
    }).filter(Boolean).join('');

    L.circleMarker([lat, lon], {
      radius: 6,
      fillColor: laag.kleur_marker || '#e74c3c',
      color: '#fff',
      weight: 1.5,
      fillOpacity: 0.9
    }).bindPopup(`
      <div class="ptag">${laag.popup_label || 'POI'}</div>
      <div class="ptit">${naam}</div>
      <div class="pbod">${velden || 'Geen extra info'}</div>
    `).addTo(cluster);
  }

  // Badge-gewijze laad-functie
  cluster._geladen = false;
  cluster._laadFn = async function() {
    if (cluster._geladen) return;
    cluster._geladen = true;

    const badge_grootte = laag.badge_grootte || 500;
    const max_items = laag.max_items || 5000;
    let offset = 0;
    let totaal = 0;

    try {
      while (totaal < max_items) {
        const deze = Math.min(badge_grootte, max_items - totaal);
        const params = new URLSearchParams({
          f: 'application/geo+json',
          limit: deze,
          offset: offset
        });
        if (laag.categorie) params.set('theme', laag.categorie);

        if (statusEl) statusEl.textContent = `Laden... ${totaal} punten`;

        const r = await fetch(`${laag.url}?${params}`, {
          headers: { Accept: 'application/geo+json' }
        });
        if (!r.ok) throw new Error('POI API: HTTP ' + r.status);
        const data = await r.json();

        const features = data.features || [];
        if (!features.length) break;

        features.forEach(voegMarkerToe);
        totaal += features.length;
        offset += features.length;

        if (features.length < deze) break;
      }

      if (statusEl) {
        statusEl.textContent = `✓ ${totaal} punten geladen`;
        setTimeout(() => statusEl.remove(), 3000);
      }
    } catch (e) {
      console.error('POI laad-fout:', e.message);
      if (statusEl) statusEl.textContent = `⚠ Fout: ${e.message}`;
    }
  };

  if (laag.default_aan) {
    cluster.addTo(kaart);
    cluster._laadFn();
  }

  return cluster;
}
