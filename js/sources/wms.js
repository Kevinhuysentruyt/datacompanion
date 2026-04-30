// ════════════════════════════════════════════════════════
//  SOURCE: WMS (Web Map Service)
//
//  Wijzigingen v3:
//  - Respecteert _pane voor z-index plaatsing
//  - Geeft attribution correct door aan Leaflet
// ════════════════════════════════════════════════════════

export function laadLaag(laag, kaart) {
  const opties = {
    layers: laag.layer,
    format: 'image/png',
    transparent: true,
    version: '1.3.0',
    opacity: laag.transparantie || 0.8,
    attribution: laag.attribution || ''
  };

  // Pane meegeven indien gespecifieerd (voor z-index controle)
  if (laag._pane) opties.pane = laag._pane;

  const wmsLayer = L.tileLayer.wms(laag.url, opties);

  if (laag.default_aan) wmsLayer.addTo(kaart);
  return wmsLayer;
}
