/* ==========================================================================
   SWIA // KINETIC ENGINE, SCROLL PHYSICS & SPATIAL FIELD
   ========================================================================== */

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------------------
     1. GLYPH SCRAMBLE DECODER ENGINE
     ------------------------------------------------------------------------ */
  const GLYPHS = '∑∆◊░▒▓█ΞΨΩ01/*+=-_[]{}<>';

  function scrambleText(el, finalStr, duration = 520) {
    if (!el || reducedMotion.matches) {
      if (el && finalStr) el.textContent = finalStr;
      return;
    }
    const target = finalStr || el.dataset.scramble || el.textContent;
    el.dataset.scramble = target;
    const len = target.length;
    const start = performance.now();

    function step(now) {
      const progress = Math.min(1, (now - start) / duration);
      const revealCount = Math.floor(progress * len);
      let out = '';
      for (let i = 0; i < len; i++) {
        const ch = target[i];
        if (ch === ' ') {
          out += ' ';
        } else if (i < revealCount || progress >= 1) {
          out += ch;
        } else {
          out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      el.textContent = out;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Trigger scramble on hover/focus and viewport entry
  const scrambleTargets = $$('[data-scramble]');
  const scrambleObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          scrambleText(entry.target, entry.target.dataset.scramble, 620);
        }
      });
    },
    { threshold: 0.25 }
  );

  scrambleTargets.forEach((el) => {
    scrambleObserver.observe(el);
    el.addEventListener('pointerenter', () => scrambleText(el, el.dataset.scramble, 420));
  });

  const scrambleAllBtn = $('#scramble-all-btn');
  if (scrambleAllBtn) {
    scrambleAllBtn.addEventListener('click', () => {
      scrambleTargets.forEach((el) => scrambleText(el, el.dataset.scramble, 680));
    });
  }

  /* ------------------------------------------------------------------------
     2. SCROLL VELOCITY PHYSICS, TICKER & MANIFESTO SCRUBBING
     ------------------------------------------------------------------------ */
  const rootStyle = document.documentElement.style;
  const velReadout = $('#vel-readout');
  const scrollPct = $('#scroll-pct');
  const progressFill = $('#scroll-progress-fill');
  const tickers = $$('.ticker-track');
  const scrubWords = $$('.scrub-word');

  let lastScrollY = window.scrollY;
  let lastScrollTime = performance.now();
  let currentVelocity = 0;
  let smoothedVelocity = 0;
  let tickerOffsets = tickers.map(() => 0);

  function updateScrollMetrics() {
    const y = window.scrollY;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pct = Math.min(100, Math.max(0, Math.round((y / maxScroll) * 100)));

    if (progressFill) progressFill.style.width = `${(y / maxScroll) * 100}%`;
    if (scrollPct) scrollPct.textContent = `${String(pct).padStart(2, '0')}%`;

    // Illuminate Manifesto words based on viewport vertical position
    const triggerY = window.innerHeight * 0.72;
    for (let i = 0; i < scrubWords.length; i++) {
      const word = scrubWords[i];
      const rect = word.getBoundingClientRect();
      if (rect.top < triggerY) {
        word.classList.add('lit');
      } else {
        word.classList.remove('lit');
      }
    }
  }

  window.addEventListener(
    'scroll',
    () => {
      const now = performance.now();
      const dt = Math.max(8, now - lastScrollTime);
      const dy = window.scrollY - lastScrollY;
      currentVelocity = (dy / dt) * 1000; // px per second
      lastScrollY = window.scrollY;
      lastScrollTime = now;
      updateScrollMetrics();
    },
    { passive: true }
  );

  updateScrollMetrics();

  /* ------------------------------------------------------------------------
     3. HERO MONOLITH PROXIMITY DISTORTION (DESKTOP + TOUCH DRAG)
     ------------------------------------------------------------------------ */
  const monolithStage = $('#monolith-stage');
  const kChars = $$('.k-char');
  const coordReadout = $('#coord-readout');

  function distortMonolith(clientX, clientY) {
    if (reducedMotion.matches) return;
    kChars.forEach((ch) => {
      const r = ch.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const dist = Math.hypot(dx, dy);
      const radius = Math.max(180, window.innerWidth * 0.24);

      if (dist < radius) {
        const power = 1 - dist / radius;
        const shiftY = -power * 22;
        const skew = (dx / radius) * 18 * power;
        const scale = 1 + power * 0.16;
        ch.style.transform = `translate3d(0, ${shiftY.toFixed(1)}px, 0) skewX(${skew.toFixed(1)}deg) scale(${scale.toFixed(2)})`;
        ch.style.color = power > 0.45 ? 'var(--accent)' : '';
        ch.style.textShadow = power > 0.35 ? '0 0 32px var(--accent-glow)' : '';
      } else {
        ch.style.transform = '';
        ch.style.color = '';
        ch.style.textShadow = '';
      }
    });

    if (coordReadout) {
      const nx = ((clientX / window.innerWidth) * 90).toFixed(4);
      const ny = ((clientY / window.innerHeight) * 180).toFixed(4);
      coordReadout.textContent = `${nx}° N // ${ny}° E`;
    }
  }

  function resetMonolith() {
    kChars.forEach((ch) => {
      ch.style.transform = '';
      ch.style.color = '';
      ch.style.textShadow = '';
    });
  }

  if (monolithStage) {
    monolithStage.addEventListener('pointermove', (e) => distortMonolith(e.clientX, e.clientY));
    monolithStage.addEventListener('pointerleave', resetMonolith);
    monolithStage.addEventListener(
      'touchmove',
      (e) => {
        if (e.touches[0]) distortMonolith(e.touches[0].clientX, e.touches[0].clientY);
      },
      { passive: true }
    );
    monolithStage.addEventListener('touchend', resetMonolith);
  }

  /* ------------------------------------------------------------------------
     4. 3D HOLOGRAPHIC SPECIMEN CARDS & MAGNETIC BUTTONS
     ------------------------------------------------------------------------ */
  const tiltCards = $$('[data-tilt]');
  tiltCards.forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      if (reducedMotion.matches || e.pointerType === 'touch') return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * 10;
      const ry = (px - 0.5) * 12;
      card.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
      card.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
      card.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });

  const magneticEls = $$('[data-magnetic]');
  magneticEls.forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      if (reducedMotion.matches || e.pointerType === 'touch') return;
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.22;
      btn.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.transform = '';
    });
  });

  /* ------------------------------------------------------------------------
     5. KINETIC SYNTHESIZER LAB (SECTION 03)
     ------------------------------------------------------------------------ */
  const synthPhrase = $('#synth-phrase');
  const ctrlAmp = $('#ctrl-amp');
  const ctrlFreq = $('#ctrl-freq');
  const ctrlSkew = $('#ctrl-skew');
  const ampVal = $('#amp-val');
  const freqVal = $('#freq-val');
  const skewVal = $('#skew-val');
  const presetBtns = $$('.preset-btn');

  let synthChars = [];
  let synthPreset = 'liquid';

  if (synthPhrase) {
    const raw = synthPhrase.dataset.text || "SO WHAT, IT'S ART.";
    synthPhrase.innerHTML = '';
    for (let i = 0; i < raw.length; i++) {
      const span = document.createElement('span');
      span.className = 'synth-char';
      span.textContent = raw[i] === ' ' ? '\u00A0' : raw[i];
      span.dataset.orig = span.textContent;
      synthPhrase.appendChild(span);
      synthChars.push(span);
    }
  }

  function updateSynthLabels() {
    if (ampVal && ctrlAmp) ampVal.textContent = `${ctrlAmp.value}%`;
    if (freqVal && ctrlFreq) freqVal.textContent = `${ctrlFreq.value}%`;
    if (skewVal && ctrlSkew) skewVal.textContent = `${ctrlSkew.value}°`;
  }

  [ctrlAmp, ctrlFreq, ctrlSkew].forEach((input) => {
    if (input) input.addEventListener('input', updateSynthLabels);
  });

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      presetBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      synthPreset = btn.dataset.preset;
      if (synthPreset === 'liquid') {
        ctrlAmp.value = 42;
        ctrlFreq.value = 65;
        ctrlSkew.value = 0;
      } else if (synthPreset === 'hyper') {
        ctrlAmp.value = 88;
        ctrlFreq.value = 95;
        ctrlSkew.value = -16;
      } else if (synthPreset === 'brutal') {
        ctrlAmp.value = 60;
        ctrlFreq.value = 40;
        ctrlSkew.value = 22;
      } else if (synthPreset === 'scramble') {
        ctrlAmp.value = 72;
        ctrlFreq.value = 85;
        ctrlSkew.value = -10;
      }
      updateSynthLabels();
    });
  });

  /* ------------------------------------------------------------------------
     6. INTERACTIVE SPATIAL VECTOR FIELD CANVAS + MASTER RAF LOOP
     ------------------------------------------------------------------------ */
  const canvas = $('#kinetic-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const reticle = $('#cursor-reticle');
  let pointerX = window.innerWidth * 0.5;
  let pointerY = window.innerHeight * 0.5;

  function resizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  window.addEventListener(
    'pointermove',
    (e) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      if (reticle) {
        reticle.style.transform = `translate3d(${e.clientX - 17}px, ${e.clientY - 17}px, 0)`;
      }
    },
    { passive: true }
  );

  $$('a, button, summary, input, textarea, .specimen-card').forEach((el) => {
    el.addEventListener('pointerenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('pointerleave', () => document.body.classList.remove('cursor-hover'));
  });

  function renderFrame(now) {
    // 1. Decay scroll velocity with spring damping
    currentVelocity *= 0.88;
    smoothedVelocity += (currentVelocity - smoothedVelocity) * 0.18;
    if (Math.abs(smoothedVelocity) < 0.5) smoothedVelocity = 0;

    const skewDeg = Math.max(-10, Math.min(10, smoothedVelocity * 0.0045));
    const stretchY = 1 + Math.min(0.08, Math.abs(smoothedVelocity) * 0.00004);

    if (!reducedMotion.matches) {
      rootStyle.setProperty('--scroll-skew', `${skewDeg.toFixed(2)}deg`);
      rootStyle.setProperty('--scroll-scale-y', stretchY.toFixed(3));
    }

    if (velReadout) {
      const vInt = Math.min(9999, Math.round(Math.abs(smoothedVelocity)));
      velReadout.textContent = `VEL // ${String(vInt).padStart(4, '0')} PX/S`;
    }

    // 2. Drive Dual Velocity Tickers
    if (!reducedMotion.matches) {
      const boost = 1 + Math.min(6, Math.abs(smoothedVelocity) * 0.003);
      const scrollSign = smoothedVelocity >= 0 ? 1 : -1;
      tickers.forEach((track, idx) => {
        const baseDir = Number(track.dataset.tickerDir || 1);
        tickerOffsets[idx] -= baseDir * scrollSign * 0.65 * boost;
        const halfWidth = track.scrollWidth / 2;
        if (halfWidth > 0) {
          if (tickerOffsets[idx] <= -halfWidth) tickerOffsets[idx] += halfWidth;
          if (tickerOffsets[idx] > 0) tickerOffsets[idx] -= halfWidth;
        }
        track.style.transform = `translate3d(${tickerOffsets[idx].toFixed(1)}px, 0, 0)`;
      });
    }

    // 3. Animate Kinetic Synthesizer Phrase
    if (synthChars.length && !reducedMotion.matches) {
      const amp = Number(ctrlAmp ? ctrlAmp.value : 42) * 0.32;
      const freq = Number(ctrlFreq ? ctrlFreq.value : 65) * 0.00012;
      const baseSkew = Number(ctrlSkew ? ctrlSkew.value : 0);

      for (let i = 0; i < synthChars.length; i++) {
        const ch = synthChars[i];
        const phase = now * freq * 35 + i * 0.48;
        let y = Math.sin(phase) * amp;
        let rot = Math.cos(phase) * (amp * 0.45);
        let scale = 1 + Math.sin(phase * 1.3) * (amp * 0.008);

        if (synthPreset === 'brutal') {
          y = Math.sign(Math.sin(phase)) * (amp * 0.75);
          rot = 0;
        }

        if (synthPreset === 'scramble' && Math.random() < 0.025 && ch.dataset.orig !== '\u00A0') {
          ch.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        } else if (ch.textContent !== ch.dataset.orig && Math.random() < 0.18) {
          ch.textContent = ch.dataset.orig;
        }

        ch.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) skewX(${baseSkew}deg) rotate(${rot.toFixed(1)}deg) scale(${scale.toFixed(2)})`;
        ch.style.color = Math.sin(phase) > 0.68 ? 'var(--accent)' : '';
      }
    }

    // 4. Draw Spatial Vector Field on Background Canvas
    if (ctx && canvas) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const cols = w < 640 ? 7 : 13;
      const rows = h < 640 ? 7 : 9;
      const cellW = w / cols;
      const cellH = h / rows;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
      ctx.lineWidth = 1;

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * cellW;
          const y = j * cellH;
          const dx = pointerX - x;
          const dy = pointerY - y;
          const dist = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx) + now * 0.0006;
          const len = Math.min(18, Math.max(5, 2200 / (dist + 120)));

          ctx.beginPath();
          ctx.moveTo(x - Math.cos(angle) * len, y - Math.sin(angle) * len);
          ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(renderFrame);
  }

  requestAnimationFrame(renderFrame);

  /* ------------------------------------------------------------------------
     7. THEME SWITCHER, MOBILE DRAWER & MODALS
     ------------------------------------------------------------------------ */
  const themes = [
    { id: 'void', label: 'MODE: ACID' },
    { id: 'ultraviolet', label: 'MODE: CYAN' },
    { id: 'crimson', label: 'MODE: CRIMSON' },
  ];
  let themeIdx = 0;
  const themeToggle = $('#theme-toggle');
  const modeLabel = $('#mode-label');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      themeIdx = (themeIdx + 1) % themes.length;
      document.documentElement.setAttribute('data-theme', themes[themeIdx].id);
      if (modeLabel) scrambleText(modeLabel, themes[themeIdx].label, 360);
    });
  }

  // Mobile Menu Drawer
  const menuToggle = $('#menu-toggle');
  const mobileDrawer = $('#mobile-drawer');
  const menuText = $('.menu-text', menuToggle);

  function closeDrawer() {
    if (!mobileDrawer || !menuToggle) return;
    mobileDrawer.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    if (menuText) menuText.textContent = 'INDEX';
  }

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', () => {
      const isOpen = !mobileDrawer.hidden;
      if (isOpen) {
        closeDrawer();
      } else {
        mobileDrawer.hidden = false;
        menuToggle.setAttribute('aria-expanded', 'true');
        if (menuText) menuText.textContent = 'CLOSE';
      }
    });

    $$('.mobile-link', mobileDrawer).forEach((link) => {
      link.addEventListener('click', closeDrawer);
    });
  }

  // Specimen Details Data & Modal
  const SPECIMENS = {
    '01': {
      id: 'SPECIMEN // 001 — LIQUID EGO',
      title: 'FERMENTED GRAPES',
      body: 'A still-life study in pretending to understand molecular tannins, terroir mythology, and crystal glassware acoustics. Engineered for visual consumption only. It tastes like red.',
      meta: 'STATUS: PRE-COMMERCIAL // EDITION: 00 OF 01 // MASS: 750ML VIRTUAL',
    },
    '02': {
      id: 'SPECIMEN // 002 — STATUS SYMBOL',
      title: 'DEPRECIATION ASSET',
      body: 'A low-slung combustion sculpture built to idle in metropolitan gridlock while projecting cinematic solitude under gas station sodium lights.',
      meta: 'STATUS: LOCKED IN VAULT // TOP VELOCITY: IRRELEVANT IN TRAFFIC',
    },
    '03': {
      id: 'SPECIMEN // 003 — PURE EFFORT',
      title: 'MANUAL TRANSIT',
      body: 'High-modulus carbon geometry designed for pedaling furiously away from modern dread while maintaining peak aerodynamic efficiency.',
      meta: 'STATUS: ARCHIVED // DRAG COEFFICIENT: 0.001 // EXISTENTIAL LOAD: HIGH',
    },
    '04': {
      id: 'SPECIMEN // 004 — WOVEN MATTER',
      title: 'EXPENSIVE THREADS',
      body: 'Saffron and obsidian textile architecture draped in zero-gravity folds. Costs approximately 1.4x a standard metropolitan studio lease.',
      meta: 'STATUS: 01 OF 01 // MATERIAL: DIGITAL SILK & PURE AUDACITY',
    },
  };

  const specDialog = $('#specimen-dialog');
  const specModalId = $('#spec-modal-id');
  const specModalTitle = $('#spec-modal-title');
  const specModalBody = $('#spec-modal-body');
  const specModalMeta = $('#spec-modal-meta');

  $$('[data-inspect]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.inspect;
      const data = SPECIMENS[key];
      if (!data || !specDialog) return;
      specModalId.textContent = data.id;
      specModalTitle.textContent = data.title;
      specModalBody.textContent = data.body;
      specModalMeta.textContent = data.meta;
      specDialog.showModal();
    });
  });

  // Brief Modal
  const briefDialog = $('#brief-dialog');
  const briefInput = $('#brief-input');
  const downloadBrief = $('#download-brief');

  $$('[data-open-brief]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeDrawer();
      if (specDialog && specDialog.open) specDialog.close();
      if (briefDialog) briefDialog.showModal();
    });
  });

  $$('[data-close-dialog]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dlg = btn.closest('dialog');
      if (dlg) dlg.close();
    });
  });

  if (downloadBrief && briefInput) {
    downloadBrief.addEventListener('click', () => {
      const text = briefInput.value.trim();
      if (!text) {
        briefInput.focus();
        return;
      }
      const stamp = new Date().toISOString();
      const hash = Math.random().toString(16).slice(2, 10).toUpperCase();
      const payload = [
        '====================================================',
        "SWIA // SO WHAT, IT'S ART — VOID TRANSMISSION RECEIPT",
        '====================================================',
        `TIMESTAMP : ${stamp}`,
        `RECEIPT ID: SWIA-VOID-${hash}`,
        'STATUS    : LOGGED INTO THE ABYSS (UNREAD BY HUMANS)',
        '----------------------------------------------------',
        'TRANSMITTED PAYLOAD:',
        text,
        '====================================================',
      ].join('\n');

      const blob = new Blob([payload], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SWIA-VOID-${hash}.txt`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      if (briefDialog) briefDialog.close();
    });
  }

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
