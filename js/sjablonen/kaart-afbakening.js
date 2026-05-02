// ════════════════════════════════════════════════════════
//  HELPER: Kaart-afbakening
//
//  Past geografische begrenzing toe op een Leaflet-map
//  op basis van een config-object uit zwevegem.json (of
//  een andere gemeenteconfig).
//
//  Plaats dit bestand als: js/sjablonen/kaart-afbakening.js
//  en importeer het in geodata.js
// ════════════════════════════════════════════════════════

/**
 * Defaults voor kaart-afbakening.
 * Kunnen overschreven worden via de loket-config in zwevegem.json:
 *   "kaart_afbakening": {
 *     "modus": "soft_lock" | "hard_lock" | "geen",
 *     "marge_percentage": 0-50,
 *     "min_zoom": 1-20,
 *     "max_zoom": 1-20,
 *     "viscosity": 0.0-1.0
 *   }
 */
const DEFAULTS = {
  modus: 'soft_lock',
  marge_percentage: 15,
  min_zoom: 12,
  max_zoom: 19,
  viscosity: 0.7
};

/**
 * Past kaart-afbakening toe op een Leaflet-map.
 *
 * @param {L.Map} map - De Leaflet map instance
 * @param {Object} boundingBox - { minLat, maxLat, minLng, maxLng } (WGS84)
 * @param {Object} config - kaart_afbakening uit loket-config (optioneel)
 */
export function pasAfbakeningToe(map, boundingBox, config = {}) {
  const cfg = { ...DEFAULTS, ...config };

  if (cfg.modus === 'geen') {
    // Niet-afgebakend: alleen initiële view zetten
    map.fitBounds([
      [boundingBox.minLat, boundingBox.minLng],
      [boundingBox.maxLat, boundingBox.maxLng]
    ], { padding: [20, 20] });
    return;
  }

  // Bereken bounds met marge
  const breedte = boundingBox.maxLng - boundingBox.minLng;
  const hoogte = boundingBox.maxLat - boundingBox.minLat;
  const margeFactor = (cfg.marge_percentage || 0) / 100;

  const maxBounds = L.latLngBounds(
    [boundingBox.minLat - hoogte * margeFactor, boundingBox.minLng - breedte * margeFactor],
    [boundingBox.maxLat + hoogte * margeFactor, boundingBox.maxLng + breedte * margeFactor]
  );

  // Zet bounds
  map.setMaxBounds(maxBounds);

  // Viscosity: 1.0 = hard lock, 0.0 = geen weerstand
  const viscosity = cfg.modus === 'hard_lock' ? 1.0 : (cfg.viscosity ?? 0.7);
  map.options.maxBoundsViscosity = viscosity;

  // Zoom-bereik
  if (cfg.min_zoom !== undefined && cfg.min_zoom !== null) {
    map.setMinZoom(cfg.min_zoom);
  }
  if (cfg.max_zoom !== undefined && cfg.max_zoom !== null) {
    map.setMaxZoom(cfg.max_zoom);
  }

  // Initiële view: focus op de echte gemeente (zonder marge)
  map.fitBounds([
    [boundingBox.minLat, boundingBox.minLng],
    [boundingBox.maxLat, boundingBox.maxLng]
  ], { padding: [20, 20] });
}

/**
 * Helpermethode: zet de bounding box vanuit een Basisregisters-respons om
 * naar het simpele {minLat, maxLat, minLng, maxLng} format.
 *
 * Basisregisters geeft typisch:
 *   { boundingBox: { lowerLeft: {lat, lon}, upperRight: {lat, lon} } }
 * of (oudere variant):
 *   { boundingBox: { minX, maxX, minY, maxY } }   waar X=lng, Y=lat
 */
export function normaliseerBoundingBox(bb) {
  if (!bb) return null;

  // Variant 1: lowerLeft / upperRight
  if (bb.lowerLeft && bb.upperRight) {
    return {
      minLat: bb.lowerLeft.lat,
      minLng: bb.lowerLeft.lon ?? bb.lowerLeft.lng,
      maxLat: bb.upperRight.lat,
      maxLng: bb.upperRight.lon ?? bb.upperRight.lng
    };
  }

  // Variant 2: minX/maxX/minY/maxY (X=lng, Y=lat)
  if (bb.minX !== undefined) {
    return {
      minLat: bb.minY,
      maxLat: bb.maxY,
      minLng: bb.minX,
      maxLng: bb.maxX
    };
  }

  // Variant 3: al in juiste vorm
  if (bb.minLat !== undefined) {
    return bb;
  }

  return null;
}
