// ════════════════════════════════════════════════════════
//  SJABLOON: Evolutie (placeholder — Fase D)
//  Wordt vervangen door:
//  - Stadsmonitor data-pipeline
//  - Lijngrafiek-renderer (Chart.js)
//  - Vergelijkingsbalken tussen gemeenten
//  - Tijdsperiode-filter
// ════════════════════════════════════════════════════════

export function renderSjabloonEvolutie(container, loket, state) {
  const indicatoren = (loket.indicatoren || []).join(', ') || 'nog te bepalen';
  const periode = loket.periode
    ? `${loket.periode.van}–${loket.periode.tot}`
    : 'nog te bepalen';

  container.innerHTML = `
    <div class="loket-header">
      <div class="loket-title">${loket.label}</div>
      <div class="loket-desc">${loket.beschrijving || 'Evoluties en vergelijkingen'}</div>
    </div>
    <div class="sjabloon-placeholder">
      <div class="ico">📊</div>
      <span class="badge-status">In ontwikkeling — Fase D</span>
      <h3>Cijfers-loket komt binnenkort</h3>
      <p>Hier komen lijngrafieken, vergelijkingsbalken en sorteerbare tabellen
      met data uit Stadsmonitor en Provincies in Cijfers.</p>
      <p style="font-size:11px;font-style:italic">
        Geplande indicatoren: ${indicatoren}<br>
        Geplande periode: ${periode}
      </p>
    </div>
  `;
}
