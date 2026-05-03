// ════════════════════════════════════════════════════════
//  RENDERER: Radio (achtergrond-keuze)
//  Slechts één laag uit de groep is tegelijk actief
//
//  v6: voorkomt dat browser naar radio-input scrollt bij
//      aanklikken — dit veroorzaakte het "springen" van
//      de pagina naar boven
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

  // Voorkom dat de browser naar het input-element scrollt bij focus
  // Dit is de oorzaak van het "springen" van de pagina
  input.addEventListener('focus', (e) => {
    e.preventDefault();
    input.blur();
  });

  if (isStandaard) {
    kaartlaag.addTo(kaart);
    if (kaartlaag._laadFn) kaartlaag._laadFn();
  }

  input.addEventListener('change', () => {
    if (!input.checked) return;

    // Bewaar scroll-positie van paneel én pagina
    const panel = document.querySelector('.geodata-panel');
    const content = document.querySelector('.content');
    const panelScroll = panel ? panel.scrollTop : 0;
    const contentScroll = content ? content.scrollTop : 0;

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

      // Herstel beide scroll-posities
      if (panel) panel.scrollTop = panelScroll;
      if (content) content.scrollTop = contentScroll;
    });
  });

  return item;
}
