// ── Filter ──
const filters = document.querySelectorAll('.filter');
const items = document.querySelectorAll('.polaroid');
const empty = document.getElementById('empty');

filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    let visible = 0;
    items.forEach(it => {
      const show = (cat === 'all' || it.dataset.cat === cat);
      it.classList.toggle('hidden', !show);
      if (show) visible++;
    });
    empty.classList.toggle('show', visible === 0);
  });
});

// ── Lightbox ──
const lb   = document.getElementById('lightbox');
const lbPh = document.getElementById('lb-ph');
const lbCap= document.getElementById('lb-cap');
const close= document.getElementById('close');

items.forEach(it => {
  it.addEventListener('click', () => {
    const img = it.querySelector('img.ph');
    const cap = it.querySelector('.caption').textContent;
    lbPh.src = img.src;
    lbPh.alt = img.alt;
    lbCap.textContent = cap;
    lb.classList.add('show');
  });
});

function closeLb(){ lb.classList.remove('show'); }
lb.addEventListener('click', closeLb);
close.addEventListener('click', closeLb);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
