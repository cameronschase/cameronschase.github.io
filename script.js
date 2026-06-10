/* ─────────────────────────────────────────────────────
   Cameron Chase — site script
   Shared by index.html and photos.html
   Each block is guarded so it only runs on the page
   that has its corresponding markup.
   ───────────────────────────────────────────────────── */

(() => {

  /* ─── ALL PAGES: light/dark theme toggle ────────────
     The initial theme is set by an inline <head> script
     (before paint) to avoid a flash. This just flips it
     and remembers the choice. */
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  /* ─── HOME: knight cursor companion ─────────────────
     Floating ♞ that follows your cursor while hovering
     anything chess-related. */
  const knight = document.getElementById('knight');
  if (knight) {
    const triggers = document.querySelectorAll('.chess, [href*="chess"], .ec h3 a[href*="deis"]');
    let mx = 0, my = 0, kx = 0, ky = 0;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    triggers.forEach(t => {
      t.addEventListener('mouseenter', () => knight.classList.add('show'));
      t.addEventListener('mouseleave', () => knight.classList.remove('show'));
    });

    (function tick() {
      kx += (mx - kx) * 0.18;
      ky += (my - ky) * 0.18;
      knight.style.left = kx + 'px';
      knight.style.top  = (ky - 28) + 'px';
      requestAnimationFrame(tick);
    })();
  }

  /* ─── HOME: Konami code → chess piece rain ──────────
     ↑ ↑ ↓ ↓ ← → ← → b a */
  const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let idx = 0;
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === seq[idx].toLowerCase()) {
      idx++;
      if (idx === seq.length) { idx = 0; rainPieces(); }
    } else { idx = 0; }
  });
  function rainPieces() {
    const pieces = ['♚','♛','♜','♝','♞','♟'];
    for (let n = 0; n < 40; n++) {
      const p = document.createElement('div');
      p.textContent = pieces[Math.floor(Math.random() * pieces.length)];
      p.style.cssText = `position:fixed;top:-40px;left:${Math.random()*100}vw;font-size:${24+Math.random()*24}px;z-index:100;pointer-events:none;color:var(--ink);opacity:.7;transition:transform 3.5s linear,opacity 3.5s linear`;
      document.body.appendChild(p);
      requestAnimationFrame(() => {
        p.style.transform = `translateY(${window.innerHeight + 80}px) rotate(${(Math.random()*720)-360}deg)`;
        p.style.opacity = '0';
      });
      setTimeout(() => p.remove(), 3600);
    }
  }

  /* ─── PHOTOS: filter pills ──────────────────────────
     Click a category pill to show only matching polaroids. */
  const filters = document.querySelectorAll('.filter');
  if (filters.length) {
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
        if (empty) empty.classList.toggle('show', visible === 0);
      });
    });
  }

  /* ─── PHOTOS: lightbox ──────────────────────────────
     Click any polaroid to enlarge it; click outside or
     press Esc to close. */
  const lb = document.getElementById('lightbox');
  if (lb) {
    const lbPh  = document.getElementById('lb-ph');
    const lbCap = document.getElementById('lb-cap');
    const close = document.getElementById('close');
    const polaroids = document.querySelectorAll('.polaroid');

    polaroids.forEach(it => {
      it.addEventListener('click', () => {
        const ph  = it.querySelector('.ph');
        const img = it.querySelector('img');
        const cap = it.querySelector('.caption').textContent;

        // copy the visual into the lightbox — works for both placeholder and real <img>
        if (img) {
          lbPh.innerHTML = `<img src="${img.src}" alt="${img.alt || ''}" style="width:100%;height:100%;object-fit:cover">`;
          lbPh.style.background = 'transparent';
        } else if (ph) {
          lbPh.innerHTML = ph.innerHTML;
          lbPh.style.background = getComputedStyle(ph).background;
          lbPh.style.color      = getComputedStyle(ph).color;
        }
        lbCap.textContent = cap;
        lb.classList.add('show');
      });
    });

    const closeLb = () => lb.classList.remove('show');
    lb.addEventListener('click', closeLb);
    close.addEventListener('click', closeLb);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
  }

  /* ─── HOME: reCAPTCHA gate ───────────────────────────
     Any link with data-gated (résumé, email) is intercepted:
     we pop the captcha modal, and only run the original
     action once the checkbox is solved. */
  const gate = document.getElementById('captchaGate');
  if (gate) {
    const box       = document.getElementById('captchaBox');
    const closeGate = document.getElementById('captchaClose');
    let widgetId    = null;   // grecaptcha widget handle, rendered lazily
    let pending     = null;   // the <a> the visitor clicked

    const open  = () => gate.classList.add('show');
    const close = () => { gate.classList.remove('show'); pending = null; };

    // Run the link the visitor originally clicked, preserving
    // download behaviour and new-tab targets.
    const proceed = (link) => {
      const a = document.createElement('a');
      a.href = link.href;
      if (link.hasAttribute('download')) a.download = link.getAttribute('download') || '';
      if (link.target) a.target = link.target;
      document.body.appendChild(a);
      a.click();
      a.remove();
    };

    // Called by reCAPTCHA when the checkbox is solved.
    window.onCaptchaPass = () => {
      const link = pending;
      close();
      if (window.grecaptcha && widgetId !== null) grecaptcha.reset(widgetId);
      if (link) proceed(link);
    };

    // Render the widget the first time the modal opens (it needs
    // the grecaptcha script, which loads async).
    const renderWidget = () => {
      if (widgetId !== null) return;
      if (!window.grecaptcha || !grecaptcha.render) { setTimeout(renderWidget, 150); return; }
      widgetId = grecaptcha.render(box, {
        sitekey:  box.dataset.sitekey,
        callback: 'onCaptchaPass',
        theme:    document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
      });
    };

    document.querySelectorAll('a[data-gated]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        pending = link;
        open();
        renderWidget();
      });
    });

    closeGate.addEventListener('click', close);
    gate.addEventListener('click', e => { if (e.target === gate) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

})();
