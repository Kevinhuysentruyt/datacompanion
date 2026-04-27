// ════════════════════════════════════════════════════════
//  RENDERER: Toggle (laag aan/uit knop)
//  Componeert een toggle-knop voor het zijpaneel
//  en koppelt aan- of uitzetten van de laag op de kaart
// ════════════════════════════════════════════════════════

export function maakToggle(label, kaartlaag, kaart) {
  const item = document.createElement('div');
  item.className = 'layer-item';

  const checked = kaart.hasLayer(kaartlaag) ? 'checked' : '';
  item.innerHTML = `
    <span>${label}</span>
    <label class="tgl">
      <input type="checkbox" ${checked}>
      <div class="tt"></div><div class="th2"></div>
    </label>
  `;

  const input = item.querySelector('input');
  input.addEventListener('change', e => {
    if (e.target.checked) {
      kaartlaag.addTo(kaart);
      // Lazy loading triggeren als de laag dat ondersteunt
      if (kaartlaag._laadFn) kaartlaag._laadFn();
    } else {
      kaart.removeLayer(kaartlaag);
    }
  });

  return item;
}
