// ════════════════════════════════════════════════════════
//  SOURCE: GeoJSON URL
//  Laadt een statisch GeoJSON-bestand uit data/ map
//  bv. zorgvoorzieningen.geojson (gegenereerd door pipeline)
//
//  Voordeel: snel, geen API-limieten, jaarlijks/maandelijks
//  versgehouden via Python pipeline
// ════════════════════════════════════════════════════════

export function laadLaag(laag, kaart) {
  const geojsonLaag = L.geoJSON(null, {
    pointToLayer(f, latlng) {
      return L.circleMarker(latlng, {
        radius: 6,
        fillColor: laag.kleur_marker || '#e74c3c',
        color: '#fff',
        weight: 1.5,
        fillOpacity: 0.9
      });
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
  });

  geojsonLaag._geladen = false;
  geojsonLaag._laadFn = async function() {
    if (geojsonLaag._geladen) return;
    geojsonLaag._geladen = true;
    try {
      const r = await fetch(laag.url);
      if (!r.ok) throw new Error(`GeoJSON niet gevonden: ${laag.url}`);
      const data = await r.json();
      geojsonLaag.addData(data);
      console.log(`GeoJSON: ${data.features?.length || 0} features geladen`);
    } catch (e) {
      console.error('GeoJSON fout:', e.message);
    }
  };

  if (laag.default_aan) {
    geojsonLaag.addTo(kaart);
    geojsonLaag._laadFn();
  }

  return geojsonLaag;
}
