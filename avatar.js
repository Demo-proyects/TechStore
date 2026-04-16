/**
 * NARA AVATAR SYSTEM v5
 * ─────────────────────────────────────────────────────────────
 * Actualizado para comportarse exactamente como el avatar de barbería:
 *  • Modal de bienvenida con audio intro
 *  • Audio FAQ con anillo de progreso SVG
 *  • ayuda.mp3 solo la primera vez
 *  • Protección contra interrupciones de audio
 *  • Estados más robustos (helpAudioActive)
 *  • Progreso de audio con requestAnimationFrame
 * ─────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════
     CONFIG
  ══════════════════════════════════════════════ */
  const C = {
    speak    : 'ava/nara-speak.webp',
    espera   : 'ava/nara-espera.webp',
    intro    : 'ava/intro.mp3',
    ayuda    : 'ava/ayuda.mp3',
    faqAudio : n => `ava/faq-${n}.mp3`,
    wa       : 'https://wa.me/18098786115',
    cool     : 1400,
    SIZE     : 80,
  };

  /* ══════════════════════════════════════════════
     PERSISTENT STORAGE
  ══════════════════════════════════════════════ */
  const ls = {
    get: k => { try { return localStorage.getItem(k);  } catch(e) { return null; } },
    set: k => { try { localStorage.setItem(k, '1');     } catch(e) {}              },
  };

  /* ══════════════════════════════════════════════
     ESTADO
  ══════════════════════════════════════════════ */
  const S = {
    mode          : 'hidden',
    audioMain     : null,
    audioFaq      : null,
    activeFaqBtn  : null,
    permanentHide     : false,
    lastDbl           : 0,
    lastTap           : 0,
    rafId             : null,
    helpAudioActive   : false,
  };

  let wrap, circle, img, btnFaq, btnBack, btnClose, faqEl, modalEl, mOk, mFollow;
  let welcomeModal;
  let firstFired = false;

  /* ══════════════════════════════════════════════
     BOOT
  ══════════════════════════════════════════════ */
  function boot() {
    if (document.getElementById('ava-wrap')) return;
    injectCSS();
    buildDOM();
    bindEvents();
    showWelcomeModal();
  }

  /* ══════════════════════════════════════════════
     PRIMERA INTERACCIÓN
  ══════════════════════════════════════════════ */
  function onFirstInteraction() {
    if (firstFired || S.permanentHide) return;
    firstFired = true;

    if (!ls.get('ava_intro_done')) {
      img.src = C.espera;

      playMain(
        C.intro,
        () => {
          popIn();
          wrap.classList.add('ava-on');
          S.mode = 'intro';
          img.src = C.speak;
        },
        () => {
          ls.set('ava_intro_done');
          setState('waiting');
        }
      );
    } else {
      popIn();
      setState('waiting');
    }
  }

  /* ══════════════════════════════════════════════
     MODAL DE BIENVENIDA
  ══════════════════════════════════════════════ */
  function showWelcomeModal() {
    const isReturn = !!ls.get('ava_intro_done');
    const replayBtn = welcomeModal.querySelector('#ava-wm-replay');

    if (replayBtn) replayBtn.style.display = isReturn ? 'inline-flex' : 'none';

    welcomeModal.classList.add('open');
  }

  function closeWelcomeModal() {
    welcomeModal.classList.remove('open');
  }

  function replayIntro() {
    try { localStorage.removeItem('ava_intro_done'); } catch(e) {}
    try { localStorage.removeItem('ava_ayuda_done'); } catch(e) {}
    S.helpAudioActive = false;
    firstFired = false;
    killAll();
    wrap.classList.remove('ava-on');
    S.mode = 'hidden';
    closeWelcomeModal();
    onFirstInteraction();
  }

  /* ══════════════════════════════════════════════
     ESTADOS
  ══════════════════════════════════════════════ */
  function setState(mode) {
    S.mode = mode;

    switch (mode) {

      case 'hidden':
        killAll();
        wrap.classList.remove('ava-on');
        break;

      case 'waiting':
        if (!S.helpAudioActive) killMain();
        wrap.classList.add('ava-on');
        hideBtns();
        closeFAQ();
        setPos('default');
        if (!S.audioFaq && !S.helpAudioActive) img.src = C.espera;
        break;

      case 'help':
        wrap.classList.add('ava-on');
        showBtns();
        closeFAQ();

        if (!ls.get('ava_ayuda_done') && !S.audioMain && !S.audioFaq) {
          ls.set('ava_ayuda_done');
          img.src = C.espera;
          playMain(
            C.ayuda,
            () => { img.src = C.speak; S.helpAudioActive = true; },
            () => { S.helpAudioActive = false; if (!S.audioFaq) img.src = C.espera; }
          );
        } else if (!S.audioMain && !S.audioFaq) {
          img.src = C.espera;
        }
        break;

      case 'faq':
        if (!S.helpAudioActive) killMain();
        wrap.classList.add('ava-on');
        hideBtns();
        setPos('center');
        if (!S.audioFaq && !S.helpAudioActive) img.src = C.espera;
        openFAQ();
        break;
    }
  }

  /* ══════════════════════════════════════════════
     AUDIO — MAIN
  ══════════════════════════════════════════════ */
  function playMain(src, onPlaying, onEnd) {
    killMain();
    const a = new Audio(src);
    S.audioMain = a;

    a.addEventListener('playing', () => {
      if (S.audioMain !== a) return;
      if (onPlaying) onPlaying();
    }, { once: true });

    const done = () => {
      if (S.audioMain !== a) return;
      S.audioMain = null;
      if (onEnd) onEnd();
    };
    a.addEventListener('ended', done, { once: true });
    a.addEventListener('error', done, { once: true });

    const p = a.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        const resume = () => { if (S.audioMain === a) a.play().catch(done); };
        ['click', 'keydown', 'touchstart'].forEach(ev =>
          document.addEventListener(ev, resume, { capture: true, once: true })
        );
      });
    }
  }

  function killMain() {
    if (S.audioMain) {
      try { S.audioMain.pause(); } catch(e) {}
      S.audioMain = null;
    }
    S.helpAudioActive = false;
  }

  /* ══════════════════════════════════════════════
     AUDIO — FAQ
  ══════════════════════════════════════════════ */
  function playFaqAudio(n, btn) {
    killFaqAudio();
    killMain();

    const a = new Audio(C.faqAudio(n));
    S.audioFaq     = a;
    S.activeFaqBtn = btn;

    btn.classList.add('faq-audio-playing');
    btn.setAttribute('aria-label', 'Detener audio');
    img.src = C.speak;

    a.addEventListener('playing', () => { startProgressRaf(a, btn); }, { once: true });

    const done = () => {
      if (S.audioFaq !== a) return;
      S.audioFaq     = null;
      S.activeFaqBtn = null;
      stopProgressRaf();
      btn.classList.remove('faq-audio-playing');
      btn.setAttribute('aria-label', 'Escuchar respuesta');
      img.src = C.espera;
    };
    a.addEventListener('ended', done, { once: true });
    a.addEventListener('error', done, { once: true });

    const p = a.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        const resume = () => { if (S.audioFaq === a) a.play().catch(done); };
        ['click', 'keydown', 'touchstart'].forEach(ev =>
          document.addEventListener(ev, resume, { capture: true, once: true })
        );
      });
    }
  }

  function killFaqAudio() {
    if (S.audioFaq) {
      try { S.audioFaq.pause(); } catch(e) {}
      S.audioFaq = null;
    }
    stopProgressRaf();
    if (S.activeFaqBtn) {
      S.activeFaqBtn.classList.remove('faq-audio-playing');
      S.activeFaqBtn.setAttribute('aria-label', 'Escuchar respuesta');
      S.activeFaqBtn = null;
    }
    document.querySelectorAll('.faq-audio-btn.faq-audio-playing').forEach(b => {
      b.classList.remove('faq-audio-playing');
      b.setAttribute('aria-label', 'Escuchar respuesta');
    });
  }

  function killAll() {
    killMain();
    killFaqAudio();
    img.src = C.espera;
  }

  /* ══════════════════════════════════════════════
     ANILLO DE PROGRESO
  ══════════════════════════════════════════════ */
  const FAB_CIRC = 2 * Math.PI * 11;

  function startProgressRaf(audio, btn) {
    stopProgressRaf();
    const ring = btn.querySelector('.fab-ring-prog');
    if (!ring) return;

    function tick() {
      if (!S.audioFaq || S.audioFaq !== audio) return;
      const dur = audio.duration;
      const pct = (dur && isFinite(dur)) ? audio.currentTime / dur : 0;
      ring.style.strokeDashoffset = FAB_CIRC * (1 - pct);
      S.rafId = requestAnimationFrame(tick);
    }

    S.rafId = requestAnimationFrame(tick);
  }

  function stopProgressRaf() {
    if (S.rafId !== null) {
      cancelAnimationFrame(S.rafId);
      S.rafId = null;
    }
    document.querySelectorAll('.fab-ring-prog').forEach(r => {
      r.style.strokeDashoffset = FAB_CIRC;
    });
  }

  /* ══════════════════════════════════════════════
     UI HELPERS
  ══════════════════════════════════════════════ */
  function popIn() {
    wrap.classList.add('ava-on');
    circle.classList.remove('ava-pop');
    void circle.offsetWidth;
    circle.classList.add('ava-pop');
  }

  function setPos(m) {
    wrap.style.cssText = '';
    wrap.className = 'ava-on pos-' + m;
  }

  function showBtns() { [btnFaq, btnBack, btnClose].forEach(b => b.classList.add('show')); }
  function hideBtns() { [btnFaq, btnBack, btnClose].forEach(b => b.classList.remove('show')); }
  function openFAQ()  { faqEl.classList.add('open'); }
  function closeFAQ() { faqEl.classList.remove('open'); }

  /* ══════════════════════════════════════════════
     CLICK EN AVATAR
  ══════════════════════════════════════════════ */
  function onCircleClick() {
    switch (S.mode) {
      case 'waiting':
      case 'intro':   setState('help');    break;
      case 'help':    setState('waiting'); break;
      case 'faq':     setState('waiting'); break;
    }
  }

  /* ══════════════════════════════════════════════
     DRAG
  ══════════════════════════════════════════════ */
  function bindDrag() {
    let dragging = false, moved = false;
    let startX, startY, startLeft, startTop;

    circle.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      e.preventDefault();
      dragging = true; moved = false;
      const r  = wrap.getBoundingClientRect();
      startX = e.clientX; startY = e.clientY;
      startLeft = r.left; startTop = r.top;
      window.addEventListener('pointermove',   onMove);
      window.addEventListener('pointerup',     onUp);
      window.addEventListener('pointercancel', onUp);
    });

    function onMove(e) {
      if (!dragging) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (!moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) moved = true;
      if (moved) {
        const x = Math.max(0, Math.min(startLeft + dx, window.innerWidth  - C.SIZE - 10));
        const y = Math.max(0, Math.min(startTop  + dy, window.innerHeight - C.SIZE - 20));
        wrap.className = 'ava-on';
        wrap.style.left = x + 'px'; wrap.style.top = y + 'px';
        wrap.style.right = 'auto'; wrap.style.transform = 'none';
      }
    }

    function onUp() {
      window.removeEventListener('pointermove',   onMove);
      window.removeEventListener('pointerup',     onUp);
      window.removeEventListener('pointercancel', onUp);
      const wasMoved = moved; dragging = false; moved = false;
      if (!wasMoved) onCircleClick();
    }
  }

  /* ══════════════════════════════════════════════
     EVENTOS
  ══════════════════════════════════════════════ */
  function bindEvents() {
    bindDrag();

    btnFaq.addEventListener('click',   e => { e.stopPropagation(); setState('faq'); });
    btnBack.addEventListener('click',  e => { e.stopPropagation(); setState('waiting'); });
    btnClose.addEventListener('click', e => {
      e.stopPropagation();
      hideBtns(); killAll();
      modalEl.classList.add('open');
    });

    mOk.addEventListener('click', () => {
      modalEl.classList.remove('open');
      setState('hidden');
      S.permanentHide = true;
    });
    mFollow.addEventListener('click', () => {
      modalEl.classList.remove('open');
      setState('waiting');
    });
    modalEl.addEventListener('click', e => {
      if (e.target === modalEl) modalEl.classList.remove('open');
    });

    faqEl.addEventListener('click', e => {
      if (e.target.closest('#ava-fq-back'))  { setState('waiting'); return; }
      if (e.target.closest('#ava-fq-close')) { setState('help');    return; }

      const audioBtn = e.target.closest('.faq-audio-btn');
      if (audioBtn) {
        e.stopPropagation();
        const n = parseInt(audioBtn.dataset.faqN, 10);
        if (S.activeFaqBtn === audioBtn) {
          killFaqAudio();
          img.src = C.espera;
        } else {
          playFaqAudio(n, audioBtn);
        }
      }
    });

    document.addEventListener('click', e => {
      if (!['help', 'faq'].includes(S.mode)) return;
      if (modalEl.classList.contains('open')) return;
      if (!e.target.closest('#ava-wrap') && !e.target.closest('#ava-faq')) {
        setState('waiting');
      }
    }, true);

    document.addEventListener('dblclick', e => {
      if (S.mode !== 'hidden' && !S.permanentHide) return;
      if (e.target.closest('#ava-wrap, #ava-faq, #ava-modal')) return;
      S.permanentHide = false;
      respawnAt(e.clientX, e.clientY);
    });

    document.addEventListener('touchend', e => {
      if (S.mode !== 'hidden' && !S.permanentHide) return;
      if (e.target.closest('#ava-wrap, #ava-faq, #ava-modal')) return;
      const now = Date.now();
      if (now - S.lastTap < 350) {
        const t = e.changedTouches[0];
        S.permanentHide = false;
        respawnAt(t.clientX, t.clientY);
        S.lastTap = 0; e.preventDefault();
      } else { S.lastTap = now; }
    }, { passive: false });
  }

  function respawnAt(cx, cy) {
    const now = Date.now();
    if (now - S.lastDbl < C.cool) return;
    S.lastDbl = now; firstFired = true;
    const x = Math.max(0,  Math.min(cx - C.SIZE / 2, window.innerWidth  - C.SIZE - 10));
    const y = Math.max(70, Math.min(cy - C.SIZE / 2, window.innerHeight - C.SIZE - 20));
    wrap.className = 'ava-on';
    wrap.style.left = x + 'px'; wrap.style.top = y + 'px';
    wrap.style.right = 'auto'; wrap.style.transform = 'none';
    popIn(); setState('waiting');
  }

  /* ══════════════════════════════════════════════
     DOM
  ══════════════════════════════════════════════ */
  function buildDOM() {
    wrap = mk('div', { id: 'ava-wrap' });
    wrap.className = 'pos-default';

    circle = mk('div', { id: 'ava-c' });
    img    = mk('img', { id: 'ava-img', src: C.espera, alt: 'Nara', draggable: 'false' });
    circle.appendChild(img);

    btnFaq   = mkBtn('ava-b-faq',   '?', 'Preguntas frecuentes');
    btnBack  = mkBtn('ava-b-back',  '↺', 'Volver al menú');
    btnClose = mkBtn('ava-b-close', '✕', 'Ocultar asistente');

    wrap.appendChild(circle);
    wrap.appendChild(btnFaq);
    wrap.appendChild(btnBack);
    wrap.appendChild(btnClose);

    faqEl = mk('div', { id: 'ava-faq' });
    faqEl.innerHTML = buildFAQHTML();

    modalEl = mk('div', { id: 'ava-modal' });
    modalEl.innerHTML = `
      <div id="ava-mbox">
        <h3>👋 ¡Hasta pronto!</h3>
        <p>Puedes volver a llamarme con un <strong>doble clic</strong> (o doble tap en móvil) en cualquier parte de la pantalla.</p>
        <p style="margin-top:12px;color:#00d4ff;font-size:0.85rem;">Siempre estoy aquí si necesitas ayuda.</p>
        <div style="display:flex;gap:10px;margin-top:22px;">
          <button id="ava-mok">Entendido</button>
          <button id="ava-mfollow">Seguir con avatar</button>
        </div>
      </div>`;

    document.body.appendChild(wrap);
    document.body.appendChild(faqEl);
    document.body.appendChild(modalEl);

    mOk     = document.getElementById('ava-mok');
    mFollow = document.getElementById('ava-mfollow');

    welcomeModal = mk('div', { id: 'ava-welcome' });
    welcomeModal.innerHTML = `
      <div id="ava-wmbox">
        <div id="ava-wm-avatar">
          <img src="${C.espera}" alt="Nara01" id="ava-wm-img"/>
        </div>
        <div id="ava-wm-body">
          <p id="ava-wm-name"><span class="word-accent">Nara_01</span></p>
          <p id="ava-wm-msg">Tu guía en este portfolio.<br>
          Tiene <strong>audio</strong> — prepárate para escucharla.</p>
        </div>
        <div id="ava-wm-actions">
          <button id="ava-wm-ok">Entendido</button>
          <button id="ava-wm-replay" style="display:none">↺ Volver a escuchar saludo</button>
        </div>
      </div>`;
    document.body.appendChild(welcomeModal);

    document.getElementById('ava-wm-ok').addEventListener('click', () => {
      closeWelcomeModal();
      onFirstInteraction();
    });
    document.getElementById('ava-wm-replay').addEventListener('click', () => {
      replayIntro();
    });
  }

  /* ══════════════════════════════════════════════
     FAQ HTML - Contenido para electrónica
  ══════════════════════════════════════════════ */
  function buildFAQHTML() {
    const items = [
      { n:1, q:'💻 ¿Cómo funciona este asistente?', a:'¡Hola! Soy Nara, la guía de este portfolio. Aparezco automáticamente para darte la bienvenida y acompañarte mientras exploras el sitio. Puedes hacerme <strong>clic</strong> para acceder a preguntas frecuentes, o <strong>arrastrarme</strong> donde prefieras. Si me cierras, vuelvo con un <strong>doble clic</strong> en cualquier parte de la pantalla.' },
      { n:2, q:'💰 ¿Cuánto cuesta un sitio web como este?', a:'Un e-commerce profesional similar a este parte desde <span class="line-accent" style="font-weight:600">$450 USD</span>, sin incluir el asistente de avatar — que es un módulo adicional. El precio final varía según el número de secciones, animaciones e integraciones.' },
      { n:3, q:'📦 ¿Qué incluye exactamente este tipo de sitio?', a:'Incluye una <strong>landing page de primer nivel</strong> con diseño avanzado de marca, múltiples secciones estratégicas y animaciones que generan confianza. Además, incorpora una <strong>tienda e-commerce completa</strong> con todas las funcionalidades profesionales: catálogo de productos, carrito de compras, proceso de pago integrado y gestión de inventario.' },
      { n:4, q:'⏱️ ¿Cuánto tarda la entrega y qué soporte incluye?', a:'El tiempo de entrega es de <strong>7 a 14 días hábiles</strong> según la complejidad. Incluye <strong>30 días de soporte</strong> post-entrega para ajustes y revisiones sin costo adicional.' },
      { n:5, q:'💬 ¿Cómo puedo tener mi propio sitio web?', a:'¡Es muy sencillo! Escríbeme por WhatsApp, cuéntame tu proyecto y te respondo con una propuesta sin compromiso. Estoy listo para ayudarte a construir la presencia digital que te representa.', wa:true },
    ];

    const WA_ICO = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

    const head = `
      <div class="afq-head">
        <div class="afq-label-row">
          <div class="afq-line"></div><span class="afq-label">RESUELVE TUS DUDAS</span><div class="afq-line"></div>
        </div>
        <h2 class="font-rye font-extrabold uppercase text-[clamp(1.3rem,2.5vw,1.8rem)] leading-[1.1] text-twht relative z-10">PRESENCIA DIGITAL.<br>
<em class="font-rye accent-text-gradient not-italic text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.3]">QUE VENDE.</em>
        </h2>
      </div>
      <div class="afq-ctrls">
        <button class="afq-ctrl" id="ava-fq-back">← Volver</button>
        <button class="afq-ctrl" id="ava-fq-close">✕ Cerrar</button>
      </div>`;

    const body = items.map(item => {
      const waBtn = item.wa ? `<a class="afq-wa-btn" href="${C.wa}" target="_blank" rel="noopener">${WA_ICO} Consultar por WhatsApp</a>` : '';
      return `
        <div class="afq-item">
          <div class="afq-bdr afq-bdr-top"></div><div class="afq-bdr afq-bdr-bot"></div>
          <div class="afq-bdr afq-bdr-lft"></div><div class="afq-bdr afq-bdr-rgt"></div>
          <details class="afq-details">
            <summary class="afq-summary">
              <span class="afq-q-text">${item.q}</span>
              <div class="afq-summary-end">
                <button class="faq-audio-btn" data-faq-n="${item.n}" aria-label="Escuchar respuesta" title="Escuchar respuesta">
                  <svg class="fab-ring-svg" width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
                    <circle class="fab-ring-track" cx="13" cy="13" r="11" fill="none" stroke-width="2"/>
                    <circle class="fab-ring-prog"  cx="13" cy="13" r="11" fill="none" stroke-width="2"
                      stroke-dasharray="69.115" stroke-dashoffset="69.115"
                      transform="rotate(-90 13 13)"/>
                  </svg>
                  <span class="fab-ico-play"><svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>
                  <span class="fab-ico-stop"><svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg></span>
                </button>
                <span class="afq-arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 9l-7 7-7-7"/></svg></span>
              </div>
            </summary>
            <div class="afq-answer"><p>${item.a}</p>${waBtn}</div>
          </details>
        </div>`;
    }).join('');

    return head + '<div class="afq-list">' + body + '</div>';
  }

  function mk(tag, attrs) {
    const e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(k => e.setAttribute(k, attrs[k]));
    return e;
  }
  function mkBtn(id, html, title) {
    const b = mk('button', { class: 'ava-btn', id, title });
    b.innerHTML = html; return b;
  }

  function injectCSS() {
    if (document.getElementById('ava-css')) return;
    const s = document.createElement('style');
    s.id = 'ava-css'; s.textContent = buildCSS();
    document.head.appendChild(s);
  }

  function buildCSS() {
    const accent='#00d4ff',bg1='#0a0e27',bg2='#131729',border='rgba(0,212,255,0.3)',gray='rgba(255,255,255,0.5)',sz=C.SIZE;
    return `
      #ava-wrap{display:none;position:fixed;z-index:9100;width:${sz}px;font-family:'Raleway',sans-serif;}
      #ava-wrap.ava-on{display:block;}
      #ava-wrap.pos-default{top:74px;right:20px;left:auto;transform:none;}
      #ava-wrap.pos-center{top:74px;left:50%;right:auto;transform:translateX(-50%);}
      #ava-c{width:${sz}px;height:${sz}px;border-radius:50%;cursor:pointer;user-select:none;position:relative;overflow:visible;touch-action:none;}
      #ava-img{width:${sz}px;height:${sz}px;object-fit:cover;border-radius:50%;display:block;pointer-events:none;border:2px solid ${border};box-shadow:0 0 0 1px rgba(0,212,255,.15),0 6px 28px rgba(0,0,0,.65);transition:box-shadow .3s;}
      #ava-c:hover #ava-img{box-shadow:0 0 0 1px ${accent},0 0 18px rgba(0,212,255,.2),0 10px 36px rgba(0,0,0,.8);}
      @keyframes ava-pop{0%{opacity:0;transform:scale(.1) translateY(20px);}65%{opacity:1;transform:scale(1.07) translateY(-4px);}100%{opacity:1;transform:scale(1) translateY(0);}}
      #ava-c.ava-pop{animation:ava-pop .6s cubic-bezier(.34,1.56,.64,1) both;}
      .ava-btn{position:absolute;width:34px;height:34px;border-radius:50%;background:${bg2};border:1.5px solid ${border};color:${gray};font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(.2);pointer-events:none;transition:opacity .22s,transform .3s cubic-bezier(.34,1.56,.64,1),background .15s,color .15s,border-color .15s;box-shadow:0 4px 18px rgba(0,0,0,.55);font-family:inherit;outline:none;}
      .ava-btn.show{opacity:1;transform:scale(1);pointer-events:all;}
      .ava-btn:hover{background:${accent};color:${bg1};border-color:${accent};}
      #ava-b-faq{left:23px;top:100px;transition-delay:.06s;background:${accent};color:${bg1};border-color:${accent};}
      #ava-b-back{left:-27px;top:88px;transition-delay:.02s;}
      #ava-b-close{left:73px;top:88px;transition-delay:0s;}
      #ava-faq{display:none;position:fixed;top:172px;left:50%;transform:translateX(-50%);width:min(640px,92vw);background:${bg1};border:1px solid ${border};padding:28px 24px;z-index:9090;box-shadow:0 24px 64px rgba(0,0,0,.78);max-height:68vh;overflow-y:auto;font-family:inherit;}
      #ava-faq.open{display:block;}
      #ava-faq::-webkit-scrollbar{width:3px;}
      #ava-faq::-webkit-scrollbar-thumb{background:${accent};border-radius:2px;}
      .afq-head{text-align:center;margin-bottom:20px;}
      .afq-label-row{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:8px;}
      .afq-line{width:36px;height:1px;background:linear-gradient(90deg,transparent,${accent},transparent);}
      .afq-label{font-size:.6rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:${accent};opacity:.8;}
      .afq-ctrls{display:flex;justify-content:flex-end;gap:6px;margin-bottom:18px;}
      .afq-ctrl{padding:4px 12px;border:1px solid ${border};background:transparent;color:${gray};font-size:.68rem;cursor:pointer;letter-spacing:.06em;transition:border-color .2s,color .2s;font-family:inherit;}
      .afq-ctrl:hover{border-color:${accent};color:${accent};}
      .afq-list{display:flex;flex-direction:column;gap:8px;}
      .afq-item{position:relative;background:${bg2};border:1px solid rgba(0,212,255,.1);}
      .afq-bdr{position:absolute;background:${accent};transition:all .28s ease;pointer-events:none;}
      .afq-bdr-top{top:0;left:0;width:0;height:1px;}
      .afq-bdr-bot{bottom:0;right:0;width:0;height:1px;}
      .afq-bdr-lft{top:0;left:0;width:1px;height:0;transition-delay:.14s;}
      .afq-bdr-rgt{bottom:0;right:0;width:1px;height:0;transition-delay:.14s;}
      .afq-item:hover .afq-bdr-top,.afq-item:hover .afq-bdr-bot{width:100%;}
      .afq-item:hover .afq-bdr-lft,.afq-item:hover .afq-bdr-rgt{height:100%;}
      .afq-details{width:100%;}
      .afq-summary{padding:14px 18px;cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:10px;outline:none;}
      .afq-summary::-webkit-details-marker{display:none;}
      .afq-q-text{font-size:.8rem;font-weight:600;color:rgba(255,255,255,.85);letter-spacing:.02em;line-height:1.5;flex:1;}
      .afq-summary-end{display:flex;align-items:center;gap:7px;flex-shrink:0;}

      .faq-audio-btn{
        position:relative;width:26px;height:26px;border-radius:50%;
        background:transparent;border:none;
        color:${gray};cursor:pointer;
        display:flex;align-items:center;justify-content:center;
        overflow:visible;padding:0;outline:none;flex-shrink:0;
        transition:color .2s;
      }
      .faq-audio-btn:hover{ color:${accent}; }
      .faq-audio-btn.faq-audio-playing{ color:${accent}; background:rgba(0,212,255,.1); border-radius:50%; }

      .fab-ring-svg{ position:absolute;top:0;left:0; pointer-events:none; }
      .fab-ring-track{ stroke:rgba(0,212,255,.2); transition:stroke .2s; }
      .faq-audio-btn:hover .fab-ring-track{ stroke:rgba(0,212,255,.45); }
      .faq-audio-btn.faq-audio-playing .fab-ring-track{ stroke:rgba(0,212,255,.3); }

      .fab-ring-prog{
        stroke:transparent;
        stroke-linecap:round;
        transition:stroke .25s;
      }
      .faq-audio-btn.faq-audio-playing .fab-ring-prog{ stroke:${accent}; }

      .faq-audio-btn .fab-ico-stop{display:none;align-items:center;justify-content:center;}
      .faq-audio-btn .fab-ico-play{display:flex;align-items:center;justify-content:center;}
      .faq-audio-btn.faq-audio-playing .fab-ico-play{display:none;}
      .faq-audio-btn.faq-audio-playing .fab-ico-stop{display:flex;}
      .afq-arrow{width:26px;height:26px;border-radius:50%;flex-shrink:0;border:1px solid ${border};display:flex;align-items:center;justify-content:center;color:${accent};transition:border-color .2s,transform .35s;}
      .afq-details[open] .afq-arrow{transform:rotate(180deg);}
      .afq-item:hover .afq-arrow{border-color:${accent};}
      .afq-answer{padding:12px 18px 18px;border-top:1px solid ${border};}
      .afq-answer p{font-size:.78rem;color:rgba(255,255,255,.7);line-height:1.85;}
      .afq-answer strong{color:#fff;}
      .afq-wa-btn{display:inline-flex;align-items:center;gap:7px;margin-top:14px;padding:8px 16px;background:rgba(37,211,102,.04);border:1px solid rgba(37,211,102,.2);color:#4ade80;font-size:.73rem;font-weight:600;text-decoration:none;transition:background .18s,border-color .18s;font-family:inherit;}
      .afq-wa-btn:hover{background:rgba(37,211,102,.1);border-color:rgba(37,211,102,.4);}
      #ava-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:10000;align-items:center;justify-content:center;backdrop-filter:blur(6px);}
      #ava-modal.open{display:flex;}
      #ava-mbox{background:${bg1};border:1px solid ${border};padding:34px 28px;max-width:360px;width:88vw;text-align:center;box-shadow:0 28px 68px rgba(0,0,0,.86);font-family:inherit;position:relative;}
      #ava-mbox::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${accent},transparent);}
      #ava-mbox h3{font-size:1rem;font-weight:800;color:#fff;margin:0 0 13px;text-transform:uppercase;letter-spacing:.08em;}
      #ava-mbox p{font-size:.78rem;color:${gray};line-height:1.9;margin:0;}
      #ava-mbox strong{color:#fff;}
      #ava-mok,#ava-mfollow{padding:8px 16px;background:transparent;border:1px solid ${border};color:${gray};font-size:.73rem;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:border-color .2s,color .2s;font-family:inherit;flex:1;}
      #ava-mfollow{border-color:${accent};color:${accent};}
      #ava-mok:hover,#ava-mfollow:hover{border-color:${accent};color:${accent};}
      #ava-welcome{display:none;position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:10100;align-items:center;justify-content:center;backdrop-filter:blur(8px);}
      #ava-welcome.open{display:flex;}
      #ava-wmbox{background:${bg1};border:1px solid rgba(0,212,255,.35);padding:28px 28px 24px;max-width:320px;width:86vw;text-align:center;box-shadow:0 28px 72px rgba(0,0,0,.9);position:relative;display:flex;flex-direction:column;align-items:center;gap:18px;}
      #ava-wmbox::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${accent},transparent);}
      #ava-wm-avatar{width:70px;height:70px;border-radius:50%;border:2px solid rgba(0,212,255,.4);overflow:hidden;box-shadow:0 0 0 1px rgba(0,212,255,.15),0 6px 28px rgba(0,0,0,.6);}
      #ava-wm-img{width:100%;height:100%;object-fit:cover;display:block;}
      #ava-wm-body{display:flex;flex-direction:column;gap:6px;}
      #ava-wm-name{font-size:1.15rem;font-weight:800;color:#fff;letter-spacing:.06em;margin:0;text-transform:uppercase;}
      #ava-wm-name span{color:${accent};}
      #ava-wm-msg{font-size:.75rem;color:${gray};line-height:1.75;margin:0;}
      #ava-wm-msg strong{color:rgba(255,255,255,.8);}
      #ava-wm-actions{display:flex;flex-direction:column;gap:8px;width:100%;}
      #ava-wm-ok{padding:9px 0;background:transparent;border:1px solid ${accent};color:${accent};font-size:.72rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:background .18s,color .18s;font-family:inherit;width:100%;}
      #ava-wm-ok:hover{background:rgba(0,212,255,.12);}
      #ava-wm-replay{padding:7px 0;background:transparent;border:1px solid rgba(0,212,255,.25);color:${gray};font-size:.68rem;letter-spacing:.06em;cursor:pointer;transition:border-color .2s,color .2s;font-family:inherit;width:100%;align-items:center;justify-content:center;gap:5px;}
      #ava-wm-replay:hover{border-color:${accent};color:${accent};}
      .line-accent{color:${accent};}
      .word-accent{color:${accent};}
      .accent-text-gradient{background:linear-gradient(135deg,${accent} 0%,#0066ff 100%);-webkit-background-clip:text;background-clip:text;color:transparent;}
    `;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();