// ════════════════════════════════════════════════════════
//  SOURCE: GeoJSON URL
//  Statisch GeoJSON-bestand uit data/ map
// ════════════════════════════════════════════════════════

export function laadLaag(laag, kaart) {
  const opties = {
    pointToLayer(f, latlng) {
      const markerOpties = {
        radius: 6,
        fillColor: laag.kleur_marker || '#e74c3c',
        color: '#fff',
        weight: 1.5,
        fillOpacity: 0.9
      };
      if (laag._pane) markerOpties.pane = laag._pane;
      return L.circleMarker(latlng, markerOpties);
    },
    onEachFeature(f, l) {
      const props = f.properties || {};
      const naam = props.name || props.naam || '(geen naam)';
      const velden = (laag.popup_velden || ['name']).map(v => {
        const w = props[v] || '';
        return w ? `<div><strong>${v}:</strong> ${w}</div>` : '';
      }).filter(Boolean).join('');
      l.bindPopup(`
        <div class="ptag">${laag.popup_label || 'Feature'}</div>
        <div class="ptit">${naam}</div>
        <div class="pbod">${velden || 'Geen info'}</div>
      `);
    }
  };
  if (laag._pane) opties.pane = laag._pane;
  if (laag.attribution) opties.attribution = laag.attribution;

  const geojsonLaag = L.geoJSON(null, opties);

  geojsonLaag._geladen = false;
  geojsonLaag._laadFn = async function() {
    if (geojsonLaag._geladen) return;
    geojsonLaag._geladen = true;
    try {
      const r = await fetch(laag.url);
      if (!r.ok) throw new Error(`GeoJSON niet gevonden: ${laag.url}`);
      const data = await r.json();
      geojsonLaag.addData(data);
    } catch (e) { console.error('GeoJSON fout:', e.message); }
  };

  if (laag.default_aan) {
    geojsonLaag.addTo(kaart);
    geojsonLaag._laadFn();
  }
  return geojsonLaag;
}
