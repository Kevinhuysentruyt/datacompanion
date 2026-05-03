// ════════════════════════════════════════════════════════
//  RENDERER: Radio (achtergrond-keuze)
//  Slechts één laag uit de groep is tegelijk actief
//
//  v3: invalidateSize na switch via kaart-referentie
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

    // 1. Eerst nieuwe laag toevoegen (voorkomt leeg moment → flip)
    if (!kaart.hasLayer(kaartlaag)) {
      kaartlaag.addTo(kaart);
      if (kaartlaag._laadFn) kaartlaag._laadFn();
    }

    // 2. Andere lagen verwijderen
    requestAnimationFrame(() => {
      if (groep) {
        groep.forEach(andere => {
          if (andere !== kaartlaag && kaart.hasLayer(andere)) {
            kaart.removeLayer(andere);
          }
        });
      }

      // 3. Forceer kaart-resize zodat Leaflet de juiste afmetingen kent
      setTimeout(() => {
        kaart.invalidateSize({ animate: false });
      }, 50);
    });
  });

  return item;
}
