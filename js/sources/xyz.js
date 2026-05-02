// ════════════════════════════════════════════════════════
//  SOURCE: XYZ / MapLibre GL
//
//  OpenFreeMap gebruikt vector tiles via MapLibre GL.
//  Dit vereist de MapLibre GL Leaflet plugin in index.html:
//
//  <link href="https://unpkg.com/maplibre-gl/dist/maplibre-gl.css" rel="stylesheet"/>
//  <script src="https://unpkg.com/maplibre-gl/dist/maplibre-gl.js"></script>
//  <script src="https://unpkg.com/@maplibre/maplibre-gl-leaflet/leaflet-maplibre-gl.js"></script>
//
//  Config-voorbeeld in sources.json:
//  {
//    "type": "xyz",
//    "label": "OpenFreeMap Liberty",
//    "style_url": "https://tiles.openfreemap.org/styles/liberty",
//    "attribution": "© OpenFreeMap © OpenMapTiles Data van OpenStreetMap"
//  }
// ════════════════════════════════════════════════════════

export function laadLaag(laagConfig, map, statusEl) {
  // OpenFreeMap / MapLibre GL vector tiles
  if (laagConfig.style_url) {
    try {
      const glLaag = L.maplibreGL({
        style: laagConfig.style_url,
        attribution: laagConfig.attribution || ''
      });
      return glLaag;
    } catch (e) {
      console.error('MapLibre GL Leaflet niet geladen. Voeg scripts toe aan index.html:', e);
      if (statusEl) statusEl.textContent = 'MapLibre plugin ontbreekt';
      return null;
    }
  }

  // Fallback: gewone XYZ raster tiles (voor andere providers)
  if (laagConfig.url) {
    const opties = {
      attribution: laagConfig.attribution || '',
      minZoom: laagConfig.min_zoom ?? 0,
      maxZoom: laagConfig.max_zoom ?? 20,
      crossOrigin: true
    };
    if (laagConfig._pane) opties.pane = laagConfig._pane;
    return L.tileLayer(laagConfig.url, opties);
  }

  console.warn('XYZ laag heeft geen style_url of url:', laagConfig.label);
  return null;
}
