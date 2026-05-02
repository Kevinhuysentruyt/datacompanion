// ════════════════════════════════════════════════════════
//  SOURCE: XYZ (tile layer)
//
//  Voor tile-providers zoals OpenFreeMap, Stadia Maps, etc.
//  Config-voorbeeld in sources.json:
//  {
//    "type": "xyz",
//    "label": "OpenFreeMap Positron",
//    "url": "https://tiles.openfreemap.org/styles/positron/{z}/{x}/{y}.png",
//    "attribution": "© OpenFreeMap © OpenMapTiles Data from OpenStreetMap",
//    "min_zoom": 0,
//    "max_zoom": 20
//  }
// ════════════════════════════════════════════════════════

export function laadLaag(laagConfig, map, statusEl) {
  const opties = {
    attribution: laagConfig.attribution || '',
    minZoom: laagConfig.min_zoom ?? 0,
    maxZoom: laagConfig.max_zoom ?? 20,
    crossOrigin: true
  };

  if (laagConfig._pane) opties.pane = laagConfig._pane;

  const xyzLaag = L.tileLayer(laagConfig.url, opties);
  return xyzLaag;
}
