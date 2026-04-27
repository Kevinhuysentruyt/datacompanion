// ════════════════════════════════════════════════════════
//  SJABLOON: Hybride (placeholder — Fase F)
//  Combineert kaart en cijfers in split-layout
//  Te bouwen na evolutie-sjabloon
// ════════════════════════════════════════════════════════

export function renderSjabloonHybride(container, loket, state) {
  container.innerHTML = `
    <div class="loket-header">
      <div class="loket-title">${loket.label}</div>
      <div class="loket-desc">${loket.beschrijving || 'Kaart en cijfers gecombineerd'}</div>
    </div>
    <div class="sjabloon-placeholder">
      <div class="ico">🗺️📊</div>
      <span class="badge-status">In ontwikkeling — Fase F</span>
      <h3>Hybride loket komt later</h3>
      <p>Hier komen kaart en cijfers naast elkaar, met cross-filtering
      tussen beide weergaves en een gedeelde tijdslider.</p>
    </div>
  `;
}
