// ════════════════════════════════════════════════════════
//  SOURCE: POI (Points of Interest)
//  Badge-paginering via Geopunt OGC API Features
// ════════════════════════════════════════════════════════

export function laadLaag(laag, kaart, statusEl) {
  const opties = {};
  if (laag._pane) opties.pane = laag._pane;
  if (laag.attribution) opties.attribution = laag.attribution;

  const cluster = L.layerGroup(opties);

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

    const markerOpties = {
      radius: 6,
      fillColor: laag.kleur_marker || '#e74c3c',
      color: '#fff',
      weight: 1.5,
      fillOpacity: 0.9
    };
    if (laag._pane) markerOpties.pane = laag._pane;

    L.circleMarker([lat, lon], markerOpties).bindPopup(`
      <div class="ptag">${laag.popup_label || 'POI'}</div>
      <div class="ptit">${naam}</div>
      <div class="pbod">${velden || 'Geen extra info'}</div>
    `).addTo(cluster);
  }

  // Attribution toevoegen aan kaart wanneer laag actief wordt
  if (laag.attribution) {
    cluster.on('add', () => kaart.attributionControl.addAttribution(laag.attribution));
    cluster.on('remove', () => kaart.attributionControl.removeAttribution(laag.attribution));
  }

  cluster._geladen = false;
  cluster._laadFn = async function() {
    if (cluster._geladen) return;
    cluster._geladen = true;
    const badge_grootte = laag.badge_grootte || 500;
    const max_items = laag.max_items || 5000;
    let offset = 0, totaal = 0;
    try {
      while (totaal < max_items) {
        const deze = Math.min(badge_grootte, max_items - totaal);
        const params = new URLSearchParams({ f: 'application/geo+json', limit: deze, offset });
        if (laag.categorie) params.set('theme', laag.categorie);
        if (statusEl) statusEl.textContent = `Laden... ${totaal} punten`;
        const r = await fetch(`${laag.url}?${params}`, { headers: { Accept: 'application/geo+json' } });
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
      console.error('POI fout:', e.message);
      if (statusEl) statusEl.textContent = `⚠ Fout: ${e.message}`;
    }
  };

  if (laag.default_aan) {
    cluster.addTo(kaart);
    cluster._laadFn();
  }
  return cluster;
}
