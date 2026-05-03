// ════════════════════════════════════════════════════════
//  RENDERER: Radio (achtergrond-keuze)
//  Slechts één laag uit de groep is tegelijk actief
//
//  v5: scroll-positie bewaren bij wisselen achtergrond
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

  if (isStandaard) {
    kaartlaag.addTo(kaart);
    if (kaartlaag._laadFn) kaartlaag._laadFn();
  }

  input.addEventListener('change', () => {
    if (!input.checked) return;

    // Bewaar scroll-positie van het zijpaneel
    const panel = document.querySelector('.geodata-panel');
    const scrollTop = panel ? panel.scrollTop : 0;

    // Eerst toevoegen, dan verwijderen
    if (!kaart.hasLayer(kaartlaag)) {
      kaartlaag.addTo(kaart);
      if (kaartlaag._laadFn) kaartlaag._laadFn();
    }

    requestAnimationFrame(() => {
      if (groep) {
        groep.forEach(andere => {
          if (andere !== kaartlaag && kaart.hasLayer(andere)) {
            kaart.removeLayer(andere);
          }
        });
      }

      // Herstel scroll-positie
      if (panel) panel.scrollTop = scrollTop;
    });
  });

  return item;
}
