// ════════════════════════════════════════════════════════
//  RENDERER: Radio (achtergrond-keuze)
//  Slechts één laag uit de groep is tegelijk actief
//
//  v2: Add-then-remove ipv remove-then-add — voorkomt
//      "flip" van de kaart bij wisselen van achtergrond.
// ════════════════════════════════════════════════════════
export function maakRadio(label, kaartlaag, kaart, naam, isStandaard, groep) {
  const item = document.createElement('div');
  item.className = 'layer-item layer-item-radio';
  const id = `${naam}-${Math.random().toString(36).slice(2, 8)}`;
  item.innerHTML = `
    <label class="radio-label" for="${id}">
      <input type="radio" id="${id}" name="${naam}" ${isStandaard ? 'checked' : ''}/>
      <span class="radio-circle"></span>
      <span class="radio-tekst">${label}</span>
    </label>
  `;
  const input = item.querySelector('input');

  // Standaard-laag direct activeren
  if (isStandaard) {
    kaartlaag.addTo(kaart);
    if (kaartlaag._laadFn) kaartlaag._laadFn();
  }

  input.addEventListener('change', () => {
    if (!input.checked) return;

    // ── 1. EERST de nieuwe laag toevoegen ──────────────
    // Dit zorgt ervoor dat de pane nooit leeg is tijdens
    // de switch, wat het "flippen" van de kaart voorkomt.
    if (!kaart.hasLayer(kaartlaag)) {
      kaartlaag.addTo(kaart);
      if (kaartlaag._laadFn) kaartlaag._laadFn();
    }

    // ── 2. DAARNA de andere lagen verwijderen ──────────
    // Kleine vertraging zodat de nieuwe laag eerst kan
    // beginnen renderen voordat de oude wegvalt.
    if (groep) {
      requestAnimationFrame(() => {
        groep.forEach(andere => {
          if (andere !== kaartlaag && kaart.hasLayer(andere)) {
            kaart.removeLayer(andere);
          }
        });
      });
    }
  });

  return item;
}
