// ════════════════════════════════════════════════════════
//  SOURCE: WMS (Web Map Service)
//  Voor rasterkaart-tiles van Geopunt diensten
//  bv. GRB basiskaart, orthofoto, klimaatlagen
//
//  CONTRACT (zelfde voor alle sources):
//  laadLaag(opglosteLaag, kaart) → Leaflet Layer object
// ════════════════════════════════════════════════════════

export function laadLaag(laag, kaart) {
  const wmsLayer = L.tileLayer.wms(laag.url, {
    layers: laag.layer,
    format: 'image/png',
    transparent: true,
    version: '1.3.0',
    opacity: laag.transparantie || 0.8,
    attribution: laag.attribution || ''
  });

  if (laag.default_aan) wmsLayer.addTo(kaart);
  return wmsLayer;
}
