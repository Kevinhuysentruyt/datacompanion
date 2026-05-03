// ════════════════════════════════════════════════════════
//  RENDERER: Toggle (laag aan/uit knop)
//  Componeert een toggle-knop voor het zijpaneel
//  en koppelt aan- of uitzetten van de laag op de kaart
//
//  v2: voorkomt browser auto-scroll bij focus op checkbox
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

  // Voorkom browser auto-scroll bij focus
  input.addEventListener('focus', (e) => {
    e.preventDefault();
    input.blur();
  });

  input.addEventListener('change', e => {
    // Bewaar scroll-positie
    const panel = document.querySelector('.geodata-panel');
    const content = document.querySelector('.content');
    const panelScroll = panel ? panel.scrollTop : 0;
    const contentScroll = content ? content.scrollTop : 0;

    if (e.target.checked) {
      kaartlaag.addTo(kaart);
      if (kaartlaag._laadFn) kaartlaag._laadFn();
    } else {
      kaart.removeLayer(kaartlaag);
    }

    // Herstel scroll-posities
    requestAnimationFrame(() => {
      if (panel) panel.scrollTop = panelScroll;
      if (content) content.scrollTop = contentScroll;
    });
  });

  return item;
}
