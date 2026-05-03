// ════════════════════════════════════════════════════════
//  RENDERER: Radio (achtergrond-keuze)
//  v7: mousedown preventDefault voorkomt focus+scroll
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
  const labelEl = item.querySelector('label');

  // mousedown preventDefault voorkomt dat de browser focus geeft
  // aan het input-element en daarna automatisch scrollt
  labelEl.addEventListener('mousedown', (e) => {
    e.preventDefault();
    // Manueel de radio activeren want we blokkeren het default gedrag
    if (!input.checked) {
      input.checked = true;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  if (isStandaard) {
    kaartlaag.addTo(kaart);
    if (kaartlaag._laadFn) kaartlaag._laadFn();
  }

  input.addEventListener('change', () => {
    if (!input.checked) return;

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
    });
  });

  return item;
}
