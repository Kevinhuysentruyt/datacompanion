// ════════════════════════════════════════════════════════
//  RENDERER: Toggle (laag aan/uit knop)
//  v3: mousedown preventDefault voorkomt focus+scroll
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
  const labelEl = item.querySelector('label');

  // mousedown preventDefault voorkomt auto-scroll bij focus
  labelEl.addEventListener('mousedown', (e) => {
    e.preventDefault();
    // Manueel togglen
    input.checked = !input.checked;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  input.addEventListener('change', e => {
    if (e.target.checked) {
      kaartlaag.addTo(kaart);
      if (kaartlaag._laadFn) kaartlaag._laadFn();
    } else {
      kaart.removeLayer(kaartlaag);
    }
  });

  return item;
}
